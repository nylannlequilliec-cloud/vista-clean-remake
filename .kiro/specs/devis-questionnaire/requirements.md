# Requirements Document

## Introduction

Ce document décrit les exigences du **Questionnaire de Devis / Réservation** de Vista Clean, un tunnel de commande multi-étapes destiné à remplacer et améliorer la page `/reservation` actuelle (formulaire Formspree simple). Vista Clean propose du nettoyage d'intérieur de voiture et de canapés en Île-de-France.

Le tunnel guide le client à travers cinq étapes séquentielles — choix du support à laver, choix du pack, options additionnelles, lieu de nettoyage, puis paiement/réservation avec acompte — tout en affichant un calcul de prix en temps réel et un récapitulatif visible en permanence. Certaines sélections basculent le parcours vers une **demande de devis** plutôt que vers le tunnel de prix standard.

L'objectif produit est de reproduire la structure du tunnel du site d'origine tout en offrant une expérience visuellement supérieure : illustrations soignées, transitions animées (GSAP), récapitulatif de prix collant, meilleure ergonomie mobile, et accessibilité complète. La stack cible est Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui (base `@base-ui/react`, sans prop `asChild`), GSAP, Lucide React et TypeScript, avec thème violet + noir (sombre par défaut, clair via `?theme=light`).

## Glossary

- **Tunnel**: Parcours complet du questionnaire de devis/réservation composé de cinq étapes séquentielles.
- **Système**: L'application front-end du questionnaire multi-étapes exécutée dans le navigateur du client.
- **Client**: Utilisateur final qui remplit le questionnaire pour obtenir un devis ou réserver une prestation.
- **Étape**: Une des cinq phases numérotées du tunnel (Lavage, Pack, Options, Lieu, Paiement).
- **Support**: Objet à nettoyer sélectionné à l'étape 1 (type de véhicule ou type de canapé/textile).
- **Pack**: Formule de prestation (CONFORT ou CONCESSION) sélectionnée à l'étape 2.
- **Option**: Prestation additionnelle payante sélectionnable à l'étape 3, regroupée par catégorie.
- **Catégorie_Option**: Regroupement d'options (TRAITEMENT, SHAMPOING, SUPPLÉMENTS, OPTIONS).
- **Mode_Devis**: État du parcours dans lequel le prix n'est pas calculé automatiquement et le Client est orienté vers une demande de devis personnalisée.
- **Mode_Prix**: État du parcours standard dans lequel le prix total est calculé automatiquement.
- **Frais_Déplacement**: Montant ajouté au prix total lorsque la prestation est réalisée à domicile, calculé selon l'adresse.
- **Supplément_Groupe_Électrogène**: Supplément de 5 € appliqué en l'absence de point d'électricité au lieu de nettoyage.
- **Acompte**: Montant correspondant à 15 % du prix total, réglé pour confirmer la réservation.
- **Prix_Total**: Somme du prix du Pack, des Options sélectionnées, des Frais_Déplacement et des suppléments applicables.
- **Récapitulatif**: Zone d'interface affichant en continu les choix du Client et le Prix_Total.
- **Barre_Progression**: Composant affichant les cinq Étapes numérotées et leur état d'avancement.
- **Créneau**: Plage horaire réservable proposée dans le calendrier de l'étape 5.
- **État_Tunnel**: Ensemble des données saisies par le Client à travers les étapes (support, pack, options, lieu, créneau).
- **Gestionnaire_Formulaire**: Bibliothèque de gestion d'état et de validation du formulaire multi-étapes.

## Requirements

### Requirement 1: Structure générale du tunnel

**User Story:** En tant que Client, je veux un parcours clair en cinq étapes, afin de configurer ma prestation puis réserver sans confusion.

#### Acceptance Criteria

1. THE Système SHALL présenter le Tunnel sous la forme de cinq Étapes ordonnées : (1) Lavage, (2) Pack, (3) Options, (4) Lieu, (5) Paiement.
2. WHEN le Client accède au Tunnel, THE Système SHALL afficher l'Étape 1 comme Étape active.
3. THE Système SHALL afficher une seule Étape active à la fois.
4. WHERE le Client n'a pas complété les champs requis de l'Étape active, THE Système SHALL empêcher l'accès à l'Étape suivante.
5. THE Système SHALL remplacer la page `/reservation` existante par le Tunnel.

### Requirement 2: Barre de progression

