"use client";

import { useEffect, useRef } from "react";
import { ShieldCheck, Leaf, Clock, CreditCard } from "lucide-react";

const badges = [
  { icon: ShieldCheck, text: "Assuré & garanti" },
  { icon: Leaf, text: "Produits éco-certifiés" },
  { icon: Clock, text: "Intervention sous 24h" },
  { icon: CreditCard, text: "Paiement après prestation" },
];

export function TrustBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-trust-badge]",
          { y: 20, opacity: 0 },
          {
            scrollTrigger: { trigger: ref.current, start: "top 90%" },
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
          }
        );
      }, ref);

      return () => ctx.revert();
    };

    initGSAP();
  }, []);

  return (
    <div ref={ref} className="py-12 border-y border-border/50 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {badges.map((badge) => (
            <div
              key={badge.text}
              data-trust-badge
              className="flex items-center gap-2.5 opacity-0"
            >
              <badge.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {badge.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
