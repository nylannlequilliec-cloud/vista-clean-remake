// Feature: devis-questionnaire
// Vue de données du Récapitulatif du Tunnel (src/lib/devis/).
// Fonction pure `buildRecap` transformant l'État_Tunnel et le PricingBreakdown
// en une structure présentation-agnostique consommée par le `StickyRecap`.
// Aucune dépendance à React ni au DOM : ce module est purement fonctionnel et
// testable.

import { getOption, getPack, getSupport } from "./pricing";
import type {
  LieuType,
  PricingBreakdown,
  TunnelMode,
  TunnelState,
} from "./types";

/** Ligne « Support choisi » du Récapitulatif. */
export interface RecapSupport {
  label: string;
}

/** Ligne « Pack » du Récapitulatif (Mode_Prix uniquement). */
export interface RecapPack {
  name: string;
  price: number;
}

/** Ligne d'une Option sélectionnée (Mode_Prix uniquement). */
export interface RecapOption {
  label: string;
  price: number;
}

/** Bloc « Lieu de prestation » du Récapitulatif. */
export interface RecapLieu {
  type: LieuType | null;
  address: string;
}

/**
 * Vue de données présentation-agnostique du Récapitulatif.
 *
 * - En `Mode_Prix`, tous les champs de prix sont renseignés à partir du
 *   `PricingBreakdown` et de la source de tarification (`isDevis: false`).
 * - En `Mode_Devis`, aucun prix automatique n'est exposé (`pack`, `options`,
 *   `fraisDeplacement`, `supplementGroupeElectrogene`, `total` et `acompte`
 *   valent `null`) ; `isDevis` vaut `true` et `tarificationLabel` porte le
 *   libellé « Tarification sur devis ». Le Support et le lieu restent affichés
 *   dans les deux modes.
 */
export interface RecapView {
  /** Mode dérivé, recopié depuis le PricingBreakdown. */
  mode: TunnelMode;
  /** `true` en Mode_Devis : aucun prix automatique n'est exposé. */
  isDevis: boolean;
  /** Support choisi (label), ou `null` si aucun support sélectionné. */
  support: RecapSupport | null;
  /** Pack choisi + prix (Mode_Prix), `null` en Mode_Devis ou sans pack. */
  pack: RecapPack | null;
  /** Options sélectionnées + prix (Mode_Prix), `[]` en Mode_Devis. */
  options: RecapOption[];
  /** Lieu de prestation (type + adresse), toujours présent. */
  lieu: RecapLieu;
  /** Frais de déplacement (Mode_Prix), `null` en Mode_Devis. */
  fraisDeplacement: number | null;
  /** Supplément groupe électrogène (Mode_Prix), `null` en Mode_Devis. */
  supplementGroupeElectrogene: number | null;
  /** Prix_Total (Mode_Prix), `null` en Mode_Devis. */
  total: number | null;
  /** Acompte 15 % (Mode_Prix), `null` en Mode_Devis. */
  acompte: number | null;
  /** Libellé « sur devis » exposé en Mode_Devis, `null` en Mode_Prix. */
  tarificationLabel: string | null;
}

/** Libellé affiché en `Mode_Devis` à la place d'un prix automatique. */
const TARIFICATION_DEVIS_LABEL = "Tarification sur devis";

/**
 * Construit la vue de données du Récapitulatif à partir de l'État_Tunnel et du
 * détail de tarification (`PricingBreakdown`) correspondant.
 *
 * Le mode est celui porté par le `pricing` (dérivé du Support via
 * `resolveMode` lors du calcul). Le Support et le lieu sont toujours exposés.
 *
 * - En `Mode_Prix` : le Pack (nom + prix), chaque Option sélectionnée (label +
 *   prix), les Frais_Déplacement, le supplément groupe électrogène, le
 *   Prix_Total et l'Acompte sont repris du `PricingBreakdown` et de la source
 *   de tarification.
 * - En `Mode_Devis` : aucun prix automatique n'est exposé ; `isDevis` vaut
 *   `true` et `tarificationLabel` signale « Tarification sur devis ».
 *
 * Fonction pure : ne mute ni l'`state` ni le `pricing`.
 *
 * @param state État complet du Tunnel.
 * @param pricing Détail de tarification issu de `computeTotal(state)`.
 * @returns La vue de données du Récapitulatif.
 *
 * Requirements: 8.4, 9.5, 10.2
 */
export function buildRecap(
  state: TunnelState,
  pricing: PricingBreakdown,
): RecapView {
  const isDevis = pricing.mode === "devis";

  const supportDef = state.support ? getSupport(state.support) : undefined;
  const support: RecapSupport | null = supportDef
    ? { label: supportDef.label }
    : null;

  const lieu: RecapLieu = {
    type: state.lieu.type,
    address: state.lieu.address,
  };

  if (isDevis) {
    return {
      mode: pricing.mode,
      isDevis: true,
      support,
      pack: null,
      options: [],
      lieu,
      fraisDeplacement: null,
      supplementGroupeElectrogene: null,
      total: null,
      acompte: null,
      tarificationLabel: TARIFICATION_DEVIS_LABEL,
    };
  }

  const packDef = state.pack ? getPack(state.pack) : undefined;
  const pack: RecapPack | null = packDef
    ? { name: packDef.name, price: packDef.price }
    : null;

  const seen = new Set<string>();
  const options: RecapOption[] = [];
  for (const optionId of state.options) {
    if (seen.has(optionId)) {
      continue;
    }
    seen.add(optionId);

    const optionDef = getOption(optionId);
    if (!optionDef) {
      continue;
    }

    options.push({ label: optionDef.label, price: optionDef.price });
  }

  return {
    mode: pricing.mode,
    isDevis: false,
    support,
    pack,
    options,
    lieu,
    fraisDeplacement: pricing.fraisDeplacement,
    supplementGroupeElectrogene: pricing.supplementGroupeElectrogene,
    total: pricing.total,
    acompte: pricing.acompte,
    tarificationLabel: null,
  };
}