**User Story:** En tant que Client, je veux voir ma progression, afin de savoir où j'en suis et combien d'étapes restent.

#### Acceptance Criteria

1. THE Barre_Progression SHALL afficher les cinq Étapes avec un numéro et un libellé pour chaque Étape.
2. WHEN une Étape est complétée, THE Barre_Progression SHALL afficher un indicateur de complétion sur cette Étape.
3. WHILE une Étape est active, THE Barre_Progression SHALL mettre en évidence visuellement l'Étape active.
4. THE Barre_Progression SHALL distinguer visuellement, par au moins un moyen autre que la couleur, les Étapes complétées, l'Étape active et les Étapes non commencées.
5. WHEN le Client sélectionne une Étape déjà complétée dans la Barre_Progression, THE Système SHALL afficher cette Étape.
6. IF le Client sélectionne dans la Barre_Progression une Étape non encore accessible, THEN THE Système SHALL empêcher la navigation vers cette Étape.

### Requirement 3: Étape 1 - Choix du support à laver

**User Story:** En tant que Client, je veux choisir ce que je souhaite faire nettoyer, afin d'adapter la suite du parcours à mon besoin.

#### Acceptance Criteria

1. THE Système SHALL afficher à l'Étape 1 une grille de cartes représentant les Supports suivants : Citadine, Berline, SUV, Monospace 5 places, Monospace 7 places, Utilitaire, Canapé sans angle, Canapé avec angle, Tapis/matelas/canapé en U/autre, Demande spécifique.
2. THE Système SHALL afficher pour chaque carte de Support une icône ou illustration visuelle et un libellé.
3. WHEN le Client sélectionne une carte de Support, THE Système SHALL enregistrer ce Support dans l'État_Tunnel comme sélection unique.
4. WHEN un Support est sélectionné, THE Système SHALL indiquer visuellement la carte sélectionnée.
5. THE Système SHALL afficher un lien intitulé « Un doute sur ton type de véhicule ? regarde ici ».
6. WHEN le Client active le lien d'aide au choix du véhicule, THE Système SHALL afficher un contenu d'aide identifiant les types de véhicules.
7. IF le Client tente de passer à l'Étape 2 sans avoir sélectionné de Support, THEN THE Système SHALL empêcher le passage et afficher un message indiquant qu'une sélection est requise.

### Requirement 4: Logique de basculement en demande de devis

**User Story:** En tant que Client ayant un besoin non standard, je veux être orienté vers une demande de devis, afin d'obtenir un prix personnalisé au lieu d'un tarif automatique inadapté.

#### Acceptance Criteria

1. WHERE le Support sélectionné est Utilitaire, Tapis/matelas/canapé en U/autre, ou Demande spécifique, THE Système SHALL activer le Mode_Devis.
2. WHERE le Support sélectionné est Citadine, Berline, SUV, Monospace 5 places, Monospace 7 places, Canapé sans angle, ou Canapé avec angle, THE Système SHALL activer le Mode_Prix.
3. WHILE le Mode_Devis est actif, THE Système SHALL orienter le Client vers un formulaire de demande de devis au lieu des étapes de calcul de prix (Pack, Options, Paiement avec acompte).
4. WHILE le Mode_Devis est actif, THE Système SHALL collecter les coordonnées du Client (prénom, téléphone) et une description du besoin.
5. WHILE le Mode_Prix est actif, THE Système SHALL présenter les Étapes de choix de Pack, d'Options et de Paiement avec acompte.
6. WHEN le Client change de Support après avoir progressé dans le Tunnel, THE Système SHALL réévaluer l'activation du Mode_Devis ou du Mode_Prix selon le nouveau Support.

### Requirement 5: Étape 2 - Choix du pack

**User Story:** En tant que Client, je veux comparer les packs et en choisir un, afin de sélectionner la prestation adaptée à mon budget.

#### Acceptance Criteria

1. WHILE le Mode_Prix est actif, THE Système SHALL afficher à l'Étape 2 les Packs CONFORT et CONCESSION sous forme de cartes comparatives.
2. THE Système SHALL afficher pour le Pack CONFORT le prix de 99 €, la liste des prestations incluses et la durée estimée de 1h10 à 1h45.
3. THE Système SHALL afficher pour le Pack CONCESSION le prix de 129 €, la liste des prestations incluses, la durée estimée de 2h30 à 3h et un badge « POPULAIRE ».
4. WHEN le Client sélectionne un Pack, THE Système SHALL enregistrer ce Pack dans l'État_Tunnel comme sélection unique.
5. WHEN un Pack est sélectionné, THE Système SHALL indiquer visuellement la carte du Pack sélectionné.
6. IF le Client tente de passer à l'Étape 3 sans avoir sélectionné de Pack, THEN THE Système SHALL empêcher le passage et afficher un message indiquant qu'une sélection est requise.

