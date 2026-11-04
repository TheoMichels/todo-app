import { test, expect } from './fixtures';

test('Tous est la vue initiale et reste sélectionné après rechargement, même sans sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('task-section-picker')).toBeVisible();
  await page.getByTestId('section-général').click();
  await expect(page.getByTestId('task-section-picker')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('task-section-picker')).toBeVisible();
  await page.getByText('Gérer sections').click();
  while (await page.getByTestId('delete-section').count()) {
    await page.getByTestId('delete-section').first().click();
  }
  await expect(page.getByText('Créez une section pour ajouter des éléments.').first()).toBeVisible();
  await expect(page.getByTestId('new-task-input')).toHaveCount(0);
});

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
  await page.getByTestId('task-section-trigger').click();
  await page.getByTestId('task-section-travail').click();
  await page.getByTestId('new-task-input').press('Enter');
  await page.getByText('+ Nouveau', { exact: true }).click();
  await page.getByPlaceholder('Ex : Livraison dépendance équipe A').fill('Suivi tous');
  await page.getByText('Sauvegarder').click();
  await expect(page.getByText('Suivi tous', { exact: true })).toHaveCount(0);
  await page.getByTestId('tracking-section-trigger').click();
  await page.getByTestId('tracking-section-travail').click();
  await page.getByText('Sauvegarder').click();
  await expect(page.getByText('Suivi tous', { exact: true })).toBeVisible();
  const taskBadge = page.locator('[data-testid^="todo-"]').filter({ hasText: 'Tâche tous' }).getByTestId('section-badge');
  const trackingBadge = page.locator('[data-testid^="tracking-"]').filter({ hasText: 'Suivi tous' }).first().getByTestId('section-badge');
  const badgeColor = await taskBadge.evaluate((el) => getComputedStyle(el).backgroundColor);
  await expect(trackingBadge).toHaveCSS('background-color', badgeColor);
  await page.reload();
  await page.getByTestId('view-all').click();
  await expect(taskBadge).toHaveCSS('background-color', badgeColor);
  await expect(trackingBadge).toHaveCSS('background-color', badgeColor);
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

test('supprimer une tâche active depuis Tous la retire définitivement', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('new-task-input').fill('Tâche supprimée');
  await page.getByTestId('new-task-input').press('Enter');
  await page.getByTestId('view-all').click();
  await page.locator('[data-testid^="todo-"]').filter({ hasText: 'Tâche supprimée' }).getByText('✕').click();
  await expect(page.getByText('Tâche supprimée', { exact: true })).toHaveCount(0);
  await page.getByText('Supprimés', { exact: true }).click();
  await expect(page.getByText('Tâche supprimée', { exact: true })).toHaveCount(0);
  await page.reload();
  await page.getByTestId('view-all').click();
  await expect(page.getByText('Tâche supprimée', { exact: true })).toHaveCount(0);
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

test('création depuis Tous sur mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByTestId('toggle-sidebar').click();
  await page.getByTestId('view-all').click();
  await page.getByTestId('new-task-input').fill('Tâche mobile');
  await page.getByTestId('task-section-trigger').click();
  await page.getByTestId('task-section-général').click();
  await page.getByTestId('new-task-input').press('Enter');
  await expect(page.getByText('Tâche mobile', { exact: true })).toBeVisible();
  await page.getByText('Points de suivi', { exact: true }).click();
  await page.getByText('+ Nouveau', { exact: true }).click();
  await page.getByPlaceholder('Ex : Livraison dépendance équipe A').fill('Suivi mobile');
  await page.getByTestId('tracking-section-trigger').click();
  await page.getByTestId('tracking-section-général').click();
  await page.getByText('Sauvegarder').click();
  await expect(page.getByText('Suivi mobile', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByTestId('toggle-sidebar').click();
  await page.getByTestId('view-all').click();
  await expect(page.getByText('Tâche mobile', { exact: true })).toBeVisible();
  await page.getByText('Points de suivi', { exact: true }).click();
  await expect(page.getByText('Suivi mobile', { exact: true })).toBeVisible();
});

test('les sections distinctes gardent leurs couleurs sur les tâches et les suivis après réordonnancement', async ({ page }) => {
  const sections = ['a', 'i', 'q'].map((id, index) => ({ id, name: `Section ${index}`, createdAt: index }));
  await page.addInitScript((data) => {
    if (localStorage.getItem('@todo_sections_v1')) return;
    localStorage.setItem('@todo_sections_v1', JSON.stringify(data));
    localStorage.setItem('@todo_todos_v1', JSON.stringify(data.map((section, index) => ({ id: `todo-${index}`, sectionId: section.id, title: `Tâche couleur ${index}`, done: false, priority: 'standard', order: index, createdAt: index }))));
    localStorage.setItem('@todo_trackings_v1', JSON.stringify(data.map((section, index) => ({ id: `point-${index}`, sectionId: section.id, title: `Suivi couleur ${index}`, status: '', nextStep: '', order: index, createdAt: index }))));
  }, sections);
  await page.goto('/');
  await page.getByTestId('view-all').click();
  const badgeColors: string[] = [];
  for (let index = 0; index < sections.length; index++) {
    const taskBadge = page.locator('[data-testid^="todo-"]').filter({ hasText: `Tâche couleur ${index}` }).getByTestId('section-badge');
    const trackingBadge = page.locator('[data-testid^="tracking-"]').filter({ hasText: `Suivi couleur ${index}` }).first().getByTestId('section-badge');
    await expect(taskBadge).toBeVisible();
    const color = await taskBadge.evaluate((element) => getComputedStyle(element).backgroundColor);
    await expect(trackingBadge).toHaveCSS('background-color', color);
    badgeColors.push(color);
  }
  expect(new Set(badgeColors).size).toBe(sections.length);
  await page.evaluate(() => {
    const key = '@todo_sections_v1';
    const stored: unknown[] = JSON.parse(localStorage.getItem(key) ?? '[]');
    localStorage.setItem(key, JSON.stringify(stored.reverse()));
  });
  await page.reload();
  await page.getByTestId('view-all').click();
  for (let index = 0; index < sections.length; index++) {
    await expect(page.locator('[data-testid^="todo-"]').filter({ hasText: `Tâche couleur ${index}` }).getByTestId('section-badge')).toHaveCSS('background-color', badgeColors[index]);
    await expect(page.locator('[data-testid^="tracking-"]').filter({ hasText: `Suivi couleur ${index}` }).first().getByTestId('section-badge')).toHaveCSS('background-color', badgeColors[index]);
  }
});
