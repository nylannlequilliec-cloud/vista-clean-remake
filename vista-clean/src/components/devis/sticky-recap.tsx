"use client";

// Feature: devis-questionnaire
// StickyRecap (Requirements 8.4, 9.5, 10.1, 10.2, 10.4, 15.2) — Récapitulatif
// persistant du Tunnel.
// - Desktop (≥ 768 px) : colonne collante (`sticky`) affichant le détail complet.
// - Mobile (< 768 px) : barre repliable collante en bas d'écran (Collapsible
//   `@base-ui/react`) exposant en permanence le Prix_Total, extensible pour le
//   détail (Requirement 10.4, 15.2).
// La donnée présentée provient de `buildRecap(state, pricing)` (fonction pure,
// présentation-agnostique). En `Mode_Devis`, aucun prix automatique n'est exposé :
// le récapitulatif affiche « Tarification sur devis » (Requirement 9.5).
// Composant sans `asChild`, cibles tactiles ≥ 44 px, tokens de thème, contraste
// et distinction non chromatique conservés.

import { Collapsible } from "@base-ui/react/collapsible";
import { ChevronUp, FileText } from "lucide-react";

import { formatEuro } from "@/lib/devis/calculations";
import { buildRecap, type RecapView } from "@/lib/devis/recap";
import type { PricingBreakdown, TunnelState } from "@/lib/devis/types";
import { cn } from "@/lib/utils";

export interface StickyRecapProps {
  /** État complet du Tunnel. */
  state: TunnelState;
  /** Détail de tarification issu de `computeTotal(state)`. */
  pricing: PricingBreakdown;
}

/** Libellés lisibles des types de lieu. */
const LIEU_LABELS: Record<"local" | "domicile", string> = {
  local: "Dans mon local (Vitry-sur-Seine 94400)",
  domicile: "À domicile",
};

/** Ligne « libellé / montant » du récapitulatif. */
function RecapLine({
  label,
  amount,
  emphasis = false,
  muted = false,
}: {
  label: string;
  amount: string;
  emphasis?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-3",
        emphasis ? "text-base font-semibold text-foreground" : "text-sm",
        muted && !emphasis ? "text-muted-foreground" : "",
      )}
    >
      <span className="min-w-0">{label}</span>
      <span className="shrink-0 tabular-nums">{amount}</span>
    </div>
  );
}

/**
 * Détail complet du récapitulatif, partagé entre la colonne desktop et le
 * panneau mobile. Gère les deux modes (prix / devis).
 */
function RecapDetails({ recap }: { recap: RecapView }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Support choisi — toujours affiché. */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Support
        </span>
        <span className="text-sm font-medium text-foreground">
          {recap.support ? recap.support.label : "Non sélectionné"}
        </span>
      </div>

      {/* Lieu de prestation — toujours affiché dès qu'un type est choisi. */}
      {recap.lieu.type ? (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Lieu
          </span>
          <span className="text-sm text-foreground">
            {LIEU_LABELS[recap.lieu.type]}
          </span>
          {recap.lieu.type === "domicile" && recap.lieu.address.trim() ? (
            <span className="text-sm text-muted-foreground">
              {recap.lieu.address}
            </span>
          ) : null}
        </div>
      ) : null}

      {recap.isDevis ? (
        // Mode_Devis : aucun prix automatique, indication « sur devis ».
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm font-medium text-foreground">
          <FileText aria-hidden="true" className="size-4 text-primary" />
          {recap.tarificationLabel}
        </div>
      ) : (
        // Mode_Prix : détail chiffré complet.
        <>
          <div className="h-px bg-border" />

          <div className="flex flex-col gap-2">
            {recap.pack ? (
              <RecapLine
                label={`Pack ${recap.pack.name}`}
                amount={formatEuro(recap.pack.price)}
              />
            ) : (
              <RecapLine label="Pack" amount="—" muted />
            )}

            {recap.options.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Options
                </span>
                {recap.options.map((option) => (
                  <RecapLine
                    key={option.label}
                    label={option.label}
                    amount={formatEuro(option.price)}
                    muted
                  />
                ))}
              </div>
            ) : null}

            {recap.lieu.type === "domicile" ||
            (recap.fraisDeplacement ?? 0) > 0 ? (
              <RecapLine
                label="Frais de déplacement"
                amount={formatEuro(recap.fraisDeplacement ?? 0)}
                muted
              />
            ) : null}

            {(recap.supplementGroupeElectrogene ?? 0) > 0 ? (
              <RecapLine
                label="Supplément groupe électrogène"
                amount={formatEuro(recap.supplementGroupeElectrogene ?? 0)}
                muted
              />
            ) : null}
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-1.5">
            <RecapLine
              label="Prix total"
              amount={formatEuro(recap.total ?? 0)}
              emphasis
            />
            <RecapLine
              label="Acompte (15 %)"
              amount={formatEuro(recap.acompte ?? 0)}
              muted
            />
          </div>
        </>
      )}
    </div>
  );
}

/** Montant « en une ligne » présenté dans l'en-tête (desktop) et le déclencheur (mobile). */
function RecapHeadline({
  recap,
  className,
}: {
  recap: RecapView;
  className?: string;
}) {
  if (recap.isDevis) {
    return (
      <span className={cn("text-sm font-semibold text-foreground", className)}>
        {recap.tarificationLabel}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-lg font-bold text-foreground tabular-nums",
        className,
      )}
    >
      {formatEuro(recap.total ?? 0)}
    </span>
  );
}

export function StickyRecap({ state, pricing }: StickyRecapProps) {
  const recap = buildRecap(state, pricing);

  return (
    <>
      {/* ─── Desktop (≥ 768 px) : colonne collante ─── */}
      <aside
        aria-label="Récapitulatif de votre configuration"
        className="hidden rounded-xl bg-card p-5 text-card-foreground ring-1 ring-foreground/10 md:sticky md:top-24 md:block"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Récapitulatif
          </h2>
          <RecapHeadline recap={recap} />
        </div>
        <RecapDetails recap={recap} />
      </aside>

      {/* ─── Mobile (< 768 px) : barre repliable collante en bas ─── */}
      <div className="sticky bottom-0 z-40 -mx-4 md:hidden">
        <Collapsible.Root
          className="border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
        >
          <Collapsible.Trigger
            aria-label="Afficher ou masquer le détail du récapitulatif"
            className={cn(
              "group flex min-h-[56px] w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none transition-colors",
              "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
              "hover:bg-muted/40",
            )}
          >
            <span className="flex flex-col">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Récapitulatif
              </span>
              <RecapHeadline recap={recap} />
            </span>
            <ChevronUp
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded:rotate-180"
            />
          </Collapsible.Trigger>

          <Collapsible.Panel
            className={cn(
              "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-300 ease-out",
              "data-starting-style:h-0 data-ending-style:h-0",
            )}
          >
            <div className="max-h-[60vh] overflow-y-auto px-4 pt-1 pb-4">
              <RecapDetails recap={recap} />
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
      </div>
    </>
  );
}
