"use client"

// Feature: devis-questionnaire
// OptionItem — ligne d'option multi-sélection de l'Étape 3 (Options).
// Affiche le libellé et le prix de l'option, un état de sélection accessible
// (role="checkbox" + aria-checked, distinction non chromatique via une icône),
// et, lorsque l'option dispose d'une information complémentaire, une icône
// « Info » révélant une infobulle descriptive au survol ET au focus clavier.
// Requirements: 6.2, 6.7, 6.9, 16.2, 16.6

import { Tooltip } from "@base-ui/react/tooltip"
import { Check, Info } from "lucide-react"

import { formatEuro } from "@/lib/devis/calculations"
import type { OptionDef, OptionId } from "@/lib/devis/types"
import { cn } from "@/lib/utils"

interface OptionItemProps {
  option: OptionDef
  selected: boolean
  onToggle: (id: OptionId) => void
}

function OptionItem({ option, selected, onToggle }: OptionItemProps) {
  return (
    <div data-slot="option-item" className="flex items-center gap-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        data-slot="option-item-toggle"
        data-state={selected ? "checked" : "unchecked"}
        onClick={() => onToggle(option.id)}
        className={cn(
          // Cible tactile ≥ 44×44 px, mobile-first.
          "group/option flex min-h-11 flex-1 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all outline-none select-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "hover:bg-muted/50",
          selected
            ? "border-primary bg-primary/5"
            : "border-border bg-transparent"
        )}
      >
        {/* Indicateur d'état : forme + icône (distinction non chromatique). */}
        <span
          aria-hidden="true"
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-[min(var(--radius-sm),6px)] border transition-colors",
            selected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-transparent"
          )}
        >
          {selected ? <Check className="size-3.5" /> : null}
        </span>

        <span className="flex-1 font-medium">{option.label}</span>

        <span className="shrink-0 text-muted-foreground tabular-nums">
          {formatEuro(option.price)}
        </span>
      </button>

      {option.info ? (
        <Tooltip.Root>
          <Tooltip.Trigger
            aria-label={`Plus d'informations sur ${option.label}`}
            className={cn(
              // Cible tactile ≥ 44×44 px pour l'icône d'aide.
              "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none",
              "hover:text-foreground",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            )}
          >
            <Info className="size-4" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={6}>
              <Tooltip.Popup
                className={cn(
                  "z-50 max-w-64 rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md",
                  "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
                  "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
                )}
              >
                {option.info}
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      ) : null}
    </div>
  )
}

export { OptionItem }
export type { OptionItemProps }
