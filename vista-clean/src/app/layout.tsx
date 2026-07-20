import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vista Clean — Nettoyage Pro à Domicile en Île-de-France",
    template: "%s | Vista Clean",
  },
  description:
    "Nettoyage intérieur voiture et canapé à domicile en Île-de-France. Produits éco-responsables, résultats bluffants. Réservez en 2 minutes.",
  keywords: [
    "nettoyage voiture",
    "nettoyage canapé",
    "nettoyage à domicile",
    "Île-de-France",
    "detailing auto",
    "nettoyage écologique",
  ],
  authors: [{ name: "Vista Clean" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://vista-clean.fr",
    siteName: "Vista Clean",
    title: "Vista Clean — Nettoyage Pro à Domicile",
    description:
      "Voiture ou canapé, on se déplace chez toi. Résultats bluffants, produits éco-responsables.",
    images: [
      {
        url: "https://vista-clean.fr/images/after-inside-car.webp",
        width: 1200,
        height: 630,
        alt: "Intérieur voiture nettoyé par Vista Clean",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vista Clean — Nettoyage Pro à Domicile",
    description:
      "Voiture ou canapé, on se déplace chez toi. Résultats bluffants, produits éco-responsables.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { AnimatedBackground } from "@/components/layout/animated-background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Vista Clean",
              description:
                "Nettoyage intérieur voiture et canapé à domicile en Île-de-France",
              url: "https://vista-clean.fr",
              areaServed: "Île-de-France",
              priceRange: "€€",
              image: "https://vista-clean.fr/images/after-inside-car.webp",
              address: {
                "@type": "PostalAddress",
                addressRegion: "Île-de-France",
                addressCountry: "FR",
              },
              sameAs: [
                "https://www.instagram.com/vistaclean_/",
                "https://www.tiktok.com/@vistaclean_",
              ],
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;var p=new URLSearchParams(window.location.search);if(p.get('theme')==='light'){d.classList.remove('dark')}else{d.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        <AnimatedBackground />
        <div className="relative z-[2] flex flex-col min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
