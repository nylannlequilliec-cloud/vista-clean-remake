// Feature: devis-questionnaire
// Test de propriété (fast-check) de la vue de données du Récapitulatif du
// Tunnel (`buildRecap`). Couvre la propriété 11 (complétude du Récapitulatif).
// numRuns >= 100.

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { computeTotal } from "../calculations";
import { getPack, getSupport, OPTIONS, PACKS, SUPPORTS } from "../pricing";
import { buildRecap } from "../recap";
import type { OptionId, PackId, SupportId, TunnelState } from "../types";

/** Tous les identifiants de supports (Mode_Prix ET Mode_Devis). */
const supportIds: SupportId[] = SUPPORTS.map((support) => support.id);

/** Tous les identifiants d'options connus. */
const optionIds: OptionId[] = OPTIONS.map((option) => option.id);

/** Tous les identifiants de packs connus. */
const packIds: PackId[] = PACKS.map((pack) => pack.id);

/** Générateur d'un identifiant d'option valide. */
const arbOptionId = fc.constantFrom(...optionIds);

/**
 * Générateur de TunnelState couvrant les DEUX branches : supports en Mode_Prix
 * et supports en Mode_Devis (plus `null`), afin d'exercer les deux chemins de
 * `buildRecap`. Le mode effectif est dérivé du support par `computeTotal`.
 */
const arbTunnelState: fc.Arbitrary<TunnelState> = fc
  .record({
    support: fc.constantFrom(...supportIds, null) as fc.Arbitrary<
      SupportId | null
    >,
    pack: fc.constantFrom(...packIds, null) as fc.Arbitrary<PackId | null>,
    options: fc.array(arbOptionId, { maxLength: 10 }),
    lieuType: fc.constantFrom("local", "domicile", null) as fc.Arbitrary<
      "local" | "domicile" | null
    >,
    address: fc.string({ maxLength: 300 }),
    addressValidated: fc.boolean(),
    noElectricity: fc.boolean(),
    creneauId: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
    prenom: fc.string({ maxLength: 100 }),
    telephone: fc.string({ maxLength: 30 }),
    besoin: fc.string({ maxLength: 2000 }),
  })
  .map((r) => ({
    support: r.support,
    pack: r.pack,
    options: r.options,
    lieu: {
      type: r.lieuType,
      address: r.address,
      addressValidated: r.addressValidated,
      noElectricity: r.noElectricity,
    },
    creneauId: r.creneauId,
    devis: { prenom: r.prenom, telephone: r.telephone, besoin: r.besoin },
  }));

/** Nombre d'options uniques et valides dans une sélection. */
function uniqueValidOptionsCount(options: OptionId[]): number {
  const seen = new Set<OptionId>();
  for (const id of options) {
    if (!seen.has(id) && OPTIONS.some((option) => option.id === id)) {
      seen.add(id);
    }
  }
  return seen.size;
}

describe("recap — propriété de correction", () => {
  // Feature: devis-questionnaire, Property 11: Complétude du Récapitulatif — pour tout TunnelState en Mode_Prix, buildRecap(state, computeTotal(state)) inclut le Support choisi, le Pack et son prix, chaque Option sélectionnée, le lieu, les Frais_Déplacement, le Prix_Total (Prix_Total) et l'Acompte issus du PricingBreakdown correspondant ; en Mode_Devis il n'expose aucun prix automatique (pack/options/total/acompte null, isDevis true) et signale « sur devis ».
  // Validates: Requirements 8.4, 9.5, 10.2
  it("Property 11: le Récapitulatif est complet en Mode_Prix et masque tout prix en Mode_Devis", () => {
    fc.assert(
      fc.property(arbTunnelState, (state) => {
        const pricing = computeTotal(state);
        const recap = buildRecap(state, pricing);

        // Le mode du récap suit celui du PricingBreakdown.
        expect(recap.mode).toBe(pricing.mode);

        // Le Support et le lieu sont exposés dans les deux modes.
        if (state.support === null) {
          expect(recap.support).toBeNull();
        } else {
          expect(recap.support).not.toBeNull();
          expect(recap.support?.label).toBe(getSupport(state.support)?.label);
        }
        expect(recap.lieu.type).toBe(state.lieu.type);
        expect(recap.lieu.address).toBe(state.lieu.address);

        if (pricing.mode === "prix") {
          // Mode_Prix : complétude du récapitulatif.
          expect(recap.isDevis).toBe(false);
          expect(recap.tarificationLabel).toBeNull();

          expect(recap.total).toBe(pricing.total);
          expect(recap.acompte).toBe(pricing.acompte);
          expect(recap.fraisDeplacement).toBe(pricing.fraisDeplacement);
          expect(recap.supplementGroupeElectrogene).toBe(
            pricing.supplementGroupeElectrogene,
          );

          // Pack + prix (ou null si aucun pack sélectionné).
          if (state.pack === null) {
            expect(recap.pack).toBeNull();
          } else {
            expect(recap.pack).not.toBeNull();
            expect(recap.pack?.price).toBe(getPack(state.pack)?.price);
          }

          // Chaque Option sélectionnée (unique et valide) figure au récap.
          expect(recap.options).toHaveLength(
            uniqueValidOptionsCount(state.options),
          );
        } else {
          // Mode_Devis : aucun prix automatique, signal « sur devis ».
          expect(recap.isDevis).toBe(true);
          expect(recap.pack).toBeNull();
          expect(recap.options).toEqual([]);
          expect(recap.total).toBeNull();
          expect(recap.acompte).toBeNull();
          expect(recap.fraisDeplacement).toBeNull();
          expect(recap.supplementGroupeElectrogene).toBeNull();
          expect(recap.tarificationLabel).toBe("Tarification sur devis");
        }
      }),
      { numRuns: 100 },
    );
  });
});
