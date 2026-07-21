"use client";

// Feature: devis-questionnaire
// DevisRequestForm — formulaire affiché en `Mode_Devis`.
//
// Lorsque le Support sélectionné relève du mode « devis » (utilitaire,
// tapis-matelas-autre, demande-specifique), le Tunnel ne présente ni packs, ni
// prix, ni acompte : la tarification est « sur devis ». Ce composant collecte
// les informations nécessaires à une demande de devis — prénom, téléphone
// (numéro français validé) et description du besoin — puis, sur saisie valide,
// délègue l'envoi effectif au parent via `onSubmit`.
//
// Il lit et écrit exclusivement l'objet imbriqué `devis` de l'`État_Tunnel`
// via react-hook-form. La validation réutilise `devisSchema` (couche logique
// pure) ; tous les messages d'erreur sont en français.
//
// Requirements: 4.3, 4.4, 9.5, 13.1, 13.2, 13.5

import { useId, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { devisSchema } from "@/lib/devis/schema";
import type { TunnelState } from "@/lib/devis/types";
import { cn } from "@/lib/utils";

interface DevisRequestFormProps {
  form: UseFormReturn<TunnelState>;
  /** Appelé uniquement lorsque la saisie est valide (l'envoi réel est géré par le parent). */
  onSubmit?: () => void;
}

/** Erreurs de validation locales, par champ du sous-objet `devis`. */
interface DevisErrors {
  prenom?: string;
  telephone?: string;
  besoin?: string;
}

function DevisRequestForm({ form, onSubmit }: DevisRequestFormProps) {
  const devis = form.watch("devis");

  const prenomId = useId();
  const telephoneId = useId();
  const besoinId = useId();
  const prenomErrorId = useId();
  const telephoneErrorId = useId();
  const besoinErrorId = useId();

  const [errors, setErrors] = useState<DevisErrors>({});

  const clearError = (field: keyof DevisErrors) => {
    setErrors((current) => {
      if (current[field] === undefined) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = () => {
    // Validation via la couche logique pure (devisSchema, messages français).
    const result = devisSchema.safeParse(form.getValues("devis"));

    if (!result.success) {
      const nextErrors: DevisErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          (field === "prenom" || field === "telephone" || field === "besoin") &&
          nextErrors[field] === undefined
        ) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit?.();
  };

  return (
    <form
      data-slot="devis-request-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Demande de devis</h2>
        {/* Explique que la tarification est « sur devis » (Requirements 4.4, 9.5). */}
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Pour ce type de prestation, la tarification se fait{" "}
            <span className="font-medium text-foreground">sur devis</span> : aucun prix
            ni acompte automatique. Laissez-nous vos coordonnées et décrivez votre besoin,
            nous vous recontactons rapidement.
          </span>
        </p>
      </div>

      {/* Prénom (requis). */}
      <div className="flex flex-col gap-2">
        <label htmlFor={prenomId} className="text-sm font-medium">
          Prénom <span className="text-destructive">*</span>
          <span className="sr-only">(requis)</span>
        </label>
        <input
          id={prenomId}
          type="text"
          maxLength={100}
          autoComplete="given-name"
          value={devis.prenom}
          onChange={(event) => {
            form.setValue("devis.prenom", event.target.value, { shouldDirty: true });
            clearError("prenom");
          }}
          aria-required="true"
          aria-invalid={errors.prenom !== undefined}
          aria-describedby={errors.prenom !== undefined ? prenomErrorId : undefined}
          placeholder="Votre prénom"
          className={cn(
            "h-11 rounded-lg border bg-background px-3 text-sm text-foreground transition-all outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            errors.prenom !== undefined
              ? "border-destructive ring-3 ring-destructive/20"
              : "border-border",
          )}
        />
        {errors.prenom !== undefined ? (
          <p id={prenomErrorId} role="alert" className="text-sm text-destructive">
            {errors.prenom}
          </p>
        ) : null}
      </div>

      {/* Téléphone (requis, numéro français validé). */}
      <div className="flex flex-col gap-2">
        <label htmlFor={telephoneId} className="text-sm font-medium">
          Téléphone <span className="text-destructive">*</span>
          <span className="sr-only">(requis)</span>
        </label>
        <input
          id={telephoneId}
          type="tel"
          inputMode="tel"
          maxLength={30}
          autoComplete="tel"
          value={devis.telephone}
          onChange={(event) => {
            form.setValue("devis.telephone", event.target.value, { shouldDirty: true });
            clearError("telephone");
          }}
          aria-required="true"
          aria-invalid={errors.telephone !== undefined}
          aria-describedby={errors.telephone !== undefined ? telephoneErrorId : undefined}
          placeholder="06 12 34 56 78"
          className={cn(
            "h-11 rounded-lg border bg-background px-3 text-sm text-foreground transition-all outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            errors.telephone !== undefined
              ? "border-destructive ring-3 ring-destructive/20"
              : "border-border",
          )}
        />
        {errors.telephone !== undefined ? (
          <p id={telephoneErrorId} role="alert" className="text-sm text-destructive">
            {errors.telephone}
          </p>
        ) : null}
      </div>

      {/* Description du besoin (requis). */}
      <div className="flex flex-col gap-2">
        <label htmlFor={besoinId} className="text-sm font-medium">
          Description du besoin <span className="text-destructive">*</span>
          <span className="sr-only">(requis)</span>
        </label>
        <textarea
          id={besoinId}
          rows={5}
          maxLength={2000}
          value={devis.besoin}
          onChange={(event) => {
            form.setValue("devis.besoin", event.target.value, { shouldDirty: true });
            clearError("besoin");
          }}
          aria-required="true"
          aria-invalid={errors.besoin !== undefined}
          aria-describedby={errors.besoin !== undefined ? besoinErrorId : undefined}
          placeholder="Décrivez ce que vous souhaitez faire nettoyer (type de support, état, dimensions, contexte…)."
          className={cn(
            "min-h-28 resize-y rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition-all outline-none",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            errors.besoin !== undefined
              ? "border-destructive ring-3 ring-destructive/20"
              : "border-border",
          )}
        />
        {errors.besoin !== undefined ? (
          <p id={besoinErrorId} role="alert" className="text-sm text-destructive">
            {errors.besoin}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="h-11 w-full sm:w-auto sm:self-end">
        Envoyer ma demande de devis
      </Button>
    </form>
  );
}

export { DevisRequestForm };
export type { DevisRequestFormProps };
