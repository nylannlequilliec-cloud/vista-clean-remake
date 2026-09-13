"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type Bubble = { t: string; l: string; w: number };
type Drop = { t: string; l: string; h: number };
type Sparkle = { t: string; l: string; s: number };

const BUBBLES: Bubble[] = [
  { t: "66%", l: "4.5%", w: 42 }, { t: "55%", l: "10%", w: 62 },
  { t: "56%", l: "22%", w: 58 }, { t: "47%", l: "38.5%", w: 32 },
  { t: "42%", l: "52%", w: 18 }, { t: "86%", l: "88%", w: 27 },
  { t: "36%", l: "98%", w: 22 },
];

const DROPS: Drop[] = [
  { t: "36%", l: "9.4%", h: 90 }, { t: "53%", l: "19.8%", h: 64 },
  { t: "36%", l: "81.5%", h: 90 }, { t: "67%", l: "94.2%", h: 58 },
];

const SPARKLES: Sparkle[] = [
  { t: "52%", l: "35.5%", s: 4 }, { t: "33%", l: "87%", s: 5 },
  { t: "39%", l: "18%", s: 3 },
];

export function AnimatedBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
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

      {/* Bubbles — fixed to reproduce the reference composition */}
      {BUBBLES.map((b, i) => (
        <div
          key={`b${i}`}
          data-bubble
          style={{
            position: "absolute",
            top: b.t,
            left: b.l,
            width: b.w,
            height: b.w,
            borderRadius: "50%",
            border: `1px solid rgba(157,92,222,${b.w > 30 ? 0.18 : 0.26})`,
            background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,0.045), rgba(113,48,170,0.045) 64%, transparent 70%)",
          }}
        />
      ))}

      {/* Fine vertical marks */}
      {DROPS.map((d, i) => (
        <div
          key={`d${i}`}
          data-drop
          style={{
            position: "absolute",
            top: d.t,
            left: d.l,
            width: 1,
            height: d.h,
            borderRadius: 999,
            background: "linear-gradient(to bottom, transparent, rgba(139,67,201,0.28), transparent)",
          }}
        />
      ))}

      {/* Sparkles */}
      {SPARKLES.map((s, i) => (
        <div
          key={`s${i}`}
          data-sparkle
          style={{
            position: "absolute",
            top: s.t,
            left: s.l,
            width: s.s,
            height: s.s,
            borderRadius: "50%",
            background: "rgba(241,226,255,0.92)",
            boxShadow: "0 0 10px 3px rgba(168,85,247,0.42)",
          }}
        />
      ))}
    </div>
  );
}
