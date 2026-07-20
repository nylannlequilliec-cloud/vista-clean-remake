import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { reconcileState } from "../reconcile";
import { resolveMode } from "../mode";
import { OPTIONS, SUPPORTS } from "../pricing";
import type { LieuType, OptionId, PackId, SupportId, TunnelState } from "../types";

// Tous les identifiants de support (source de vérité : pricing.ts).
const SUPPORT_IDS: SupportId[] = SUPPORTS.map((support) => support.id);
const OPTION_IDS: OptionId[] = OPTIONS.map((option) => option.id);
const PACK_IDS: PackId[] = ["confort", "concession"];
const LIEU_TYPES: LieuType[] = ["local", "domicile"];

/** Arbitraire couvrant l'ensemble des SupportId. */
const arbSupportId: fc.Arbitrary<SupportId> = fc.constantFrom(...SUPPORT_IDS);

/**
 * Arbitraire produisant un `TunnelState` quelconque : n'importe quel support
 * (ou null), pack, sous-ensemble d'options, lieu, créneau et champs de devis.
 */
const arbTunnelState: fc.Arbitrary<TunnelState> = fc.record({
  support: fc.option(arbSupportId, { nil: null }),
  pack: fc.option(fc.constantFrom(...PACK_IDS), { nil: null }),
  options: fc.uniqueArray(fc.constantFrom(...OPTION_IDS)),
  lieu: fc.record({
    type: fc.option(fc.constantFrom(...LIEU_TYPES), { nil: null }),
    address: fc.string(),
    addressValidated: fc.boolean(),
    noElectricity: fc.boolean(),
  }),
  creneauId: fc.option(fc.string(), { nil: null }),
  devis: fc.record({
    prenom: fc.string(),
    telephone: fc.string(),
    besoin: fc.string(),
  }),
});

describe("reconcileState — Property 4", () => {
  // Feature: devis-questionnaire, Property 4: reconcileState produit un état cohérent après changement de support. Pour tout TunnelState et tout nouveau SupportId, reconcileState(state, nextSupport) produit un état dont le mode dérivé égale resolveMode(nextSupport), et dans lequel toute sélection ultérieure devenue incompatible (par ex. pack et options lorsqu'on bascule en Mode_Devis) est retirée, ne laissant que des sélections valides pour le nouveau support.
  it("produit un état cohérent avec le mode du nouveau support, sans muter l'entrée", () => {
    fc.assert(
      fc.property(arbTunnelState, arbSupportId, (state, nextSupport) => {
        // Copie profonde de l'entrée pour vérifier l'absence de mutation.
        const snapshot = structuredClone(state);

        const result = reconcileState(state, nextSupport);

        // Le nouvel état porte le support demandé.
        expect(result.support).toBe(nextSupport);

        // Le mode dérivé de l'état est celui du nouveau support.
        expect(resolveMode(result.support)).toBe(resolveMode(nextSupport));

        // En Mode_Devis, toutes les sélections de prix sont retirées.
        if (resolveMode(nextSupport) === "devis") {
          expect(result.pack).toBeNull();
          expect(result.options).toEqual([]);
          expect(result.lieu.type).toBeNull();
          expect(result.lieu.address).toBe("");
          expect(result.lieu.addressValidated).toBe(false);
          expect(result.lieu.noElectricity).toBe(false);
          expect(result.creneauId).toBeNull();
        }

        // L'entrée n'est jamais mutée.
        expect(state).toEqual(snapshot);
      }),
      { numRuns: 100 },
    );
  });
});
