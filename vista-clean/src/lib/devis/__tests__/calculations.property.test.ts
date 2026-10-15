// Feature: devis-questionnaire
// Tests de propriété (fast-check) de la couche de calculs pure du Tunnel.
// Couvre les propriétés 1 (Prix_Total & Acompte), 5 (basculement d'options)
// et 12 (formatage monétaire). numRuns >= 100 par propriété.

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  computeFraisDeplacement,
  computeTotal,
  formatEuro,
  toggleOption,
} from "../calculations";
import {
  ACOMPTE_RATE,
  getOption,
  getPack,
  OPTIONS,
  PACKS,
  SUPPLEMENT_GROUPE_ELECTROGENE,
  SUPPORTS,
} from "../pricing";
import type { OptionId, PackId, SupportId, TunnelState } from "../types";

/** Reproduit l'arrondi à deux décimales utilisé par la couche de calculs. */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Identifiants des supports en Mode_Prix (parcours tarifé). */
const priceSupportIds: SupportId[] = SUPPORTS.filter(
  (support) => support.mode === "prix",
).map((support) => support.id);

/** Tous les identifiants d'options connus. */
const optionIds: OptionId[] = OPTIONS.map((option) => option.id);

/** Tous les identifiants de packs connus. */
const packIds: PackId[] = PACKS.map((pack) => pack.id);

/** Générateur d'un identifiant d'option valide (sous-ensemble de OPTIONS). */
const arbOptionId = fc.constantFrom(...optionIds);

/** Somme (dédupliquée, arrondie) des prix d'une liste d'options. */
function expectedOptionsTotal(options: OptionId[]): number {
  const uniques = [...new Set(options)];
  return round2(
    uniques.reduce((sum, id) => sum + (getOption(id)?.price ?? 0), 0),
  );
}

/** Construit un TunnelState minimal à partir d'un sous-ensemble de champs. */
function makeState(partial: {
  support?: SupportId | null;
  pack?: PackId | null;
  options?: OptionId[];
  lieuType?: "local" | "domicile" | null;
  address?: string;
  addressValidated?: boolean;
  noElectricity?: boolean;
}): TunnelState {
  return {
    support: partial.support ?? priceSupportIds[0],
    pack: partial.pack ?? null,
    options: partial.options ?? [],
    lieu: {
      type: partial.lieuType ?? "local",
      address: partial.address ?? "",
      addressValidated: partial.addressValidated ?? false,
      noElectricity: partial.noElectricity ?? false,
    },
    creneauId: null,
    devis: { prenom: "", telephone: "", besoin: "" },
  };
}

/**
 * Générateur de TunnelState restreint au Mode_Prix : le support est soit `null`
 * (mode par défaut « prix »), soit un support pré-classé « prix ».
 */
const arbPriceTunnelState: fc.Arbitrary<TunnelState> = fc
  .record({
    support: fc.constantFrom(...priceSupportIds, null) as fc.Arbitrary<
      SupportId | null
    >,
    pack: fc.constantFrom(...packIds, null) as fc.Arbitrary<PackId | null>,
    options: fc.array(arbOptionId, { maxLength: 8 }),
    lieuType: fc.constantFrom("local", "domicile", null) as fc.Arbitrary<
      "local" | "domicile" | null
    >,
    address: fc.string({ maxLength: 300 }),
    addressValidated: fc.boolean(),
    noElectricity: fc.boolean(),
  })
  .map((r) =>
    makeState({
      support: r.support,
      pack: r.pack,
      options: r.options,
      lieuType: r.lieuType,
      address: r.address,
      addressValidated: r.addressValidated,
      noElectricity: r.noElectricity,
    }),
  );

