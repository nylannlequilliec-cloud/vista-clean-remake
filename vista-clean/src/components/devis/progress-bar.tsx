"use client";

// Feature: devis-questionnaire
// Barre_Progression (Requirement 2) : cinq pastilles numérotées + libellé,
// mise en évidence de l'étape active, distinction non chromatique des états,
// navigation clavier et annonce du changement d'étape aux technologies
// d'assistance. Composant de présentation pur — toute la logique
// d'accessibilité (completed / reachable) est fournie par l'appelant.

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/** Métadonnées d'une étape affichée dans la Barre_Progression. */
export interface StepMeta {
  /** Numéro affiché (1-indexé). */
  number: number;
  /** Libellé court de l'étape (ex. « Lavage »). */
  label: string;
}

export interface ProgressBarProps {
  /** Les cinq étapes ordonnées : numéro + libellé. */
  steps: StepMeta[];
  /** Index (0-indexé) de l'étape active. */
  activeIndex: number;
  /** État de complétion par étape. */
  completed: boolean[];
  /** Étapes accessibles à la navigation. */
  reachable: boolean[];
  /** Callback déclenché lorsqu'une étape accessible est sélectionnée. */
  onSelectStep: (index: number) => void;
}

export function ProgressBar({
  steps,
  activeIndex,
  completed,
  reachable,
  onSelectStep,
}: ProgressBarProps) {
  const activeStep = steps[activeIndex];

  return (
    <nav
      aria-label="Progression du questionnaire"
      className="rounded-2xl border border-white/10 bg-card/60 p-4 shadow-xl shadow-primary/5 backdrop-blur-xl"
    >
      <ol className="flex items-start">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = completed[index] ?? false;
          const isReachable = reachable[index] ?? false;
          // Une étape non accessible ne peut être ni activée ni sélectionnée.
          const isDisabled = !isReachable;
          // Le connecteur amont est « rempli » lorsque l'étape précédente est
          // complétée (progression atteinte).
          const previousCompleted = index > 0 && (completed[index - 1] ?? false);

          const stateLabel = isCompleted
            ? " (complétée)"
            : isActive
              ? " (étape en cours)"
              : "";

          return (
            <li
              key={step.label}
              className="relative flex min-w-0 flex-1 flex-col items-center"
            >
              {/* Connecteur reliant le centre de la pastille précédente. */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-[21px] right-1/2 left-[-50%] h-0.5",
                    previousCompleted ? "bg-primary" : "bg-border",
                  )}
                />
              )}

              <button
                type="button"
                onClick={() => {
                  if (isReachable) {
                    onSelectStep(index);
                  }
                }}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Étape ${step.number} sur ${steps.length} : ${step.label}${stateLabel}`}
                className={cn(
                  "group relative z-10 flex min-h-11 w-full flex-col items-center gap-1.5 rounded-lg px-1 py-1 outline-none transition-colors",
                  "focus-visible:ring-3 focus-visible:ring-ring/50",
                  isReachable
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60",
                )}
              >
                {/* Pastille : numéro, ou icône Check si complétée (non chromatique). */}
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary font-bold text-primary-foreground ring-3 ring-primary/30"
                      : isCompleted
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="size-5" aria-hidden="true" />
                  ) : (
                    step.number
                  )}
                </span>

                <span
                  className={cn(
                    "max-w-full truncate text-center text-xs sm:text-sm",
                    isActive
                      ? "font-semibold text-foreground"
                      : isCompleted
                        ? "font-medium text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Région live annonçant le changement d'étape (Requirement 16.4). */}
      <div aria-live="polite" className="sr-only">
        {activeStep
          ? `Étape ${activeStep.number} sur ${steps.length} : ${activeStep.label}`
          : ""}
      </div>
    </nav>
  );
}
