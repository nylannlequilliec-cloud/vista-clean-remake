// Feature: devis-questionnaire
// Source unique de vérité tarifaire du Tunnel (src/lib/devis/).
// Regroupe les Supports, Packs et Options avec leurs prix exacts, ainsi que
// les constantes de tarification et des accès typés. Aucune dépendance à React
// ni au DOM : ce module est purement déclaratif et testable.

import type {
  OptionDef,
  OptionId,
  Pack,
  PackId,
  Support,
  SupportId,
} from "./types";

/**
 * Les 10 supports proposés à l'Étape 1 (Lavage), chacun pré-classé selon son
 * mode de tarification.
 *
 * - `Mode_Prix` ('prix') : citadine, berline, suv, monospace-5, monospace-7,
 *   canape-sans-angle, canape-avec-angle.
 * - `Mode_Devis` ('devis') : utilitaire, tapis-matelas-autre, demande-specifique.
 *
 * Chaque support porte une icône Lucide non vide.
 */
export const SUPPORTS: Support[] = [
  { id: "citadine", label: "Citadine", icon: "Car", mode: "prix" },
  { id: "berline", label: "Berline", icon: "CarFront", mode: "prix" },
  { id: "suv", label: "SUV", icon: "CarTaxiFront", mode: "prix" },
  { id: "monospace-5", label: "Monospace 5 places", icon: "Bus", mode: "prix" },
  { id: "monospace-7", label: "Monospace 7 places", icon: "Bus", mode: "prix" },
  { id: "canape-sans-angle", label: "Canapé sans angle", icon: "Sofa", mode: "prix" },
  { id: "canape-avec-angle", label: "Canapé avec angle", icon: "Sofa", mode: "prix" },
  { id: "utilitaire", label: "Utilitaire", icon: "Truck", mode: "devis" },
  {
    id: "tapis-matelas-autre",
    label: "Tapis / matelas / canapé en U / autre",
    icon: "Package",
    mode: "devis",
  },
  {
    id: "demande-specifique",
    label: "Demande spécifique",
    icon: "HelpCircle",
    mode: "devis",
  },
];

/**
 * Les deux packs disponibles en `Mode_Prix`.
 * CONFORT (99 €) et CONCESSION (129 €, `popular`).
 */
export const PACKS: Pack[] = [
  {
    id: "confort",
    name: "CONFORT",
    price: 99,
    durationLabel: "1h10 à 1h45",
    popular: false,
    features: [
      "Aspiration complète de l'habitacle et du coffre",
      "Nettoyage des plastiques et des surfaces",
      "Lavage des vitres intérieures",
      "Dépoussiérage des aérateurs et recoins",
      "Parfum d'ambiance offert",
    ],
  },
  {
    id: "concession",
    name: "CONCESSION",
    price: 129,
    durationLabel: "2h30 à 3h",
    popular: true,
    features: [
      "Toutes les prestations du pack CONFORT",
      "Shampoing des sièges et des moquettes",
      "Détachage en profondeur des tissus",
      "Nettoyage détaillé des plastiques et cuirs",
      "Finition qualité concession",
    ],
  },
];

/**
 * Les options additionnelles regroupées par catégorie, avec prix exacts.
 * Chaque option possède un identifiant kebab-case stable.
 */
export const OPTIONS: OptionDef[] = [
  // TRAITEMENT
  { id: "traitement-cuir", category: "TRAITEMENT", label: "Traitement du cuir", price: 50 },
  { id: "alcantara", category: "TRAITEMENT", label: "Alcantara", price: 50 },
  { id: "ozone", category: "TRAITEMENT", label: "Ozone", price: 50 },
  { id: "vapeur", category: "TRAITEMENT", label: "Vapeur", price: 30 },
  { id: "antimoisissure", category: "TRAITEMENT", label: "Antimoisissure", price: 60 },
  { id: "cuir-hors-sieges", category: "TRAITEMENT", label: "Cuir hors sièges", price: 25 },

  // SHAMPOING
  { id: "siege-auto-bebe", category: "SHAMPOING", label: "Siège auto bébé", price: 10 },
  { id: "coffre", category: "SHAMPOING", label: "Coffre", price: 20 },
  { id: "plafonnier", category: "SHAMPOING", label: "Plafonnier", price: 60 },

  // SUPPLEMENTS
  { id: "vehicule-pas-vide", category: "SUPPLEMENTS", label: "Véhicule pas vidé", price: 25 },

  // OPTIONS
  { id: "renovation-2-phares", category: "OPTIONS", label: "Rénovation des 2 phares", price: 60 },
  { id: "interieur-clair", category: "OPTIONS", label: "Intérieur clair", price: 30 },
  { id: "tapis-supplementaire", category: "OPTIONS", label: "Tapis supplémentaire", price: 20 },
  { id: "tapis-de-coffre", category: "OPTIONS", label: "Tapis de coffre", price: 15 },
  { id: "sous-coffre", category: "OPTIONS", label: "Sous coffre", price: 25 },
  { id: "senteur-parfum", category: "OPTIONS", label: "Senteur Parfum", price: 15 },
  { id: "gonflage-pneus", category: "OPTIONS", label: "Gonflage des pneus", price: 5 },
  { id: "remplissage-lave-glace", category: "OPTIONS", label: "Remplissage lave-glace", price: 10 },
  { id: "nettoyage-ceintures", category: "OPTIONS", label: "Nettoyage des ceintures", price: 20 },
];

/** Supplément appliqué en cas d'absence d'électricité (groupe électrogène). */
export const SUPPLEMENT_GROUPE_ELECTROGENE = 5;

/** Taux d'acompte appliqué au Prix_Total (15 %). */
export const ACOMPTE_RATE = 0.15;

/** Retourne le Support correspondant à l'identifiant, ou `undefined`. */
export function getSupport(id: SupportId): Support | undefined {
  return SUPPORTS.find((support) => support.id === id);
}

/** Retourne le Pack correspondant à l'identifiant, ou `undefined`. */
export function getPack(id: PackId): Pack | undefined {
  return PACKS.find((pack) => pack.id === id);
}

/** Retourne l'OptionDef correspondant à l'identifiant, ou `undefined`. */
export function getOption(id: OptionId): OptionDef | undefined {
  return OPTIONS.find((option) => option.id === id);
}
