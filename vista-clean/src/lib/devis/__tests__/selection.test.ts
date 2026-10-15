// Feature: devis-questionnaire
// Test de propriété (fast-check) de la logique pure de sélection de créneau.
// Couvre la Property 10 (Sélection de créneau). numRuns >= 100.

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { selectCreneau } from "../selection";
import type { Creneau, TunnelState } from "../types";

/**
 * Arbitraire d'un tableau de `Creneau` aux identifiants uniques, avec des
 * drapeaux `full` aléatoires, des dates ISO et des libellés d'horaire.
 */
const arbCreneaux: fc.Arbitrary<Creneau[]> = fc
  .uniqueArray(
    fc.record({
      id: fc.string({ minLength: 1, maxLength: 12 }),
      date: fc
        .date({
          min: new Date("2024-01-01T00:00:00Z"),
          max: new Date("2030-12-31T00:00:00Z"),
          noInvalidDate: true,
        })
        .map((d) => d.toISOString().slice(0, 10)),
      startLabel: fc.constantFrom("08h00", "10h30", "14h00", "16h15", "18h45"),
      full: fc.boolean(),
    }),
    { selector: (creneau) => creneau.id, maxLength: 12 },
  );

/** Arbitraire d'un `TunnelState` quelconque (le champ pertinent est `creneauId`). */
const arbTunnelState: fc.Arbitrary<TunnelState> = fc.record({
  support: fc.constant(null),
  pack: fc.constant(null),
  options: fc.constant([]),
  lieu: fc.record({
    type: fc.constant(null),
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
 * Arbitraire d'un identifiant cible : tantôt puisé dans les créneaux existants
 * (disponibles comme complets), tantôt un identifiant absent de l'ensemble.
 */
function arbTargetId(creneaux: Creneau[]): fc.Arbitrary<string> {
  const absent = fc
    .string({ minLength: 1, maxLength: 16 })
    .filter((id) => !creneaux.some((creneau) => creneau.id === id));

  if (creneaux.length === 0) {
    return absent;
  }

  return fc.oneof(
    fc.constantFrom(...creneaux.map((creneau) => creneau.id)),
    absent,
  );
}

describe("selectCreneau — Property 10", () => {
  // Feature: devis-questionnaire, Property 10: Creneau selection. For any set of Creneau and any target creneau id, selecting an available creneau (full === false) records its id in the state (creneauId === targetId), while selecting a full creneau (full === true) OR a non-existent id is rejected and leaves creneauId unchanged. Also assert the input state is never mutated.
  // Validates: Requirements 8.2, 8.3
  it("enregistre un créneau disponible, rejette un créneau complet ou inexistant, sans muter l'entrée", () => {
    fc.assert(
      fc.property(
        arbCreneaux.chain((creneaux) =>
          fc.record({
            creneaux: fc.constant(creneaux),
            state: arbTunnelState,
            targetId: arbTargetId(creneaux),
          }),
        ),
        ({ creneaux, state, targetId }) => {
          // Copie profonde de l'entrée pour vérifier l'absence de mutation.
          const snapshot = structuredClone(state);

          const result = selectCreneau(state, creneaux, targetId);

          const target = creneaux.find((creneau) => creneau.id === targetId);
          const isAvailable = target !== undefined && !target.full;

          if (isAvailable) {
            // Un créneau disponible voit son identifiant enregistré.
            expect(result.creneauId).toBe(targetId);
          } else {
            // Un créneau complet ou inexistant laisse creneauId inchangé.
            expect(result.creneauId).toBe(state.creneauId);
          }

          // L'entrée n'est jamais mutée.
          expect(state).toEqual(snapshot);
        },
      ),
      { numRuns: 100 },
    );
  });
});
