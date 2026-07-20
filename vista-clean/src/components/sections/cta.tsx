"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Leaf } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative z-10">
            <p className="text-sm font-medium text-primary-foreground/70 uppercase tracking-wider mb-4">
              Prêt à réserver ?
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight mb-6">
              Réserve ton nettoyage pro
              <br />
              en 2 minutes
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Choisis ton service, ton créneau, et on s&apos;occupe du reste.
              Simple, rapide, efficace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/reservation"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "rounded-full px-8 text-base font-semibold shadow-lg"
                )}
              >
                Réserver maintenant <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <Leaf className="h-4 w-4" />
                Produits éco-certifiés
              </span>
            </div>

            <p className="mt-6 text-sm text-primary-foreground/60">
              Devis gratuit · Intervention sous 24h
            </p>

            <span className="mt-3 inline-flex items-center gap-2 text-sm text-primary-foreground/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
              </span>
              Créneaux disponibles cette semaine
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
