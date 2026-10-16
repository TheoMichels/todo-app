# Todo — fiche projet
> Faits uniquement, maintenus par l'agent (≤ 40 lignes). Les règles sont dans ~/.codex/AGENTS.md.

## Produit
- But : gestion de tâches par sections, notes et points de suivi (tracking), avec corbeille.
- Utilisateur : moi seul · Plateformes : web PWA (Vercel), mobile Expo possible.

## Stack
- Expo SDK 57 (RN Web 0.21, React 19.2, RN 0.86), TS. Expo 57 récent : en cas de doute sur une API, consulter https://docs.expo.dev/versions/v57.0.0/ pour l'API concernée uniquement.
- `expo-linear-gradient`, `react-native-svg`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-draggable-flatlist`.
- Offline-first : AsyncStorage localement (validation `zod`) ; synchro via l'API serverless `api/db.ts` → Upstash Redis.
- Schéma : multiSchema Prisma (`todo`, `auth`) dans `prisma/schema.prisma` ; Zod dans `src/types/schemas.ts`.

## Commandes
| Action | Commande |
|---|---|
| Dev / Build web | `npm run web` · `npm run build` (`dist/`, cf. `vercel.json`) |
| Preview / Typecheck | `npm run preview` (port 4173) · `npm run typecheck` |
| Lint / Tests / E2E | `npm run lint` · `npm test` · `npm run test:e2e` |
| BDD / Migrations | `npm run db:deploy` (`prisma migrate deploy` via `DIRECT_URL`) |

## Modèle de données
| Entité | Table (`todo.*`) | Type / Schéma Zod | Clé locale / Repository |
|---|---|---|---|
| Section (+ virtuels corbeille/notes) | `sections` | `SectionSchema` | `@todo_sections_v1` · `sectionRepository.ts` |
| Todo (priorité standard \| urgent) | `todos` | `TodoSchema` | `@todo_todos_v1` · `todoRepository.ts` |
| Note | `notes` | `NoteSchema` | `@todo_notes_v1` · `noteRepository.ts` |
| TrackingPoint | `tracking_points` | `TrackingPointSchema` | `@todo_trackings_v1` · `trackingRepository.ts` |
- Stockage : `src/config/storageMode.ts`, `src/storage/validatedStorage.ts` (Zod, repli `todo-app:*`), `src/storage/index.ts`.

## Design
- Tokens `src/theme/colors.ts` (canon stack-target §2) · dégradé 4 teintes · brand `#072939`, primary `#5E5CE6` · shadows/radius/spacing.

## Zones sensibles et déploiement
- Vercel (`vercel.json`). Serveur : `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (jamais en `EXPO_PUBLIC_`). Client mobile : `EXPO_PUBLIC_API_URL` facultatif.
- Scripts d'icônes ad hoc à la racine (`*_icon*.py`, `fix_icons.py`) : hérités, préférer les skills logo.
