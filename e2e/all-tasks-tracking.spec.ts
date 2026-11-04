import { test, expect } from './fixtures';

test('Tous regroupe les éléments, impose une section et conserve les créations', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('new-task-input').fill('Tâche générale');
  await page.getByTestId('new-task-input').press('Enter');
  await page.getByText('+ Nouvelle Section').click();
  await page.getByPlaceholder('Nom de la section').fill('Travail');
  await page.getByPlaceholder('Nom de la section').press('Enter');
  await page.getByTestId('new-task-input').fill('Tâche section');
  await page.getByTestId('new-task-input').press('Enter');
  await page.getByText('+ Nouveau', { exact: true }).click();
  await page.getByPlaceholder('Ex : Livraison dépendance équipe A').fill('Suivi section');
  await page.getByText('Sauvegarder').click();
  await page.getByTestId('view-all').click();
  await expect(page.getByText('Tâche section')).toBeVisible();
  await expect(page.getByText('Suivi section')).toBeVisible();
  await expect(page.locator('[data-testid^="todo-"]').filter({ hasText: 'Tâche section' })).toContainText('Travail');
  await expect(page.locator('[data-testid^="tracking-"]').filter({ hasText: 'Suivi section' }).first()).toContainText('Travail');
  await expect(page.getByText('Tâche générale')).toBeVisible();
  await page.getByTestId('new-task-input').fill('Tâche tous');
  await page.getByTestId('new-task-input').press('Enter');
  await expect(page.getByText('Tâche tous', { exact: true })).toHaveCount(0);
  await page.getByTestId('task-section-travail').click();
  await page.getByTestId('new-task-input').press('Enter');
  await page.getByText('+ Nouveau', { exact: true }).click();
  await page.getByPlaceholder('Ex : Livraison dépendance équipe A').fill('Suivi tous');
  await page.getByText('Sauvegarder').click();
  await expect(page.getByText('Suivi tous', { exact: true })).toHaveCount(0);
  await page.getByTestId('tracking-section-travail').click();
  await page.getByText('Sauvegarder').click();
  await expect(page.getByText('Suivi tous', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByTestId('view-all').click();
  await expect(page.getByText('Tâche tous', { exact: true })).toBeVisible();
  await expect(page.getByText('Suivi tous', { exact: true })).toBeVisible();
  await page.getByTestId('section-travail').click();
  await expect(page.getByText('Tâche tous', { exact: true })).toBeVisible();
  await expect(page.getByText('Suivi tous', { exact: true })).toBeVisible();
});

test('Tous reste utilisable sans sections sur mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  // La suppression de la dernière section laisse la vue vide dans la session.
  await page.getByTestId('toggle-sidebar').click();
  await page.getByText('Gérer sections').click();
  await page.getByTestId('delete-section').first().click();
  await page.getByTestId('view-all').click();
  await expect(page.getByText('Créez une section pour ajouter des éléments.')).toBeVisible();
  await expect(page.getByTestId('new-task-input')).toHaveCount(0);
});
