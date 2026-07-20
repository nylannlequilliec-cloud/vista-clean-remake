// Feature: devis-questionnaire
// Tests de la source de tarification centralisée (src/lib/devis/pricing.ts).
// Contient le test de propriété d'intégrité des données (Property 2) ainsi que
// des tests d'exemple/snapshot vérifiant les listes et prix exacts.

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  ACOMPTE_RATE,
  OPTIONS,
  PACKS,
  SUPPLEMENT_GROUPE_ELECTROGENE,
  SUPPORTS,
  getOption,
  getPack,
  getSupport,
} from "../pricing";
import type { OptionCategory } from "../types";

const OPTION_CATEGORIES: OptionCategory[] = [
  "TRAITEMENT",
  "SHAMPOING",
  "SUPPLEMENTS",
  "OPTIONS",
];

describe("pricing — Property 2: Intégrité des données de tarification", () => {
  // Feature: devis-questionnaire, Property 2: Pour toute entrée de SUPPORTS, PACKS et OPTIONS, le libellé est non vide, tout prix est un nombre fini ≥ 0, chaque support déclare un mode ∈ {prix, devis} et une icône non vide, et chaque option appartient à exactement une des catégories {TRAITEMENT, SHAMPOING, SUPPLEMENTS, OPTIONS}.
  // Validates: Requirements 3.2, 6.1, 6.2
  it("garantit l'intégrité de chaque support, pack et option (fast-check)", () => {
    // Support : tirage d'un index aléatoire dans SUPPORTS
    fc.assert(
      fc.property(fc.nat({ max: SUPPORTS.length - 1 }), (i) => {
        const support = SUPPORTS[i];
        expect(support.label.trim().length).toBeGreaterThan(0);
        expect(support.icon.trim().length).toBeGreaterThan(0);
        expect(["prix", "devis"]).toContain(support.mode);
      }),
      { numRuns: 100 }
    );

    // Pack : tirage d'un index aléatoire dans PACKS
    fc.assert(
      fc.property(fc.nat({ max: PACKS.length - 1 }), (i) => {
        const pack = PACKS[i];
        expect(pack.name.trim().length).toBeGreaterThan(0);
        expect(Number.isFinite(pack.price)).toBe(true);
        expect(pack.price).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );

    // Option : tirage d'un index aléatoire dans OPTIONS
    fc.assert(
      fc.property(fc.nat({ max: OPTIONS.length - 1 }), (i) => {
        const option = OPTIONS[i];
        expect(option.label.trim().length).toBeGreaterThan(0);
        expect(Number.isFinite(option.price)).toBe(true);
        expect(option.price).toBeGreaterThanOrEqual(0);
        // Appartient à exactement une catégorie parmi les 4 autorisées
        const matches = OPTION_CATEGORIES.filter((c) => c === option.category);
        expect(matches).toHaveLength(1);
      }),
      { numRuns: 100 }
    );
  });
});

describe("pricing — exemples / snapshot : supports", () => {
  it("expose exactement les 10 supports attendus avec leur mode", () => {
    expect(SUPPORTS.map((s) => s.id)).toEqual([
      "citadine",
      "berline",
      "suv",
      "monospace-5",
      "monospace-7",
      "canape-sans-angle",
      "canape-avec-angle",
      "utilitaire",
      "tapis-matelas-autre",
      "demande-specifique",
    ]);
  });

  it("classe correctement les supports en Mode_Prix et Mode_Devis", () => {
    const prix = SUPPORTS.filter((s) => s.mode === "prix").map((s) => s.id);
    const devis = SUPPORTS.filter((s) => s.mode === "devis").map((s) => s.id);
    expect(prix).toEqual([
      "citadine",
      "berline",
      "suv",
      "monospace-5",
      "monospace-7",
      "canape-sans-angle",
      "canape-avec-angle",
    ]);
    expect(devis).toEqual([
      "utilitaire",
      "tapis-matelas-autre",
      "demande-specifique",
    ]);
  });
});

describe("pricing — exemples / snapshot : packs", () => {
  it("expose CONFORT (99 €) et CONCESSION (129 €, populaire)", () => {
    expect(PACKS.map((p) => p.id)).toEqual(["confort", "concession"]);

    const confort = getPack("confort");
    expect(confort?.name).toBe("CONFORT");
    expect(confort?.price).toBe(99);
    expect(confort?.durationLabel).toBe("1h10 à 1h45");
    expect(confort?.popular).toBe(false);

    const concession = getPack("concession");
    expect(concession?.name).toBe("CONCESSION");
    expect(concession?.price).toBe(129);
    expect(concession?.durationLabel).toBe("2h30 à 3h");
    expect(concession?.popular).toBe(true);
  });
});

describe("pricing — exemples / snapshot : options par catégorie et prix", () => {
  const pricesFor = (category: OptionCategory) =>
    OPTIONS.filter((o) => o.category === category).map((o) => o.price);

  it("TRAITEMENT : 50 / 50 / 50 / 30 / 60 / 25", () => {
    expect(pricesFor("TRAITEMENT")).toEqual([50, 50, 50, 30, 60, 25]);
  });

  it("SHAMPOING : 10 / 20 / 60", () => {
    expect(pricesFor("SHAMPOING")).toEqual([10, 20, 60]);
  });

  it("SUPPLEMENTS : 25", () => {
    expect(pricesFor("SUPPLEMENTS")).toEqual([25]);
  });

  it("OPTIONS : 60 / 30 / 20 / 15 / 25 / 15 / 5 / 10 / 20", () => {
    expect(pricesFor("OPTIONS")).toEqual([60, 30, 20, 15, 25, 15, 5, 10, 20]);
  });

  it("associe chaque option à son prix exact via getOption", () => {
    expect(getOption("traitement-cuir")?.price).toBe(50);
    expect(getOption("alcantara")?.price).toBe(50);
    expect(getOption("ozone")?.price).toBe(50);
    expect(getOption("vapeur")?.price).toBe(30);
    expect(getOption("antimoisissure")?.price).toBe(60);
    expect(getOption("cuir-hors-sieges")?.price).toBe(25);
    expect(getOption("siege-auto-bebe")?.price).toBe(10);
    expect(getOption("coffre")?.price).toBe(20);
    expect(getOption("plafonnier")?.price).toBe(60);
    expect(getOption("vehicule-pas-vide")?.price).toBe(25);
    expect(getOption("renovation-2-phares")?.price).toBe(60);
    expect(getOption("interieur-clair")?.price).toBe(30);
    expect(getOption("tapis-supplementaire")?.price).toBe(20);
    expect(getOption("tapis-de-coffre")?.price).toBe(15);
    expect(getOption("sous-coffre")?.price).toBe(25);
    expect(getOption("senteur-parfum")?.price).toBe(15);
    expect(getOption("gonflage-pneus")?.price).toBe(5);
    expect(getOption("remplissage-lave-glace")?.price).toBe(10);
    expect(getOption("nettoyage-ceintures")?.price).toBe(20);
  });
});

describe("pricing — constantes et accès typés", () => {
  it("expose les constantes de tarification attendues", () => {
    expect(SUPPLEMENT_GROUPE_ELECTROGENE).toBe(5);
    expect(ACOMPTE_RATE).toBe(0.15);
  });

  it("getSupport retourne le support attendu", () => {
    expect(getSupport("citadine")?.label).toBe("Citadine");
    expect(getSupport("utilitaire")?.mode).toBe("devis");
  });
});
