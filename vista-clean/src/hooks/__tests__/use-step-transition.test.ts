// Feature: devis-questionnaire
// Test de réduction des animations pour `useStepTransition` (Task 8.4).
//
// L'utilisateur préfère les animations réduites (`prefers-reduced-motion:
// reduce`). On simule ce contexte en mockant GSAP : `gsap.matchMedia` invoque
// synchroniquement le handler `reduceMotion`, et `gsap.fromTo` est un spy. On
// vérifie que le hook rend un `containerRef`, ne lève pas d'exception, et que la
// transition est effectivement instantanée (durée 0) tout en restant
// fonctionnelle.
//
// Requirements: 14.3

import { createElement } from "react";
import type { RefObject } from "react";
import { render } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { useStepTransition } from "../use-step-transition";

// Mock de GSAP : `matchMedia().add()` exécute immédiatement le handler avec la
// condition `reduceMotion` active, et `fromTo` est un espion inspectable.
vi.mock("gsap", () => {
  const fromTo = vi.fn();
  const revert = vi.fn();
  const add = vi.fn(
    (
      _queries: Record<string, string>,
      callback: (context: {
        conditions: { reduceMotion: boolean; fullMotion: boolean };
      }) => void,
    ) => {
      // Simule `prefers-reduced-motion: reduce`.
      callback({ conditions: { reduceMotion: true, fullMotion: false } });
    },
  );
  const matchMedia = vi.fn(() => ({ add, revert }));
  const gsap = { matchMedia, fromTo };
  return { gsap, default: gsap };
});

// Récupère les spies mockés pour les assertions.
import { gsap } from "gsap";

/**
 * Composant de test minimal : attache le `containerRef` du hook à un élément du
 * DOM afin que l'effet d'animation s'exécute (l'effet court-circuite si le ref
 * est nul).
 */
function StepHarness({ activeIndex }: { activeIndex: number }) {
  const { containerRef } = useStepTransition(activeIndex) as {
    containerRef: RefObject<HTMLDivElement | null>;
  };
  return createElement(
    "div",
    { ref: containerRef, "data-testid": "step" },
    "contenu de l'étape",
  );
}

beforeAll(() => {
  // Renseigne `window.matchMedia` pour signaler `prefers-reduced-motion: reduce`.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useStepTransition (prefers-reduced-motion: reduce)", () => {
  it("rend un containerRef et n'échoue pas au montage", () => {
    expect(() =>
      render(createElement(StepHarness, { activeIndex: 0 })),
    ).not.toThrow();
  });

  it("initialise une transition GSAP via matchMedia", () => {
    render(createElement(StepHarness, { activeIndex: 0 }));

    expect(gsap.matchMedia).toHaveBeenCalled();
    expect(gsap.fromTo).toHaveBeenCalledTimes(1);
  });

  it("rend la transition instantanée (durée 0) en mode réduit tout en restant fonctionnelle", () => {
    const { getByTestId } = render(createElement(StepHarness, { activeIndex: 0 }));

    // Le contenu de l'étape est bien rendu (transition fonctionnelle).
    expect(getByTestId("step")).toBeInTheDocument();

    const [, fromVars, toVars] = (gsap.fromTo as unknown as {
      mock: { calls: Array<[unknown, Record<string, number>, Record<string, number>]> };
    }).mock.calls[0];

    // En mode réduit : élément déjà visible au départ, aucun décalage, durée nulle.
    expect(fromVars.autoAlpha).toBe(1);
    expect(fromVars.y).toBe(0);
    expect(toVars.duration).toBe(0);
    expect(toVars.y).toBe(0);
    expect(toVars.autoAlpha).toBe(1);
  });

  it("rejoue une transition instantanée lors d'un changement d'étape", () => {
    const { rerender } = render(createElement(StepHarness, { activeIndex: 0 }));
    expect(gsap.fromTo).toHaveBeenCalledTimes(1);

    rerender(createElement(StepHarness, { activeIndex: 1 }));

    // Une nouvelle transition est déclenchée pour la nouvelle étape.
    expect(gsap.fromTo).toHaveBeenCalledTimes(2);
    const lastCall = (gsap.fromTo as unknown as {
      mock: { calls: Array<[unknown, Record<string, number>, Record<string, number>]> };
    }).mock.calls[1];
    expect(lastCall[2].duration).toBe(0);
  });
});
