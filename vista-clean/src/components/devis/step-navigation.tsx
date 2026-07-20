"use client";

// Feature: devis-questionnaire
// Navigation entre les Étapes du tunnel (Requirement 11).
// - Bouton « Continuer » : déclenche onNext (la validation puis l'avance est gérée
//   par le parent / useTunnel).
// - Contrôle « Retour » : déclenche onPrev, non rendu à l'Étape 1 (canGoBack=false).
// Composants natifs stylés via `buttonVariants` (pas de `asChild`). Clavier + focus
// visible fournis par buttonVariants ; cibles tactiles ≥ 44 px (Requirement 17.5).

import { ArrowLeft, ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface StepNavigationProps {
  /** Autorise l'affichage du contrôle « Retour ». `false` à l'Étape 1. */
  canGoBack: boolean;
  /** `true` sur la dernière Étape (adapte le libellé et masque la flèche). */
  isLastStep?: boolean;
  /** Passe à l'Étape suivante (validation gérée par le parent). */
  onNext: () => void;
  /** Revient à l'Étape précédente. */
  onPrev: () => void;
  /** Libellé du bouton principal (ex. « Réserver mon lavage » sur la dernière Étape). */
  nextLabel?: string;
}

// Classe commune assurant une cible tactile ≥ 44×44 px.
const touchTarget = "min-h-[44px] px-5";

export function StepNavigation({
  canGoBack,
  isLastStep = false,
  onNext,
  onPrev,
  nextLabel,
}: StepNavigationProps) {
  const label = nextLabel ?? (isLastStep ? "Réserver mon lavage" : "Continuer");

  return (
    <div className="flex items-center gap-3">
      {canGoBack ? (
        <button
          type="button"
          onClick={onPrev}
          data-icon="inline-start"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            touchTarget
          )}
        >
          <ArrowLeft aria-hidden="true" />
          Retour
        </button>
      ) : null}

      <button
        type="button"
        onClick={onNext}
        data-icon={isLastStep ? undefined : "inline-end"}
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          touchTarget,
          "ml-auto"
        )}
      >
        {label}
        {isLastStep ? null : <ArrowRight aria-hidden="true" />}
      </button>
    </div>
  );
}
