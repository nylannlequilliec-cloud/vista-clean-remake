import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions fréquentes sur le nettoyage auto et canapé à domicile Vista Clean en Île-de-France.",
};

const faqs = [
  {
    question: "Comment se passe une prestation ?",
    answer:
      "C'est simple : tu réserves en ligne, on confirme ton créneau, et on se déplace directement chez toi avec tout le matériel nécessaire. Tu n'as rien à préparer.",
  },
  {
    question: "Quels produits utilisez-vous ?",
    answer:
      "On utilise exclusivement des produits éco-responsables, certifiés et sans danger pour ta santé, tes enfants et tes animaux. Zéro produit chimique agressif.",
  },
  {
    question: "Combien de temps dure un nettoyage ?",
    answer:
      "Le Pack Confort prend environ 1h10 à 1h45, et le Pack Concession entre 2h30 et 3h selon l'état du véhicule.",
  },
  {
    question: "Vous intervenez dans quelle zone ?",
    answer:
      "On intervient dans toute l'Île-de-France. Paris et petite couronne principalement, mais n'hésite pas à demander pour la grande couronne.",
  },
  {
    question: "Je peux annuler ou reporter ma réservation ?",
    answer:
      "Oui, tu peux annuler ou reporter gratuitement jusqu'à 24h avant le créneau prévu. Contacte-nous par message sur Instagram ou TikTok.",
  },
  {
    question: "Vous nettoyez aussi les canapés ?",
    answer:
      "Absolument ! On fait le shampoing de canapés en tissu, alcantara, microfibre… Résultats visibles immédiatement.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    answer:
      "On accepte le paiement par carte bancaire, espèces, et virement. Le paiement se fait après la prestation, une fois que tu es satisfait du résultat.",
  },
  {
    question: "Et si le résultat ne me convient pas ?",
    answer:
      "On garantit la satisfaction. Si une tache persiste malgré le nettoyage, on repasse gratuitement. C'est rare, mais on assure.",
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Questions <span className="text-primary">fréquentes</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Tout ce que tu veux savoir avant de réserver
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                className="rounded-2xl border border-border bg-card px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-medium py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Tu as encore une question ? Contacte-nous sur Instagram !
            </p>
            <Link
              href="/reservation"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full px-8"
              )}
            >
              Réserver maintenant <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
