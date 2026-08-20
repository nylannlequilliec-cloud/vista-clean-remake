// Feature: devis-questionnaire
// (Dé)sérialisation persistante de l'État_Tunnel (Requirements 12.1, 12.2, 12.4).
// Fonctions pures de (de)sérialisation + helpers localStorage à dégradation
// gracieuse (mode privé, quota dépassé, SSR où `window` est indéfini).

import { z } from "zod";
import type { SupportId, PackId, LieuType, TunnelState } from "./types";

/**
 * Clé de stockage versionnée. Un changement de forme incompatible doit
 * s'accompagner d'un incrément de version afin que `deserialize` rejette
 * les anciennes données (retour à l'état initial).
 */
export const STORAGE_KEY = "vista-clean:devis:v1";

/** Identifiants de support acceptés (miroir de `SupportId`). */
const supportIdSchema: z.ZodType<SupportId> = z.enum([
  "citadine",
  "berline",
  "suv",
  "monospace-5",
  "monospace-7",
  "utilitaire",
  "canape-sans-angle",
  "canape-avec-angle",
  "tapis-matelas-autre",
  "demande-specifique",
]);

/** Identifiants de pack acceptés (miroir de `PackId`). */
const packIdSchema: z.ZodType<PackId> = z.enum(["confort", "concession"]);

/** Types de lieu acceptés (miroir de `LieuType`). */
const lieuTypeSchema: z.ZodType<LieuType> = z.enum(["local", "domicile"]);

/**
 * Schéma Zod décrivant la forme complète de `TunnelState`.
 * Utilisé pour valider les données désérialisées : toute forme corrompue ou
 * incompatible est rejetée. Les objets sont stricts afin qu'une clé inconnue
 * (donnée incompatible) provoque un échec de validation.
 */
export const tunnelStateSchema: z.ZodType<TunnelState> = z.strictObject({
  support: supportIdSchema.nullable(),
  pack: packIdSchema.nullable(),
  options: z.array(z.string().max(100)).max(50),
  lieu: z.strictObject({
    type: lieuTypeSchema.nullable(),
    address: z.string().max(300),
    addressValidated: z.boolean(),
    noElectricity: z.boolean(),
  }),
  creneauId: z.string().max(100).nullable(),
  devis: z.strictObject({
    prenom: z.string().max(100),
    telephone: z.string().max(30),
    besoin: z.string().max(2000),
  }),
});

/**
 * Sérialise l'État_Tunnel en JSON.
 * `deserialize(serialize(state))` est un round-trip exact pour tout état valide.
 */
export function serialize(state: TunnelState): string {
  return JSON.stringify(state);
}

/**
 * Désérialise une chaîne JSON en `TunnelState`.
 * Retourne `null` si la chaîne n'est pas du JSON valide, ou si sa forme ne
 * correspond pas au schéma (donnée corrompue / version incompatible).
 */
export function deserialize(raw: string): TunnelState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = tunnelStateSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

/**
 * Accès sûr à `localStorage` : retourne `null` si l'API est indisponible
 * (SSR, mode privé, stockage désactivé).
 */
function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Charge l'État_Tunnel persisté depuis `localStorage`.
 * Retourne `null` si aucun état n'est stocké, si le stockage est indisponible,
 * ou si les données sont corrompues/incompatibles.
 */
export function loadState(): TunnelState | null {
  const storage = getStorage();
  if (!storage) return null;

  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (raw === null) return null;
  return deserialize(raw);
}

/**
 * Persiste l'État_Tunnel dans `localStorage`.
 * No-op silencieux si le stockage est indisponible ou si l'écriture échoue
 * (quota dépassé, mode privé).
 */
export function saveState(state: TunnelState): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, serialize(state));
  } catch {
    // Dégradation gracieuse : quota dépassé, stockage en lecture seule, etc.
  }
}

/**
 * Efface l'État_Tunnel persisté (après réservation confirmée — Requirement 12.4).
 * No-op silencieux si le stockage est indisponible.
 */
export function clearState(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // Dégradation gracieuse.
  }
}
