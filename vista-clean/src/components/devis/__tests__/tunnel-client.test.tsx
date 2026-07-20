// Feature: devis-questionnaire
// Tests d'intégration du Tunnel complet via `TunnelClient` (Tasks 12.3 & 12.4).
//
// Ces tests exercent le composant racine `TunnelClient` câblé au vrai hook
// `useTunnel` (couche logique pure incluse). Ils couvrent :
//  - Task 12.3 : flux de réservation — succès (confirmation + persistance
//    effacée) et échec (message d'erreur + État_Tunnel conservé).
//  - Task 12.4 : accessibilité de bout en bout — navigation clavier, attributs
//    `aria-current` / région `aria-live`, étiquettes accessibles des contrôles.
//
// GSAP est mocké pour que `useStepTransition` ne touche aucune API d'animation
// réelle sous jsdom ; `window.matchMedia` est également stubé.
//
// Requirements: 8.8, 8.9, 8.10, 12.4, 16.1, 16.2, 16.4, 16.5

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { STORAGE_KEY, serialize } from "@/lib/devis/persistence";
import type { TunnelState } from "@/lib/devis/types";

// ─────────────────────────────────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────────────────────────────────

// Permet de surcharger `submitReservation` par test SANS re-implémenter le hook.
// Par défaut (`override === null`), le vrai `submitReservation` est utilisé, ce
// qui exerce le vrai flux (paiement stub → succès → effacement de la
// persistance). Pour le chemin d'échec, on injecte une implémentation qui
// rejette afin de déclencher la branche d'erreur de `TunnelClient`.
const submitState = vi.hoisted(() => ({
  override: null as null | (() => Promise<void>),
}));

vi.mock("@/hooks/use-tunnel", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/hooks/use-tunnel")>();
  return {
    ...actual,
    useTunnel: () => {
      const real = actual.useTunnel();
      return submitState.override
        ? { ...real, submitReservation: submitState.override }
        : real;
    },
  };
});

// GSAP : mock minimal. `useStepTransition` appelle `gsap.matchMedia()` puis
// `mm.add(...)`. On neutralise l'animation (aucun style réel manipulé).
vi.mock("gsap", () => {
  const mm = { add: vi.fn(), revert: vi.fn() };
  const gsap = {
    matchMedia: vi.fn(() => mm),
    fromTo: vi.fn(),
    to: vi.fn(),
    set: vi.fn(),
    context: vi.fn(() => ({ revert: vi.fn() })),
    registerPlugin: vi.fn(),
  };
  return { gsap, default: gsap };
});

// Import APRÈS les mocks pour que le composant consomme les versions mockées.
import { TunnelClient } from "@/components/devis/tunnel-client";

// ─────────────────────────────────────────────────────────────────────────
// Fixtures & helpers
// ─────────────────────────────────────────────────────────────────────────

/**
 * État_Tunnel complet et valide en Mode_Prix : toutes les étapes sont
 * satisfaites (support « prix », pack, lieu local, créneau disponible), ce qui
 * rend toutes les étapes accessibles et permet la réservation immédiate.
 * Le créneau correspond à un créneau disponible de la liste d'exemple de
 * `StepPaiement` (`SAMPLE_CRENEAUX`).
 */
const COMPLETE_STATE: TunnelState = {
  support: "citadine",
  pack: "concession",
  options: ["ozone"],
  lieu: {
    type: "local",
    address: "",
    addressValidated: false,
    noElectricity: false,
  },
  creneauId: "2025-06-16-0900",
  devis: { prenom: "", telephone: "", besoin: "" },
};

/** Pré-remplit la persistance pour que le Tunnel s'hydrate prêt à soumettre. */
function seedCompleteState() {
  window.localStorage.setItem(STORAGE_KEY, serialize(COMPLETE_STATE));
}

