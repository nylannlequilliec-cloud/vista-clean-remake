"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { MapPin, Shield, Leaf } from "lucide-react";

export function Team() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-team-content]",
          { y: 40, opacity: 0 },
          {
            scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
            y: 0,
            opacity: 1,
            duration: 0.8,
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
        <div
          data-team-content
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-card to-accent/5 border border-border p-8 sm:p-12 opacity-0"
        >
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Photo */}
            <div className="relative w-full lg:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/team.webp"
                alt="Le fondateur de Vista Clean avec son van de nettoyage professionnel"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Île-de-France
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
                Qui suis-je
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Un passionné du{" "}
                <span className="text-primary">détail</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Je suis le fondateur de Vista Clean. Passionné de detailing auto depuis plusieurs années,
                j&apos;ai investi dans du matériel professionnel haut de gamme pour offrir
                un service de qualité à domicile. Mon van est équipé de tout le nécessaire
                pour transformer ton intérieur.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">Matériel pro</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 text-sm">
                  <Leaf className="h-4 w-4 text-accent" />
                  <span className="font-medium">Produits éco</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">Se déplace chez toi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
