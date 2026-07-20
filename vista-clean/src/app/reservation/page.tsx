"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, ChevronDown } from "lucide-react";

const services = [
  { id: "confort-citadine", label: "Pack Confort — Citadine", price: "99€" },
  { id: "confort-berline", label: "Pack Confort — Berline", price: "114€" },
  { id: "confort-suv", label: "Pack Confort — SUV", price: "129€" },
  { id: "confort-monospace", label: "Pack Confort — Monospace", price: "149€" },
  { id: "concession-citadine", label: "Pack Concession — Citadine", price: "129€" },
  { id: "concession-berline", label: "Pack Concession — Berline", price: "148€" },
  { id: "concession-suv", label: "Pack Concession — SUV", price: "168€" },
  { id: "concession-monospace", label: "Pack Concession — Monospace", price: "194€" },
  { id: "canape", label: "Nettoyage canapé", price: "Sur devis" },
];

export default function ReservationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    service: "",
    date: "",
    timeSlot: "",
    message: "",
  });

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/xplaceholder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) setSubmitted(true);
      else setError("Une erreur est survenue. Réessaye ou contacte-nous sur WhatsApp.");
    } catch {
      setError("Erreur réseau. Vérifie ta connexion ou contacte-nous sur WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-6">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-4">
              Demande envoyée !
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              On te recontacte sous 24h pour confirmer ton créneau. À très vite !
            </p>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Intervention sous 24h
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Réserve ta <span className="text-primary">prestation</span>
            </h1>
            <p className="text-muted-foreground">
              Remplis le formulaire, on te confirme le créneau rapidement.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm"
          >
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
              >
                Prénom
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="Ton prénom"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium mb-2"
              >
                Téléphone
              </label>
              <input
                type="tel"
                id="phone"
                required
                pattern="[0-9\s\+]{10,14}"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="06 12 34 56 78"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium mb-2"
              >
                Adresse d&apos;intervention
              </label>
              <input
                type="text"
                id="address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                placeholder="12 rue de la Paix, 75002 Paris"
              />
            </div>

            {/* Service */}
            <div>
              <label
                htmlFor="service"
                className="block text-sm font-medium mb-2"
              >
                Prestation souhaitée
              </label>
              <div className="relative">
                <select
                  id="service"
                  required
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                >
                  <option value="">Choisis une prestation</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.label} — {service.price}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium mb-2"
              >
                Date souhaitée
              </label>
              <input
                type="date"
                id="date"
                required
                min={minDate}
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label
                htmlFor="timeSlot"
                className="block text-sm font-medium mb-2"
              >
                Créneau préféré
              </label>
              <div className="relative">
                <select
                  id="timeSlot"
                  required
                  value={formData.timeSlot}
                  onChange={(e) =>
                    setFormData({ ...formData, timeSlot: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all appearance-none"
                >
                  <option value="">Choisis un créneau</option>
                  <option value="matin">Matin (8h-12h)</option>
                  <option value="apres-midi">Après-midi (12h-17h)</option>
                  <option value="flexible">Flexible</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                Message (optionnel)
              </label>
              <textarea
                id="message"
                rows={3}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                placeholder="Précisions sur l'état du véhicule, adresse…"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full h-12 text-base font-semibold shadow-lg shadow-primary/25"
            >
              {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}{" "}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Devis gratuit · Sans engagement · Réponse sous 24h
            </p>
          </form>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