### Requirement 6: Étape 3 - Choix des options

**User Story:** En tant que Client, je veux ajouter des options à ma prestation, afin de personnaliser le nettoyage selon mes besoins.

#### Acceptance Criteria

1. THE Système SHALL afficher à l'Étape 3 les Options regroupées par Catégorie_Option : TRAITEMENT, SHAMPOING, SUPPLÉMENTS et OPTIONS.
2. THE Système SHALL afficher pour chaque Option son nom et son prix.
3. THE Système SHALL proposer dans la catégorie TRAITEMENT : Traitement du cuir (50 €), Alcantara (50 €), Ozone (50 €), Vapeur (30 €), Antimoisissure (60 €), Cuir hors sièges (25 €).
4. THE Système SHALL proposer dans la catégorie SHAMPOING : Siège auto bébé (10 €), Coffre (20 €), Plafonnier (60 €).
5. THE Système SHALL proposer dans la catégorie SUPPLÉMENTS : Véhicule pas vidé (25 €).
6. THE Système SHALL proposer dans la catégorie OPTIONS : Rénovation des 2 phares (60 €), Intérieur clair (30 €), Tapis supplémentaire (20 €), Tapis de coffre (15 €), Sous coffre (25 €), Senteur Parfum (15 €), Gonflage des pneus (5 €), Remplissage lave-glace (10 €), Nettoyage des ceintures (20 €).
7. THE Système SHALL permettre la sélection simultanée de plusieurs Options (multi-sélection).
8. WHEN le Client sélectionne ou désélectionne une Option, THE Système SHALL mettre à jour l'État_Tunnel et recalculer le Prix_Total.
9. WHERE une Option dispose d'une information complémentaire, THE Système SHALL afficher une icône d'information révélant une infobulle descriptive au survol ou à l'activation.
10. THE Système SHALL autoriser le passage à l'Étape 4 même si aucune Option n'est sélectionnée.

### Requirement 7: Étape 4 - Lieu de nettoyage

**User Story:** En tant que Client, je veux indiquer où la prestation se déroule, afin que les frais et contraintes de déplacement soient pris en compte.

#### Acceptance Criteria

1. THE Système SHALL proposer à l'Étape 4 deux choix de lieu : « Dans mon local (Vitry-sur-Seine 94400) » et « À domicile ».
2. WHEN le Client sélectionne « Dans mon local », THE Système SHALL fixer les Frais_Déplacement à 0 €.
3. WHERE le Client sélectionne « À domicile », THE Système SHALL afficher un champ de saisie d'adresse et un bouton de validation de l'adresse.
4. WHEN le Client valide une adresse à domicile, THE Système SHALL calculer les Frais_Déplacement et les ajouter au Prix_Total.
5. WHERE le Client sélectionne « À domicile », THE Système SHALL afficher l'avertissement « Supplément de 5 € pour le groupe électrogène si pas de point d'électricité ».
6. WHEN le Client indique l'absence de point d'électricité, THE Système SHALL ajouter le Supplément_Groupe_Électrogène de 5 € au Prix_Total.
7. IF le Client sélectionne « À domicile » sans valider d'adresse, THEN THE Système SHALL empêcher le passage à l'Étape 5 et afficher un message demandant une adresse valide.

### Requirement 8: Étape 5 - Paiement et réservation

**User Story:** En tant que Client, je veux choisir un créneau et régler l'acompte, afin de confirmer ma réservation.

#### Acceptance Criteria

