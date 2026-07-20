import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// ─────────────────────────────────────────────────────────────────────────
// Polyfills jsdom pour les composants @base-ui (Accordion, Collapsible,
// Tooltip…) et GSAP. jsdom ne fournit ni ResizeObserver, ni matchMedia, ni
// certaines API de layout : on les stubbe de façon additive (sans écraser une
// implémentation déjà posée par un test) pour que le rendu des composants ne
// lève pas d'erreur.
// ─────────────────────────────────────────────────────────────────────────
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (
  typeof Element !== "undefined" &&
  typeof Element.prototype.scrollIntoView !== "function"
) {
  Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// Unmount React trees and clean up the DOM after each test to avoid leakage.
afterEach(() => {
  cleanup();
});
