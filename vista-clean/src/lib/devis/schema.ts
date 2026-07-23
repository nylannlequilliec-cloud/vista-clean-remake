// Feature: devis-questionnaire
// Schémas de validation Zod par étape et validation du numéro de téléphone
// français. Aucune dépendance à React ni au DOM : ce module est purement
// logique et testable. Tous les messages d'erreur sont en français.

import { z } from "zod";

import { PACKS, SUPPORTS } from "./pricing";
import type { PackId, StepId, SupportId } from "./types";

/**
 * Valide un numéro de téléphone français.
 *
 * Accepte :
 * - le format national `0X XX XX XX XX` (0 suivi de 9 chiffres, le premier
 *   chiffre significatif ∈ 1-9) ;
 * - le format international `+33 X XX XX XX XX` (+33 suivi de 9 chiffres, le
 *   premier chiffre significatif ∈ 1-9).
 *
 * Les séparateurs usuels (espaces, points, tirets) sont tolérés et ignorés.
 * Toute autre chaîne retourne `false`.
 */
export function isValidFrenchPhone(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }

  // Retire les séparateurs usuels (espaces, points, tirets), conserve le « + ».
  const cleaned = value.replace(/[\s.\-]/g, "");

  const national = /^0[1-9]\d{8}$/;
  const international = /^\+33[1-9]\d{8}$/;

  return national.test(cleaned) || international.test(cleaned);
}

/** Tuples d'identifiants dérivés de la source de tarification (source unique). */
const SUPPORT_IDS = SUPPORTS.map((support) => support.id) as [
  SupportId,
  ...SupportId[],
];
const PACK_IDS = PACKS.map((pack) => pack.id) as [PackId, ...PackId[]];

/**
 * Étape 1 (Lavage) : un Support non-null doit être sélectionné.
 */
const lavageSchema = z.object({
  support: z
    .enum(SUPPORT_IDS)
    .nullable()
    .refine((value): value is SupportId => value !== null, {
      message: "une sélection est requise",
    }),
});

/**
 * Étape 2 (Pack) : un Pack non-null doit être sélectionné.
 * Cette étape n'est validée par l'appelant qu'en `Mode_Prix`.
 */
const packSchema = z.object({
  pack: z
    .enum(PACK_IDS)
    .nullable()
    .refine((value): value is PackId => value !== null, {
      message: "une sélection est requise",
    }),
});

/**
 * Étape 3 (Options) : toujours valide (multi-sélection, zéro autorisé).
 */
const optionsSchema = z.object({
  options: z.array(z.string()),
});

/**
 * Étape 4 (Lieu) : le type doit être renseigné. En « domicile », l'adresse doit
 * être non vide et validée. En « local », aucune contrainte supplémentaire.
 */
const lieuSchema = z.object({
  lieu: z
    .object({
      type: z.enum(["local", "domicile"]).nullable(),
      address: z.string(),
      addressValidated: z.boolean(),
      noElectricity: z.boolean(),
    })
    .superRefine((lieu, ctx) => {
      if (lieu.type === null) {
        ctx.addIssue({
          code: "custom",
          message: "une sélection est requise",
          path: ["type"],
        });
        return;
      }

      if (lieu.type === "domicile") {
        if (lieu.address.trim() === "") {
          ctx.addIssue({
            code: "custom",
            message: "une adresse valide est requise",
            path: ["address"],
          });
        }

        if (!lieu.addressValidated) {
          ctx.addIssue({
            code: "custom",
            message: "veuillez valider l'adresse",
            path: ["addressValidated"],
          });
        }
      }
    }),
});

/**
 * Étape 5 (Paiement) : un Créneau non-null doit être sélectionné.
 */
const paiementSchema = z.object({
  creneauId: z
    .string()
    .nullable()
    .refine((value): value is string => value !== null, {
      message: "veuillez sélectionner un créneau",
    }),
});

/**
 * Schémas de validation par étape. Chaque schéma valide la tranche pertinente
 * de l'`État_Tunnel` avant d'autoriser l'avancement.
 */
export const stepSchemas: Record<StepId, z.ZodType> = {
  lavage: lavageSchema,
  pack: packSchema,
  options: optionsSchema,
  lieu: lieuSchema,
  paiement: paiementSchema,
};

/**
 * Schéma du formulaire de demande de devis (`Mode_Devis`) : prénom et
 * description du besoin non vides, téléphone français valide.
 */
export const devisSchema = z.object({
  prenom: z
    .string()
    .trim()
    .min(1, { message: "le prénom est requis" })
    .max(50, { message: "le prénom ne doit pas dépasser 50 caractères" }),
  telephone: z
    .string()
    .max(30, { message: "le numéro de téléphone ne doit pas dépasser 30 caractères" })
    .refine(isValidFrenchPhone, {
      message: "numéro de téléphone français invalide",
    }),
  besoin: z
    .string()
    .trim()
    .min(1, { message: "la description du besoin est requise" })
    .max(1000, { message: "la description ne doit pas dépasser 1000 caractères" }),
});
