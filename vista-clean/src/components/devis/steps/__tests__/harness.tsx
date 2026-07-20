// Feature: devis-questionnaire
// Harnais de test partagé pour les composants d'étape (Task 10.7).
//
// Les composants d'étape reçoivent un formulaire react-hook-form typé
// `UseFormReturn<TunnelState>` en props. Ce harnais monte un vrai formulaire
// initialisé avec `INITIAL_TUNNEL_STATE` (surcharges partielles possibles) et
// expose l'instance du formulaire aux assertions via un objet ref mutable, afin
// de pouvoir observer l'`État_Tunnel` après interaction.

import { useEffect } from "react";
import type { MutableRefObject, ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import { INITIAL_TUNNEL_STATE } from "@/hooks/use-tunnel";
import type { TunnelState } from "@/lib/devis/types";

export type FormRef = MutableRefObject<UseFormReturn<TunnelState> | null>;

interface FormHarnessProps {
  /** Surcharges partielles de l'état initial (fusion superficielle + nichée). */
  initial?: Partial<TunnelState>;
  /** Reçoit l'instance de formulaire pour permettre les assertions d'état. */
  formRef?: FormRef;
  /** Rend le composant d'étape testé avec le formulaire fourni. */
  children: (form: UseFormReturn<TunnelState>) => ReactNode;
}

/**
 * Fusionne l'état initial avec des surcharges, en préservant les sous-objets
 * imbriqués `lieu` et `devis`.
 */
function buildInitialState(initial?: Partial<TunnelState>): TunnelState {
  return {
    ...INITIAL_TUNNEL_STATE,
    ...initial,
    lieu: { ...INITIAL_TUNNEL_STATE.lieu, ...initial?.lieu },
    devis: { ...INITIAL_TUNNEL_STATE.devis, ...initial?.devis },
  };
}

export function FormHarness({ initial, formRef, children }: FormHarnessProps) {
  const form = useForm<TunnelState>({
    defaultValues: buildInitialState(initial),
    mode: "onChange",
  });

  // `useForm` renvoie une instance stable.
  // Assigner le ref dans un effet pour respecter les règles de React.
  useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [formRef, form]);

  return <>{children(form)}</>;
}
