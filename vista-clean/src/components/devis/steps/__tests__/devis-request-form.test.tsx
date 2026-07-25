// Feature: devis-questionnaire
// Tests de composant — DevisRequestForm (Task 10.7).
//
// Vérifie que la soumission avec des champs vides fait apparaître les erreurs
// requises en français, qu'un numéro de téléphone invalide déclenche l'erreur
// dédiée, et qu'une saisie valide appelle `onSubmit`.
//
// Requirements: 4.3, 4.4, 9.5, 13.1, 13.2, 13.5

import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DevisRequestForm } from "../../devis-request-form";
import { FormHarness, type FormRef } from "./harness";

function makeFormRef(): FormRef {
  return { current: null };
}

describe("DevisRequestForm", () => {
  it("affiche les erreurs françaises requises lors d'une soumission vide", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <FormHarness>
        {(form) => <DevisRequestForm form={form} onSubmit={onSubmit} />}
      </FormHarness>,
    );

    await user.click(
      screen.getByRole("button", { name: /Envoyer ma demande de devis/i }),
    );

    expect(screen.getByText(/le prénom est requis/i)).toBeInTheDocument();
    expect(
      screen.getByText(/numéro de téléphone français invalide/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/la description du besoin est requise/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("affiche l'erreur de téléphone pour un numéro invalide", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <FormHarness>
        {(form) => <DevisRequestForm form={form} onSubmit={onSubmit} />}
      </FormHarness>,
    );

    await user.type(screen.getByLabelText(/Prénom/i), "Jean");
    await user.type(screen.getByLabelText(/Téléphone/i), "123");
    await user.type(
      screen.getByLabelText(/Description du besoin/i),
      "Nettoyage complet",
    );

    await user.click(
      screen.getByRole("button", { name: /Envoyer ma demande de devis/i }),
    );

    expect(
      screen.getByText(/numéro de téléphone français invalide/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("appelle onSubmit pour une saisie valide", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <FormHarness>
        {(form) => <DevisRequestForm form={form} onSubmit={onSubmit} />}
      </FormHarness>,
    );

    await user.type(screen.getByLabelText(/Prénom/i), "Jean");
    await user.type(screen.getByLabelText(/Téléphone/i), "0612345678");
    await user.type(
      screen.getByLabelText(/Description du besoin/i),
      "Nettoyage complet de mon canapé en U",
    );

    await user.click(
      screen.getByRole("button", { name: /Envoyer ma demande de devis/i }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("affiche des erreurs lorsque les entrées dépassent les limites de longueur", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <DevisRequestForm form={form} onSubmit={onSubmit} />}
      </FormHarness>,
    );

    // Bypasse le maxLength HTML en modifiant l'état directement
    act(() => {
      formRef.current?.setValue("devis.prenom", "A".repeat(51));
      formRef.current?.setValue("devis.telephone", "0" + "1".repeat(30));
      formRef.current?.setValue("devis.besoin", "A".repeat(1001));
    });

    await user.click(
      screen.getByRole("button", { name: /Envoyer ma demande de devis/i }),
    );

    expect(
      screen.getByText(/le prénom ne doit pas dépasser 50 caractères/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/le numéro de téléphone ne doit pas dépasser 30 caractères/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/la description du besoin ne doit pas dépasser 1000 caractères/i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
