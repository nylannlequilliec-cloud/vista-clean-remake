"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";

/**
 * Durée de la transition d'étape en secondes.
 * Contrainte : ≤ 500 ms (Requirement 14.2). ~0,4 s pour un fondu/glissement fluide.
 */
const TRANSITION_DURATION = 0.4;

/**
 * Décalage vertical (px) appliqué à l'entrée d'une étape (mouvement subtil).
 */
const TRANSITION_OFFSET = 16;

/**
 * Hook d'animation des transitions entre étapes du Tunnel.
 *
 * Anime l'entrée du conteneur d'étape à chaque changement d'`activeIndex`
 * (fondu + léger glissement). N'embarque aucune logique métier.
 *
 * - Utilise `gsap.matchMedia()` qui crée un contexte GSAP interne (scoping +
 *   nettoyage automatique) et permet de respecter `prefers-reduced-motion`.
 * - Si l'utilisateur préfère les animations réduites, la transition devient
 *   instantanée (durée 0) tout en restant fonctionnelle (Requirement 14.3).
 * - Le nettoyage `mm.revert()` réinitialise les styles inline à chaque
 *   changement d'étape et au démontage (Requirement 14.4).
 *
 * Cohérent avec le composant `AnimatedBackground` existant (import `gsap`,
 * `"use client"`, nettoyage sur cleanup).
 *
 * @param activeIndex Index (0-based) de l'étape active. La transition se
 *   rejoue à chaque changement de cette valeur.
 * @returns `containerRef` à attacher au conteneur de l'étape à animer.
 */
export function useStepTransition(activeIndex: number): {
  containerRef: RefObject<HTMLDivElement | null>;
} {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        // Les deux requêtes sont mutuellement exclusives : exactement un
        // handler s'exécute selon la préférence de l'utilisateur.
        reduceMotion: "(prefers-reduced-motion: reduce)",
        fullMotion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduceMotion } = context.conditions as {
          reduceMotion: boolean;
          fullMotion: boolean;
        };

        const duration = reduceMotion ? 0 : TRANSITION_DURATION;
        const offset = reduceMotion ? 0 : TRANSITION_OFFSET;

        gsap.fromTo(
          container,
          { autoAlpha: reduceMotion ? 1 : 0, y: offset },
          {
            autoAlpha: 1,
            y: 0,
            duration,
            ease: "power2.out",
            overwrite: "auto",
          }
        );
      }
    );

    return () => mm.revert();
  }, [activeIndex]);

  return { containerRef };
}
