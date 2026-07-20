"use client";

// Feature: devis-questionnaire
// Étape 5 du Tunnel — Paiement (src/components/devis/steps/).
//
// Présente :
//  - un calendrier de disponibilités affichant les `Créneau` regroupés par jour ;
//    un créneau complet (`full === true`) porte la mention « Complet » et n'est
//    pas sélectionnable (Requirements 8.1, 8.2) ;
//  - la sélection d'un créneau disponible met à jour `creneauId` dans
//    l'`État_Tunnel` (guardée par la fonction pure `selectCreneau`, Requirement 8.3) ;
//  - un rappel détaillé du montant à régler : Prix_Total et Acompte (15 %),
//    formatés via `formatEuro` (Requirements 8.4, 8.5) ;
//  - une FAQ (accordion existant) répondant au minimum à « Pourquoi un acompte ? »
//    et « Que se passe-t-il après le paiement ? » (Requirement 8.11).
//
// Le bouton « Réserver mon lavage » vit dans `StepNavigation` / `TunnelClient`
// (Requirement 8.6) : cette étape se concentre sur les créneaux, le détail de
// l'acompte et la FAQ.
//
// Composant purement présentationnel : il lit/écrit le champ `creneauId` de
// l'`État_Tunnel` via le formulaire react-hook-form fourni en props et consomme
// le `PricingBreakdown` déjà calculé. Aucune prop `asChild`, cibles tactiles
// ≥ 44 px, navigation clavier et focus visible, distinction d'état non
// chromatique. Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.11

import { useId } from "react";
import type { UseFormReturn } from "react-hook-form";
import { CalendarClock, Check, ShieldCheck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatEuro } from "@/lib/devis/calculations";
import { selectCreneau } from "@/lib/devis/selection";
import type {
  Creneau,
  PricingBreakdown,
  TunnelState,
} from "@/lib/devis/types";
import { cn } from "@/lib/utils";

