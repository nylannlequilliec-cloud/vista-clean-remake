import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Vista Clean — Nettoyage auto et canapé à domicile en Île-de-France.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-10">
            Mentions <span className="text-primary">légales</span>
          </h1>

          <div className="space-y-8 text-muted-foreground leading-relaxed">
            {/* Éditeur */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Éditeur du site
              </h2>
              <p>
                Le site vista-clean.fr est édité par <strong className="text-foreground">Vista Clean</strong>, entreprise de nettoyage
                à domicile spécialisée dans le nettoyage intérieur automobile et
                textile.
              </p>
              <ul className="mt-3 space-y-1">
                <li>Dénomination : Vista Clean</li>
                <li>Siège social : Île-de-France, France</li>
                <li>
                  Contact : via Instagram{" "}
                  <a
                    href="https://www.instagram.com/vistaclean_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @vistaclean_
                  </a>
                </li>
              </ul>
            </section>

            {/* Hébergement */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Hébergement
              </h2>
              <p>
                Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133,
                Covina, CA 91723, États-Unis.
              </p>
              <p className="mt-1">
                Site web :{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  vercel.com
                </a>
              </p>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Propriété intellectuelle
              </h2>
              <p>
                L&apos;ensemble du contenu du site vista-clean.fr (textes,
                images, vidéos, logos, éléments graphiques) est la propriété
                exclusive de Vista Clean ou de ses partenaires. Toute
                reproduction, représentation, modification ou exploitation, même
                partielle, sans autorisation préalable écrite est strictement
                interdite.
              </p>
            </section>

            {/* Protection des données */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Protection des données personnelles
              </h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données
                (RGPD) et à la loi Informatique et Libertés, vous disposez d&apos;un
                droit d&apos;accès, de rectification, de suppression et de
                portabilité de vos données personnelles.
              </p>
              <p className="mt-3">
                Les données collectées via le formulaire de réservation (prénom,
                téléphone, prestation, date) sont utilisées uniquement dans le
                cadre de la prise de contact et de la planification des
                prestations. Elles ne sont jamais cédées à des tiers.
              </p>
              <p className="mt-3">
                Pour exercer vos droits ou pour toute question relative à vos
                données personnelles, contactez-nous via Instagram{" "}
                <a
                  href="https://www.instagram.com/vistaclean_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  @vistaclean_
                </a>
                .
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Cookies
              </h2>
              <p>
                Ce site n&apos;utilise pas de cookies publicitaires ni de trackers
                tiers. Seuls des cookies techniques strictement nécessaires au
                fonctionnement du site peuvent être déposés.
              </p>
            </section>

            {/* Responsabilité */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Limitation de responsabilité
              </h2>
              <p>
                Vista Clean s&apos;efforce de fournir des informations aussi
                précises que possible sur le site. Toutefois, Vista Clean ne
                pourra être tenu responsable des omissions, des inexactitudes ou
                des carences dans la mise à jour des informations.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
