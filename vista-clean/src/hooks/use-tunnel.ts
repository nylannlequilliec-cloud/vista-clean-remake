// Feature: devis-questionnaire
// Hook d'orchestration `useTunnel` (src/hooks/).
//
// Ce hook se contente de CÂBLER l'état React (react-hook-form + `useState`) à
// la couche logique pure de `src/lib/devis/`. Toute la logique métier
// (résolution de mode, calcul de prix, validation par étape, navigation,
// réconciliation, persistance) vit dans la couche pure et est réutilisée ici.
//
// Il est destiné à être consommé par un composant `"use client"` (TunnelClient).
//
// Requirements: 1.2, 1.3, 1.4, 4.6, 9.1, 9.2, 10.3, 11.1, 11.2, 11.3, 11.4,
// 11.5, 12.1, 12.2, 12.3, 12.4, 17.1, 17.2, 17.3

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useForm,
  type FieldPath,
  type UseFormReturn,
} from "react-hook-form";

import { computeTotal } from "../lib/devis/calculations";
import { resolveMode } from "../lib/devis/mode";
import {
  advance,
  computeCompleted,
  computeReachable,
  goToStep as navGoToStep,
  STEP_ORDER,
} from "../lib/devis/navigation";
import {
  clearState,
  loadState,
  saveState,
} from "../lib/devis/persistence";
import { reconcileState } from "../lib/devis/reconcile";
import type {
  PricingBreakdown,
  StepId,
  SupportId,
  TunnelMode,
  TunnelState,
} from "../lib/devis/types";

/**
 * État initial vide et cohérent du Tunnel. Sert de repli lorsqu'aucun état
 * valide n'est persisté dans `localStorage`.
 */
export const INITIAL_TUNNEL_STATE: TunnelState = {
  support: null,
  pack: null,
  options: [],
  lieu: {
    type: null,
    address: "",
    addressValidated: false,
    noElectricity: false,
  },
  creneauId: null,
  devis: {
    prenom: "",
    telephone: "",
    besoin: "",
  },
};

/**
 * Champs de l'`État_Tunnel` à valider (via `form.trigger`) pour chaque étape.
 * L'avancement effectif reste gouverné par les sous-schémas Zod de
 * `navigation.advance` ; ce déclenchement sert uniquement à faire remonter les
 * erreurs de champ dans react-hook-form.
 */
const STEP_FIELDS: Record<StepId, FieldPath<TunnelState>[]> = {
  lavage: ["support"],
  pack: ["pack"],
  options: ["options"],
  lieu: ["lieu"],
  paiement: ["creneauId"],
};

