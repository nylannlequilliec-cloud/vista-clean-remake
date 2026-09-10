# Rapport d’audit sécurité — Vista Clean

## Résumé exécutif

Audit statique ciblé du site vitrine Next.js/React, complété par les vérifications de dépendances et de compilation. Aucun secret, sink DOM dangereux alimenté par une donnée utilisateur, injection de code ou vulnérabilité de dépendance connue n’a été confirmé. Deux sujets restent à traiter avant l’ouverture de véritables branchements serveur.

## Findings

### SBP-001 — CSP non appliquée — corrigé

- **Sévérité initiale :** Medium
- **Localisation :** `next.config.ts:48-50`
- **Preuve initiale :** `Content-Security-Policy-Report-Only`
- **Impact :** Le navigateur signale les violations mais ne bloque pas un script injecté. Une future régression XSS pourrait donc s’exécuter malgré la présence apparente d’une CSP.
- **Correction appliquée :** suppression de l’en-tête Report-Only ; `proxy.ts` publie désormais la CSP nonce en mode enforce. `unsafe-eval` reste limité au développement.
- **Note :** Le site actuel ne montre pas de chemin confirmé vers une XSS ; c’est une faiblesse de défense en profondeur.

### SBP-002 — Rate limiting local non distribué — différé jusqu’au branchement

- **Sévérité :** Medium (avant activation des API)
- **Localisation :** `src/lib/security/request.ts` — limiteur mémoire utilisé par les routes API
- **Preuve :** L’état des compteurs est conservé dans une structure mémoire du processus.
- **Impact :** Avec plusieurs instances, chaque instance possède son propre compteur. Un abus peut donc contourner la limite en répartissant les requêtes entre instances ou après redémarrage.
- **Correction recommandée :** Lors du branchement réel, utiliser un rate limiter partagé (Redis/KV/solution edge), avec une clé robuste et des limites distinctes par route et par adresse réseau.
- **Note :** Les routes retournent actuellement `503 service non configuré` et n’envoient aucune donnée à un fournisseur externe.

## Contrôles vérifiés

- `npm audit` : 0 vulnérabilité connue.
- Tests : 102 réussis.
- Build Next.js : réussi.
- Pas de `eval`, `new Function`, `innerHTML`, `postMessage` ou redirection contrôlée par l’utilisateur détecté dans le code applicatif.
- Les données personnelles du formulaire ne sont pas persistées dans `localStorage`.
- Les liens externes ouverts dans un nouvel onglet utilisent `noopener noreferrer`.
- Les routes API valident l’origine, le type de contenu, la taille, la forme des données et les valeurs autorisées.

## Points à vérifier au prochain branchement

1. Recalculer tous les prix, options et créneaux côté serveur.
2. Ajouter authentification/service-to-service, idempotence persistante et validation du paiement côté serveur.
3. Remplacer le limiteur mémoire par un stockage partagé.
4. Passer la CSP de Report-Only à Enforce après vérification des en-têtes en production.
