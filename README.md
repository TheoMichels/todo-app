# Todo

Application personnelle de gestion de tâches par sections, notes et points de suivi, conçue en architecture offline-first.

## Architecture

- **Front-end** : Expo SDK 57, React Native Web 0.21, React 19, TypeScript strict.
- **Stockage local (Offline-first)** : `AsyncStorage` validé par des schémas `zod` (`src/storage/`).
- **Synchronisation Cloud & Auth** : Supabase PostgreSQL (instance partagée, schéma dédié `todo`, RLS sur toutes les tables) via `src/services/syncService.ts`.
- **Base de données & Migrations** : Schéma `prisma/schema.prisma` multi-schémas et migrations SQL versionnées (`prisma/migrations/`).
- **Déploiement** : Vercel (export statique PWA servi depuis `dist/`).

## Commandes

| Commande | Action |
|---|---|
| `npm run web` | Serveur de développement Expo Web (port 8081) |
| `npm run build` | Export web statique pour production (`dist/`) |
| `npm run preview` | Serveur de prévisualisation statique (port 4173) |
| `npm run typecheck` | Vérification stricte des types TypeScript |
| `npm run lint` | Linter Expo / ESLint |
| `npm test` | Tests unitaires (logique, validations Zod, services) |
| `npm run test:e2e` | Tests E2E Playwright |
| `npm run db:deploy` | Déploiement des migrations Prisma directes sur Supabase |

## Configuration des variables d'environnement

Copiez `.env.example` vers `.env` ou `.env.local` :

```bash
cp .env.example .env
```

Variables requises pour la synchronisation Supabase (automatiquement injectées sur Vercel) :
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` / `DIRECT_URL` (uniquement pour l'exécution des migrations de base de données).
