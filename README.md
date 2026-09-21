# Todo App (Offline-First avec Upstash & Vercel)

Cette application est basée sur une architecture "offline-first" (comme l'application congés) :
- **Localement** : Les données sont stockées sur l'appareil à l'aide de `AsyncStorage`.
- **En ligne (Production/Dev)** : Une API Vercel Serverless (`/api/db.ts`) synchronise les données vers une base de données **Upstash Redis**.

## Configuration locale

Pour démarrer le projet en local avec synchronisation vers l'API, copiez le fichier `.env.example` vers `.env` et ajustez les variables si besoin :

```bash
cp .env.example .env
```
Contenu de base :
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=votre_url_upstash
UPSTASH_REDIS_REST_TOKEN=votre_token_upstash
```

### Lancer l'application
```bash
npm install
npm start
```

## Déploiement Vercel

Lors du déploiement sur Vercel, assurez-vous de configurer les variables d'environnement suivantes dans les paramètres du projet Vercel :
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Les données seront automatiquement synchronisées entre le client React Native (Web/Mobile) et Upstash Redis via l'API Vercel (`api/db.ts`).