beforeEach(() => {
  submitState.override = null;
  window.localStorage.clear();

  // Stubs jsdom pour les composants qui pourraient interroger l'environnement.
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Task 12.3 — Flux de réservation
// ─────────────────────────────────────────────────────────────────────────

describe("TunnelClient — flux de réservation (Task 12.3)", () => {
  it("chemin succès : réserve, affiche la confirmation et efface la réservation persistée", async () => {
    const user = userEvent.setup();
    seedCompleteState();

    render(<TunnelClient />);

    // L'état hydraté rend toutes les étapes accessibles : on saute directement à
    // l'étape « Paiement » via la Barre_Progression.
    const paiementStep = screen.getByRole("button", {
      name: /Étape 5 sur 5 : Paiement/,
    });
    await user.click(paiementStep);

    // La dernière étape expose le bouton de réservation.
    const reserveButton = await screen.findByRole("button", {
      name: "Réserver mon lavage",
    });
    await user.click(reserveButton);

    // Confirmation de réservation (Requirement 8.8).
    expect(
      await screen.findByRole("heading", { name: "Réservation confirmée" }),
    ).toBeInTheDocument();

    // La persistance ne contient plus la réservation complétée (Requirement
    // 12.4) : soit la clé est effacée, soit l'état a été réinitialisé (vide).
    await waitFor(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        expect(stored).toBeNull();
      } else {
        const parsed = JSON.parse(stored) as TunnelState;
        expect(parsed.support).toBeNull();
        expect(parsed.creneauId).toBeNull();
      }
    });
  });

  it("chemin échec : affiche un message d'erreur et conserve l'État_Tunnel", async () => {
    const user = userEvent.setup();
    seedCompleteState();

    // Le prestataire de paiement échoue : `submitReservation` rejette.
    submitState.override = () => Promise.reject(new Error("payment failed"));

    render(<TunnelClient />);

    const paiementStep = screen.getByRole("button", {
      name: /Étape 5 sur 5 : Paiement/,
    });
    await user.click(paiementStep);

    const reserveButton = await screen.findByRole("button", {
      name: "Réserver mon lavage",
    });
    await user.click(reserveButton);

    // Message d'erreur affiché (Requirements 8.9, 8.10).
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/n'a pas pu être initialisé/i);

    // L'État_Tunnel saisi est conservé pour permettre une nouvelle tentative
    // (Requirement 8.9) : la persistance est intacte.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string)).toEqual(COMPLETE_STATE);

    // Aucune confirmation de réservation n'est affichée.
    expect(
      screen.queryByRole("heading", { name: "Réservation confirmée" }),
    ).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Task 12.4 — Accessibilité du Tunnel
// ─────────────────────────────────────────────────────────────────────────

describe("TunnelClient — accessibilité (Task 12.4)", () => {
  it("expose aria-current sur l'étape active et une région aria-live annonçant l'étape", () => {
    render(<TunnelClient />);

    // L'étape active (Étape 1) porte aria-current="step" (Requirement 16.4).
    const activeStep = screen.getByRole("button", {
      name: /Étape 1 sur 5 : Lavage/,
    });
    expect(activeStep).toHaveAttribute("aria-current", "step");

    // Région live annonçant l'étape courante (Requirement 16.4).
    const liveRegion = screen.getByText("Étape 1 sur 5 : Lavage");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("tous les contrôles interactifs ont des étiquettes accessibles", () => {
    render(<TunnelClient />);

    // Les cartes de support sont des radios nommés (Requirements 16.2, 16.5).
    expect(
      screen.getByRole("radio", { name: "Citadine" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "SUV" }),
    ).toBeInTheDocument();

    // Le radiogroup est étiqueté par le titre de l'étape.
    expect(
      screen.getByRole("radiogroup", {
        name: /Que souhaitez-vous faire nettoyer/i,
      }),
    ).toBeInTheDocument();

    // Le bouton d'avancement porte un nom accessible.
    expect(
      screen.getByRole("button", { name: "Continuer" }),
    ).toBeInTheDocument();

    // Aucune commande interactive sans nom accessible : chaque bouton a un nom.
    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAccessibleName();
    }
  });

  it("permet la navigation clavier de bout en bout (sélection puis avance)", async () => {
    const user = userEvent.setup();
    render(<TunnelClient />);

    // Sélection d'un support au clavier (focus + activation via Entrée).
    const citadine = screen.getByRole("radio", { name: "Citadine" });
    citadine.focus();
    expect(citadine).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(citadine).toHaveAttribute("aria-checked", "true");

    // Avance à l'étape suivante au clavier via « Continuer ».
    const continueButton = screen.getByRole("button", { name: "Continuer" });
    continueButton.focus();
    expect(continueButton).toHaveFocus();
    await user.keyboard("{Enter}");

    // L'Étape 2 (Pack) est désormais active et rendue.
    expect(
      await screen.findByRole("radio", { name: "CONFORT" }),
    ).toBeInTheDocument();

    const step2 = screen.getByRole("button", {
      name: /Étape 2 sur 5 : Pack/,
    });
    expect(step2).toHaveAttribute("aria-current", "step");

    // Le contrôle « Retour » devient disponible et est opérable au clavier.
    const backButton = screen.getByRole("button", { name: "Retour" });
    backButton.focus();
    await user.keyboard("{Enter}");

    // Retour à l'Étape 1 (Lavage) : le radiogroup des supports réapparaît.
    expect(
      await within(
        screen.getByRole("radiogroup", {
          name: /Que souhaitez-vous faire nettoyer/i,
        }),
      ).findByRole("radio", { name: "Citadine" }),
    ).toBeInTheDocument();
  });
});