describe("calculations — propriétés de correction", () => {
  // Feature: devis-questionnaire, Property 1: Invariant du Prix_Total et de l'Acompte — pour tout TunnelState en Mode_Prix, total = prix du pack (0 sans pack) + somme des options sélectionnées + frais de déplacement (0 en local) + supplément groupe électrogène (5 sans électricité), et acompte = round2(total * 0.15).
  // Validates: Requirements 7.2, 7.4, 7.6, 8.5, 9.1, 9.4
  it("Property 1: le Prix_Total agrège ses composantes et l'acompte vaut 15 % du total", () => {
    fc.assert(
      fc.property(arbPriceTunnelState, (state) => {
        const breakdown = computeTotal(state);

        const expectedPackPrice = state.pack
          ? (getPack(state.pack)?.price ?? 0)
          : 0;
        const expectedOptions = expectedOptionsTotal(state.options);
        const expectedFrais =
          state.lieu.type === "local"
            ? 0
            : computeFraisDeplacement(state.lieu.address);
        const expectedSupplement = state.lieu.noElectricity
          ? SUPPLEMENT_GROUPE_ELECTROGENE
          : 0;
        const expectedTotal = round2(
          expectedPackPrice +
            expectedOptions +
            expectedFrais +
            expectedSupplement,
        );

        expect(breakdown.mode).toBe("prix");
        expect(breakdown.packPrice).toBe(expectedPackPrice);
        expect(breakdown.optionsTotal).toBe(expectedOptions);
        expect(breakdown.fraisDeplacement).toBe(expectedFrais);
        expect(breakdown.supplementGroupeElectrogene).toBe(expectedSupplement);
        expect(breakdown.total).toBe(expectedTotal);
        expect(breakdown.acompte).toBe(round2(expectedTotal * ACOMPTE_RATE));
      }),
      { numRuns: 200 },
    );
  });

  // Feature: devis-questionnaire, Property 5: Basculement d'options — round-trip et somme — basculer deux fois un identifiant redonne la sélection d'origine (en tant qu'ensemble), et après un basculement optionsTotal vaut la somme des prix des options réellement sélectionnées (sans doublon).
  // Validates: Requirements 6.7, 6.8
  it("Property 5: toggleOption est involutif (à l'ensemble) et le total des options ignore les doublons", () => {
    fc.assert(
      fc.property(
        fc.array(arbOptionId, { maxLength: 10 }),
        arbOptionId,
        (options, id) => {
          const once = toggleOption(options, id);
          const twice = toggleOption(once, id);

          // Round-trip : deux basculements redonnent l'ensemble d'origine.
          expect(new Set(twice)).toEqual(new Set(options));

          // L'identifiant basculé n'apparaît jamais en double.
          const occurrences = once.filter((optionId) => optionId === id).length;
          expect(occurrences).toBeLessThanOrEqual(1);

          // optionsTotal somme les options réellement sélectionnées, sans doublon.
          const breakdown = computeTotal(makeState({ options: once }));
          expect(breakdown.optionsTotal).toBe(expectedOptionsTotal(once));
        },
      ),
      { numRuns: 200 },
    );
  });

  // Feature: devis-questionnaire, Property 12: Formatage monétaire — formatEuro produit une chaîne en euros comportant au plus 2 décimales, dont la valeur numérique reparsée est égale au montant arrondi à 2 décimales, pour tout montant fini >= 0.
  // Validates: Requirements 9.3
  it("Property 12: formatEuro produit au plus 2 décimales et reste réversible", () => {
    const arbAmount = fc.double({
      min: 0,
      max: 1e7,
      noNaN: true,
      noDefaultInfinity: true,
    });

    fc.assert(
      fc.property(arbAmount, (amount) => {
        const formatted = formatEuro(amount);

        // Retire tout sauf chiffres et virgule décimale (espaces insécables,
        // séparateurs de milliers et symbole € inclus).
        const cleaned = formatted.replace(/[^\d,]/g, "");
        const [, decimals = ""] = cleaned.split(",");

        // Au plus deux décimales.
        expect(decimals.length).toBeLessThanOrEqual(2);

        // Valeur reparsée == montant arrondi à deux décimales.
        const reparsed = Number.parseFloat(cleaned.replace(",", "."));
        expect(reparsed).toBeCloseTo(round2(amount), 2);
      }),
      { numRuns: 200 },
    );
  });
});
