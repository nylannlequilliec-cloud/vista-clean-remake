"use client";

// Feature: devis-questionnaire
// TunnelClient — îlot client racine du Tunnel de devis / réservation
// (Task 12.1). Câble le hook d'orchestration `useTunnel` aux composants de
// présentation et aux cinq étapes. Aucune logique métier ici : tout est délégué
// à la couche logique pure via `useTunnel`.
//
// Rendu :
//  - `Mode_Prix`  : `ProgressBar` + étape active (`STEP_ORDER[activeIndex]`) +
//    `StickyRecap` + `StepNavigation`. La dernière étape déclenche la
//    réservation (`submitReservation`).
//  - `Mode_Devis` : `DevisRequestForm` (ni packs, ni prix, ni acompte).
//
// La transition entre étapes est animée via `useStepTransition` (GSAP, respect
// de `prefers-reduced-motion`). Le fond animé (`AnimatedBackground`) est fourni
// par la page ; ce composant se contente de structurer le contenu.
//
// Accessibilité : `ProgressBar` embarque une région `aria-live` annonçant le
// changement d'étape ; tous les contrôles sont opérables au clavier avec focus
// visible (fournis par les composants sous-jacents).
//
// Requirements: 1.1, 1.3, 4.3, 4.5, 8.8, 8.9, 8.10, 10.1, 14.1

import { useState } from "react";
import { CheckCircle2, RotateCcw, TriangleAlert } from "lucide-react";

import { DevisRequestForm } from "@/components/devis/devis-request-form";
import { ProgressBar, type StepMeta } from "@/components/devis/progress-bar";
import { StepNavigation } from "@/components/devis/step-navigation";
import { StickyRecap } from "@/components/devis/sticky-recap";
import { StepLavage } from "@/components/devis/steps/step-lavage";
import { StepLieu } from "@/components/devis/steps/step-lieu";
import { StepOptions } from "@/components/devis/steps/step-options";
import { StepPack } from "@/components/devis/steps/step-pack";
import { StepPaiement } from "@/components/devis/steps/step-paiement";
import { buttonVariants } from "@/components/ui/button";
import { useStepTransition } from "@/hooks/use-step-transition";
import { useTunnel } from "@/hooks/use-tunnel";
import { STEP_ORDER } from "@/lib/devis/navigation";
import { cn } from "@/lib/utils";

/**
 * Métadonnées des cinq étapes affichées dans la `ProgressBar`, dans l'ordre de
 * `STEP_ORDER`. Numérotation 1..5 pour l'affichage.
 */
const STEP_META: StepMeta[] = [
  { number: 1, label: "Lavage" },
  { number: 2, label: "Pack" },
  { number: 3, label: "Options" },
  { number: 4, label: "Lieu" },
  { number: 5, label: "Paiement" },
];

/** États locaux du cycle de soumission de la réservation. */
type SubmitStatus = "idle" | "submitting" | "success" | "error";

const RESERVATION_ERROR_MESSAGE =
  "Le paiement de l'acompte n'a pas pu être initialisé. Vos informations sont conservées, vous pouvez réessayer.";

