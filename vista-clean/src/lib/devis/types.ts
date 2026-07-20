// Feature: devis-questionnaire
// Types partagés de la couche logique pure du Tunnel (src/lib/devis/).
// Source unique de vérité des formes de données utilisées par la tarification,
// la validation, la réconciliation d'état et la persistance.

/**
 * Identifiants des 10 supports proposés dans l'Étape 1 (Lavage).
 * Chaque support est pré-classé `mode: 'prix' | 'devis'` dans `pricing.ts`.
 */
export type SupportId =
  | "citadine"
  | "berline"
  | "suv"
  | "monospace-5"
  | "monospace-7"
  | "utilitaire"
  | "canape-sans-angle"
  | "canape-avec-angle"
  | "tapis-matelas-autre"
  | "demande-specifique";

/** Identifiants des packs disponibles en `Mode_Prix`. */
export type PackId = "confort" | "concession";

/** Catégories regroupant les options additionnelles. */
export type OptionCategory = "TRAITEMENT" | "SHAMPOING" | "SUPPLEMENTS" | "OPTIONS";

/** Identifiant d'une option (ex. "traitement-cuir", "ozone"). */
export type OptionId = string;

/** Mode du Tunnel : tarification automatique ou demande de devis. */
export type TunnelMode = "prix" | "devis";

/** Type de lieu de prestation. */
export type LieuType = "local" | "domicile";

/** Identifiants des cinq étapes séquentielles du Tunnel. */
export type StepId = "lavage" | "pack" | "options" | "lieu" | "paiement";

/** Support sélectionnable à l'Étape 1. */
export interface Support {
  id: SupportId;
  label: string;
  /** Nom d'icône Lucide ou chemin d'illustration. */
  icon: string;
  /** Mode pré-classé dans la source de tarification. */
  mode: TunnelMode;
}

/** Pack sélectionnable à l'Étape 2 (Mode_Prix). */
export interface Pack {
  id: PackId;
  /** "CONFORT" | "CONCESSION" */
  name: string;
  /** 99 | 129 */
  price: number;
  /** ex. "1h10 à 1h45" */
  durationLabel: string;
  features: string[];
  popular: boolean;
}

/** Définition d'une option additionnelle. */
export interface OptionDef {
  id: OptionId;
  category: OptionCategory;
  label: string;
  price: number;
  /** Texte d'infobulle optionnel. */
  info?: string;
}

/** Créneau de réservation présenté à l'Étape 5 (Paiement). */
export interface Creneau {
  id: string;
  /** Date ISO yyyy-mm-dd. */
  date: string;
  /** ex. "14h00" */
  startLabel: string;
  /** « Complet » → non sélectionnable. */
  full: boolean;
}

/** État complet du Tunnel, source de vérité du formulaire multi-étapes. */
export interface TunnelState {
  support: SupportId | null;
  pack: PackId | null;
  /** Multi-sélection. */
  options: OptionId[];
  lieu: {
    type: LieuType | null;
    /** Requis si domicile. */
    address: string;
    addressValidated: boolean;
    /** Supplément groupe électrogène. */
    noElectricity: boolean;
  };
  creneauId: string | null;
  /** Champs Mode_Devis. */
  devis: {
    prenom: string;
    telephone: string;
    besoin: string;
  };
}

/** Ligne détaillée d'un calcul de prix. */
export interface PricingLine {
  label: string;
  amount: number;
}

/** Résultat complet du calcul de tarification. */
export interface PricingBreakdown {
  /** 'devis' → total masqué. */
  mode: TunnelMode;
  packPrice: number;
  optionsTotal: number;
  optionLines: PricingLine[];
  /** 0 en local. */
  fraisDeplacement: number;
  /** 0 ou 5. */
  supplementGroupeElectrogene: number;
  /** Somme (Requirement 9.1). */
  total: number;
  /** 15 % du total (Requirement 8.5). */
  acompte: number;
}
