"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Julien",
    age: 28,
    text: "Service impeccable, rapide et professionnel. Ma voiture est comme neuve !",
  },
  {
    name: "Fatima",
    age: 34,
    text: "Très satisfaite du résultat, il est venu à domicile et a tout géré avec soin. Je recommande vivement !",
  },
  {
    name: "Thomas",
    age: 25,
    text: "Super service ! Très pratique, et ma voiture brille comme jamais.",
  },
  {
    name: "Sarah",
    age: 27,
    text: "Le travail a été rapide et de qualité. Franchement rien à redire, je reviendrai sans hésiter !",
  },
  {
    name: "Omar",
    age: 40,
    text: "Excellent service ! Il a pris soin de tout, et en plus il utilise des produits qui respectent l'environnement.",
  },
  {
    name: "Awa",
    age: 30,
    text: "Franchement top, ma voiture est nickel et le contact est super sympa. Je reviendrai !",
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-testimonial-card]",
          { y: 40, opacity: 0 },
          {
            scrollTrigger: {
              trigger: sectionRef.current,
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
    <section ref={sectionRef} id="avis" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Témoignages
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ils ont adoré,{" "}
            <span className="text-primary">à toi de juger</span>
          </h2>
        </div>

        {/* Testimonial grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              data-testimonial-card
              className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow duration-300 opacity-0"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {testimonial.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.age} ans
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
