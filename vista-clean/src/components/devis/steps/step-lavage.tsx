"use client";

// Feature: devis-questionnaire
// Étape 1 du Tunnel — Lavage (src/components/devis/steps/).
//
// Présente une grille responsive de `SupportCard` (une par entrée de `SUPPORTS`)
// et l'aide au choix du véhicule (`VehicleHelp`). La sélection est UNIQUE : la
// grille est exposée comme un groupe radio accessible (role="radiogroup") et
// chaque carte est un radio (role="radio" côté `SupportCard`).
//
// Ce composant est purement présentationnel : il lit/écrit le champ `support`
// de l'`État_Tunnel` via le formulaire react-hook-form fourni en props et ne
// calcule aucun prix.
//
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 15.1, 15.2, 15.4

import { useId } from "react";
import type { UseFormReturn } from "react-hook-form";

import { SupportCard } from "@/components/devis/support-card";
import { VehicleHelp } from "@/components/devis/vehicle-help";
import { SUPPORTS } from "@/lib/devis/pricing";
import type { SupportId, TunnelState } from "@/lib/devis/types";

export interface StepLavageProps {
  form: UseFormReturn<TunnelState>;
}

export function StepLavage({ form }: StepLavageProps) {
  const headingId = useId();

  // Sélection courante du Support (source de vérité : l'`État_Tunnel`).
  const selected = form.watch("support");

  function handleSelect(id: SupportId) {
    // Sélection unique : on remplace la valeur du champ `support` et on marque
    // le champ comme validé / modifié / touché pour la navigation et les erreurs.
    form.setValue("support", id, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          className="text-xl font-semibold text-foreground sm:text-2xl"
        >
          Que souhaitez-vous faire nettoyer ?
        </h2>
        <p className="text-sm text-muted-foreground">
          Choisissez le support à nettoyer pour adapter la suite du parcours.
        </p>
      </div>

      {/* Groupe radio accessible : sélection unique parmi les Supports.
          Grille mobile-first (2 colonnes) qui s'élargit sur les grands écrans. */}
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
      >
        {SUPPORTS.map((support) => (
          <SupportCard
            key={support.id}
            support={support}
            selected={selected === support.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <VehicleHelp />
    </div>
  );
}
