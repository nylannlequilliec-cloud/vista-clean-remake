// Feature: devis-questionnaire
// Tests de propriété (fast-check) de la couche de navigation pure du Tunnel.
// Couvre les propriétés 6 (la validation par étape gouverne l'avancement),
// 7 (invariants de navigation) et 8 (la navigation préserve les données de
// l'État_Tunnel). numRuns >= 100 par propriété.

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  advance,
  computeCompleted,
  computeReachable,
  goToStep,
  STEP_ORDER,
} from "../navigation";
import { stepSchemas } from "../schema";
import { OPTIONS, SUPPORTS } from "../pricing";
import type {
  LieuType,
  OptionId,
  PackId,
  SupportId,
  TunnelState,
} from "../types";

// --- Sources de vérité pour les générateurs --------------------------------

const SUPPORT_IDS: SupportId[] = SUPPORTS.map((support) => support.id);
const OPTION_IDS: OptionId[] = OPTIONS.map((option) => option.id);
const PACK_IDS: PackId[] = ["confort", "concession"];
const LIEU_TYPES: LieuType[] = ["local", "domicile"];

const LAST_INDEX = STEP_ORDER.length - 1;

const arbSupportId: fc.Arbitrary<SupportId> = fc.constantFrom(...SUPPORT_IDS);

/**
 * Générateur d'un `TunnelState` quelconque : chaque champ couvre à la fois les
 * valeurs valides et invalides pour un sous-schéma d'étape donné, de sorte que
 * les deux branches (avancement autorisé / bloqué) soient exercées.
 */
const arbAnyTunnelState: fc.Arbitrary<TunnelState> = fc.record({
  support: fc.option(arbSupportId, { nil: null }),
  pack: fc.option(fc.constantFrom(...PACK_IDS), { nil: null }),
  options: fc.uniqueArray(fc.constantFrom(...OPTION_IDS)),
  lieu: fc.record({
    type: fc.option(fc.constantFrom(...LIEU_TYPES), { nil: null }),
    address: fc.string({ maxLength: 300 }),
    addressValidated: fc.boolean(),
    noElectricity: fc.boolean(),
  }),
  creneauId: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  devis: fc.record({
    prenom: fc.string({ maxLength: 100 }),
    telephone: fc.string({ maxLength: 30 }),
    besoin: fc.string({ maxLength: 2000 }),
  }),
});

/**
 * Générateur d'un `TunnelState` entièrement valide en Mode_Prix (toutes les
 * étapes satisfaites). Garantit que la branche « avancement autorisé » de la
 * Propriété 6 est effectivement exercée.
 */
const arbFullyValidState: fc.Arbitrary<TunnelState> = fc.record({
  support: fc.constantFrom("citadine", "berline", "suv") as fc.Arbitrary<SupportId>,
  pack: fc.constantFrom(...PACK_IDS),
  options: fc.uniqueArray(fc.constantFrom(...OPTION_IDS)),
  lieu: fc.constantFrom(
    { type: "local" as LieuType, address: "", addressValidated: false, noElectricity: false },
    { type: "domicile" as LieuType, address: "12 rue de la Paix", addressValidated: true, noElectricity: false },
  ),
  creneauId: fc.constantFrom("creneau-1", "creneau-2"),
  devis: fc.constant({ prenom: "", telephone: "", besoin: "" }),
});

/** Mélange d'états quelconques et d'états pleinement valides. */
const arbMixedState: fc.Arbitrary<TunnelState> = fc.oneof(
  arbAnyTunnelState,
  arbFullyValidState,
);

