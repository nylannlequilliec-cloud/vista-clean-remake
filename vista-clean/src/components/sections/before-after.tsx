"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

const comparisons = [
  {
    id: "interieur",
    label: "Intérieur voiture",
    before: "/images/before-inside-car.webp",
    after: "/images/after-inside-car.webp",
  },
  {
    id: "fauteuil",
    label: "Fauteuil",
    before: "/images/before-chair.webp",
    after: "/images/after-chair.webp",
  },
  {
    id: "canape",
    label: "Canapé",
    before: "/images/before-couch.webp",
    after: "/images/after-couch.webp",
  },
  {
    id: "moquette",
    label: "Sol moquette",
    before: "/images/before-sol.webp",
    after: "/images/after-sol.webp",
  },
  {
    id: "tache",
    label: "Siège taché",
    before: "/images/before-tache.webp",
    after: "/images/after-tache.webp",
  },
];

function ComparisonSlider({
  before,
  after,
  label,
}: {
  before: string;
  after: string;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) updatePosition(e.clientX);
    },
    [isDragging, updatePosition]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-col-resize select-none group"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      role="slider"
      aria-label={`Comparaison avant/après : ${label}`}
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setSliderPosition((p) => Math.max(0, p - 5));
        if (e.key === "ArrowRight") setSliderPosition((p) => Math.min(100, p + 5));
      }}
    >
      {/* After (full background) */}
      <Image
        src={after}
        alt={`Après — ${label}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Before (clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={before}
          alt={`Avant — ${label}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white/80">
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l4-4 4 4M8 15l4 4 4-4"
            />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
        AVANT
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-black text-xs font-medium">
        APRÈS
      </div>
    </div>
  );
}

export function BeforeAfter() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-ba-title]",
          { y: 40, opacity: 0 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
            },
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    };

    initGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="resultats"
      className="py-24 sm:py-32 bg-secondary/30"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div data-ba-title className="text-center mb-12 opacity-0">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Avant / Après
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Les résultats parlent{" "}
            <span className="text-primary">d&apos;eux-mêmes</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Fais glisser le curseur pour voir la transformation
          </p>
        </div>

        {/* Main slider */}
        <div className="max-w-3xl mx-auto">
          <ComparisonSlider
            before={comparisons[activeIndex].before}
            after={comparisons[activeIndex].after}
            label={comparisons[activeIndex].label}
          />
        </div>

        {/* Thumbnails */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {comparisons.map((comp, index) => (
            <button
              key={comp.id}
              onClick={() => setActiveIndex(index)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeIndex === index
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {comp.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
