"use client";

import { useEffect, useRef } from "react";
import { Car, Sofa, Leaf, Zap, MapPin, ThumbsUp } from "lucide-react";

const services = [
  {
    icon: Car,
    title: "Lavage intérieur voiture",
    description:
      "Aspiration, shampoing sièges et moquettes, vitrerie, plastiques… Ton véhicule retrouve son état neuf.",
  },
  {
    icon: Sofa,
    title: "Nettoyage de canapés",
    description:
      "Shampoing profond, extraction des taches, désodorisation. Résultat garanti sur tous types de tissus.",
  },
];

const advantages = [
  {
    icon: MapPin,
    title: "Flexibilité",
    description: "On vient chez toi ou tu passes à notre local, c'est toi qui choisis.",
  },
  {
    icon: Zap,
    title: "Rapide et efficace",
    description: "Un travail soigné en un temps record. Pas de prise de tête.",
  },
  {
    icon: Leaf,
    title: "Écologique",
    description:
      "Produits éco-responsables, bons pour ta santé et celle de la planète.",
  },
  {
    icon: ThumbsUp,
    title: "Résultats bluffants",
    description:
      "Une vraie transformation visible. Tu seras bluffé par l'avant/après !",
  },
];

export function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-service-card]",
          { y: 60, opacity: 0 },
          {
            scrollTrigger: {
              trigger: "[data-services-grid]",
              start: "top 85%",
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
          }
        );

        gsap.fromTo(
          "[data-advantage-card]",
          { y: 40, opacity: 0 },
          {
            scrollTrigger: {
              trigger: "[data-advantages-grid]",
              start: "top 85%",
            },
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    };

    initGSAP();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Nos prestations
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ce qu&apos;on fait <span className="text-primary">briller</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Nettoyage sur mesure, résultat garanti. Voiture ou canapé, on
            s&apos;en occupe.
          </p>
        </div>

        {/* Service cards */}
        <div data-services-grid className="grid md:grid-cols-2 gap-6 mb-24">
          {services.map((service) => (
            <div
              key={service.title}
              data-service-card
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 opacity-0"
            >
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-6">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Advantages */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
            On fait les choses <span className="text-accent">bien.</span>
          </h2>
        </div>

        <div
          data-advantages-grid
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {advantages.map((advantage) => (
            <div
              key={advantage.title}
              data-advantage-card
              className="text-center p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/20 transition-colors duration-300 opacity-0"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 mb-4">
                <advantage.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-heading text-base font-bold mb-2">
                {advantage.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
