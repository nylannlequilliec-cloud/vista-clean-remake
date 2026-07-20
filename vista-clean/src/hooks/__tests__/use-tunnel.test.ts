// Feature: devis-questionnaire
// Tests unitaires du hook d'orchestration `useTunnel` (Task 8.2).
//
// Ces tests câblent le hook à la couche logique pure et vérifient son
// comportement observable : état initial, avancement gouverné par la
// validation d'étape, hydratation/persistance via localStorage, réinitialisation
// après une réservation réussie, et réconciliation sur changement de support.
//
// Requirements: 1.2, 12.2, 12.4, 4.6

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { INITIAL_TUNNEL_STATE, useTunnel } from "../use-tunnel";
import { STORAGE_KEY, serialize } from "../../lib/devis/persistence";
import type { TunnelState } from "../../lib/devis/types";

/**
 * Construit un `TunnelState` valide en partant de l'état initial, en
 * surchargeant les champs fournis.
 */
function makeState(overrides: Partial<TunnelState>): TunnelState {
  return { ...INITIAL_TUNNEL_STATE, ...overrides };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("useTunnel", () => {
  it("démarre sur l'Étape 1 (activeIndex 0) avec un état initial vide et le Mode_Prix", () => {
    const { result } = renderHook(() => useTunnel());

    expect(result.current.activeIndex).toBe(0);
    expect(result.current.mode).toBe("prix");
    expect(result.current.form.getValues().support).toBeNull();
    expect(result.current.form.getValues().pack).toBeNull();
    expect(result.current.form.getValues().options).toEqual([]);
  });

  it("bloque l'avancement quand l'étape active est invalide (goNext n'avance pas)", async () => {
    const { result } = renderHook(() => useTunnel());

    // Aucun support sélectionné → le sous-schéma de l'étape « lavage » échoue.
    await act(async () => {
      await result.current.goNext();
    });

    expect(result.current.activeIndex).toBe(0);
  });

  it("avance quand l'étape active est valide (goNext progresse d'une étape)", async () => {
    const { result } = renderHook(() => useTunnel());

    act(() => {
      result.current.form.setValue("support", "citadine");
    });

    await act(async () => {
      await result.current.goNext();
    });

    expect(result.current.activeIndex).toBe(1);
  });

  it("hydrate le formulaire depuis un état valide pré-sérialisé dans localStorage", () => {
    const persisted = makeState({ support: "berline" });
    window.localStorage.setItem(STORAGE_KEY, serialize(persisted));

    const { result } = renderHook(() => useTunnel());

    expect(result.current.form.getValues().support).toBe("berline");
    expect(result.current.activeIndex).toBe(0);
  });

  it("réinitialise l'état et efface les données persistées après une réservation réussie", async () => {
    // Pré-remplit un état valide et persiste des données de réservation.
    const persisted = makeState({ support: "citadine", pack: "confort" });
    window.localStorage.setItem(STORAGE_KEY, serialize(persisted));

    const { result } = renderHook(() => useTunnel());

    // Progresse d'une étape pour vérifier le retour à l'Étape 1 après succès.
    await act(async () => {
      await result.current.goNext();
    });
    expect(result.current.activeIndex).toBe(1);

    await act(async () => {
      await result.current.submitReservation();
    });

    // Retour à l'Étape 1 et état ramené à l'initial.
    expect(result.current.activeIndex).toBe(0);
    expect(result.current.form.getValues().support).toBeNull();
    expect(result.current.form.getValues().pack).toBeNull();
    expect(result.current.form.getValues().options).toEqual([]);

    // La persistance ne contient plus les données de réservation antérieures.
    const rawAfter = window.localStorage.getItem(STORAGE_KEY);
    if (rawAfter !== null) {
      const parsed = JSON.parse(rawAfter) as TunnelState;
      expect(parsed.support).toBeNull();
      expect(parsed.pack).toBeNull();
    }
  });

  it("réconcilie l'état sur changement de support : passer à un support Mode_Devis vide le pack et les options", () => {
    const { result } = renderHook(() => useTunnel());

    // Parcours Mode_Prix : support standard + pack + options.
    act(() => {
      result.current.form.setValue("support", "citadine");
    });
    act(() => {
      result.current.form.setValue("pack", "confort");
    });
    act(() => {
      result.current.form.setValue("options", ["ozone"]);
    });

    expect(result.current.form.getValues().pack).toBe("confort");
    expect(result.current.form.getValues().options).toEqual(["ozone"]);

    // Bascule vers un support Mode_Devis (utilitaire) → sélections de prix retirées.
    act(() => {
      result.current.form.setValue("support", "utilitaire");
    });

    expect(result.current.mode).toBe("devis");
    expect(result.current.form.getValues().pack).toBeNull();
    expect(result.current.form.getValues().options).toEqual([]);
  });
});
