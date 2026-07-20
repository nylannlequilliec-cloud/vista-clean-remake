// Feature: devis-questionnaire
// Tests de la résolution de mode (src/lib/devis/mode.ts).
// Property 3 (fast-check, numRuns: 100) + assertion d'exemple pour l'état null.

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { resolveMode } from "../mode";
import type { SupportId } from "../types";

/** Les 10 identifiants de support (source de vérité : pricing.ts / types.ts). */
const ALL_SUPPORT_IDS: SupportId[] = [
  "citadine",
  "berline",
  "suv",
  "monospace-5",
  "monospace-7",
  "utilitaire",
  "canape-sans-angle",
  "canape-avec-angle",
  "tapis-matelas-autre",
  "demande-specifique",
];

/** Les supports non standard traités en Mode_Devis. */
const DEVIS_SUPPORT_IDS: ReadonlySet<SupportId> = new Set<SupportId>([
  "utilitaire",
  "tapis-matelas-autre",
  "demande-specifique",
]);

/** Arbitraire couvrant l'intégralité de l'espace des SupportId. */
const supportIdArb: fc.Arbitrary<SupportId> = fc.constantFrom(...ALL_SUPPORT_IDS);

describe("resolveMode", () => {
  // Feature: devis-questionnaire, Property 3: resolveMode totally partitions supports.
  // For any SupportId, resolveMode returns exactly one mode; it returns "devis"
  // iff the support is utilitaire, tapis-matelas-autre, or demande-specifique,
  // and "prix" for all other standard supports.
  // Validates: Requirements 4.1, 4.2, 4.3, 4.5
  it("partitionne totalement les supports entre 'prix' et 'devis'", () => {
    fc.assert(
      fc.property(supportIdArb, (supportId) => {
        const mode = resolveMode(supportId);

        // Le mode est exactement l'une des deux valeurs (partition totale).
        expect(mode === "prix" || mode === "devis").toBe(true);

        // "devis" ssi le support est non standard, "prix" sinon.
        if (DEVIS_SUPPORT_IDS.has(supportId)) {
          expect(mode).toBe("devis");
        } else {
          expect(mode).toBe("prix");
        }
      }),
      { numRuns: 100 },
    );
  });

  it("retourne 'prix' pour l'état initial sans sélection (null)", () => {
    expect(resolveMode(null)).toBe("prix");
  });
});