1. THE Système SHALL afficher à l'Étape 5 un calendrier de disponibilités présentant des Créneaux par jour.
2. WHERE un Créneau est complet, THE Système SHALL l'afficher avec la mention « Complet » et le rendre non sélectionnable.
3. WHEN le Client sélectionne un Créneau disponible, THE Système SHALL enregistrer ce Créneau dans l'État_Tunnel.
4. THE Système SHALL afficher un Récapitulatif comprenant le Support choisi, le Pack et son prix, les Options sélectionnées, le lieu, les Frais_Déplacement, le Prix_Total, l'Acompte à régler et les avertissements applicables.
5. THE Système SHALL calculer l'Acompte comme 15 % du Prix_Total.
6. THE Système SHALL afficher un bouton « Réserver mon lavage ».
7. IF le Client active « Réserver mon lavage » sans avoir sélectionné de Créneau, THEN THE Système SHALL empêcher la soumission et afficher un message demandant un Créneau.
8. WHEN le Client confirme la réservation, THE Système SHALL initier le règlement sécurisé de l'Acompte.
9. IF le règlement de l'Acompte échoue, THEN THE Système SHALL afficher un message d'erreur et conserver l'État_Tunnel.
10. WHEN le règlement de l'Acompte réussit, THE Système SHALL afficher une confirmation de réservation au Client.
11. THE Système SHALL afficher une FAQ à l'Étape 5 comprenant au minimum les questions « Pourquoi un acompte ? » et « Que se passe-t-il après le paiement ? ».

### Requirement 9: Calcul de prix en temps réel

**User Story:** En tant que Client, je veux voir le prix évoluer à chaque choix, afin de maîtriser mon budget pendant la configuration.

#### Acceptance Criteria

1. THE Système SHALL calculer le Prix_Total comme la somme du prix du Pack, du prix cumulé des Options sélectionnées, des Frais_Déplacement et du Supplément_Groupe_Électrogène applicable.
2. WHEN le Client modifie une sélection influant sur le prix, THE Système SHALL recalculer et afficher le Prix_Total mis à jour dans un délai inférieur à 300 ms.
3. THE Système SHALL afficher chaque montant du Prix_Total en euros avec deux décimales au maximum.
4. WHILE le Mode_Prix est actif et qu'aucun Pack n'est encore sélectionné, THE Système SHALL afficher un Prix_Total limité au cumul des éléments déjà choisis.
5. WHILE le Mode_Devis est actif, THE Système SHALL masquer le Prix_Total automatique et afficher une indication de tarification sur devis.

### Requirement 10: Récapitulatif collant

**User Story:** En tant que Client, je veux garder mon récapitulatif sous les yeux, afin de vérifier mes choix et le prix tout au long du tunnel.

#### Acceptance Criteria

1. WHILE le Mode_Prix est actif, THE Système SHALL afficher le Récapitulatif de façon persistante à travers les Étapes 2 à 5.
2. THE Récapitulatif SHALL afficher le Support choisi, le Pack, les Options sélectionnées, le lieu et le Prix_Total.
3. WHEN une sélection du Client change, THE Système SHALL mettre à jour le Récapitulatif dans un délai inférieur à 300 ms.
4. WHERE la largeur de l'écran est inférieure à 768 px, THE Système SHALL présenter le Récapitulatif dans un format adapté au mobile qui reste accessible à tout moment.

### Requirement 11: Navigation entre étapes

**User Story:** En tant que Client, je veux avancer et revenir en arrière entre les étapes, afin de corriger mes choix sans repartir de zéro.

#### Acceptance Criteria

1. THE Système SHALL afficher un bouton « Continuer » pour passer de l'Étape active à l'Étape suivante.
2. WHERE l'Étape active n'est pas la première, THE Système SHALL afficher un contrôle de retour vers l'Étape précédente.
3. WHEN le Client revient à une Étape précédente, THE Système SHALL conserver les choix déjà saisis pour cette Étape.
4. WHEN le Client active « Continuer » alors que les champs requis de l'Étape active sont valides, THE Système SHALL afficher l'Étape suivante.
5. IF les champs requis de l'Étape active sont invalides ou manquants, THEN THE Système SHALL empêcher l'avancement et afficher les messages de validation correspondants.

### Requirement 12: Persistance de l'état

**User Story:** En tant que Client, je veux que mes choix soient conservés, afin de ne pas les perdre en revenant en arrière ou en rechargeant la page.

#### Acceptance Criteria

1. WHEN le Client navigue entre les Étapes, THE Système SHALL conserver l'État_Tunnel.
2. WHEN le Client recharge la page du Tunnel, THE Système SHALL restaurer l'État_Tunnel précédemment saisi.
3. WHEN le Client modifie une sélection à une Étape antérieure qui invalide une sélection ultérieure, THE Système SHALL mettre à jour les Étapes concernées de manière cohérente.
4. WHEN la réservation est confirmée avec succès, THE Système SHALL réinitialiser l'État_Tunnel persistant.

