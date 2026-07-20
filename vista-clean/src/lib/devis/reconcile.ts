// Feature: devis-questionnaire
// Réconciliation de l'État_Tunnel sur changement de support (src/lib/devis/).
// Fonction pure garantissant qu'après un changement de Support, l'état ne
// conserve que des sélections cohérentes avec le mode dérivé du nouveau
// support. Aucune dépendance à React ni au DOM : ce module est purement
// fonctionnel et testable.

import { resolveMode } from "./mode";
import type { SupportId, TunnelState } from "./types";

/**
 * Réconcilie l'`État_Tunnel` lorsque le Client change de Support.
 *
 * Le nouvel état porte toujours le `nextSupport` demandé. Le mode est ensuite
 * dérivé via `resolveMode(nextSupport)` :
 *
 * - En **`Mode_Devis`**, les sélections propres au parcours de prix (Pack,
 *   Options, Lieu, Créneau) deviennent incompatibles : elles sont retirées et
 *   ramenées à leur valeur initiale. Seuls le Support et les champs de la
 *   demande de devis (`devis`) subsistent.
 * - En **`Mode_Prix`**, toutes les sélections déjà saisies sont préservées :
 *   un changement de support entre deux supports « prix » conserve le Pack,
 *   les Options, le Lieu et le Créneau.
 *
 * La fonction ne mute jamais `prev` : elle retourne toujours un nouvel objet.
 *
 * Invariant (Property 4) : `resolveMode(result.support) === resolveMode(nextSupport)`
 * et aucune sélection incompatible ne subsiste dans l'état retourné.
 *
 * @param prev État courant du Tunnel (non muté).
 * @param nextSupport Nouveau Support sélectionné.
 * @returns Un nouvel `État_Tunnel` cohérent avec le mode du nouveau support.
 *
 * Requirements: 4.6, 12.3
 */
export function reconcileState(
  prev: TunnelState,
  nextSupport: SupportId,
): TunnelState {
  const nextMode = resolveMode(nextSupport);

  if (nextMode === "devis") {
    // Le parcours bascule en demande de devis : les sélections de prix
    // (pack, options, lieu, créneau) n'ont plus de sens et sont retirées.
    // Les champs de la demande de devis sont conservés.
    return {
      support: nextSupport,
      pack: null,
      options: [],
      lieu: {
        type: null,
        address: "",
        addressValidated: false,
        noElectricity: false,
      },
      creneauId: null,
      devis: { ...prev.devis },
    };
  }

  // Mode_Prix : le nouveau support reste compatible avec toutes les
  // sélections de prix existantes, qui sont donc intégralement préservées.
  return {
    ...prev,
    support: nextSupport,
    options: [...prev.options],
    lieu: { ...prev.lieu },
    devis: { ...prev.devis },
  };
}
