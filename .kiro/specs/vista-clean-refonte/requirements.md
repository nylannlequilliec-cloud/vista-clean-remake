# Requirements — Refonte Vista Clean

## Contexte

**Client :** Vista Clean — nettoyage auto + canapés à domicile en Île-de-France
**Site actuel :** vista-clean.fr (Nuxt.js, design générique type IA, manque de personnalité)
**Objectif :** Refaire un site moderne, professionnel et premium qui convertit mieux, en Next.js
**Délai :** 3 jours
**Livreur :** Le code source Next.js prêt à déployer (ils gèrent leur hébergement)

---

## 1. Pages à livrer

| # | Page | Route | Priorité |
|---|------|-------|----------|
| 1 | Accueil (Landing) | `/` | Critique |
| 2 | Réservation / Tarifs | `/reservation` | Critique |
| 3 | FAQ | `/faq` | Haute |
| 4 | Mentions légales | `/mentions-legales` | Moyenne |

**SEO multi-pages :** Chaque page a ses propres meta title, description, Open Graph, structured data (LocalBusiness schema).

---

## 2. Sections de la page d'accueil

| # | Section | Description |
|---|---------|-------------|
| 1 | Hero | Accroche forte + CTA réserver + vidéo/image de fond |
| 2 | Social proof | Chiffres clés (clients, prestations, note, délai) |
| 3 | Services | Cartes lavage auto + nettoyage canapé avec images |
| 4 | Avantages | 4 points forts (flexibilité, rapidité, éco, résultats) |
| 5 | Tarifs / Packs | Sélecteur véhicule + cartes pricing (Confort / Concession) |
| 6 | Avant/Après | Slider comparatif interactif |
| 7 | Témoignages | Carousel d'avis clients |
| 8 | CTA final | Bloc de conversion avec bouton réserver |
| 9 | Footer | Réseaux sociaux, copyright, liens légaux |

---

## 3. Fonctionnalités

### 3.1 Critiques (MVP)
- [ ] Site responsive mobile-first (80%+ du trafic vient de TikTok = mobile)
- [ ] Animations scroll fluides (GSAP ScrollTrigger)
- [ ] Slider avant/après interactif
- [ ] Sélecteur de type de véhicule pour les tarifs
- [ ] Boutons CTA menant vers la page réservation
- [ ] Dark/light mode automatique (prefers-color-scheme)
- [ ] Performance Lighthouse ≥ 90 toutes catégories
- [ ] SEO technique (sitemap, robots.txt, structured data, meta OG)

### 3.2 Importantes
- [ ] Animations d'entrée des sections au scroll
- [ ] Micro-interactions hover sur les cartes
- [ ] Navbar sticky avec changement au scroll
- [ ] Formulaire de réservation (nom, téléphone, service, date)
- [ ] FAQ avec accordéon accessible
- [ ] Carousel d'avis avec auto-scroll

### 3.3 Nice-to-have
- [ ] Animations de chargement (skeleton/loader)
- [ ] Confetti ou animation de confirmation après réservation
- [ ] PWA manifest pour "ajouter à l'écran"

---

## 4. Stack technique

| Couche | Techno | Raison |
|--------|--------|--------|
| Framework | Next.js 14+ (App Router) | SSR, SEO, performance |
| Styling | Tailwind CSS 4 | Utility-first, rapide |
| Composants | shadcn/ui | Accessible, moderne |
| Animations | GSAP + ScrollTrigger | Pro, performant, gratuit |
| Icônes | Lucide React | Cohérent, léger |
| Fonts | Google Fonts (Inter + un display) | Gratuit, rapide |
| Formulaire | React Hook Form + Zod | Validation robuste |
| Déploiement | Vercel (ou export statique) | Gratuit tier hobby |

---

## 5. Design direction

| Aspect | Choix |
|--------|-------|
| Style | Clean moderne, premium mais accessible (pas corporate froid) |
| Palette | Bleu profond + blanc + accent vert (éco) — à valider via ui-ux-pro-max |
| Typo | Inter (body) + Space Grotesk ou Clash Display (titres) |
| Ton | Jeune, direct, tutoiement (comme leur marque actuelle) |
| Ambiance | Confiance + qualité + simplicité |
| Différence vs actuel | Moins "template IA", plus d'identité propre, animations soignées |

---

## 6. Contenu à reprendre du site actuel

- Textes des services (lavage intérieur, canapé)
- Prix des packs (Confort 99€, Concession 129€ pour citadine)
- Grille tarifaire par type de véhicule
- Témoignages clients (6 avis)
- Images avant/après
- Liens réseaux sociaux (Instagram, TikTok, Snapchat)

---

## 7. Critères d'acceptation

- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility = 100
- [ ] Lighthouse SEO ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Mobile-first, beau sur iPhone 12-15
- [ ] Temps de chargement < 2s (LCP)
- [ ] Pas de CLS visible
- [ ] Animations respectent prefers-reduced-motion
- [ ] Toutes les images en WebP/AVIF avec next/image
- [ ] Structured data JSON-LD LocalBusiness valide

---

## 8. Planning (3 jours)

| Jour | Tâches |
|------|--------|
| **J1** | Setup Next.js + Tailwind + shadcn. Design system (couleurs, typo, tokens). Landing page : Hero + Social proof + Services + Avantages |
| **J2** | Landing page : Tarifs + Avant/Après + Témoignages + CTA + Footer. Page FAQ. Animations GSAP. |
| **J3** | Page Réservation (formulaire). SEO (meta, sitemap, schema). Performance tuning. Polish final + responsive check. |

---

## 9. Livrables finaux

1. Code source Next.js complet (repo ou zip)
2. Instructions de déploiement (README)
3. Captures d'écran desktop + mobile pour la démo au client
4. (Optionnel) Démo live sur Vercel gratuit pour montrer le résultat

---

## 10. Stratégie de vente au client

- Montrer le site actuel vs la refonte côte à côte
- Mettre en avant : performance (score Lighthouse), SEO, responsive mobile
- Prix suggéré : 300-500€ (raisonnable pour une PME locale, excellent pour toi)
- Proposer un appel de 5min via Instagram/TikTok DM pour présenter
- Préparer une courte vidéo avant/après du site (comme eux font avec les voitures)
