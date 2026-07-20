"use client";

// Feature: devis-questionnaire
// StepPack — Étape 2 (Choix du pack), affichée uniquement en Mode_Prix
// (l'activation du mode est gérée par le parent).
//
// Présente les deux Packs (CONFORT / CONCESSION) issus de la source de
// tarification `PACKS` sous forme de cartes comparatives : prix formaté,
// durée estimée, liste des prestations incluses et badge « POPULAIRE » pour le
// pack marqué `popular`. La sélection est unique et pilotée par le champ
// `pack` de l'État_Tunnel via react-hook-form (`useController`).
//
// Accessibilité : conteneur role="radiogroup", chaque carte role="radio" avec
// aria-checked, opérable au clavier (les cartes sont des <button>), focus
// visible. L'état sélectionné est indiqué par plusieurs moyens non chromatiques
// (bordure épaisse + anneau + icône Check), pas seulement par la couleur.
// Cibles tactiles ≥ 44 px.
//
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5

import { useController, type UseFormReturn } from "react-hook-form";
import { Check, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatEuro } from "@/lib/devis/calculations";
import { PACKS } from "@/lib/devis/pricing";
import type { Pack, PackId, TunnelState } from "@/lib/devis/types";
import { cn } from "@/lib/utils";

interface StepPackProps {
  form: UseFormReturn<TunnelState>;
}

interface PackCardProps {
  pack: Pack;
  selected: boolean;
  onSelect: (id: PackId) => void;
}

function PackCard({ pack, selected, onSelect }: PackCardProps) {
  const titleId = `pack-card-${pack.id}-title`;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-labelledby={titleId}
      data-selected={selected}
      onClick={() => onSelect(pack.id)}
      className={cn(
        // Carte comparative + cible tactile confortable (≥ 44 px).
        "group relative flex min-h-[44px] w-full flex-col rounded-3xl border-2 bg-card p-8 text-left transition-all outline-none select-none",
        // Focus clavier visible.
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        // État non sélectionné : bordure discrète + survol.
        !selected && "border-border hover:border-primary/40",
        // État sélectionné : distinction non chromatique (bordure + anneau + ombre).
        selected &&
          "border-primary shadow-xl shadow-primary/10 ring-3 ring-primary/30"
      )}
    >
      {/* Badge « POPULAIRE » pour le pack mis en avant. */}
      {pack.popular ? (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1">
          <Zap aria-hidden="true" />
          POPULAIRE
        </Badge>
      ) : null}

      {/* Indicateur de sélection non chromatique : pastille Check. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-4 top-4 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity",
          selected ? "opacity-100" : "opacity-0"
        )}
      >
        <Check className="size-4" />
      </span>

      <h3
        id={titleId}
        className="font-heading text-xl font-bold tracking-tight"
      >
        {pack.name}
      </h3>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-heading text-4xl font-bold tabular-nums">
          {formatEuro(pack.price)}
        </span>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Durée&nbsp;: {pack.durationLabel}
      </p>

      <ul className="mt-6 space-y-3">
        {pack.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-accent"
            />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}

export function StepPack({ form }: StepPackProps) {
  const { field } = useController({ control: form.control, name: "pack" });

  const handleSelect = (id: PackId) => {
    // Sélection unique enregistrée dans l'État_Tunnel, avec validation et
    // marquage « dirty » (Requirement 5.4).
    form.setValue("pack", id, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div
      role="radiogroup"
      aria-label="Choix du pack"
      className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2"
    >
      {PACKS.map((pack) => (
        <PackCard
          key={pack.id}
          pack={pack}
          selected={field.value === pack.id}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}

export type { StepPackProps };
