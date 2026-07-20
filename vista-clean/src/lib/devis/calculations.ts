// Feature: devis-questionnaire
// Calculs de prix du Tunnel (src/lib/devis/).
// Fonctions pures dérivant le Prix_Total, l'Acompte, le formatage monétaire,
// les frais de déplacement et le basculement d'options à partir de
// l'État_Tunnel et de la source de tarification. Aucune dépendance à React ni
// au DOM : ce module est purement fonctionnel et testable.

import { resolveMode } from "./mode";
import {
  ACOMPTE_RATE,
  getOption,
  getPack,
  SUPPLEMENT_GROUPE_ELECTROGENE,
} from "./pricing";
import type {
  OptionId,
  PricingBreakdown,
  PricingLine,
  TunnelState,
} from "./types";

/**
 * Forfait de frais de déplacement par défaut (en euros).
 *
 * Les exigences ne fixent aucune règle chiffrée pour les frais de déplacement à
 * domicile. On applique donc une stratégie par défaut simple et déterministe :
 * un forfait unique, isolé dans cette constante afin de pouvoir être remplacé
 * par une logique de zonage plus riche sans impacter le reste du Tunnel.
 *
 * Valeur de secours neutre : `0`. Ajuster ici (ou remplacer le corps de
 * `computeFraisDeplacement`) lorsqu'une grille tarifaire sera définie.
 */
const FRAIS_DEPLACEMENT_FORFAIT = 0;

/**
 * Arrondit un montant à deux décimales pour éviter la dérive des flottants.
 *
 * @param value Montant brut.
 * @returns Le montant arrondi à deux décimales.
 */
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calcule les frais de déplacement à partir d'une adresse.
 *
 * Stratégie par défaut isolée et déterministe : forfait unique
 * (`FRAIS_DEPLACEMENT_FORFAIT`). Une adresse vide ou composée uniquement
 * d'espaces ne génère aucun frais. Cette fonction est le point d'extension
 * unique pour une future logique de zonage/distance.
 *
 * @param address Adresse saisie par le Client (prestation à domicile).
 * @returns Les frais de déplacement, arrondis à deux décimales.
 *
 * Requirements: 7.4
 */
export function computeFraisDeplacement(address: string): number {
  if (address.trim().length === 0) {
    return 0;
  }

  return round2(FRAIS_DEPLACEMENT_FORFAIT);
}

/**
 * Calcule l'acompte à régler pour confirmer la réservation.
 *
 * @param total Prix_Total sur lequel appliquer le taux d'acompte.
 * @returns 15 % du total, arrondi à deux décimales.
 *
 * Requirements: 8.5, 9.4
 */
export function computeAcompte(total: number): number {
  return round2(total * ACOMPTE_RATE);
}

/**
 * Formate un montant en euros à la française, avec au plus deux décimales.
 *
 * Exemple : `99` → `"99,00 €"`. Le montant est arrondi à deux décimales avant
 * formatage afin que la valeur reformatée corresponde toujours au montant
 * arrondi.
 *
 * @param amount Montant numérique fini ≥ 0.
 * @returns La chaîne monétaire formatée en euros (locale `fr-FR`).
 *
 * Requirements: 9.3
 */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(round2(amount));
}

/**
 * Bascule (toggle) une option dans la liste de sélection, de façon pure.
 *
 * - Si l'option est absente, elle est ajoutée une seule fois.
 * - Si l'option est présente, elle est retirée.
 *
 * La liste retournée est une nouvelle référence (immutabilité) et ne contient
 * jamais de doublon pour l'identifiant basculé.
 *
 * @param options Liste courante des options sélectionnées.
 * @param id Identifiant de l'option à basculer.
 * @returns La nouvelle liste d'options.
 *
 * Requirements: 6.7, 6.8
 */
export function toggleOption(options: OptionId[], id: OptionId): OptionId[] {
  if (options.includes(id)) {
    return options.filter((optionId) => optionId !== id);
  }

  return [...options, id];
}

/**
 * Construit le détail complet de tarification (`PricingBreakdown`) à partir de
 * l'État_Tunnel courant.
 *
 * Le total est la somme :
 * - du prix du Pack (0 si aucun pack sélectionné) ;
 * - du prix cumulé des options sélectionnées (sans doublon) ;
 * - des frais de déplacement (0 « dans mon local », sinon via
 *   `computeFraisDeplacement`) ;
 * - du supplément groupe électrogène (5 € en l'absence d'électricité).
 *
 * L'acompte vaut 15 % du total. Le `mode` est dérivé du Support via
 * `resolveMode` : le détail est calculé de manière cohérente même en
 * `Mode_Devis` (l'UI / le récapitulatif se charge de masquer le prix).
 *
 * @param state État complet du Tunnel.
 * @returns Le détail de tarification arrondi à deux décimales.
 *
 * Requirements: 7.2, 7.4, 7.6, 8.5, 9.1, 9.4
 */
export function computeTotal(state: TunnelState): PricingBreakdown {
  const mode = resolveMode(state.support);

  const pack = state.pack ? getPack(state.pack) : undefined;
  const packPrice = pack ? pack.price : 0;

  const seen = new Set<OptionId>();
  const optionLines: PricingLine[] = [];
  let optionsTotal = 0;

  for (const optionId of state.options) {
    if (seen.has(optionId)) {
      continue;
    }
    seen.add(optionId);

    const option = getOption(optionId);
    if (!option) {
      continue;
    }

    optionLines.push({ label: option.label, amount: option.price });
    optionsTotal += option.price;
  }
  optionsTotal = round2(optionsTotal);

  const fraisDeplacement =
    state.lieu.type === "local"
      ? 0
      : computeFraisDeplacement(state.lieu.address);

  const supplementGroupeElectrogene = state.lieu.noElectricity
    ? SUPPLEMENT_GROUPE_ELECTROGENE
    : 0;

  const total = round2(
    packPrice + optionsTotal + fraisDeplacement + supplementGroupeElectrogene,
  );

  const acompte = computeAcompte(total);

  return {
    mode,
    packPrice,
    optionsTotal,
    optionLines,
    fraisDeplacement,
    supplementGroupeElectrogene,
    total,
    acompte,
  };
}
