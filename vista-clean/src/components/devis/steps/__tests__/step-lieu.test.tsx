// Feature: devis-questionnaire
// Tests de composant — StepLieu (Task 10.7).
//
// Vérifie la révélation du champ d'adresse en « À domicile », le message
// d'erreur français lors de la validation d'une adresse vide, l'avertissement
// exact relatif au groupe électrogène, et le basculement de la case « Pas de
// point d'électricité ».
//
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 13.3, 13.4

import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StepLieu } from "../step-lieu";
import { FormHarness, type FormRef } from "./harness";

const WARNING_GROUPE_ELECTROGENE =
  "Supplément de 5 € pour le groupe électrogène si pas de point d'électricité";
const ADDRESS_REQUIRED_MESSAGE = "Veuillez saisir une adresse valide.";

function makeFormRef(): FormRef {
  return { current: null };
}

describe("StepLieu", () => {
  it("ne montre pas le champ d'adresse tant que « À domicile » n'est pas choisi", () => {
    render(<FormHarness>{(form) => <StepLieu form={form} />}</FormHarness>);

    expect(
      screen.queryByLabelText(/Adresse de la prestation/i),
    ).not.toBeInTheDocument();
  });

  it("révèle le champ d'adresse et l'avertissement en sélectionnant « À domicile »", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepLieu form={form} />}
      </FormHarness>,
    );

    await user.click(screen.getByRole("radio", { name: /À domicile/i }));

    expect(formRef.current?.getValues().lieu.type).toBe("domicile");
    expect(
      screen.getByLabelText(/Adresse de la prestation/i),
    ).toBeInTheDocument();
    // Avertissement groupe électrogène (texte exact).
    expect(screen.getByText(WARNING_GROUPE_ELECTROGENE)).toBeInTheDocument();
  });

  it("affiche l'erreur française lorsqu'on valide une adresse vide", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepLieu form={form} />}
      </FormHarness>,
    );

    await user.click(screen.getByRole("radio", { name: /À domicile/i }));
    await user.click(screen.getByRole("button", { name: /Valider l'adresse/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      ADDRESS_REQUIRED_MESSAGE,
    );
    expect(formRef.current?.getValues().lieu.addressValidated).toBe(false);
  });

  it("valide une adresse renseignée (addressValidated passe à true, sans erreur)", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepLieu form={form} />}
      </FormHarness>,
    );

    await user.click(screen.getByRole("radio", { name: /À domicile/i }));
    await user.type(
      screen.getByLabelText(/Adresse de la prestation/i),
      "12 rue de la Paix, 94400 Vitry-sur-Seine",
    );
    await user.click(screen.getByRole("button", { name: /Valider l'adresse/i }));

    expect(formRef.current?.getValues().lieu.addressValidated).toBe(true);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("bascule la case « Pas de point d'électricité »", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepLieu form={form} />}
      </FormHarness>,
    );

    await user.click(screen.getByRole("radio", { name: /À domicile/i }));

    const noElec = screen.getByRole("checkbox", {
      name: /Pas de point d'électricité/i,
    });
    expect(noElec).toHaveAttribute("aria-checked", "false");

    await user.click(noElec);
    expect(noElec).toHaveAttribute("aria-checked", "true");
    expect(formRef.current?.getValues().lieu.noElectricity).toBe(true);
  });

  it("« Dans mon local » ne révèle ni adresse ni avertissement", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepLieu form={form} />}
      </FormHarness>,
    );

    await user.click(screen.getByRole("radio", { name: /Dans mon local/i }));

    expect(formRef.current?.getValues().lieu.type).toBe("local");
    expect(
      screen.queryByLabelText(/Adresse de la prestation/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(WARNING_GROUPE_ELECTROGENE),
    ).not.toBeInTheDocument();
  });

  it("affiche l'erreur de longueur si l'adresse dépasse 250 caractères", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepLieu form={form} />}
      </FormHarness>,
    );

    await user.click(screen.getByRole("radio", { name: /À domicile/i }));

    // Bypasse le maxLength HTML en modifiant l'état directement
    act(() => {
      formRef.current?.setValue("lieu.address", "A".repeat(251));
    });
    await user.click(screen.getByRole("button", { name: /Valider l'adresse/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "L'adresse ne doit pas dépasser 250 caractères.",
    );
    expect(formRef.current?.getValues().lieu.addressValidated).toBe(false);
  });
});