### Requirement 13: Validation des saisies

**User Story:** En tant que Client, je veux être informé clairement des erreurs de saisie, afin de les corriger facilement.

#### Acceptance Criteria

1. WHEN le Client soumet une Étape comportant un champ requis vide, THE Système SHALL afficher un message d'erreur associé à ce champ.
2. WHERE un champ de téléphone est requis, THE Système SHALL vérifier que la valeur saisie correspond à un format de numéro de téléphone français.
3. WHERE un champ d'adresse est requis pour une prestation à domicile, THE Système SHALL vérifier que le champ d'adresse est renseigné avant de valider l'adresse.
4. WHEN une valeur invalide est corrigée en une valeur valide, THE Système SHALL retirer le message d'erreur correspondant.
5. THE Système SHALL présenter les messages d'erreur en français.

### Requirement 14: Animations et transitions

**User Story:** En tant que Client, je veux des transitions fluides et cohérentes, afin de vivre une expérience agréable et haut de gamme.

#### Acceptance Criteria

1. WHEN le Client passe d'une Étape à une autre, THE Système SHALL jouer une transition animée entre les Étapes à l'aide de GSAP.
2. THE Système SHALL maintenir une cohérence visuelle des animations avec le fond animé et le style existants du site.
3. WHERE le Client a activé la préférence système « réduction des animations », THE Système SHALL réduire ou désactiver les animations non essentielles.
4. THE Système SHALL maintenir la durée des transitions d'Étape à 500 ms au maximum.

### Requirement 15: Responsive mobile-first

**User Story:** En tant que Client sur mobile, je veux un tunnel confortable sur petit écran, afin de réserver aussi facilement que sur ordinateur.

#### Acceptance Criteria

1. THE Système SHALL présenter le Tunnel selon une approche mobile-first adaptée aux largeurs à partir de 320 px.
2. WHERE la largeur de l'écran est inférieure à 768 px, THE Système SHALL adapter la grille de cartes et le Récapitulatif au format mobile.
3. THE Système SHALL rendre chaque élément interactif accessible avec une cible tactile d'au moins 44 × 44 pixels.
4. THE Système SHALL présenter le contenu sans défilement horizontal sur les largeurs à partir de 320 px.

### Requirement 16: Accessibilité

**User Story:** En tant que Client utilisant un clavier ou une technologie d'assistance, je veux naviguer dans tout le tunnel, afin de réserver sans obstacle.

#### Acceptance Criteria

1. THE Système SHALL permettre la navigation et la sélection de tous les contrôles interactifs du Tunnel au clavier.
2. THE Système SHALL associer une étiquette accessible à chaque champ de saisie, carte sélectionnable, option et bouton.
3. THE Système SHALL maintenir un ratio de contraste d'au moins 4,5:1 pour le texte normal dans les thèmes sombre et clair.
4. WHEN l'Étape active change, THE Système SHALL communiquer le changement d'Étape aux technologies d'assistance.
5. THE Système SHALL afficher un indicateur de focus visible sur l'élément interactif actuellement ciblé au clavier.
6. THE Système SHALL indiquer l'état des sélections (sélectionné, non sélectionné, désactivé) par un moyen autre que la seule couleur.

### Requirement 17: Gestion du formulaire multi-étapes (exigences non-fonctionnelles)

**User Story:** En tant que développeur, je veux une gestion d'état et de validation robuste et adaptée, afin de fiabiliser le tunnel multi-étapes et sa maintenance.

#### Acceptance Criteria

1. THE Système SHALL gérer l'État_Tunnel et la validation au moyen d'un Gestionnaire_Formulaire dédié aux formulaires multi-étapes.
2. THE Système SHALL utiliser React Hook Form pour la gestion de l'état du formulaire et Zod pour la définition et la validation des schémas de données.
3. THE Système SHALL valider les données de chaque Étape via un schéma Zod avant d'autoriser l'avancement.
4. THE Système SHALL implémenter le Tunnel avec la stack imposée : Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui basé sur `@base-ui/react`, GSAP, Lucide React et TypeScript.
5. THE Système SHALL implémenter les composants shadcn/ui sans utiliser la prop `asChild`.
6. THE Système SHALL appliquer le thème violet + noir en mode sombre par défaut et le mode clair lorsque le paramètre d'URL `?theme=light` est présent.
7. THE Système SHALL centraliser les données de tarification (Supports, Packs, Options et prix) dans une source de données typée unique.
