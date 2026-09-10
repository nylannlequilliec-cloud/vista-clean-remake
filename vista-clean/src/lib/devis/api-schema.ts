import { z } from "zod";

import { isValidFrenchPhone } from "./schema";

const supportIdSchema = z.enum([
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
]);
const packIdSchema = z.enum(["confort", "concession"]);
const optionIdSchema = z.enum([
  "traitement-cuir",
  "alcantara",
  "ozone",
  "vapeur",
  "antimoisissure",
  "cuir-hors-sieges",
  "siege-auto-bebe",
  "coffre",
  "plafonnier",
  "vehicule-pas-vide",
  "renovation-2-phares",
  "interieur-clair",
  "tapis-supplementaire",
  "tapis-de-coffre",
  "sous-coffre",
  "senteur-parfum",
  "gonflage-pneus",
  "remplissage-lave-glace",
  "nettoyage-ceintures",
]);

const lieuSchema = z.strictObject({
  type: z.enum(["local", "domicile"]),
  address: z.string().trim().max(300),
  addressValidated: z.boolean(),
  noElectricity: z.boolean(),
});

export const reservationRequestSchema = z.strictObject({
  support: supportIdSchema,
  pack: packIdSchema,
  options: z
    .array(optionIdSchema)
    .max(50)
    .refine((options) => new Set(options).size === options.length),
  lieu: lieuSchema,
  creneauId: z.string().trim().min(1).max(100),
});

export const devisRequestSchema = z.strictObject({
  support: supportIdSchema,
  devis: z.strictObject({
    prenom: z.string().trim().min(1).max(100),
    telephone: z.string().max(30).refine(isValidFrenchPhone),
    besoin: z.string().trim().min(1).max(2000),
  }),
});

export type ReservationRequest = z.infer<typeof reservationRequestSchema>;
export type DevisRequest = z.infer<typeof devisRequestSchema>;