export interface StepPaiementProps {
  form: UseFormReturn<TunnelState>;
  pricing: PricingBreakdown;
  /** Créneaux de disponibilité. À défaut, une liste d'exemple est utilisée. */
  creneaux?: Creneau[];
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * DONNÉES D'EXEMPLE — À REMPLACER PAR UNE VRAIE SOURCE DE DISPONIBILITÉS
 * ─────────────────────────────────────────────────────────────────────────
 * Les exigences ne fixent pas de source de disponibilités. Cette liste est un
 * simple jeu de démonstration (quelques jours, certains créneaux marqués
 * `full: true`) utilisé lorsque la prop `creneaux` n'est pas fournie. Elle doit
 * être remplacée par une vraie source (API de réservation / calendrier).
 */
const SAMPLE_CRENEAUX: Creneau[] = [
  { id: "2025-06-16-0900", date: "2025-06-16", startLabel: "09h00", full: false },
  { id: "2025-06-16-1100", date: "2025-06-16", startLabel: "11h00", full: true },
  { id: "2025-06-16-1400", date: "2025-06-16", startLabel: "14h00", full: false },
  { id: "2025-06-17-0900", date: "2025-06-17", startLabel: "09h00", full: false },
  { id: "2025-06-17-1400", date: "2025-06-17", startLabel: "14h00", full: false },
  { id: "2025-06-17-1600", date: "2025-06-17", startLabel: "16h00", full: true },
  { id: "2025-06-18-1000", date: "2025-06-18", startLabel: "10h00", full: false },
  { id: "2025-06-18-1330", date: "2025-06-18", startLabel: "13h30", full: false },
  { id: "2025-06-18-1500", date: "2025-06-18", startLabel: "15h00", full: false },
];

/** Formate une date ISO `yyyy-mm-dd` en libellé lisible en français. */
function formatDayLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  const label = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
  // Majuscule initiale (« lundi 16 juin » → « Lundi 16 juin »).
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Regroupe les créneaux par jour en préservant l'ordre d'apparition. */
function groupByDay(creneaux: Creneau[]): { date: string; slots: Creneau[] }[] {
  const groups: { date: string; slots: Creneau[] }[] = [];
  const index = new Map<string, Creneau[]>();

  for (const creneau of creneaux) {
    let slots = index.get(creneau.date);
    if (!slots) {
      slots = [];
      index.set(creneau.date, slots);
      groups.push({ date: creneau.date, slots });
    }
    slots.push(creneau);
  }

  return groups;
}

/** FAQ minimale de l'Étape 5 (Requirement 8.11). */
const FAQ_ITEMS: { value: string; question: string; answer: string }[] = [
  {
    value: "acompte",
    question: "Pourquoi un acompte ?",
    answer:
      "L'acompte de 15 % confirme votre réservation et bloque votre créneau. Il est déduit du montant total réglé le jour de la prestation.",
  },
  {
    value: "apres-paiement",
    question: "Que se passe-t-il après le paiement ?",
    answer:
      "Vous recevez une confirmation de réservation récapitulant votre créneau et votre configuration. Nous vous recontactons pour finaliser les détails et le solde est réglé une fois la prestation réalisée.",
  },
];

export function StepPaiement({ form, pricing, creneaux }: StepPaiementProps) {
  const headingId = useId();
  const calendarLabelId = useId();

  const effectiveCreneaux =
    creneaux && creneaux.length > 0 ? creneaux : SAMPLE_CRENEAUX;
  const groupedDays = groupByDay(effectiveCreneaux);

  // Sélection courante (source de vérité : l'`État_Tunnel`).
  const selectedCreneauId = form.watch("creneauId");

  function handleSelect(creneau: Creneau) {
    // Un créneau complet n'est pas sélectionnable (Requirement 8.2).
    if (creneau.full) {
      return;
    }

    // `selectCreneau` garantit qu'un créneau complet/inexistant est rejeté et
    // que `creneauId` reste inchangé le cas échéant (Requirement 8.3).
    const next = selectCreneau(form.getValues(), effectiveCreneaux, creneau.id);
    form.setValue("creneauId", next.creneauId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          className="text-xl font-semibold text-foreground sm:text-2xl"
        >
          Choisissez votre créneau
        </h2>
        <p className="text-sm text-muted-foreground">
          Sélectionnez une disponibilité, puis réglez l&apos;acompte pour
          confirmer votre réservation.
        </p>
      </div>

      {/* ─── Calendrier de disponibilités (Requirements 8.1, 8.2, 8.3) ─── */}
      <section aria-labelledby={calendarLabelId} className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <CalendarClock aria-hidden="true" className="size-5 text-primary" />
          <h3
            id={calendarLabelId}
            className="text-base font-semibold text-foreground"
          >
            Disponibilités
          </h3>
        </div>

        <div
          role="radiogroup"
          aria-labelledby={calendarLabelId}
          className="flex flex-col gap-5"
        >
          {groupedDays.map((day) => (
            <div key={day.date} className="flex flex-col gap-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {formatDayLabel(day.date)}
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {day.slots.map((creneau) => {
                  const selected = selectedCreneauId === creneau.id;
                  return (
                    <button
                      key={creneau.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-disabled={creneau.full}
                      disabled={creneau.full}
                      data-selected={selected}
                      onClick={() => handleSelect(creneau)}
                      className={cn(
                        // Cible tactile ≥ 44 px + mise en page.
                        "relative flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all outline-none select-none",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                        creneau.full
                          ? // Créneau complet : non sélectionnable, distinction non chromatique.
                            "cursor-not-allowed border-dashed border-border bg-muted/40 text-muted-foreground line-through"
                          : selected
                            ? // Sélectionné : accent + bordure épaisse + icône Check.
                              "border-primary bg-primary/5 text-foreground shadow-sm shadow-primary/10"
                            : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/50",
                      )}
                    >
                      {selected ? (
                        <Check
                          aria-hidden="true"
                          className="size-4 text-primary"
                        />
                      ) : null}
                      <span>{creneau.startLabel}</span>
                      {creneau.full ? (
                        <span className="sr-only">Complet</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {/* Mention « Complet » visible pour les créneaux indisponibles. */}
              {day.slots.some((slot) => slot.full) ? (
                <p className="text-xs text-muted-foreground">
                  Les créneaux barrés sont complets.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Détail de l'acompte à régler (Requirements 8.4, 8.5) ─── */}
      <section
        aria-label="Montant à régler"
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">
            Montant à régler aujourd&apos;hui
          </h3>
        </div>

        <dl className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="text-muted-foreground">Prix total</dt>
            <dd className="font-medium tabular-nums text-foreground">
              {formatEuro(pricing.total)}
            </dd>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-base font-semibold text-foreground">
              Acompte (15 %)
            </dt>
            <dd className="text-lg font-bold tabular-nums text-primary">
              {formatEuro(pricing.acompte)}
            </dd>
          </div>
        </dl>

        <p className="text-xs text-muted-foreground">
          L&apos;acompte confirme votre réservation. Le solde de{" "}
          {formatEuro(pricing.total - pricing.acompte)} est réglé le jour de la
          prestation.
        </p>
      </section>

      {/* ─── FAQ (Requirement 8.11) ─── */}
      <section aria-label="Questions fréquentes" className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">
          Questions fréquentes
        </h3>
        <Accordion>
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
