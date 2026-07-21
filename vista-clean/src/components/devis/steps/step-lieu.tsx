"use client";

// Feature: devis-questionnaire
// StepLieu — Étape 4 (Lieu) du Tunnel.
// Propose deux choix de lieu accessibles (role="radiogroup") : « Dans mon local »
// (Frais_Déplacement = 0 €) et « À domicile ». En domicile, révèle un champ
// d'adresse, un bouton « Valider l'adresse » (validé uniquement si l'adresse
// est renseignée, sinon message d'erreur en français), l'avertissement relatif
// au groupe électrogène, et une case « Pas de point d'électricité »
// (Supplément_Groupe_Électrogène de 5 €).
//
// Ce composant lit et écrit exclusivement l'objet imbriqué `lieu` de
// l'`État_Tunnel` via react-hook-form ; le recalcul du prix et le blocage de
// l'avancement (adresse non validée) sont assurés par la couche logique pure.
//
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 13.3

import { useId, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { AlertTriangle, Building2, Check, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LieuType, TunnelState } from "@/lib/devis/types";
import { cn } from "@/lib/utils";

interface StepLieuProps {
  form: UseFormReturn<TunnelState>;
}

/** Avertissement affiché en « À domicile » (Requirement 7.5, texte exact). */
const WARNING_GROUPE_ELECTROGENE =
  "Supplément de 5 € pour le groupe électrogène si pas de point d'électricité";

/** Message d'erreur en cas de validation d'une adresse vide (Requirements 7.7, 13.3). */
const ADDRESS_REQUIRED_MESSAGE = "Veuillez saisir une adresse valide.";

interface LieuChoice {
  type: LieuType;
  label: string;
  description: string;
  icon: typeof Building2;
}

const LIEU_CHOICES: LieuChoice[] = [
  {
    type: "local",
    label: "Dans mon local",
    description: "Vitry-sur-Seine 94400",
    icon: Building2,
  },
  {
    type: "domicile",
    label: "À domicile",
    description: "Nous nous déplaçons chez vous",
    icon: Home,
  },
];

function StepLieu({ form }: StepLieuProps) {
  const lieu = form.watch("lieu");
  const addressFieldId = useId();
  const addressErrorId = useId();

  // Message d'erreur local affiché lorsqu'on valide une adresse vide.
  const [addressError, setAddressError] = useState<string | null>(null);

  const selectType = (type: LieuType) => {
    form.setValue("lieu.type", type, { shouldDirty: true });

    if (type === "local") {
      // « Dans mon local » : Frais_Déplacement = 0 €. On réinitialise les champs
      // liés au domicile pour éviter tout état incohérent (Requirement 7.2).
      form.setValue("lieu.address", "", { shouldDirty: true });
      form.setValue("lieu.addressValidated", false, { shouldDirty: true });
      form.setValue("lieu.noElectricity", false, { shouldDirty: true });
      setAddressError(null);
    }
  };

  const handleAddressChange = (value: string) => {
    form.setValue("lieu.address", value, { shouldDirty: true });
    // Toute modification de l'adresse après validation invalide la validation
    // précédente (l'adresse doit être revalidée).
    if (lieu.addressValidated) {
      form.setValue("lieu.addressValidated", false, { shouldDirty: true });
    }
    if (addressError) {
      setAddressError(null);
    }
  };

  const validateAddress = () => {
    const current = form.getValues("lieu.address");
    if (current.trim().length === 0) {
      // Adresse vide : on empêche la validation et on affiche un message en
      // français (Requirements 7.7, 13.3).
      form.setValue("lieu.addressValidated", false, { shouldDirty: true });
      setAddressError(ADDRESS_REQUIRED_MESSAGE);
      return;
    }
    if (current.length > 300) {
      form.setValue("lieu.addressValidated", false, { shouldDirty: true });
      setAddressError("L'adresse est trop longue.");
      return;
    }
    // Adresse renseignée : on valide, ce qui déclenche le calcul des
    // Frais_Déplacement dans la couche logique (Requirement 7.4).
    form.setValue("lieu.addressValidated", true, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setAddressError(null);
  };

  const isDomicile = lieu.type === "domicile";

  return (
    <div data-slot="step-lieu" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-tight">Lieu de la prestation</h2>
        <p className="text-sm text-muted-foreground">
          Choisissez où vous souhaitez que le nettoyage soit réalisé.
        </p>
      </div>

      {/* Choix du lieu — groupe de boutons radio accessibles. */}
      <div
        role="radiogroup"
        aria-label="Lieu de la prestation"
        className="grid gap-3 sm:grid-cols-2"
      >
        {LIEU_CHOICES.map((choice) => {
          const selected = lieu.type === choice.type;
          const Icon = choice.icon;

          return (
            <button
              key={choice.type}
              type="button"
              role="radio"
              aria-checked={selected}
              data-selected={selected}
              onClick={() => selectType(choice.type)}
              className={cn(
                // Cible tactile ≥ 44×44 px, mobile-first.
                "group relative flex min-h-11 w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all outline-none select-none",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                !selected && "border-border hover:border-primary/40 hover:bg-muted/50",
                selected &&
                  "border-primary bg-primary/5 text-foreground shadow-md shadow-primary/10",
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn(
                  "size-6 shrink-0 transition-colors",
                  selected
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium leading-snug">{choice.label}</span>
                <span className="text-xs text-muted-foreground">{choice.description}</span>
              </span>

              {/* Indicateur de sélection non chromatique : icône Check. */}
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity",
                  selected ? "opacity-100" : "opacity-0",
                )}
              >
                <Check className="size-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Section « À domicile » : adresse, validation, avertissement, électricité. */}
      {isDomicile ? (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex flex-col gap-2">
            <label htmlFor={addressFieldId} className="text-sm font-medium">
              Adresse de la prestation
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id={addressFieldId}
                type="text"
                inputMode="text"
                maxLength={300}
                autoComplete="street-address"
                value={lieu.address}
                onChange={(event) => handleAddressChange(event.target.value)}
                aria-invalid={addressError !== null}
                aria-describedby={addressError !== null ? addressErrorId : undefined}
                placeholder="12 rue de la Paix, 94400 Vitry-sur-Seine"
                className={cn(
                  // Champ mobile-first, hauteur ≥ 44 px, focus visible.
                  "h-11 flex-1 rounded-lg border bg-background px-3 text-sm text-foreground transition-all outline-none",
                  "placeholder:text-muted-foreground",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                  addressError !== null
                    ? "border-destructive ring-3 ring-destructive/20"
                    : "border-border",
                )}
              />

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={validateAddress}
                className="h-11 shrink-0"
              >
                Valider l&apos;adresse
              </Button>
            </div>

            {/* Message d'erreur (français) — adresse manquante. */}
            {addressError !== null ? (
              <p id={addressErrorId} role="alert" className="text-sm text-destructive">
                {addressError}
              </p>
            ) : null}

            {/* Confirmation visuelle non chromatique de la validation. */}
            {lieu.addressValidated ? (
              <p className="flex items-center gap-1.5 text-sm text-primary">
                <Check aria-hidden="true" className="size-4" />
                Adresse validée
              </p>
            ) : null}
          </div>

          {/* Avertissement groupe électrogène (texte exact, Requirement 7.5). */}
          <p className="flex items-start gap-2 rounded-lg border border-border bg-background/60 p-3 text-sm text-muted-foreground">
            <AlertTriangle
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <span>{WARNING_GROUPE_ELECTROGENE}</span>
          </p>

          {/* Case « Pas de point d'électricité » (Supplément 5 €, Requirement 7.6). */}
          <button
            type="button"
            role="checkbox"
            aria-checked={lieu.noElectricity}
            data-state={lieu.noElectricity ? "checked" : "unchecked"}
            onClick={() =>
              form.setValue("lieu.noElectricity", !lieu.noElectricity, {
                shouldDirty: true,
              })
            }
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all outline-none select-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "hover:bg-muted/50",
              lieu.noElectricity
                ? "border-primary bg-primary/5"
                : "border-border bg-transparent",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-[min(var(--radius-sm),6px)] border transition-colors",
                lieu.noElectricity
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-transparent",
              )}
            >
              {lieu.noElectricity ? <Check className="size-3.5" /> : null}
            </span>
            <span className="flex-1 font-medium">Pas de point d&apos;électricité</span>
            <span className="shrink-0 text-muted-foreground tabular-nums">+5 €</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export { StepLieu };
export type { StepLieuProps };
