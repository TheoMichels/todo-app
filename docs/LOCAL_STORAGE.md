# Lancer Todo en mode local

```sh
npm install
npm run web
```

Ouvrir `http://localhost:8081` : l'application est accessible immédiatement, sans compte distant ni clé d'API. Le badge « Stockage local » affiché dans l'en-tête confirme ce mode de fonctionnement. Les sections, les tâches (todos), les notes et les points de suivi (trackings) sont enregistrés directement dans le navigateur via les repositories AsyncStorage validés.

## Partitionnement par origine et persistance

Le stockage local est strictement partitionné par origine (combinaison protocole, hôte et port), par navigateur et par profil utilisateur :
- Conserver la même adresse et le même port (`http://localhost:8081`) pour retrouver l'intégralité de ses données.
- Les données stockées localement ne sont jamais écrites sur le dépôt Git.
- Aucun compte ni synchronisation multi-appareil n'est actif en mode local : les mutations sont purement locales.

## Clés de stockage et migration en douceur

Le socle technique cible structure les clés sous la convention `@todo_<collection>_v1` :
- `@todo_sections_v1` : liste des sections (avec conservation des identifiants virtuels `__trash__` et `__notes__`).
- `@todo_todos_v1` : liste des tâches (titre, statut `done`, priorité `standard` | `urgent`, ordre, date de création).
- `@todo_notes_v1` : liste des notes autonomes (titre, description, date de création).
- `@todo_trackings_v1` : liste des points de suivi (titre, statut, next step, échéance, ordre).

### Rétrocompatibilité avec les clés historiques `todo-app:*`

La couche `validatedStorage` assure une rétrocompatibilité complète :
1. Lors de la première lecture, si la clé `@todo_*_v1` n'existe pas encore, le repository inspecte la clé historique `todo-app:*` correspondante (`todo-app:sections`, `todo-app:todos`, `todo-app:notes`, `todo-app:trackings`).
2. Les données historiques sont désérialisées et validées par Zod.
3. Elles sont migrées automatiquement en douceur en étant sauvegardées sous la clé `@todo_*_v1`.
4. Les écritures ultérieures s'effectuent exclusivement sur la clé versionnée cible.
5. Toute donnée corrompue est rejetée avec un message explicite en français et conservée intacte sur le support de stockage afin de ne jamais masquer ni écraser un contenu récupérable.

## Inspection et réinitialisation des données

Pour inspecter, exporter ou effacer les données locales du navigateur :
1. Ouvrir les outils de développement du navigateur (`F12` ou `Cmd+Option+I`).
2. Aller dans l'onglet **Application** (ou **Stockage**).
3. Dérouler **Stockage local** (Local Storage) et sélectionner l'origine courante (`http://localhost:8081`).
4. Les clés `@todo_*_v1` et `todo-app:*` sont éditables et supprimables individuellement.
5. L'action « Effacer le stockage du site » ou l'utilisation d'une session de navigation privée réinitialise complètement l'application.

## Prévisualisation de l'export statique

Pour tester le build de production localement :

```sh
npm run build
npm run preview
```

Le serveur de prévisualisation écoute sur `http://localhost:4173`. Cette origine dispose d'un espace de stockage isolé et indépendant de celui du serveur de développement `8081`.

## Comportement Vercel et adresses loopback

Conformément à la règle `stack-target.md` §4, le mode de stockage est résolu au build :
- `storageMode` vaut `supabase` uniquement si `VERCEL=1` et que `VERCEL_ENV !== 'development'`.
- Dès lors que le hostname correspond à une adresse loopback (`localhost`, `*.localhost`, `127.0.0.1`, `::1`), `resolveStorageMode` force systématiquement le mode `local`.
- Un export réalisé hors de Vercel fonctionne toujours en mode local.

## Commandes de vérification

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
```
