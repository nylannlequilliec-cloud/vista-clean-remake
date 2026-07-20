// Feature: devis-questionnaire
// Logique pure de navigation et de validation par étape du Tunnel.
// Aucune dépendance à React ni au DOM : ce module expose des fonctions pures
// destinées à être consommées par le hook `useTunnel`. L'invariant « exactement
// une étape active à tout instant » est maintenu par l'appelant à l'aide de ces
// fonctions.

import { stepSchemas } from "./schema";
import type { StepId, TunnelState } from "./types";

/**
 * Ordre séquentiel des cinq étapes du Tunnel. L'index d'une étape dans ce
 * tableau sert d'identifiant de position pour toute la logique de navigation.
 */
export const STEP_ORDER: StepId[] = [
  "lavage",
  "pack",
  "options",
  "lieu",
  "paiement",
];

/**
 * Indique, pour chaque étape (dans l'ordre de `STEP_ORDER`), si son sous-schéma
 * Zod est satisfait par l'`État_Tunnel` courant.
 *
 * Chaque schéma d'étape est un `z.object` qui ne retient que la tranche
 * pertinente de l'état ; passer l'état complet à `safeParse` est donc sûr (les
 * clés superflues sont ignorées).
 */
export function computeCompleted(state: TunnelState): boolean[] {
  return STEP_ORDER.map((stepId) => stepSchemas[stepId].safeParse(state).success);
}

/**
 * Dérive l'accessibilité de chaque étape à partir de son état de complétion.
 * L'étape 0 est toujours accessible ; l'étape `i` (> 0) n'est accessible que si
 * toutes les étapes précédentes sont complétées.
 */
export function computeReachable(completed: boolean[]): boolean[] {
  const reachable: boolean[] = [];
  let previousAllCompleted = true;

  for (let i = 0; i < completed.length; i += 1) {
    reachable[i] = previousAllCompleted;
    previousAllCompleted = previousAllCompleted && completed[i];
  }

  return reachable;
}

/**
 * Tente d'avancer d'exactement une étape.
 *
 * L'avancement n'a lieu que si le sous-schéma de l'étape active est satisfait.
 * Dans le cas contraire, l'étape active reste inchangée et `ok` vaut `false`.
 * L'index ne dépasse jamais la dernière étape.
 */
export function advance(
  state: TunnelState,
  activeIndex: number,
): { activeIndex: number; ok: boolean } {
  const stepId = STEP_ORDER[activeIndex];

  if (stepId === undefined) {
    return { activeIndex, ok: false };
  }

  const ok = stepSchemas[stepId].safeParse(state).success;

  if (!ok) {
    return { activeIndex, ok: false };
  }

  const lastIndex = STEP_ORDER.length - 1;
  const nextIndex = Math.min(activeIndex + 1, lastIndex);

  return { activeIndex: nextIndex, ok: true };
}

/**
 * Retourne `target` uniquement si cette étape est accessible ; sinon retourne
 * `activeIndex` inchangé. Toute cible hors bornes est également rejetée.
 */
export function goToStep(
  activeIndex: number,
  target: number,
  reachable: boolean[],
): number {
  if (target < 0 || target >= reachable.length) {
    return activeIndex;
  }

  return reachable[target] ? target : activeIndex;
}
