# Implementation Plan: Questionnaire de Devis / Réservation

## Overview

Ce plan décompose la conception du Tunnel en étapes de code incrémentales. Il applique la séparation logique/présentation décrite dans le design : la **couche logique pure** (`src/lib/devis/`) et ses **tests de propriété** (Vitest + fast-check) sont implémentées **avant** toute logique UI. Viennent ensuite les hooks d'orchestration (`useTunnel`, `useStepTransition`), les composants de présentation réutilisables, les cinq étapes, puis le câblage final qui remplace la page `/reservation`.

Toutes les tâches ciblent le projet Next.js 16 (App Router) situé dans `vista-clean/`, avec les chemins existants `src/app`, `src/components`, `src/lib`, et un nouveau dossier `src/hooks`. La stack imposée est respectée : Tailwind 4, shadcn/ui basé sur `@base-ui/react` (sans prop `asChild`), GSAP, Lucide React, TypeScript, thème violet + noir sombre par défaut, mobile-first, accessibilité complète.

Les 13 propriétés de correction de la conception portent sur la couche logique pure et sont chacune couvertes par un test de propriété dédié (fast-check, `numRuns: 100`, commentaire de traçabilité `// Feature: devis-questionnaire, Property {n}: ...`).

## Tasks

- [x] 1. Mise en place des dépendances et de l'outillage de test
  - Installer les dépendances runtime dans `vista-clean/` : `react-hook-form`, `zod`, `@hookform/resolvers`
  - Installer les dépendances de dev : `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  - Créer `vista-clean/vitest.config.ts` (environnement `jsdom`, alias `@/` → `src/`, globals activés)
  - Ajouter les scripts `test` (`vitest --run`) et `test:watch` dans `vista-clean/package.json`
  - Créer `vista-clean/src/lib/devis/__tests__/` et un fichier de setup testing-library (`vitest.setup.ts`)
  - _Requirements: 17.2, 17.4_

- [x] 2. Types partagés et source de tarification centralisée
  - [x] 2.1 Définir les types TypeScript de la couche logique
    - Créer `src/lib/devis/types.ts` avec `SupportId`, `PackId`, `OptionCategory`, `OptionId`, `TunnelMode`, `LieuType`, `StepId`
    - Définir les interfaces `Support`, `Pack`, `OptionDef`, `Creneau`, `TunnelState`, `PricingLine`, `PricingBreakdown`
    - _Requirements: 17.7, 3.1, 5.1, 6.1_

  - [x] 2.2 Implémenter la source de vérité tarifaire
    - Créer `src/lib/devis/pricing.ts` : `SUPPORTS` (10 supports pré-classés `mode`), `PACKS` (CONFORT 99 €, CONCESSION 129 € `popular`), `OPTIONS` regroupées par catégorie avec prix exacts
    - Exporter `SUPPLEMENT_GROUPE_ELECTROGENE = 5`, `ACOMPTE_RATE = 0.15`, et les accès typés `getSupport(id)`, `getPack(id)`, `getOption(id)`
    - _Requirements: 17.7, 3.1, 3.2, 5.2, 5.3, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x]* 2.3 Écrire le test de propriété d'intégrité des données de tarification
    - **Property 2: Intégrité des données de tarification**
    - **Validates: Requirements 3.2, 6.1, 6.2**
    - Cible `pricing.ts` : libellés non vides, prix finis ≥ 0, mode ∈ {prix, devis} + icône non vide par support, chaque option dans exactement une catégorie

  - [x]* 2.4 Écrire les tests d'exemple/snapshot des données de tarification
    - Vérifier la liste exacte des supports, packs et options avec leurs prix
    - _Requirements: 3.1, 5.2, 5.3, 6.3, 6.4, 6.5, 6.6_

- [x] 3. Logique de mode et calculs de prix
  - [x] 3.1 Implémenter la résolution de mode
    - Créer `src/lib/devis/mode.ts` avec `resolveMode(supportId): TunnelMode` dérivant le mode depuis `SUPPORTS`
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x]* 3.2 Écrire le test de propriété de partition des supports
    - **Property 3: `resolveMode` partitionne totalement les supports**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.5**

  - [x] 3.3 Implémenter les calculs de prix
    - Créer `src/lib/devis/calculations.ts` : `computeTotal(state)`, `computeAcompte(total)`, `formatEuro(amount)`, `computeFraisDeplacement(address)` (stratégie forfait/zonage isolée), et l'utilitaire pur de basculement d'options `toggleOption(options, id)`
    - _Requirements: 9.1, 9.3, 9.4, 8.5, 7.2, 7.4, 7.6, 6.7, 6.8_

  - [x]* 3.4 Écrire le test de propriété du Prix_Total et de l'Acompte
    - **Property 1: Invariant du Prix_Total et de l'Acompte**
    - **Validates: Requirements 7.2, 7.4, 7.6, 8.5, 9.1, 9.4**

  - [x]* 3.5 Écrire le test de propriété de basculement d'options
    - **Property 5: Basculement d'options — round-trip et somme**
    - **Validates: Requirements 6.7, 6.8**

  - [x]* 3.6 Écrire le test de propriété de formatage monétaire
    - **Property 12: Formatage monétaire**
    - **Validates: Requirements 9.3**

- [x] 4. Réconciliation de l'état sur changement de support
  - [x] 4.1 Implémenter `reconcileState`
    - Créer `src/lib/devis/reconcile.ts` avec `reconcileState(prev, nextSupport)` retirant les sélections devenues incompatibles selon le mode dérivé du nouveau support
    - _Requirements: 4.6, 12.3_

  - [x]* 4.2 Écrire le test de propriété de cohérence après changement de support
    - **Property 4: `reconcileState` produit un état cohérent après changement de support**
    - **Validates: Requirements 4.6, 12.3**

- [x] 5. Validation Zod et persistance
  - [x] 5.1 Implémenter les schémas de validation par étape
    - Créer `src/lib/devis/schema.ts` : `stepSchemas: Record<StepId, ZodSchema>`, messages d'erreur en français, `isValidFrenchPhone(value)` utilisé via `.refine`
    - _Requirements: 17.2, 17.3, 13.1, 13.2, 13.3, 13.5, 3.7, 5.6, 7.7, 8.7_

  - [x]* 5.2 Écrire le test de propriété de validation du téléphone français
    - **Property 13: Validation du numéro de téléphone français**
    - **Validates: Requirements 13.2**

  - [x] 5.3 Implémenter la (dé)sérialisation persistante
    - Créer `src/lib/devis/persistence.ts` : clé `vista-clean:devis:v1`, `serialize(state)`, `deserialize(raw)` (validation Zod, retourne `null` si corrompu/incompatible), gestion des accès `localStorage` indisponibles
    - _Requirements: 12.1, 12.2, 12.4_

  - [x]* 5.4 Écrire le test de propriété de round-trip de persistance
    - **Property 9: Round-trip de persistance**
    - **Validates: Requirements 12.2**

- [x] 6. Logique pure de navigation, créneaux et récapitulatif
  - [x] 6.1 Implémenter la logique de navigation et de validation
    - Créer `src/lib/devis/navigation.ts` : `STEP_ORDER`, `computeCompleted(state)`, `computeReachable(completed)`, `advance(state, activeIndex)` (avance ssi le sous-schéma de l'étape active est satisfait), `goToStep(activeIndex, target, reachable)`
    - _Requirements: 1.3, 1.4, 2.5, 2.6, 11.3, 11.4, 11.5, 12.1, 17.3_

  - [x]* 6.2 Écrire le test de propriété de gouvernance de l'avancement
    - **Property 6: La validation par étape gouverne l'avancement**
    - **Validates: Requirements 1.4, 11.4, 11.5, 17.3**

  - [x]* 6.3 Écrire le test de propriété des invariants de navigation
    - **Property 7: Invariants de navigation**
    - **Validates: Requirements 1.3, 2.5, 2.6**

  - [x]* 6.4 Écrire le test de propriété de préservation des données
    - **Property 8: La navigation préserve les données de l'État_Tunnel**
    - **Validates: Requirements 11.3, 12.1**

  - [x] 6.5 Implémenter la sélection de créneau
    - Créer `src/lib/devis/selection.ts` avec `selectCreneau(state, creneaux, targetId)` (rejette un créneau `full`, laisse `creneauId` inchangé)
    - _Requirements: 8.2, 8.3_

  - [x]* 6.6 Écrire le test de propriété de sélection de créneau
    - **Property 10: Sélection de créneau**
    - **Validates: Requirements 8.2, 8.3**

  - [x] 6.7 Implémenter la vue de données du Récapitulatif
    - Créer `src/lib/devis/recap.ts` avec `buildRecap(state, pricing)` exposant Support, Pack + prix, Options, lieu, Frais_Déplacement, Prix_Total, Acompte en `Mode_Prix` ; « sur devis » sans prix en `Mode_Devis`
    - _Requirements: 8.4, 9.5, 10.2_

  - [x]* 6.8 Écrire le test de propriété de complétude du Récapitulatif
    - **Property 11: Complétude du Récapitulatif**
    - **Validates: Requirements 8.4, 9.5, 10.2**

- [x] 7. Checkpoint - Couche logique pure
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Hooks d'orchestration
  - [x] 8.1 Implémenter `useTunnel`
    - Créer `src/hooks/use-tunnel.ts` : initialiser `useForm<TunnelState>` (hydratation depuis `localStorage`), dériver `mode` via `resolveMode`, recalculer `pricing` via `computeTotal`, exposer `goNext`/`goPrev`/`goToStep` (via `navigation.ts` + `form.trigger`), réconcilier sur changement de support (`reconcileState`), persister via `watch` (`serialize`), `submitReservation` et reset après succès
    - _Requirements: 1.2, 1.3, 1.4, 4.6, 9.1, 9.2, 10.3, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 17.1, 17.2, 17.3_

  - [x]* 8.2 Écrire les tests unitaires de `useTunnel`
    - État initial (Étape 1 active), avancement bloqué si invalide, persistance/hydratation, reset après succès, réconciliation sur changement de support
    - _Requirements: 1.2, 12.2, 12.4, 4.6_

  - [x] 8.3 Implémenter `useStepTransition`
    - Créer `src/hooks/use-step-transition.ts` : transitions GSAP (≤ 500 ms) via `gsap.context` + `gsap.matchMedia`, désactivation si `prefers-reduced-motion: reduce`
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x]* 8.4 Écrire le test de réduction des animations
    - Mock de `matchMedia` (`prefers-reduced-motion: reduce`) : transition instantanée, changement d'étape fonctionnel
    - _Requirements: 14.3_

- [x] 9. Composants de présentation réutilisables
  - [x] 9.1 Implémenter `SupportCard`
    - Créer `src/components/devis/support-card.tsx` : carte sélectionnable, cible tactile ≥ 44×44 px, `role="radio"`/`aria-checked`, focus visible, état non chromatique (bordure + icône)
    - _Requirements: 3.2, 3.3, 3.4, 15.3, 16.2, 16.5, 16.6_

  - [x] 9.2 Implémenter `OptionItem`
    - Créer `src/components/devis/option-item.tsx` : checkbox multi-sélection, icône `Info` (Lucide) + infobulle `@base-ui/react` au survol/focus, `role="checkbox"`/`aria-checked`
    - _Requirements: 6.2, 6.7, 6.9, 16.2, 16.6_

  - [x] 9.3 Implémenter `VehicleHelp`
    - Créer `src/components/devis/vehicle-help.tsx` : lien « Un doute sur ton type de véhicule ? regarde ici » révélant un contenu d'aide identifiant les types de véhicules
    - _Requirements: 3.5, 3.6_

  - [x] 9.4 Implémenter `ProgressBar`
    - Créer `src/components/devis/progress-bar.tsx` : 5 pastilles numérotées + libellé, mise en évidence de l'étape active (`aria-current="step"`), icône `Check` sur les complétées, étapes non accessibles `disabled`/`aria-disabled`, région live pour annoncer le changement d'étape
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 16.4, 16.6_

  - [x] 9.5 Implémenter `StepNavigation`
    - Créer `src/components/devis/step-navigation.tsx` : bouton « Continuer » (déclenche validation puis avance), contrôle « Retour » masqué à l'Étape 1, via `buttonVariants` (pas de `asChild`)
    - _Requirements: 11.1, 11.2, 17.5_

  - [x] 9.6 Implémenter `StickyRecap`
    - Créer `src/components/devis/sticky-recap.tsx` : colonne collante desktop (≥ 768 px), drawer/barre repliable mobile (`@base-ui/react`), consomme `buildRecap`, masque le prix et affiche « Tarification sur devis » en `Mode_Devis`
    - _Requirements: 8.4, 9.5, 10.1, 10.2, 10.4, 15.2_

  - [x]* 9.7 Écrire les tests de composants et d'accessibilité des composants réutilisables
    - Navigation clavier, `aria-checked`/`aria-current`/`aria-live`, focus visible, distinction d'état non chromatique, infobulles, aide véhicule
    - _Requirements: 2.2, 2.3, 2.4, 3.6, 6.9, 16.1, 16.2, 16.4, 16.5, 16.6_

- [x] 10. Composants d'étape et formulaire de devis
  - [x] 10.1 Implémenter `StepLavage`
    - Créer `src/components/devis/steps/step-lavage.tsx` : grille responsive de `SupportCard` (radiogroup accessible), intégration `VehicleHelp`, sélection unique dans `État_Tunnel`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 15.1, 15.2, 15.4_

  - [x] 10.2 Implémenter `StepPack`
    - Créer `src/components/devis/steps/step-pack.tsx` : deux cartes comparatives CONFORT/CONCESSION (prix, prestations, durée, badge « POPULAIRE »), sélection unique, affiché en `Mode_Prix`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 10.3 Implémenter `StepOptions`
    - Créer `src/components/devis/steps/step-options.tsx` : options groupées par `Catégorie_Option` via `OptionItem`, multi-sélection, recalcul du prix, avancement autorisé sans sélection
    - _Requirements: 6.1, 6.7, 6.8, 6.9, 6.10, 9.2_

  - [x] 10.4 Implémenter `StepLieu`
    - Créer `src/components/devis/steps/step-lieu.tsx` : choix local (frais 0 €) / domicile (champ adresse + validation + avertissement groupe électrogène 5 € + case absence d'électricité)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 13.3_

  - [x] 10.5 Implémenter `StepPaiement`
    - Créer `src/components/devis/steps/step-paiement.tsx` : calendrier de `Créneau` (« Complet » non sélectionnable), `StickyRecap` détaillé, acompte 15 %, bouton « Réserver mon lavage », FAQ (accordion existant)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.11_

  - [x] 10.6 Implémenter `DevisRequestForm`
    - Créer `src/components/devis/devis-request-form.tsx` : formulaire `Mode_Devis` collectant prénom, téléphone (validé), description du besoin, sans étapes de prix/acompte
    - _Requirements: 4.3, 4.4, 9.5, 13.1, 13.2, 13.5_

  - [x]* 10.7 Écrire les tests de composants d'étape et edge cases de validation
    - Support/pack/créneau manquants bloquent l'avancement avec le bon message, domicile sans adresse validée, rendu conditionnel du mode
    - _Requirements: 3.7, 5.6, 7.7, 8.7, 13.1, 13.3, 13.4, 4.3_

- [x] 11. Checkpoint - Composants et étapes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Intégration et câblage final
  - [x] 12.1 Implémenter `TunnelClient`
    - Créer `src/components/devis/tunnel-client.tsx` (`"use client"`) : appelle `useTunnel`, rend `ProgressBar` + étape active + `StickyRecap` + `StepNavigation` en `Mode_Prix` ou `DevisRequestForm` en `Mode_Devis`, conteneur animé référencé par `useStepTransition`, gestion succès/échec du paiement (message + état conservé sur échec)
    - _Requirements: 1.1, 1.3, 4.3, 4.5, 8.8, 8.9, 8.10, 10.1, 14.1_

  - [x] 12.2 Remplacer la page `/reservation` par le Tunnel
    - Réécrire `src/app/reservation/page.tsx` (Server Component) : `metadata` (« Devis & Réservation | Vista Clean »), rend `Navbar`, `TunnelClient`, `Footer`, `WhatsAppButton`
    - _Requirements: 1.5, 17.4, 17.6_

  - [x]* 12.3 Écrire les tests d'intégration du flux de réservation
    - Mock du prestataire de paiement : succès (confirmation + reset de la persistance), échec (message + état conservé)
    - _Requirements: 8.8, 8.9, 8.10, 12.4_

  - [x]* 12.4 Écrire le test d'intégration d'accessibilité du Tunnel
    - Navigation clavier de bout en bout, annonce du changement d'étape, étiquettes accessibles sur tous les contrôles
    - _Requirements: 16.1, 16.2, 16.4, 16.5_

- [x] 13. Checkpoint final - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Les tâches marquées d'un `*` sont optionnelles (tests) et peuvent être ignorées pour un MVP plus rapide.
- La couche logique pure (`src/lib/devis/`) et ses tests de propriété sont implémentés avant toute UI, conformément à la stratégie de test de la conception.
- Chaque propriété de correction possède son propre test de propriété dédié (fast-check, `numRuns: 100`, commentaire de traçabilité).
- Chaque tâche référence des sous-exigences précises pour la traçabilité.
- Les checkpoints assurent une validation incrémentale.
- Le paiement de l'acompte est délégué à un prestataire sécurisé ; l'endpoint d'initialisation doit être authentifié/validé côté serveur (exigence de sécurité signalée pour l'implémentation).
- Rappel stack : shadcn/ui basé sur `@base-ui/react` **sans prop `asChild`**, transitions GSAP, thème violet + noir sombre par défaut, mobile-first, contraste ≥ 4,5:1.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["3.1", "3.3", "5.1", "5.3", "2.3", "2.4"] },
    { "id": 4, "tasks": ["3.2", "3.4", "3.5", "3.6", "4.1", "5.2", "5.4", "6.1", "6.5", "6.7"] },
    { "id": 5, "tasks": ["4.2", "6.2", "6.3", "6.4", "6.6", "6.8"] },
    { "id": 6, "tasks": ["8.1", "8.3"] },
    { "id": 7, "tasks": ["8.2", "8.4", "9.1", "9.2", "9.3", "9.4", "9.5", "9.6"] },
    { "id": 8, "tasks": ["9.7", "10.1", "10.2", "10.3", "10.4", "10.5", "10.6"] },
    { "id": 9, "tasks": ["10.7", "12.1"] },
    { "id": 10, "tasks": ["12.2"] },
    { "id": 11, "tasks": ["12.3", "12.4"] }
  ]
}
```
