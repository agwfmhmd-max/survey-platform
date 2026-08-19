# Mise à jour de la plateforme d’enquête

## Résumé

La plateforme a été refondue pour devenir une interface d’enquête académique bilingue, moderne, mobile-first et compatible avec l’architecture Supabase existante. Les tables, l’authentification administrateur, le mécanisme de session, l’envoi des réponses et la vue agrégée publique ont été conservés.

## Fichiers modifiés

| Fichier | Modification |
| --- | --- |
| `src/SondageAssuranceParametrique.jsx` | Refonte complète de l’accueil, questionnaire par étapes, cartes de choix, progression, écran de succès, support français/arabe RTL, dashboard administrateur, gestion CRUD logique des questions, résultats agrégés et gestion d’erreurs. |
| `src/index.css` | Nouvelle identité visuelle académique, responsive design mobile-first, états hover/focus/loading/error/success, cartes, navigation et dashboard. |
| `src/lib/supabaseClient.js` | Ajout d’un client de repli qui évite l’écran blanc lorsque les variables Supabase manquent et affiche une erreur récupérable. Avec les variables présentes, le client Supabase réel est utilisé. |
| `index.html` | Métadonnées, description, langue/direction initiales et titre mis à jour. |
| `DEFAULT_SURVEY_QUESTIONS.sql` | Seed idempotent de 16 questions académiques bilingues et de leurs options, sans suppression de données existantes. |
| `package.json` | Suppression de la dépendance Recharts devenue inutile après le remplacement par des graphiques CSS légers. |
| `package-lock.json` | Régénéré après la mise à jour des dépendances. |
| `UPDATES.md` | Présente note de livraison. |

## Fonctionnalités principales

Le questionnaire affiche désormais une question à la fois, conserve les réponses pendant la navigation, indique la progression, distingue les questions obligatoires et facultatives et propose des cartes interactives pour les choix uniques ou multiples. Le formulaire fonctionne en français et en arabe avec adaptation automatique de la direction LTR/RTL.

L’espace administrateur conserve son accès caché par cinq clics sur le nom de la plateforme. Il conserve la session Supabase, permet d’ajouter, modifier, activer, désactiver et réordonner les questions, ainsi que de gérer leurs options. La suppression est volontairement traitée comme une désactivation afin de préserver l’historique des réponses de recherche.

Les résultats restent accessibles uniquement dans l’espace administrateur et sont affichés sous forme agrégée. Les données individuelles et les identifiants des répondants ne sont pas exposés dans l’interface publique.

## SQL nécessaire

Aucune migration de schéma n’est requise. Le fichier `DEFAULT_SURVEY_QUESTIONS.sql` est facultatif : exécutez-le une seule fois dans Supabase si les questions académiques ne sont pas encore présentes. Il n’efface aucune question ni réponse existante et ignore les questions déjà enregistrées.

## Validation

La commande `npm install --no-audit --no-fund` a été exécutée avec succès. La commande `npm run build` a également été exécutée avec succès. Le bundle JavaScript final est passé d’environ 773 kB à environ 193 kB minifiés après le retrait de Recharts et l’utilisation de graphiques CSS légers.

Pour lancer le projet :

```bash
cp .env.example .env
# renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```
