"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type Bubble = { l: string; w: number; dur: number; del: number };
type Drop = { l: string; h: number; dur: number; del: number };
type Sparkle = { t: string; l: string; s: number; dur: number; del: number };

const BUBBLES: Bubble[] = [
  { l: "5%", w: 40, dur: 7, del: 0 },
  { l: "15%", w: 18, dur: 9, del: 1.2 },
  { l: "22%", w: 55, dur: 11, del: 0.5 },
  { l: "30%", w: 12, dur: 6, del: 3 },
  { l: "38%", w: 30, dur: 8, del: 2 },
  { l: "45%", w: 65, dur: 13, del: 1 },
  { l: "52%", w: 20, dur: 7.5, del: 4 },
  { l: "60%", w: 45, dur: 10, del: 0.8 },
  { l: "68%", w: 14, dur: 6.5, del: 5 },
  { l: "75%", w: 35, dur: 9.5, del: 2.5 },
  { l: "82%", w: 50, dur: 12, del: 1.8 },
  { l: "90%", w: 22, dur: 8, del: 3.5 },
  { l: "95%", w: 28, dur: 7, del: 6 },
  { l: "10%", w: 60, dur: 14, del: 4.5 },
  { l: "50%", w: 16, dur: 5.5, del: 7 },
];

const DROPS: Drop[] = [
  { l: "10%", h: 80, dur: 3, del: 0 },
  { l: "20%", h: 50, dur: 2.5, del: 1 },
  { l: "35%", h: 100, dur: 4, del: 0.5 },
  { l: "50%", h: 60, dur: 2.8, del: 2 },
  { l: "65%", h: 90, dur: 3.5, del: 1.5 },
  { l: "80%", h: 70, dur: 3, del: 3 },
  { l: "92%", h: 55, dur: 2.2, del: 0.8 },
  { l: "42%", h: 85, dur: 3.8, del: 4 },
];

const SPARKLES: Sparkle[] = [
  { t: "15%", l: "20%", s: 8, dur: 2.5, del: 0 },
  { t: "30%", l: "70%", s: 6, dur: 3, del: 1 },
  { t: "50%", l: "35%", s: 10, dur: 4, del: 0.5 },
  { t: "70%", l: "55%", s: 7, dur: 3.5, del: 2 },
  { t: "40%", l: "85%", s: 9, dur: 2.8, del: 3 },
  { t: "80%", l: "25%", s: 5, dur: 4.5, del: 1.5 },
  { t: "25%", l: "50%", s: 8, dur: 3, del: 4 },
  { t: "60%", l: "10%", s: 6, dur: 3.2, del: 5 },
];

export function AnimatedBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const vh = () => window.innerHeight;

      // Bubbles rise from bottom to top, shrinking and fading.
      root.querySelectorAll<HTMLElement>("[data-bubble]").forEach((el, i) => {
        const { dur, del } = BUBBLES[i];
        gsap.fromTo(
          el,
          { y: 0, scale: 1, opacity: 0.6 },
          {
            y: () => -(vh() + 150),
            scale: 0.5,
            opacity: 0,
            duration: dur,
            delay: del,
            ease: "none",
            repeat: -1,
          }
        );
      });

      // Drops fall from top to bottom.
      root.querySelectorAll<HTMLElement>("[data-drop]").forEach((el, i) => {
        const { dur, del } = DROPS[i];
        gsap.fromTo(
          el,
          { y: -50, opacity: 0.8 },
          {
            y: () => vh() + 50,
            opacity: 0,
            duration: dur,
            delay: del,
            ease: "none",
            repeat: -1,
          }
        );
      });

      // Sparkles pulse in and out.
      root.querySelectorAll<HTMLElement>("[data-sparkle]").forEach((el, i) => {
        const { dur, del } = SPARKLES[i];
        gsap.fromTo(
          el,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 0.8,
            duration: dur / 2,
            delay: del,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          }
        );
      });

      // Glow blobs drift slowly.
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
      <div data-blob style={{ position: "absolute", top: "5%", left: "0%", width: 350, height: 350, borderRadius: "50%", background: "rgba(147,51,234,0.2)", filter: "blur(100px)" }} />
      <div data-blob style={{ position: "absolute", top: "50%", right: "5%", width: 450, height: 450, borderRadius: "50%", background: "rgba(124,58,237,0.15)", filter: "blur(100px)" }} />
      <div data-blob style={{ position: "absolute", bottom: "10%", left: "20%", width: 300, height: 300, borderRadius: "50%", background: "rgba(168,85,247,0.15)", filter: "blur(100px)" }} />

      {/* Bubbles — rising from bottom */}
      {BUBBLES.map((b, i) => (
        <div
          key={`b${i}`}
          data-bubble
          style={{
            position: "absolute",
            bottom: 0,
            left: b.l,
            width: b.w,
            height: b.w,
            borderRadius: "50%",
            border: `1.5px solid rgba(168,85,247,${b.w > 30 ? 0.25 : 0.4})`,
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,${b.w > 30 ? 0.12 : 0.2}), rgba(139,92,246,0.08))`,
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Drops — thin lines falling */}
      {DROPS.map((d, i) => (
        <div
          key={`d${i}`}
          data-drop
          style={{
            position: "absolute",
            top: 0,
            left: d.l,
            width: 2,
            height: d.h,
            borderRadius: 999,
            background: "linear-gradient(to bottom, transparent, rgba(168,85,247,0.4), transparent)",
            willChange: "transform, opacity",
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
            background: "white",
            boxShadow: "0 0 12px 4px rgba(168,85,247,0.6)",
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
