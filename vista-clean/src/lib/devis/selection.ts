// Feature: devis-questionnaire
// Logique pure de sélection de créneau (Étape 5 — Paiement).
// Isolée du rendu React pour être testable (property-based testing).

import type { Creneau, TunnelState } from "./types";

/**
 * Sélectionne un créneau dans l'État_Tunnel.
 *
 * Un créneau disponible (`full === false`) voit son identifiant enregistré
 * dans un nouvel état. Un créneau complet (`full === true`) ou inexistant est
 * rejeté : l'état est retourné inchangé (`creneauId` intact).
 *
 * Fonction pure : ne mute jamais `state` en entrée.
 *
 * @param state - État courant du Tunnel.
 * @param creneaux - Ensemble des créneaux proposés.
 * @param targetId - Identifiant du créneau ciblé.
 * @returns Un nouvel état avec `creneauId = targetId` si le créneau existe et
 *   est disponible ; sinon l'état inchangé.
 *
 * @see Requirements 8.2, 8.3
 */
export function selectCreneau(
  state: TunnelState,
  creneaux: Creneau[],
  targetId: string,
): TunnelState {
  const target = creneaux.find((creneau) => creneau.id === targetId);

  if (!target || target.full) {
    return state;
  }

  return { ...state, creneauId: targetId };
}
