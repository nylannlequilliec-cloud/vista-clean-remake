// Feature: devis-questionnaire
// Tests de composant — StepPaiement (Task 10.7).
//
// Vérifie qu'un créneau complet est non sélectionnable et porte la mention
// « Complet », que la sélection d'un créneau disponible met à jour `creneauId`,
// que le récapitulatif affiche Prix total et Acompte, et que la FAQ contient les
// deux questions attendues.
//
// Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7, 8.11

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StepPaiement } from "../step-paiement";
import { computeTotal } from "@/lib/devis/calculations";
import { INITIAL_TUNNEL_STATE } from "@/hooks/use-tunnel";
import type { Creneau } from "@/lib/devis/types";
import { FormHarness, type FormRef } from "./harness";

function makeFormRef(): FormRef {
  return { current: null };
}

// Détail de tarification déterministe (pack CONFORT → total 99 €, acompte 15 %).
const PRICING = computeTotal({ ...INITIAL_TUNNEL_STATE, pack: "confort" });

// Jeu de créneaux contrôlé : un disponible, un complet.
const CRENEAUX: Creneau[] = [
  { id: "2025-06-16-0900", date: "2025-06-16", startLabel: "09h00", full: false },
  { id: "2025-06-16-1100", date: "2025-06-16", startLabel: "11h00", full: true },
];

describe("StepPaiement", () => {
  it("rend un créneau complet non sélectionnable avec la mention « Complet »", () => {
    render(
      <FormHarness>
        {(form) => (
          <StepPaiement form={form} pricing={PRICING} creneaux={CRENEAUX} />
        )}
      </FormHarness>,
    );

    const full = screen.getByRole("radio", { name: /11h00/i });
    expect(full).toBeDisabled();
    expect(full).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Complet")).toBeInTheDocument();
  });

  it("sélectionne un créneau disponible : creneauId mis à jour dans l'État_Tunnel", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => (
          <StepPaiement form={form} pricing={PRICING} creneaux={CRENEAUX} />
        )}
      </FormHarness>,
    );

    const available = screen.getByRole("radio", { name: /09h00/i });
    await user.click(available);

    expect(available).toHaveAttribute("aria-checked", "true");
    expect(formRef.current?.getValues().creneauId).toBe("2025-06-16-0900");
  });

  it("ne sélectionne pas un créneau complet (creneauId inchangé)", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => (
          <StepPaiement form={form} pricing={PRICING} creneaux={CRENEAUX} />
        )}
      </FormHarness>,
    );

    await user.click(screen.getByRole("radio", { name: /11h00/i }));

    expect(formRef.current?.getValues().creneauId).toBeNull();
  });

  it("affiche le récapitulatif Prix total et Acompte", () => {
    render(
      <FormHarness>
        {(form) => (
          <StepPaiement form={form} pricing={PRICING} creneaux={CRENEAUX} />
        )}
      </FormHarness>,
    );

    expect(screen.getByText(/Prix total/i)).toBeInTheDocument();
    expect(screen.getByText(/Acompte \(15\s*%\)/i)).toBeInTheDocument();
  });

  it("affiche la FAQ avec les deux questions attendues", () => {
    render(
      <FormHarness>
        {(form) => (
          <StepPaiement form={form} pricing={PRICING} creneaux={CRENEAUX} />
        )}
      </FormHarness>,
    );

    expect(screen.getByText(/Pourquoi un acompte\s*\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Que se passe-t-il après le paiement\s*\?/i),
    ).toBeInTheDocument();
  });
});
