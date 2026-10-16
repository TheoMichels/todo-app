# Todo — fiche projet
> Faits uniquement, maintenus par l'agent (≤ 40 lignes). Les règles sont dans ~/.codex/AGENTS.md.

## Produit
- But : gestion de tâches par sections, notes et points de suivi (tracking), avec corbeille.
- Utilisateur : moi seul · Plateformes : web PWA (Vercel), mobile Expo possible.

## Stack
- Expo SDK 57 (RN Web 0.21, React 19.2, RN 0.86), TS. Expo 57 récent : en cas de doute sur une API, consulter https://docs.expo.dev/versions/v57.0.0/ pour l'API concernée uniquement.
- `expo-linear-gradient`, `react-native-svg`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-draggable-flatlist`.
- Offline-first : AsyncStorage localement ; synchro via l'API serverless `api/db.ts` → Upstash Redis.
- Schéma : types TS dans `src/types/` (pas de base relationnelle).

## Commandes
| Action | Commande |
|---|---|
| Dev | `npm run web` |
| Build web | `npx expo export -p web` (sortie `dist/`, cf. `vercel.json`) |
| Typecheck / Lint / Tests / E2E | **non configurés** — à ajouter via `project-bootstrap` à la première tâche de code |
| Port de preview QA | 4173 (pas encore de `.agents/harness.config`) |

## Modèle de données
| Entité | Type | Repository (local / API) |
|---|---|---|
| Section (+ ids spéciaux corbeille et notes) | `src/types/section.ts` | `sectionRepository.ts` / `apiSectionRepository.ts` |
| Todo (priorité standard \| urgent) | `src/types/todo.ts` | `todoRepository.ts` / `apiTodoRepository.ts` |
| Note | `src/types/note.ts` | `noteRepository.ts` / `apiNoteRepository.ts` |
| TrackingPoint | `src/types/trackingPoint.ts` | `trackingRepository.ts` / `apiTrackingRepository.ts` |
- Point d'entrée stockage : `src/storage/index.ts`, `src/storage/db.ts`.

## Design
- Tokens `src/theme/colors.ts` · dégradé pastel `#EAD6EE` `#A0F1EA` `#F5E6E8` `#D5E1FA` · brand `#072939` · accent `#5E5CE6` / `#7D7AFF` · textes `#072939` `#50646F` `#8B99A3`.

## Zones sensibles et déploiement
- Vercel (`vercel.json`). Serveur : `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (jamais en `EXPO_PUBLIC_`). Client mobile : `EXPO_PUBLIC_API_URL` facultatif.
- Scripts d'icônes ad hoc à la racine (`*_icon*.py`, `fix_icons.py`) : hérités, préférer les skills logo.
