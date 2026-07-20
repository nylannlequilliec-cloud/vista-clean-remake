"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  // Animated counter
  useEffect(() => {
    const target = 3152;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          "[data-hero-badge]",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 }
        )
          .fromTo(
            "[data-hero-title]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
            "-=0.3"
          )
          .fromTo(
            "[data-hero-desc]",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            "-=0.4"
          )
          .fromTo(
            "[data-hero-cta]",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            "-=0.3"
          )
          .fromTo(
            "[data-hero-stat]",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
            "-=0.2"
          );
      }, heroRef);

      return () => ctx.revert();
    };

    initGSAP();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
    >
      {/* Background image — their real after photo */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/after-inside-car.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div
          data-hero-badge
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary text-sm font-medium mb-8 opacity-0"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Île-de-France · 150K+ abonnés TikTok 🔥
        </div>

        {/* Title */}
        <h1
          data-hero-title
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 opacity-0"
        >
          Ton intérieur,
          <br />
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            impeccable.
          </span>
        </h1>

        {/* Description */}
        <p
          data-hero-desc
          className="mx-auto max-w-xl text-lg sm:text-xl text-muted-foreground mb-8 opacity-0"
        >
          Voiture ou canapé, on se déplace chez toi avec tout le matos pro.
          Résultats bluffants, produits éco-responsables.
        </p>

        {/* Price + Social proof inline */}
        <div data-hero-cta className="flex flex-col items-center gap-4 mb-8 opacity-0">
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-accent/15 text-accent font-semibold">
              À partir de 99€
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">{count.toLocaleString()}+</strong> prestations
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div data-hero-cta className="flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0">
          <Link
            href="/reservation"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            )}
          >
            Réserver maintenant <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <a
            href="https://wa.me/33781387984?text=Salut%20!%20Je%20voudrais%20réserver%20un%20nettoyage"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-full px-8 text-base gap-2"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href="tel:+33781387984"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "rounded-full px-6 text-base gap-2 sm:hidden"
            )}
          >
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: "4.9/5", label: "Note moyenne", emoji: "⭐" },
            { value: `${count.toLocaleString()}+`, label: "Prestations", emoji: "✅" },
            { value: "24h", label: "Délai max", emoji: "⚡" },
            { value: "100%", label: "Satisfaction", emoji: "💯" },
          ].map((stat) => (
            <div
              key={stat.label}
              data-hero-stat
              className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 opacity-0"
            >
              <span className="text-lg">{stat.emoji}</span>
              <span className="font-heading text-xl font-bold">
                {stat.value}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
