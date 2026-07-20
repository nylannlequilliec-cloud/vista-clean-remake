"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export function TikTokBanner() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-tiktok-content]",
          { y: 30, opacity: 0 },
          {
            scrollTrigger: { trigger: ref.current, start: "top 85%" },
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
          }
        );
      }, ref);

      return () => ctx.revert();
    };

    initGSAP();
  }, []);

  return (
    <section ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-tiktok-content
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 opacity-0"
        >
          {/* TikTok-style decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#69C9D0]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#EE1D52]/15 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            {/* TikTok video previews */}
            <div className="flex gap-3 shrink-0">
              <div className="relative w-28 h-48 rounded-xl overflow-hidden border-2 border-white/10 shadow-xl">
                <Image
                  src="/images/tiktok-1.webp"
                  alt="Vidéo TikTok Vista Clean — Nettoyage intérieur"
                  fill
                  className="object-cover"
                  sizes="112px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-[10px] text-white font-medium">45K</span>
                </div>
              </div>
              <div className="relative w-28 h-48 rounded-xl overflow-hidden border-2 border-white/10 shadow-xl hidden sm:block">
                <Image
                  src="/images/tiktok-2.webp"
                  alt="Vidéo TikTok Vista Clean — Résultat avant/après"
                  fill
                  className="object-cover"
                  sizes="112px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-[10px] text-white font-medium">28K</span>
                </div>
              </div>
            </div>

            {/* Text content */}
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.7 6.34 6.34 0 009.49 22a6.34 6.34 0 006.34-6.34V9.4a8.16 8.16 0 003.76.92V6.87a4.85 4.85 0 01-.01-.18z" />
                </svg>
                @vistaclean_ · 150K+ abonnés
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
                Retrouve nos vidéos satisfaisantes
              </h3>
              <p className="text-white/60 max-w-md mb-6">
                Avant/après, coulisses, astuces nettoyage… Nos TikToks montrent
                le vrai travail, sans filtre. Rejoins la commu !
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <a
                  href="https://www.tiktok.com/@vistaclean_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-white/90 transition-colors shadow-lg"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.88 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.82.11v-3.5a6.37 6.37 0 00-.82-.05A6.34 6.34 0 003.15 15.7 6.34 6.34 0 009.49 22a6.34 6.34 0 006.34-6.34V9.4a8.16 8.16 0 003.76.92V6.87a4.85 4.85 0 01-.01-.18z" />
                  </svg>
                  Suivre sur TikTok
                </a>
                <a
                  href="https://www.instagram.com/vistaclean_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white border border-white/20 font-medium text-sm hover:bg-white/20 transition-colors"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