describe("navigation — propriétés de correction", () => {
  // Feature: devis-questionnaire, Property 6: La validation par étape gouverne l'avancement — pour tout TunnelState et tout index d'étape active, advance(state, activeIndex) incrémente activeIndex d'exactement un ssi le sous-schéma Zod de l'étape active est satisfait (borné à la dernière étape) ; sinon activeIndex reste inchangé et ok vaut false.
  // Validates: Requirements 1.4, 11.4, 11.5, 17.3
  it("Property 6: advance n'avance que si le sous-schéma de l'étape active est satisfait", () => {
    fc.assert(
      fc.property(
        arbMixedState,
        fc.integer({ min: -2, max: STEP_ORDER.length + 2 }),
        (state, activeIndex) => {
          const result = advance(state, activeIndex);
          const stepId = STEP_ORDER[activeIndex];

          // Index hors bornes : aucun avancement, ok=false, index inchangé.
          if (stepId === undefined) {
            expect(result.ok).toBe(false);
            expect(result.activeIndex).toBe(activeIndex);
            return;
          }

          const expectedOk = stepSchemas[stepId].safeParse(state).success;
          expect(result.ok).toBe(expectedOk);

          if (expectedOk) {
            // Avance d'exactement un, borné à la dernière étape.
            expect(result.activeIndex).toBe(Math.min(activeIndex + 1, LAST_INDEX));
          } else {
            // Étape active inchangée.
            expect(result.activeIndex).toBe(activeIndex);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: devis-questionnaire, Property 7: Invariants de navigation — pour toute séquence d'actions de navigation valides (advance / goPrev = max(0, i-1) / goToStep) partant de l'état initial, exactement une étape est active à tout instant (l'index reste dans [0, STEP_ORDER.length-1]), et goToStep(activeIndex, i, reachable) ne rend i actif que si reachable[i] est vrai ; toute cible non accessible laisse activeIndex inchangé.
  // Validates: Requirements 1.3, 2.5, 2.6
  it("Property 7: exactement une étape active et goToStep respecte l'accessibilité", () => {
    const arbAction = fc.oneof(
      fc.constant({ kind: "advance" as const }),
      fc.constant({ kind: "prev" as const }),
      fc.record({
        kind: fc.constant("goto" as const),
        target: fc.integer({ min: -2, max: STEP_ORDER.length + 2 }),
      }),
    );

    fc.assert(
      fc.property(
        arbMixedState,
        fc.array(arbAction, { maxLength: 20 }),
        (state, actions) => {
          const reachable = computeReachable(computeCompleted(state));

          // État initial : étape 0 active.
          let index = 0;

          const assertSingleActive = (i: number) => {
            expect(Number.isInteger(i)).toBe(true);
            expect(i).toBeGreaterThanOrEqual(0);
            expect(i).toBeLessThanOrEqual(LAST_INDEX);
          };

          assertSingleActive(index);

          for (const action of actions) {
            if (action.kind === "advance") {
              index = advance(state, index).activeIndex;
            } else if (action.kind === "prev") {
              index = Math.max(0, index - 1);
            } else {
              const target = action.target;
              const next = goToStep(index, target, reachable);

              const inBounds = target >= 0 && target < reachable.length;
              if (inBounds && reachable[target]) {
                // Cible accessible : elle devient l'étape active.
                expect(next).toBe(target);
              } else {
                // Cible non accessible ou hors bornes : index inchangé.
                expect(next).toBe(index);
              }

              index = next;
            }

            // Invariant maintenu après chaque action.
            assertSingleActive(index);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: devis-questionnaire, Property 8: La navigation préserve les données de l'État_Tunnel — pour tout TunnelState et toute séquence d'opérations de navigation, les champs de données (support, pack, options, lieu, creneau, devis) restent inchangés ; seul l'index actif évolue. Les fonctions de navigation étant pures et opérant sur des index (et non sur l'état), advance/goToStep ne mutent jamais l'objet état transmis.
  // Validates: Requirements 11.3, 12.1
  it("Property 8: advance et goToStep ne mutent jamais l'État_Tunnel", () => {
    fc.assert(
      fc.property(
        arbMixedState,
        fc.array(fc.integer({ min: -2, max: STEP_ORDER.length + 2 }), {
          maxLength: 20,
        }),
        (state, indices) => {
          const snapshot = structuredClone(state);

          const reachable = computeReachable(computeCompleted(state));
          // computeCompleted / computeReachable ne mutent pas l'état non plus.
          expect(state).toEqual(snapshot);

          let index = 0;
          for (const i of indices) {
            advance(state, i);
            goToStep(index, i, reachable);
            index = advance(state, index).activeIndex;

            // À chaque itération, l'état de données reste identique.
            expect(state).toEqual(snapshot);
          }

          // L'objet état n'a jamais été muté par la navigation.
          expect(state).toEqual(snapshot);
        },
      ),
      { numRuns: 100 },
    );
  });
});
