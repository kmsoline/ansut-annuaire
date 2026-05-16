# Déploiement sur Vercel

## Prérequis
- Compte [Vercel](https://vercel.com)
- Compte [Neon](https://neon.tech) (base de données PostgreSQL)
- Repository GitHub

## Étapes

### 1. Base de données Neon
1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet
3. Copier la **Connection string** (DATABASE_URL)
4. Pour DIRECT_URL, utiliser la même connection string

### 2. Vercel Blob (stockage photos)
1. Dans le dashboard Vercel, aller dans **Storage**
2. Créer un nouveau **Blob store**
3. Copier le `BLOB_READ_WRITE_TOKEN`

### 3. GitHub
1. Créer un repository GitHub (public ou privé)
2. Pousser le code :
```bash
git init
git add .
git commit -m "Initial commit — Annuaire ANSUT"
git remote add origin https://github.com/votre-user/ansut-annuaire.git
git push -u origin main
```

### 4. Déploiement Vercel
1. Aller sur [vercel.com](https://vercel.com) → **Add New Project**
2. Importer le repository GitHub
3. Dans **Environment Variables**, ajouter :
   - `DATABASE_URL` — votre connection string Neon
   - `DIRECT_URL` — même valeur que DATABASE_URL
   - `NEXTAUTH_SECRET` — générer avec `openssl rand -base64 32`
   - `AUTH_SECRET` — même valeur que NEXTAUTH_SECRET
   - `AUTH_PASSWORD` — mot de passe partagé pour les comptes @ansut.ci
   - `BLOB_READ_WRITE_TOKEN` — depuis Vercel Blob
   - `NEXTAUTH_URL` — votre URL de production (ex: https://ansut.vercel.app)
4. Cliquer **Deploy**

### 5. Migration des données
Après le premier déploiement, migrer les données JSON vers Neon :
```bash
# En local avec la DATABASE_URL de production
DATABASE_URL="votre-neon-url" npm run db:push
DATABASE_URL="votre-neon-url" npm run db:seed
```

### 6. Vérification
- Tester la connexion sur l'URL Vercel
- Vérifier les logs dans le dashboard Vercel si erreur

## Variables d'environnement locales
Copier `.env.example` en `.env.local` et remplir les valeurs pour le développement local.
