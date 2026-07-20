// Feature: devis-questionnaire
// Tests de composant — StepPack (Task 10.7).
//
// Vérifie le rendu des deux cartes comparatives (CONFORT / CONCESSION) avec
// prix et badge « POPULAIRE », ainsi que la sélection unique reflétée dans le
// champ `pack` de l'`État_Tunnel`.
//
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StepPack } from "../step-pack";
import { FormHarness, type FormRef } from "./harness";

function makeFormRef(): FormRef {
  return { current: null };
}

describe("StepPack", () => {
  it("rend les packs CONFORT et CONCESSION avec leurs prix", () => {
    render(<FormHarness>{(form) => <StepPack form={form} />}</FormHarness>);

    expect(screen.getByRole("radio", { name: /CONFORT/i })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /CONCESSION/i }),
    ).toBeInTheDocument();

    // Prix formatés (espace insécable possible avant « € » → on cible le nombre).
    expect(screen.getByText(/99,00/)).toBeInTheDocument();
    expect(screen.getByText(/129,00/)).toBeInTheDocument();
  });

  it("affiche le badge « POPULAIRE » sur le pack mis en avant", () => {
    render(<FormHarness>{(form) => <StepPack form={form} />}</FormHarness>);

    expect(screen.getByText("POPULAIRE")).toBeInTheDocument();
  });

  it("sélectionne un pack au clic : aria-checked + valeur dans l'État_Tunnel", async () => {
    const user = userEvent.setup();
    const formRef = makeFormRef();

    render(
      <FormHarness formRef={formRef}>
        {(form) => <StepPack form={form} />}
      </FormHarness>,
    );

    const concession = screen.getByRole("radio", { name: /CONCESSION/i });
    expect(concession).toHaveAttribute("aria-checked", "false");

    await user.click(concession);

    expect(concession).toHaveAttribute("aria-checked", "true");
    expect(formRef.current?.getValues().pack).toBe("concession");
  });
});
