# Poste Litiges — installation sur Vercel

Le site où l'on dépose chaque soir le scan des litiges et les 4 tableaux Excel. Claude lit les BL, le site remplit les tableaux sans doublons et prépare le récap et les mails aux agences.

## Ce qu'il faut avant de commencer

| Quoi | Où | Pourquoi |
|---|---|---|
| Un compte Vercel (gratuit) | vercel.com | héberger le site |
| Une clé API Anthropic | console.anthropic.com → Settings → API Keys | lire l'écriture manuscrite sur les scans (payant à l'usage, il faut ajouter un peu de crédit dans **Billing**) |
| Node.js sur le Mac | nodejs.org (version LTS) | pour la commande `npx vercel` |

## Installation (15 minutes, une seule fois)

1. **Dézippe** le dossier `poste-litiges`, par exemple dans Téléchargements.
2. Ouvre **Terminal** et va dans le dossier :
   ```
   cd ~/Downloads/poste-litiges
   ```
3. **Crée le projet** sur Vercel. Il te demande de te connecter, ensuite réponds Entrée à toutes les questions :
   ```
   npx vercel
   ```
4. **Base partagée**, pour que ta collègue voie les mêmes adresses d'agences, la même équipe et les mêmes réglages que toi : sur vercel.com, ouvre le projet → onglet **Storage** → **Create Database** → **Upstash for Redis** (offre gratuite) → **Connect** au projet.
5. **Ajoute les deux secrets** (colle la valeur quand il te la demande) :
   ```
   npx vercel env add ANTHROPIC_API_KEY production
   npx vercel env add APP_PASSWORD production
   ```
   `APP_PASSWORD` est le mot de passe du site, commun à toute l'équipe litiges. Sans lui, n'importe qui qui a le lien peut utiliser ta clé Claude.
6. **Mets en ligne** :
   ```
   npx vercel --prod
   ```
   La commande affiche l'adresse du site (du genre `poste-litiges.vercel.app`).
7. Donne l'adresse et le mot de passe à ta collègue. Chacune/chacun choisit son prénom en haut à droite (« Je suis »). Pour ajouter quelqu'un, va dans **Réglages → Qui utilise le site**.

**Mettre à jour plus tard :** remplace les fichiers du dossier, puis relance `npx vercel --prod`.

**Autre méthode, sans Terminal :** mets le dossier dans un dépôt GitHub, puis sur vercel.com choisis **Add New → Project → Import**. Les étapes 4 et 5 se font alors dans **Settings → Environment Variables**.

## Premier soir

- Dans **Réglages** : l'adresse de Séb, ta signature, les initiales qu'on ne compte jamais (BPA est déjà mise), et la ligne de chaque emballeur (petites ou grandes barres).
- Les adresses des agences se remplissent au fur et à mesure, directement dans les mails de l'étape 4. Le site les garde ensuite.
- Le premier soir, vérifie bien les cartes de l'étape 3, pour voir comment Claude lit votre écriture.

## Réglages avancés (facultatif)

- `CLAUDE_MODEL` : le modèle utilisé pour lire les scans. Par défaut `claude-sonnet-5-5`. Si la lecture de l'écriture manuscrite n'est pas assez fiable, mets `claude-opus-5-5`, plus précis mais plus cher.

## Contenu du dossier

- `public/index.html` : le site
- `public/vendor/` : pdf.js et ExcelJS (lecture du PDF et des Excel, directement dans le navigateur)
- `api/read.js` : envoie une page scannée à Claude et renvoie ce qu'il a lu
- `api/config.js` : réglages partagés (Upstash Redis)
- `api/_auth.js` : vérification du mot de passe

Les fichiers Excel ne quittent jamais le navigateur. Seules les images des pages scannées sont envoyées à Claude pour la lecture.
