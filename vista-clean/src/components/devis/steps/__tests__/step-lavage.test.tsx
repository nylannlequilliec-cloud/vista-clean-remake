// Feature: devis-questionnaire
// Tests de composant — StepLavage (Task 10.7).
//
// Vérifie le rendu du groupe radio de Supports, la sélection unique reflétée
// dans l'`État_Tunnel` (aria-checked + valeur du champ `support`), et la
// présence de l'aide au choix du véhicule (`VehicleHelp`).
//
// Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 15.1

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StepLavage } from "../step-lavage";
import { SUPPORTS } from "@/lib/devis/pricing";
import { FormHarness, type FormRef } from "./harness";

function makeFormRef(): FormRef {
  return { current: null };
}

describe("StepLavage", () => {
  it("rend un groupe radio contenant une carte par Support", () => {
    render(<FormHarness>{(form) => <StepLavage form={form} />}</FormHarness>);

    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(SUPPORTS.length);
  });

  it("sélectionne un Support au clic : aria-checked + valeur dans l'État_Tunnel", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepLavage form={form} />}
      </FormHarness>,
    );

    const citadine = screen.getByRole("radio", { name: /Citadine/i });
    expect(citadine).toHaveAttribute("aria-checked", "false");

    await user.click(citadine);

    expect(citadine).toHaveAttribute("aria-checked", "true");
    expect(formRef.current?.getValues().support).toBe("citadine");
  });

  it("applique la sélection unique : sélectionner un autre Support remplace le précédent", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepLavage form={form} />}
      </FormHarness>,
    );

    const citadine = screen.getByRole("radio", { name: /Citadine/i });
    const suv = screen.getByRole("radio", { name: /^SUV$/i });

    await user.click(citadine);
    await user.click(suv);

    expect(formRef.current?.getValues().support).toBe("suv");
    expect(citadine).toHaveAttribute("aria-checked", "false");
    expect(suv).toHaveAttribute("aria-checked", "true");
  });

  it("affiche l'aide au choix du véhicule (VehicleHelp)", () => {
    render(<FormHarness>{(form) => <StepLavage form={form} />}</FormHarness>);

    expect(
      screen.getByText(/Un doute sur ton type de véhicule\s*\?\s*regarde ici/i),
    ).toBeInTheDocument();
  });
});
