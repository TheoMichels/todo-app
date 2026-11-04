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

test('les tâches terminées et les suivis supprimés quittent Tous', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('new-task-input').fill('Tâche à terminer');
  await page.getByTestId('new-task-input').press('Enter');
  await page.getByText('+ Nouveau', { exact: true }).click();
  await page.getByPlaceholder('Ex : Livraison dépendance équipe A').fill('Suivi à supprimer');
  await page.getByText('Sauvegarder').click();
  await page.getByTestId('view-all').click();
  await page.locator('[data-testid^="tracking-"]').filter({ hasText: 'Suivi à supprimer' }).first().getByText('✕').click();
  await expect(page.getByText('Suivi à supprimer', { exact: true })).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Terminer Tâche à terminer' }).click();
  await expect(page.getByText('Tâche à terminer', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Suivi à supprimer', { exact: true })).toHaveCount(0);
  await page.getByText('Supprimés', { exact: true }).click();
  await expect(page.getByText('Tâche à terminer', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByTestId('view-all').click();
  await expect(page.getByText('Tâche à terminer', { exact: true })).toHaveCount(0);
  await page.getByText('Supprimés', { exact: true }).click();
  await expect(page.getByText('Tâche à terminer', { exact: true })).toBeVisible();
});

for (const viewport of [{ name: 'mobile', width: 375, height: 812 }, { name: 'desktop', width: 1440, height: 900 }]) {
  test(`Tous reste utilisable sans sections sur ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    if (viewport.name === 'mobile') await page.getByTestId('toggle-sidebar').click();
    await page.getByText('Gérer sections').click();
    await page.getByTestId('delete-section').first().click();
    await page.getByTestId('view-all').click();
    await expect(page.getByText('Créez une section pour ajouter des éléments.').first()).toBeVisible();
    await expect(page.getByTestId('new-task-input')).toHaveCount(0);
    await expect(page.getByText('Aucune tâche pour le moment.')).toBeVisible();
    if (viewport.name === 'mobile') await page.getByText('Points de suivi', { exact: true }).click();
    await expect(page.getByText('Aucun point de suivi pour le moment.')).toBeVisible();
    await expect(page.getByText('+ Nouveau', { exact: true })).toHaveCount(0);
  });
}
