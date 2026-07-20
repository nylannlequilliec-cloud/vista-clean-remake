"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bus,
  Car,
  CarFront,
  CarTaxiFront,
  Sofa,
  type LucideIcon,
} from "lucide-react";

import { SUPPORTS, PACKS } from "@/lib/devis/pricing";
import { formatEuro } from "@/lib/devis/calculations";
import { resolveMode } from "@/lib/devis/mode";
import type { SupportId } from "@/lib/devis/types";
import { cn } from "@/lib/utils";

/* ─── Subset of supports shown in the widget ─────────────────────────────── */

const QUICK_SUPPORT_IDS: SupportId[] = [
  "citadine",
  "berline",
  "suv",
  "monospace-5",
  "monospace-7",
  "canape-sans-angle",
];

const QUICK_SUPPORTS = SUPPORTS.filter((s) =>
  QUICK_SUPPORT_IDS.includes(s.id)
);

/* ─── Icon map (same pattern as SupportCard) ─────────────────────────────── */

const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  CarFront,
  CarTaxiFront,
  Bus,
  Sofa,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export function QuickEstimate() {
  const [selected, setSelected] = useState<SupportId | null>(null);

  const mode = selected ? resolveMode(selected) : null;

  return (
    <section
      id="quick-estimate"
      className="relative py-16 md:py-24"
      aria-labelledby="quick-estimate-heading"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Glassmorphism card */}
        <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <h2
              id="quick-estimate-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading tracking-tight"
            >
              Estime ton prix en 10 secondes
            </h2>
            <p className="mt-2 text-muted-foreground text-base sm:text-lg">
              Clique ton véhicule, vois ton prix
            </p>
          </div>

          {/* Support selection — radiogroup */}
          <div
            role="radiogroup"
            aria-label="Type de véhicule ou support"
            className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4"
          >
            {QUICK_SUPPORTS.map((support) => {
              const Icon = ICON_MAP[support.icon] ?? Car;
              const isSelected = selected === support.id;

              return (
                <button
                  key={support.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={support.label}
                  onClick={() => setSelected(support.id)}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 sm:p-4 text-center outline-none select-none cursor-pointer",
                    "transition-all duration-200 hover:scale-[1.04] active:scale-[0.96]",
                    "focus-visible:ring-3 focus-visible:ring-ring/50",
                    !isSelected &&
                      "border-border bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/10",
                    isSelected &&
                      "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-[1.04] ring-2 ring-primary/30"
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-7 sm:size-8 transition-colors duration-200",
                      isSelected
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-medium leading-tight",
                      isSelected && "text-primary"
                    )}
                  >
                    {support.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Price reveal */}
          {selected && mode === "prix" && (
            <div className="mt-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className={cn(
                      "relative rounded-2xl border p-5 sm:p-6 text-center transition-shadow",
                      pack.popular
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border bg-card"
                    )}
                  >
                    {pack.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                        POPULAIRE
                      </span>
                    )}
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {pack.name}
                    </p>
                    <p className="mt-2 text-3xl sm:text-4xl font-bold font-heading text-foreground">
                      {formatEuro(pack.price)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {pack.durationLabel}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="mt-6 text-center">
                <Link
                  href="/reservation"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  Configurer ma prestation
                </Link>
              </div>
            </div>
          )}

          {/* Devis mode */}
          {selected && mode === "devis" && (
            <div className="mt-8 animate-in slide-in-from-bottom-4 fade-in duration-300 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Tarification sur devis
              </p>
              <Link
                href="/reservation"
                className="mt-4 inline-flex items-center justify-center rounded-xl border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Demander un devis
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
