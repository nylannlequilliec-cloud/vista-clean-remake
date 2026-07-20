import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { TunnelClient } from "@/components/devis/tunnel-client";

export const metadata: Metadata = {
  title: "Devis & Réservation",
  description:
    "Configure ta prestation de nettoyage auto ou canapé et réserve ton créneau en quelques étapes. Devis instantané, intervention à domicile en Île-de-France sous 24h.",
};

export default function ReservationPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="px-4 sm:px-6 lg:px-8">
          <TunnelClient />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
