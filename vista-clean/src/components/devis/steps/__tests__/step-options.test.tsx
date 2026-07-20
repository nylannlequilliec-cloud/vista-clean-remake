// Feature: devis-questionnaire
// Tests de composant — StepOptions (Task 10.7).
//
// Vérifie le rendu des catégories et de leurs options, le basculement d'une
// option (multi-sélection) reflété dans l'`État_Tunnel`, et le fait que zéro
// option sélectionnée est un état valide (avancement autorisé).
//
// Requirements: 6.1, 6.7, 6.8, 6.9, 6.10, 9.2

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StepOptions } from "../step-options";
import { stepSchemas } from "@/lib/devis/schema";
import { FormHarness, type FormRef } from "./harness";

function makeFormRef(): FormRef {
  return { current: null };
}

describe("StepOptions", () => {
  it("rend les intitulés de catégories et leurs options", () => {
    render(<FormHarness>{(form) => <StepOptions form={form} />}</FormHarness>);

    // Intitulés de catégories.
    expect(
      screen.getByRole("heading", { name: /^Traitement$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Shampoing$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Suppléments$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Options$/i }),
    ).toBeInTheDocument();

    // Quelques options représentatives.
    expect(
      screen.getByRole("checkbox", { name: /Traitement du cuir/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /Ozone/i }),
    ).toBeInTheDocument();
  });

  it("bascule une option : ajout puis retrait reflétés dans l'État_Tunnel", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepOptions form={form} />}
      </FormHarness>,
    );

    const ozone = screen.getByRole("checkbox", { name: /Ozone/i });
    expect(ozone).toHaveAttribute("aria-checked", "false");

    // Ajout.
    await user.click(ozone);
    expect(ozone).toHaveAttribute("aria-checked", "true");
    expect(formRef.current?.getValues().options).toContain("ozone");

    // Retrait (round-trip).
    await user.click(ozone);
    expect(ozone).toHaveAttribute("aria-checked", "false");
    expect(formRef.current?.getValues().options).not.toContain("ozone");
  });

  it("autorise plusieurs options simultanément (multi-sélection)", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepOptions form={form} />}
      </FormHarness>,
    );

    await user.click(screen.getByRole("checkbox", { name: /Ozone/i }));
    // Le nom accessible concatène libellé + prix ; on cible le libellé exact
    // « Coffre » (distinct de « Tapis de coffre » / « Sous coffre ») via son
    // nœud texte, puis on remonte au bouton associé.
    const coffreButton = screen.getByText("Coffre").closest("button");
    expect(coffreButton).not.toBeNull();
    await user.click(coffreButton as HTMLButtonElement);

    const options = formRef.current?.getValues().options ?? [];
    expect(options).toEqual(expect.arrayContaining(["ozone", "coffre"]));
    expect(options).toHaveLength(2);
  });

  it("autorise l'avancement sans aucune option sélectionnée (zéro option valide)", () => {
    render(<FormHarness>{(form) => <StepOptions form={form} />}</FormHarness>);

    // Aucune option cochée au rendu initial.
    for (const checkbox of screen.getAllByRole("checkbox")) {
      expect(checkbox).toHaveAttribute("aria-checked", "false");
    }

    // Le sous-schéma de l'étape « options » valide une sélection vide.
    expect(stepSchemas.options.safeParse({ options: [] }).success).toBe(true);
  });
});
