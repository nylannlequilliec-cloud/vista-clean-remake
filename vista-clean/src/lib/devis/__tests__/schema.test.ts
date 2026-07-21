// Feature: devis-questionnaire
// Tests de propriété pour la validation du numéro de téléphone français
// (`isValidFrenchPhone`) du module `schema.ts`.

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { isValidFrenchPhone, devisSchema, stepSchemas } from "../schema";

const NUM_RUNS = 100;

/**
 * Prédicat indépendant reproduisant la sémantique de `isValidFrenchPhone` :
 * une fois les séparateurs usuels retirés, la chaîne doit correspondre au
 * format national `0X XX XX XX XX` ou international `+33 X XX XX XX XX`.
 * Utilisé uniquement pour construire/filtrer les générateurs, pas pour tester.
 */
function matchesFrenchPhoneFormat(value: string): boolean {
  const cleaned = value.replace(/[\s.\-]/g, "");
  return /^0[1-9]\d{8}$/.test(cleaned) || /^\+33[1-9]\d{8}$/.test(cleaned);
}

/** Insère les séparateurs `seps[i]` entre `chars[i]` et `chars[i+1]`. */
function interleave(chars: string[], seps: string[]): string {
  let out = chars[0] ?? "";
  for (let i = 1; i < chars.length; i += 1) {
    out += (seps[i - 1] ?? "") + chars[i];
  }
  return out;
}

/**
 * Génère un numéro de téléphone français valide : format national ou
 * international, premier chiffre significatif ∈ 1-9, puis 8 chiffres, avec des
 * séparateurs usuels (espace, point, tiret) interleavés aléatoirement.
 */
const arbValidFrenchPhone: fc.Arbitrary<string> = fc
  .record({
    international: fc.boolean(),
    first: fc.integer({ min: 1, max: 9 }),
    rest: fc.array(fc.integer({ min: 0, max: 9 }), {
      minLength: 8,
      maxLength: 8,
    }),
  })
  .chain(({ international, first, rest }) => {
    const prefix = international ? "+33" : "0";
    const base = `${prefix}${first}${rest.join("")}`;
    const chars = base.split("");
    return fc
      .array(fc.constantFrom("", " ", ".", "-"), {
        minLength: chars.length - 1,
        maxLength: chars.length - 1,
      })
      .map((seps) => interleave(chars, seps));
  });

/**
 * Génère des chaînes qui ne sont PAS des numéros français valides : chaînes
 * arbitraires, longueurs incorrectes, lettres, préfixes erronés, chaîne vide —
 * en écartant tout ce qui, séparateurs retirés, respecterait le format.
 */
const arbInvalidPhone: fc.Arbitrary<string> = fc
  .oneof(
    fc.string(),
    // Suites de chiffres de longueur incorrecte.
    fc
      .array(fc.integer({ min: 0, max: 9 }), { minLength: 0, maxLength: 15 })
      .map((digits) => digits.join("")),
    // Format national mais premier chiffre significatif = 0.
    fc
      .array(fc.integer({ min: 0, max: 9 }), { minLength: 8, maxLength: 8 })
      .map((rest) => `00${rest.join("")}`),
    // Préfixe international erroné.
    fc
      .array(fc.integer({ min: 0, max: 9 }), { minLength: 9, maxLength: 9 })
      .map((digits) => `+34${digits.join("")}`),
    // Contient des lettres.
    fc.string({ minLength: 1 }).map((s) => `0${s}abc`),
    fc.constant(""),
  )
  .filter((value) => !matchesFrenchPhoneFormat(value));

describe("isValidFrenchPhone", () => {
  // Feature: devis-questionnaire, Property 13: Pour tout numéro de téléphone
  // français valide (national 0X XX XX XX XX ou international +33 X XX XX XX XX,
  // avec séparateurs usuels espaces/points/tirets), isValidFrenchPhone retourne
  // true ; pour toute chaîne ne respectant pas ce format, elle retourne false.
  it("retourne true pour tout numéro français valide", () => {
    fc.assert(
      fc.property(arbValidFrenchPhone, (phone) => {
        expect(isValidFrenchPhone(phone)).toBe(true);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("retourne false pour toute chaîne ne respectant pas le format", () => {
    fc.assert(
      fc.property(arbInvalidPhone, (phone) => {
        expect(isValidFrenchPhone(phone)).toBe(false);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it("accepte des exemples canoniques (national et international)", () => {
    expect(isValidFrenchPhone("06 12 34 56 78")).toBe(true);
    expect(isValidFrenchPhone("01.23.45.67.89")).toBe(true);
    expect(isValidFrenchPhone("07-12-34-56-78")).toBe(true);
    expect(isValidFrenchPhone("+33 6 12 34 56 78")).toBe(true);
  });

  it("rejette des exemples invalides", () => {
    expect(isValidFrenchPhone("")).toBe(false);
    expect(isValidFrenchPhone("00 12 34 56 78")).toBe(false);
    expect(isValidFrenchPhone("06 12 34 56")).toBe(false);
    expect(isValidFrenchPhone("+34 6 12 34 56 78")).toBe(false);
    expect(isValidFrenchPhone("abcdefghij")).toBe(false);
  });

  it("rejette les numéros de téléphone dépassant la limite de longueur de 30 caractères", () => {
    const longPhone = "06" + " ".repeat(29);
    expect(isValidFrenchPhone(longPhone)).toBe(false);
  });
});

describe("devisSchema et stepSchemas - Limites de longueur de sécurité", () => {
  it("rejette les valeurs dépassant la limite pour le prenom", () => {
    const parsed = devisSchema.safeParse({
      prenom: "a".repeat(101),
      telephone: "0612345678",
      besoin: "Nettoyage canapé",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("le prénom est trop long");
    }
  });

  it("rejette les valeurs dépassant la limite pour le besoin", () => {
    const parsed = devisSchema.safeParse({
      prenom: "Jean",
      telephone: "0612345678",
      besoin: "a".repeat(2001),
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("la description est trop longue");
    }
  });

  it("rejette les valeurs de lieu d'adresse dépassant 300 caractères", () => {
    const schemaLieu = stepSchemas.lieu;
    const parsed = schemaLieu.safeParse({
      lieu: {
        type: "domicile",
        address: "a".repeat(301),
        addressValidated: true,
        noElectricity: false,
      },
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toContain("l'adresse est trop longue");
    }
  });
});
