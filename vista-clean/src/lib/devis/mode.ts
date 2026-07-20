// Feature: devis-questionnaire
// Résolution du mode du Tunnel (src/lib/devis/).
// Fonction pure dérivant le Mode_Prix ou le Mode_Devis à partir du Support
// sélectionné, en s'appuyant sur le pré-classement de `pricing.ts`. Aucune
// dépendance à React ni au DOM : ce module est purement fonctionnel et testable.

import { getSupport } from "./pricing";
import type { SupportId, TunnelMode } from "./types";

/**
 * Détermine le mode du Tunnel pour un Support donné.
 *
 * Le mode est dérivé du pré-classement des `SUPPORTS` (source de vérité
 * tarifaire) :
 * - `'devis'` pour les supports non standard (utilitaire, tapis-matelas-autre,
 *   demande-specifique) ;
 * - `'prix'` pour tous les supports standard.
 *
 * En l'absence de sélection (`null`) — état initial avant tout choix — le mode
 * par défaut est le parcours standard `'prix'`.
 *
 * @param supportId Identifiant du Support sélectionné, ou `null`.
 * @returns Le mode du Tunnel : `'prix'` ou `'devis'`.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.5
 */
export function resolveMode(supportId: SupportId | null): TunnelMode {
  if (supportId === null) {
    return "prix";
  }

  return getSupport(supportId)?.mode ?? "prix";
}
