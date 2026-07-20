"use client";

// Feature: devis-questionnaire
// Étape 3 du Tunnel — Options (src/components/devis/steps/).
//
// Présente les Options additionnelles regroupées par `Catégorie_Option`
// (TRAITEMENT, SHAMPOING, SUPPLÉMENTS, OPTIONS), chacune rendue via `OptionItem`
// en multi-sélection. Le composant est purement présentationnel : il lit/écrit
// le champ `options` de l'`État_Tunnel` via le formulaire react-hook-form fourni
// en props et délègue le basculement à `toggleOption`. Le recalcul du prix est
// assuré par `useTunnel` (abonnement `watch`) ; rien à faire ici.
//
// L'avancement est autorisé même sans aucune option sélectionnée.
//
// Requirements: 6.1, 6.7, 6.8, 6.9, 6.10, 9.2

import { useId } from "react";
import type { UseFormReturn } from "react-hook-form";

import { OptionItem } from "@/components/devis/option-item";
import { toggleOption } from "@/lib/devis/calculations";
import { OPTIONS } from "@/lib/devis/pricing";
import type { OptionCategory, OptionId, TunnelState } from "@/lib/devis/types";

export interface StepOptionsProps {
  form: UseFormReturn<TunnelState>;
}

/**
 * Ordre d'affichage des catégories et libellés français associés.
 * L'ordre est explicite pour garantir un rendu stable et conforme.
 */
const CATEGORY_ORDER: { category: OptionCategory; heading: string }[] = [
  { category: "TRAITEMENT", heading: "Traitement" },
  { category: "SHAMPOING", heading: "Shampoing" },
  { category: "SUPPLEMENTS", heading: "Suppléments" },
  { category: "OPTIONS", heading: "Options" },
];

export function StepOptions({ form }: StepOptionsProps) {
  const headingId = useId();

  // Sélection courante des options (source de vérité : l'`État_Tunnel`).
  const selected = form.watch("options");

  function handleToggle(id: OptionId) {
    // Basculement pur puis mise à jour du champ `options`. Le recalcul du prix
    // est pris en charge en amont par `useTunnel` via `watch`.
    const next = toggleOption(selected ?? [], id);
    form.setValue("options", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          className="text-xl font-semibold text-foreground sm:text-2xl"
        >
          Personnalisez votre prestation
        </h2>
        <p className="text-sm text-muted-foreground">
          Ajoutez autant d&apos;options que vous le souhaitez. Cette étape est
          facultative.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {CATEGORY_ORDER.map(({ category, heading }) => {
          const options = OPTIONS.filter(
            (option) => option.category === category,
          );

          if (options.length === 0) {
            return null;
          }

          return (
            <section key={category} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {heading}
              </h3>
              <div className="flex flex-col gap-2">
                {options.map((option) => (
                  <OptionItem
                    key={option.id}
                    option={option}
                    selected={(selected ?? []).includes(option.id)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
