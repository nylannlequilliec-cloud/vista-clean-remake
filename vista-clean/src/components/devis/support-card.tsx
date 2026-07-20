"use client";

// Feature: devis-questionnaire
// Carte sélectionnable réutilisable de l'Étape 1 (Lavage).
// Présente l'icône Lucide et le libellé d'un Support. Accessible comme un radio :
// role="radio", aria-checked, opérable au clavier (Enter/Espace), focus visible.
// L'état sélectionné est indiqué par un moyen non chromatique (bordure épaisse +
// icône Check) en plus de l'accent violet du thème.

import {
  Bus,
  Car,
  CarFront,
  CarTaxiFront,
  Check,
  HelpCircle,
  Package,
  Sofa,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type { Support, SupportId } from "@/lib/devis/types";
import { cn } from "@/lib/utils";

/**
 * Table de correspondance entre les noms d'icônes déclarés dans `pricing.ts`
 * (champ `Support.icon`) et les composants `lucide-react` correspondants.
 */
const SUPPORT_ICONS: Record<string, LucideIcon> = {
  Car,
  CarFront,
  CarTaxiFront,
  Bus,
  Sofa,
  Truck,
  Package,
  HelpCircle,
};

export interface SupportCardProps {
  support: Support;
  selected: boolean;
  onSelect: (id: SupportId) => void;
}

export function SupportCard({ support, selected, onSelect }: SupportCardProps) {
  // Repli sur une icône neutre si le nom n'est pas reconnu.
  const Icon = SUPPORT_ICONS[support.icon] ?? HelpCircle;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      data-selected={selected}
      onClick={() => onSelect(support.id)}
      className={cn(
        // Cible tactile ≥ 44×44 px + mise en page de la carte.
        "group relative flex min-h-[44px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 bg-card p-4 text-center transition-all outline-none select-none",
        // Focus clavier visible.
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        // État non sélectionné : bordure discrète + survol.
        !selected &&
          "border-border hover:border-primary/40 hover:bg-muted/50",
        // État sélectionné : accent violet + bordure épaisse (distinction non chromatique).
        selected &&
          "border-primary bg-primary/5 text-foreground shadow-md shadow-primary/10"
      )}
    >
      {/* Indicateur de sélection non chromatique : icône Check. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity",
          selected ? "opacity-100" : "opacity-0"
        )}
      >
        <Check className="size-3.5" />
      </span>

      <Icon
        aria-hidden="true"
        className={cn(
          "size-8 transition-colors",
          selected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />

      <span className="text-sm font-medium leading-snug">{support.label}</span>
    </button>
  );
}
