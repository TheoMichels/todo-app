# Contrat de test
- AC-01 : `e2e/all-tasks-tracking.spec.ts`, sélection requise et création depuis Tous.
- AC-02 : même spec, création depuis section puis sélection requise depuis Tous.
- AC-03 : même spec, trois couleurs distinctes, communes entre types et stables après rechargement et inversion de l’ordre.
- AC-04 : même spec, parcours mobile et desktop, persistance, absence de sections.
- Commande : `npx playwright test e2e/all-tasks-tracking.spec.ts` ; inspection visuelle indépendante par QA.
