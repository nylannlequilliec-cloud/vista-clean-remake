"use client";

import { useEffect, useRef } from "react";
import { CalendarCheck, MapPin, Sparkles, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: CalendarCheck,
    number: "01",
    title: "Réserve en ligne",
    description: "Choisis ton pack, ta date et ton créneau. Ça prend 2 minutes.",
  },
  {
    icon: MapPin,
    number: "02",
    title: "On vient chez toi",
    description: "On se déplace à ton adresse avec tout le matériel pro nécessaire.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "On nettoie à fond",
    description: "Shampoing, aspiration, finition… le tout avec des produits éco.",
  },
  {
    icon: ThumbsUp,
    number: "04",
    title: "Tu profites du résultat",
    description: "Ton intérieur est comme neuf. Satisfaction garantie ou on repasse.",
  },
];

export function Process() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-process-step]",
          { y: 50, opacity: 0 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
            },
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: "power3.out",
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    };

    initGSAP();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Comment ça marche
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Simple comme <span className="text-primary">1, 2, 3, 4</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              data-process-step
              className="relative opacity-0"
            >
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-primary/20 to-transparent" />
              )}

              <div className="relative z-10 text-center">
                {/* Number + Icon */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 mb-5">
                  <step.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-bold mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
