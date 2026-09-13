"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const BUBBLE_COUNT = 14;
const DROP_COUNT = 9;
const SPARKLE_COUNT = 12;

export function AnimatedBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const random = gsap.utils.random;
      const viewportHeight = () => window.innerHeight;

      const launchBubble = (element: HTMLElement) => {
        const size = random(14, 68);
        gsap.set(element, {
          left: `${random(2, 98)}%`, bottom: -size, width: size, height: size,
          xPercent: -50, y: 0, scale: random(0.75, 1.08), opacity: 0,
        });
        gsap.timeline({ repeat: -1, repeatDelay: random(0.3, 2.4) })
          .to(element, { opacity: random(0.18, 0.48), duration: random(0.4, 1.1) })
          .to(element, {
            y: () => -(viewportHeight() + size + random(80, 220)),
            x: random(-95, 95), scale: random(0.45, 0.9), opacity: 0,
            duration: random(8, 15), ease: "none",
          });
      };

      const launchDrop = (element: HTMLElement) => {
        const height = random(42, 132);
        gsap.set(element, {
          left: `${random(4, 96)}%`, top: -height, height, scaleY: random(0.65, 1.15), opacity: 0,
        });
        gsap.timeline({ repeat: -1, repeatDelay: random(0.15, 1.5) })
          .to(element, { opacity: random(0.22, 0.48), duration: 0.16 })
          .to(element, { y: () => viewportHeight() + height + 80, opacity: 0, duration: random(2.5, 5), ease: "none" });
      };

      const twinkle = (element: HTMLElement) => {
        const size = random(2, 8);
        gsap.set(element, {
          left: `${random(4, 96)}%`, top: `${random(10, 90)}%`, width: size, height: size,
          scale: 0, opacity: 0,
        });
        gsap.timeline({ repeat: -1, repeatDelay: random(0.5, 3), onRepeat: () => {
          const nextSize = random(2, 9);
          gsap.set(element, { left: `${random(4, 96)}%`, top: `${random(10, 90)}%`, width: nextSize, height: nextSize });
        } })
          .to(element, { opacity: random(0.45, 0.95), scale: random(0.8, 1.45), duration: random(0.28, 0.7), ease: "sine.out" })
          .to(element, { opacity: 0, scale: 0, duration: random(0.45, 1.1), ease: "sine.in" });
      };

      root.querySelectorAll<HTMLElement>("[data-bubble]").forEach(launchBubble);
      root.querySelectorAll<HTMLElement>("[data-drop]").forEach(launchDrop);
      root.querySelectorAll<HTMLElement>("[data-sparkle]").forEach(twinkle);

      // The reference is nearly still; only the large glows drift subtly.
      const blobs = root.querySelectorAll<HTMLElement>("[data-blob]");
      if (blobs[0]) {
        gsap.to(blobs[0], {
          x: 40,
          y: -20,
          scale: 1.05,
          duration: 8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
      if (blobs[1]) {
        gsap.to(blobs[1], {
          x: -50,
          y: 40,
          scale: 1.1,
          duration: 10,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
      if (blobs[2]) {
        gsap.to(blobs[2], {
          x: -30,
          y: 30,
          scale: 0.98,
          duration: 12,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 2,
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}
    >
      {/* Glow blobs */}
      <div data-blob style={{ position: "absolute", top: "-20%", left: "-8%", width: 600, height: 600, borderRadius: "50%", background: "rgba(97,35,173,0.28)", filter: "blur(120px)" }} />
      <div data-blob style={{ position: "absolute", bottom: "-34%", right: "-12%", width: 720, height: 580, borderRadius: "50%", background: "rgba(80,23,136,0.24)", filter: "blur(135px)" }} />
      <div data-blob style={{ position: "absolute", top: "48%", left: "28%", width: 420, height: 240, borderRadius: "50%", background: "rgba(44,12,84,0.12)", filter: "blur(100px)" }} />

      {/* Bubbles — each rise is launched with a new size and trajectory. */}
      {Array.from({ length: BUBBLE_COUNT }).map((_, i) => (
        <div
          key={`b${i}`}
          data-bubble
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "1px solid rgba(157,92,222,0.26)",
            background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.045), rgba(113,48,170,0.045) 64%, transparent 70%)",
          }}
        />
      ))}

      {/* Falling purple rain lines */}
      {Array.from({ length: DROP_COUNT }).map((_, i) => (
        <div
          key={`d${i}`}
          data-drop
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: 1,
            height: 80,
            borderRadius: 999,
            background: "linear-gradient(to bottom, transparent, rgba(139,67,201,0.28), transparent)",
          }}
        />
      ))}

      {/* Random blinking light points */}
      {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
        <div
          key={`s${i}`}
          data-sparkle
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "rgba(241,226,255,0.92)",
            boxShadow: "0 0 10px 3px rgba(168,85,247,0.42)",
          }}
        />
      ))}
    </div>
  );
}
