# Budget mariage — à valider à deux

Application de gestion et de **validation** du budget de mariage, pensée pour un binôme.
Chaque dépense proposée par l'un arrive chez l'autre sous forme de carte à trancher, avec son
impact chiffré sur le budget. Une dépense n'est « validée » que quand vous l'avez tous les deux
approuvée ; un seul refus la met de côté.

- **Accueil** — budget max, validé, en attente, déjà payé, estimation totale, alertes de
  dépassement, répartition par poste, dernière activité.
- **À décider** — la file de décisions. Carte par carte : montant, écart avec l'enveloppe de la
  catégorie, budget restant si tu valides. Valider / refuser (au clic ou en glissant la carte),
  reporter, laisser un mot.
- **Budget** — les catégories groupées, leur enveloppe prévue, leur consommation réelle, et les
  dépenses de chaque poste.
- **Réglages** — nom du projet, date, budget max, prénoms, et le code à donner à ton binôme.

Tout est synchronisé en direct entre vos deux téléphones (Supabase Realtime).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth +
Realtime) · déploiement Vercel.

## Voir l'app tout de suite

```bash
npm install
npm run dev
```

Puis ouvre **http://localhost:3000/?demo=1** : un jeu de données de démonstration, entièrement en
mémoire, pour cliquer partout sans base de données. Rien n'est enregistré.

## Mise en place de Supabase (une fois, ~5 min)

### 1. Créer le projet

Sur [supabase.com](https://supabase.com), crée un projet (plan gratuit suffisant). Choisis une
région européenne, par exemple `eu-west-3`.

### 2. Créer les tables

Dans le tableau de bord Supabase : **SQL Editor** → **New query** → colle tout le contenu de
[`supabase/schema.sql`](supabase/schema.sql) → **Run**.

Le script est idempotent : tu peux le relancer sans rien casser. Il crée les tables, les règles de
sécurité (chacun ne voit que son propre mariage), les deux fonctions `create_wedding` /
`join_wedding`, et active la synchro temps réel.

### 3. Récupérer les deux clés

**Project Settings** → **API** :

| Valeur                | Variable                        |
| --------------------- | ------------------------------- |
| Project URL           | `NEXT_PUBLIC_SUPABASE_URL`      |
| Project API key `anon` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

La clé `anon` est faite pour être publique : la sécurité repose sur les règles RLS du script SQL.
Ne mets **jamais** la clé `service_role` dans ce projet.

### 4. Autoriser les URL de connexion

**Authentication** → **URL Configuration** :

- *Site URL* : `http://localhost:3000` (puis ton URL Vercel une fois déployé)
- *Redirect URLs* : ajoute `http://localhost:3000` **et** `https://<ton-projet>.vercel.app`

Sans ça, le lien reçu par e-mail refusera de vous connecter.

### 5. Lancer en local

```bash
cp .env.local.example .env.local
```

Remplis les deux valeurs dans `.env.local`, puis :

```bash
npm run dev
```

## Déployer sur Vercel

### Option A — par le dépôt Git (recommandé)

```bash
git init
git add .
git commit -m "Budget mariage"
```

Pousse le dépôt sur GitHub, puis sur [vercel.com/new](https://vercel.com/new) importe-le. Vercel
détecte Next.js tout seul, aucune configuration de build à toucher. Avant de cliquer **Deploy**,
ajoute les deux variables d'environnement :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

pour les trois environnements (Production, Preview, Development).

### Option B — en ligne de commande

```bash
npx vercel
```

puis

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
```

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

```bash
npx vercel --prod
```

Après le premier déploiement, retourne dans Supabase → Authentication → URL Configuration pour y
ajouter l'URL Vercel (étape 4).

## Vous connecter à deux

1. **Toi** : ouvre l'app, saisis ton e-mail, clique sur le lien reçu. Choisis *Créer le mariage*,
   ton prénom, le budget max et la date.
2. Va dans **Réglages** → copie le **code d'invitation** (6 caractères) et envoie-le à ta fiancée.
3. **Elle** : ouvre la même URL sur son téléphone, saisit son e-mail, clique sur son lien, choisit
   *Rejoindre* et entre le code.

Un mariage accepte deux membres — la fonction `join_wedding` refuse un troisième.

Ajoute l'app à l'écran d'accueil du téléphone (Safari : *Partager* → *Sur l'écran d'accueil*) pour
l'utiliser comme une application.

## Bon à savoir

- **E-mails** : le service d'envoi intégré de Supabase est limité à quelques messages par heure sur
  le plan gratuit. Largement suffisant pour deux personnes, mais si tu testes beaucoup, branche un
  SMTP perso dans Authentication → Emails.
- **Règles de validation** : ajouter une dépense vaut validation de ta part. Modifier le *montant*
  d'une dépense annule les votes et redemande l'accord de l'autre — modifier le libellé, le
  prestataire ou la note ne les touche pas.
- **Estimation totale** : pour chaque catégorie, on retient le plus grand des deux montants entre
  l'enveloppe prévue et le réel engagé (validé + en attente). Une enveloppe non consommée reste
  donc comptée, ce qui évite les bonnes surprises trompeuses.
- **Sauvegarde** : Supabase → Table Editor → chaque table peut être exportée en CSV.

## Structure

```
app/            layout, page racine, styles globaux
components/     App (routage + auth), Dashboard, Decisions, Budget, ExpenseSheet, Settings, ui
lib/            types, formatage, calculs budgétaires, client Supabase, store temps réel, démo
supabase/       schema.sql — à exécuter dans le SQL Editor
```