/** Résultat de l'initialisation du paiement par le prestataire. */
interface PaymentResult {
  success: boolean;
  error?: string;
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * STUB DE PAIEMENT — À REMPLACER PAR L'INTÉGRATION RÉELLE
 * ─────────────────────────────────────────────────────────────────────────
 * Le règlement de l'acompte est délégué à un prestataire de paiement sécurisé
 * (hors périmètre de la couche logique du Tunnel). Cette fonction est un
 * marqueur clairement identifié : elle NE réalise AUCUN paiement réel.
 *
 * SÉCURITÉ : l'appel réel devra passer par un endpoint d'initialisation
 * authentifié et validé côté serveur ; aucun secret de paiement ne doit être
 * manipulé côté client au-delà de l'initialisation fournie par le prestataire.
 */
async function initiatePaymentPlaceholder(
  _state: TunnelState,
  _pricing: PricingBreakdown,
): Promise<PaymentResult> {
  // TODO(devis-questionnaire): appeler le prestataire de paiement sécurisé.
  return { success: true };
}

/** Contrat de retour du hook `useTunnel`. */
export interface UseTunnelReturn {
  form: UseFormReturn<TunnelState>;
  /** Mode dérivé du Support sélectionné : `'prix'` | `'devis'`. */
  mode: TunnelMode;
  /** Index de l'unique étape active (invariant : une seule étape active). */
  activeIndex: number;
  /** Complétion de chaque étape (dans l'ordre de `STEP_ORDER`). */
  completed: boolean[];
  /** Accessibilité de chaque étape (dans l'ordre de `STEP_ORDER`). */
  reachable: boolean[];
  /** Détail de tarification recalculé à chaque changement pertinent. */
  pricing: PricingBreakdown;
  /** Valide l'étape active puis avance si celle-ci est satisfaite. */
  goNext: () => Promise<void>;
  /** Recule d'une étape (borné à l'étape 0). */
  goPrev: () => void;
  /** Saute à une étape si elle est accessible. */
  goToStep: (index: number) => void;
  /** Initialise le paiement ; réinitialise l'état après succès. */
  submitReservation: () => Promise<void>;
}

/**
 * Orchestre le Tunnel de devis / réservation en câblant react-hook-form et un
 * index d'étape à la couche logique pure.
 */
export function useTunnel(): UseTunnelReturn {
  // Hydratation depuis la persistance, calculée une seule fois (Requirement 12.2).
  const initialValuesRef = useRef<TunnelState | null>(null);
  if (initialValuesRef.current === null) {
    initialValuesRef.current = loadState() ?? INITIAL_TUNNEL_STATE;
  }

  const form = useForm<TunnelState>({
    defaultValues: initialValuesRef.current,
    mode: "onChange",
  });

  // Une seule étape active à tout instant (Requirement 1.3, 11.x).
  const [activeIndex, setActiveIndex] = useState(0);

  // `watch()` sans argument s'abonne à toutes les valeurs et déclenche un
  // re-rendu à chaque changement, ce qui permet de recalculer les vues dérivées.
  const values = form.watch();

  const mode = resolveMode(values.support);
  const pricing = computeTotal(values);
  const completed = computeCompleted(values);
  const reachable = computeReachable(completed);

  // Garde-fous contre les boucles de réconciliation.
  const lastSupportRef = useRef<SupportId | null>(
    initialValuesRef.current.support,
  );
  const reconcilingRef = useRef(false);

  // Persistance sur `watch` + réconciliation sur changement de Support.
  useEffect(() => {
    const subscription = form.watch((_value, { name }) => {
      // Persiste l'état courant (Requirements 12.1, 12.2).
      saveState(form.getValues());

      if (reconcilingRef.current) {
        return;
      }

      // Réconciliation lorsque le Support change (Requirements 4.6, 12.3).
      if (name === "support") {
        const nextSupport = form.getValues("support");
        if (nextSupport !== lastSupportRef.current) {
          lastSupportRef.current = nextSupport;

          if (nextSupport !== null) {
            const reconciled = reconcileState(form.getValues(), nextSupport);
            reconcilingRef.current = true;
            form.reset(reconciled, { keepDefaultValues: true });
            reconcilingRef.current = false;
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const goNext = useCallback(async () => {
    const stepId = STEP_ORDER[activeIndex];
    const fields = stepId ? STEP_FIELDS[stepId] : undefined;

    // Fait remonter les erreurs de champ dans react-hook-form (Requirement 17.3).
    if (fields && fields.length > 0) {
      await form.trigger(fields);
    }

    // L'avancement reste gouverné par le sous-schéma Zod de l'étape active.
    const result = advance(form.getValues(), activeIndex);
    if (result.ok) {
      setActiveIndex(result.activeIndex);
    }
  }, [activeIndex, form]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => Math.max(0, current - 1));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      const currentReachable = computeReachable(
        computeCompleted(form.getValues()),
      );
      setActiveIndex((current) =>
        navGoToStep(current, index, currentReachable),
      );
    },
    [form],
  );

  const submitReservation = useCallback(async () => {
    const current = form.getValues();
    const result = await initiatePaymentPlaceholder(current, computeTotal(current));

    if (result.success) {
      // Succès : on efface la persistance et on réinitialise le Tunnel
      // (Requirement 12.4).
      clearState();
      lastSupportRef.current = null;
      form.reset(INITIAL_TUNNEL_STATE);
      setActiveIndex(0);
    }
    // Échec : l'`État_Tunnel` est conservé afin de permettre une nouvelle
    // tentative (Requirement 8.9). On ne touche ni à l'état ni à la persistance.
  }, [form]);

  return {
    form,
    mode,
    activeIndex,
    completed,
    reachable,
    pricing,
    goNext,
    goPrev,
    goToStep,
    submitReservation,
  };
}
