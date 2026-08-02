// Feature: devis-questionnaire
// Test de propriété (fast-check) de la (dé)sérialisation persistante du Tunnel.
// Couvre la Propriété 9 (Round-trip de persistance). numRuns >= 100.

import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { deserialize, serialize } from "../persistence";
import type {
  LieuType,
  PackId,
  SupportId,
  TunnelState,
} from "../types";

/** Identifiants de support acceptés par le schéma (miroir de `SupportId`). */
const supportIds: SupportId[] = [
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

/** Identifiants de pack acceptés par le schéma (miroir de `PackId`). */
const packIds: PackId[] = ["confort", "concession"];

/** Types de lieu acceptés par le schéma (miroir de `LieuType`). */
const lieuTypes: LieuType[] = ["local", "domicile"];

/**
 * Générateur d'un `TunnelState` valide correspondant EXACTEMENT à la forme
 * acceptée par le schéma Zod (`strictObject`). Aucune clé supplémentaire n'est
 * générée dans les objets stricts (support, pack, lieu, devis) sous peine de
 * rejet par la validation.
 * Respecte les contraintes strictes de sécurité de longueur de chaines.
 */
const arbTunnelState: fc.Arbitrary<TunnelState> = fc.record({
  support: fc.constantFrom<SupportId | null>(...supportIds, null),
  pack: fc.constantFrom<PackId | null>(...packIds, null),
  options: fc.array(fc.string({ maxLength: 100 }), { maxLength: 100 }),
  lieu: fc.record({
    type: fc.constantFrom<LieuType | null>(...lieuTypes, null),
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
 * Générateur d'entrées corrompues / de forme incompatible garanties invalides.
 * Chaque cas doit faire retourner `null` à `deserialize` (dégradation gracieuse).
 */
const arbCorruptedRaw: fc.Arbitrary<string> = fc.oneof(
  // 1. Chaînes non-JSON (JSON.parse échoue).
  fc
    .string()
    .filter((s) => {
      try {
        JSON.parse(s);
        return false;
      } catch {
        return true;
      }
    }),
  // 2. JSON valide mais de type primitif / tableau (forme incompatible).
  fc
    .oneof(
      fc.integer(),
      fc.double({ noNaN: true, noDefaultInfinity: true }),
      fc.boolean(),
      fc.string(),
      fc.constant(null),
      fc.array(fc.anything()),
    )
    .map((value) => JSON.stringify(value)),
  // 3. Objet auquel il manque des clés requises.
  arbTunnelState.map((state) => {
    const obj = { ...state } as Record<string, unknown>;
    delete obj.support;
    delete obj.creneauId;
    return JSON.stringify(obj);
  }),
  // 4. Objet comportant une clé supplémentaire inconnue (rejeté par strictObject).
  arbTunnelState.map((state) =>
    JSON.stringify({ ...state, unexpectedKey: "boom" }),
  ),
  // 5. Objet dont un champ a un type incompatible.
  arbTunnelState.map((state) =>
    JSON.stringify({ ...state, options: "pas-un-tableau" }),
  ),
);

describe("persistence — propriétés de correction", () => {
  // Feature: devis-questionnaire, Property 9: Round-trip de persistance — pour tout TunnelState valide, deserialize(serialize(state)) est égal (deep-equal) à state ; et pour toute chaîne corrompue ou de forme incompatible, deserialize retourne null (dégradation gracieuse).
  // Validates: Requirements 12.2
  it("Property 9: deserialize(serialize(state)) redonne l'état d'origine (round-trip exact)", () => {
    fc.assert(
      fc.property(arbTunnelState, (state) => {
        const restored = deserialize(serialize(state));
        expect(restored).toEqual(state);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: devis-questionnaire, Property 9: Round-trip de persistance — volet dégradation gracieuse : toute entrée corrompue (JSON invalide, mauvaise forme, clés manquantes ou supplémentaires) doit produire null.
  // Validates: Requirements 12.2
  it("Property 9: deserialize retourne null pour toute entrée corrompue ou incompatible", () => {
    fc.assert(
      fc.property(arbCorruptedRaw, (raw) => {
        expect(deserialize(raw)).toBeNull();
      }),
      { numRuns: 100 },
    );
  });
});

describe("persistence — contraintes de sécurité de longueur", () => {
  const BASE_STATE: TunnelState = {
    support: "citadine",
    pack: "confort",
    options: ["ozone"],
    lieu: {
      type: "domicile",
      address: "123 Rue de la Paix",
      addressValidated: true,
      noElectricity: false,
    },
    creneauId: "slot-1",
    devis: {
      prenom: "Jean",
      telephone: "0612345678",
      besoin: "Nettoyage complet",
    },
  };

  it("rejette un état désérialisé si le prénom dépasse 100 caractères", () => {
    const invalidState = {
      ...BASE_STATE,
      devis: {
        ...BASE_STATE.devis,
        prenom: "A".repeat(101),
      },
    };
    expect(deserialize(serialize(invalidState))).toBeNull();
  });

  it("rejette un état désérialisé si le téléphone dépasse 30 caractères", () => {
    const invalidState = {
      ...BASE_STATE,
      devis: {
        ...BASE_STATE.devis,
        telephone: "0".repeat(31),
      },
    };
    expect(deserialize(serialize(invalidState))).toBeNull();
  });

  it("rejette un état désérialisé si le besoin dépasse 2000 caractères", () => {
    const invalidState = {
      ...BASE_STATE,
      devis: {
        ...BASE_STATE.devis,
        besoin: "A".repeat(2001),
      },
    };
    expect(deserialize(serialize(invalidState))).toBeNull();
  });

  it("rejette un état désérialisé si l'adresse dépasse 300 caractères", () => {
    const invalidState = {
      ...BASE_STATE,
      lieu: {
        ...BASE_STATE.lieu,
        address: "A".repeat(301),
      },
    };
    expect(deserialize(serialize(invalidState))).toBeNull();
  });

  it("rejette un état désérialisé si un identifiant d'option dépasse 100 caractères", () => {
    const invalidState = {
      ...BASE_STATE,
      options: ["A".repeat(101)],
    };
    expect(deserialize(serialize(invalidState))).toBeNull();
  });

  it("rejette un état désérialisé s'il y a plus de 100 options", () => {
    const invalidState = {
      ...BASE_STATE,
      options: Array(101).fill("ozone"),
    };
    expect(deserialize(serialize(invalidState))).toBeNull();
  });

  it("rejette un état désérialisé si l'identifiant du créneau dépasse 100 caractères", () => {
    const invalidState = {
      ...BASE_STATE,
      creneauId: "C".repeat(101),
    };
    expect(deserialize(serialize(invalidState))).toBeNull();
  });
});
