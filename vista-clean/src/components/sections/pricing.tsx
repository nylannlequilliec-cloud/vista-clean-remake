"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const vehicleTypes = [
  { id: "citadine", label: "Citadine", multiplier: 1 },
  { id: "berline", label: "Berline", multiplier: 1.15 },
  { id: "suv", label: "SUV", multiplier: 1.3 },
  { id: "monospace", label: "Monospace", multiplier: 1.5 },
];

const packs = [
  {
    id: "confort",
    name: "Pack Confort",
    basePrice: 99,
    popular: false,
    duration: "1h10 à 1h45",
    features: [
      "Nettoyage des surfaces plastiques",
      "Aspiration complète habitacle + coffre",
      "Nettoyage et finition seuils de porte",
      "Vitrerie intérieure éclatante",
      "Shampoing tapis et moquette",
    ],
  },
  {
    id: "concession",
    name: "Pack Concession",
    basePrice: 129,
    popular: true,
    duration: "2h30 à 3h",
    features: [
      "Nettoyage des surfaces plastiques",
      "Aspiration complète habitacle + coffre",
      "Nettoyage et finition seuils de porte",
      "Vitrerie intérieure éclatante",
      "Shampoing complet sièges, tapis, moquettes",
      "Nettoyage cuir et alcantara",
      "Brillance et revitalisation plastiques",
      "Finition parfum de luxe",
    ],
  },
];

export function Pricing() {
  const [selectedVehicle, setSelectedVehicle] = useState("citadine");
  const sectionRef = useRef<HTMLDivElement>(null);

  const multiplier =
    vehicleTypes.find((v) => v.id === selectedVehicle)?.multiplier ?? 1;

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-pricing-card]",
          { y: 60, opacity: 0 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
            },
            y: 0,
            opacity: 1,
            duration: 0.8,
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
    <section ref={sectionRef} id="tarifs" className="py-24 sm:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Nos packs
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Choisis ton <span className="text-primary">pack</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sélectionne ton véhicule et compare les formules
          </p>
        </div>

        {/* Vehicle selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {vehicleTypes.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedVehicle === vehicle.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-card border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {vehicle.label}
            </button>
          ))}
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {packs.map((pack) => (
            <div
              key={pack.id}
              data-pricing-card
              className={`relative rounded-3xl p-8 transition-all duration-300 opacity-0 ${
                pack.popular
                  ? "bg-card border-2 border-primary shadow-xl shadow-primary/10 md:scale-[1.02]"
                  : "bg-card border border-border hover:border-primary/20"
              }`}
            >
              {pack.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                  <Zap className="h-3 w-3 mr-1" />
                  Populaire
                </Badge>
              )}

              <h3 className="font-heading text-xl font-bold mb-2">
                {pack.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-heading text-4xl font-bold">
                  {Math.round(pack.basePrice * multiplier)}€
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Durée : {pack.duration}
              </p>

              <ul className="space-y-3 mb-8">
                {pack.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/reservation"
                className={cn(
                  buttonVariants({ variant: pack.popular ? "default" : "outline" }),
                  "w-full rounded-full",
                  pack.popular && "shadow-lg shadow-primary/25"
                )}
              >
                {pack.popular ? "Réserver maintenant →" : "Choisir ce pack →"}
              </Link>
            </div>
          ))}
        </div>
        {/* Nettoyage textile section */}
        <div className="mt-20">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
              Nettoyage textile
            </p>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
              Nettoyage <span className="text-primary">canapé</span>
            </h3>
          </div>

          <div className="max-w-lg mx-auto opacity-0" data-pricing-card>
            <div className="rounded-3xl bg-card border border-border p-8 text-center">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="font-heading text-3xl font-bold">
                  À partir de 59€
                </span>
                <span className="text-muted-foreground text-sm">la place</span>
              </div>

              <ul className="space-y-3 mt-6 mb-8 text-left">
                {[
                  "Shampoing profond",
                  "Extraction des taches",
                  "Désodorisation",
                  "Résultat garanti",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/reservation"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full rounded-full shadow-lg shadow-primary/25"
                )}
              >
                Demander un devis →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