export function TunnelClient() {
  const {
    form,
    mode,
    activeIndex,
    completed,
    reachable,
    pricing,
    goNext,
    goPrev,
    goToStep,
    submitReservation,
  } = useTunnel();

  // Conteneur animé (fondu + léger glissement) rejoué à chaque changement
  // d'étape. Respecte `prefers-reduced-motion` (transition instantanée).
  const { containerRef } = useStepTransition(activeIndex);

  // État de présentation local du résultat de soumission (Mode_Prix).
  const [status, setStatus] = useState<SubmitStatus>("idle");
  // Confirmation de l'envoi d'une demande de devis (Mode_Devis).
  const [devisSubmitted, setDevisSubmitted] = useState(false);

  // Valeurs réactives de l'État_Tunnel pour alimenter le récapitulatif.
  const state = form.watch();

  const isLastStep = activeIndex === STEP_ORDER.length - 1;

  /**
   * Déclenche l'initialisation du paiement de l'acompte puis expose le résultat.
   *
   * SÉCURITÉ : `submitReservation` délègue aujourd'hui à un stub. L'intégration
   * réelle DOIT initialiser le paiement via un endpoint authentifié et validé
   * CÔTÉ SERVEUR ; aucun secret de paiement ne doit transiter ni être manipulé
   * côté client au-delà de la session d'initialisation fournie par le
   * prestataire sécurisé. En cas d'échec, l'État_Tunnel est conservé pour
   * permettre une nouvelle tentative (Requirements 8.8, 8.9, 8.10).
   */
  const handleReserve = async () => {
    setStatus("submitting");
    try {
      await submitReservation();
      setStatus("success");
    } catch {
      // Échec : on conserve l'état saisi et on affiche un message d'erreur.
      setStatus("error");
    }
  };

  /** Rend l'étape active en fonction de sa position dans `STEP_ORDER`. */
  const renderActiveStep = () => {
    const stepId = STEP_ORDER[activeIndex];
    switch (stepId) {
      case "lavage":
        return <StepLavage form={form} />;
      case "pack":
        return <StepPack form={form} />;
      case "options":
        return <StepOptions form={form} />;
      case "lieu":
        return <StepLieu form={form} />;
      case "paiement":
        return <StepPaiement form={form} pricing={pricing} />;
      default:
        return null;
    }
  };

  // ─── Confirmation de réservation (Mode_Prix, succès) ───
  if (status === "success") {
    return (
      <ConfirmationPanel
        title="Réservation confirmée"
        message="Votre acompte a bien été pris en compte et votre créneau est réservé. Vous recevrez une confirmation récapitulant votre configuration. À très vite !"
      />
    );
  }

  // ─── Confirmation d'envoi de demande de devis (Mode_Devis) ───
  if (devisSubmitted) {
    return (
      <ConfirmationPanel
        title="Demande de devis envoyée"
        message="Merci ! Votre demande a bien été transmise. Nous vous recontactons rapidement au numéro indiqué pour établir votre devis personnalisé."
      />
    );
  }

  // ─── Mode_Devis : formulaire de demande de devis ───
  if (mode === "devis") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() =>
            form.setValue("support", null, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-4 min-h-11",
          )}
          data-icon="inline-start"
        >
          <RotateCcw aria-hidden="true" />
          Changer de support
        </button>
        <DevisRequestForm
          form={form}
          onSubmit={() => setDevisSubmitted(true)}
        />
      </div>
    );
  }

  // ─── Mode_Prix : parcours en cinq étapes ───
  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-6xl gap-6 md:gap-8",
        // Deux colonnes (contenu + récapitulatif) à partir de l'étape 2.
        activeIndex >= 1 &&
          "md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_22rem]",
      )}
    >
      {/* Colonne principale : progression, étape active, navigation. */}
      <div className="flex min-w-0 flex-col gap-8">
        <ProgressBar
          steps={STEP_META}
          activeIndex={activeIndex}
          completed={completed}
          reachable={reachable}
          onSelectStep={goToStep}
        />

        {/* Conteneur animé référencé par `useStepTransition`. */}
        <div ref={containerRef}>{renderActiveStep()}</div>

        {status === "error" ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{RESERVATION_ERROR_MESSAGE}</span>
          </p>
        ) : null}

        <StepNavigation
          canGoBack={activeIndex > 0}
          isLastStep={isLastStep}
          onNext={isLastStep ? handleReserve : goNext}
          onPrev={goPrev}
          nextLabel={
            isLastStep
              ? status === "submitting"
                ? "Réservation en cours…"
                : "Réserver mon lavage"
              : undefined
          }
        />
      </div>

      {/* Colonne récapitulatif : masquée sur desktop à l'étape 1 (aside caché),
          barre mobile toujours rendue (Requirement 10.1). */}
      <div className={cn(activeIndex < 1 && "[&>aside]:hidden")}>
        <StickyRecap state={state} pricing={pricing} />
      </div>
    </div>
  );
}

/** Panneau de confirmation partagé (succès réservation ou envoi de devis). */
function ConfirmationPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl bg-card p-8 text-center text-card-foreground ring-1 ring-foreground/10"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 aria-hidden="true" className="size-8 text-primary" />
      </span>
      <h2 className="font-heading text-2xl font-bold tracking-tight">{title}</h2>
      <p className="max-w-md text-muted-foreground">{message}</p>
    </div>
  );
}
