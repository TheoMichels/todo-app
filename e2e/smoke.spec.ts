import { test, expect } from './fixtures';

test.describe('Smoke test', () => {
  test('charge la page d’accueil sans erreur console', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached' });
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.getByText('Todo').first()).toBeVisible();

    const storageBadge = page.locator('[data-testid="storage-mode-badge"]');
    await expect(storageBadge).toBeVisible();
    await expect(storageBadge).toHaveText('Stockage local');
  });

  test('le champ de tâche a les attributs anti-autofill et aucun champ mot de passe n’est présent', async ({ page }) => {
    await page.goto('/');
    const taskInput = page.locator('[data-testid="new-task-input"]');
    await expect(taskInput).toBeVisible();
    await expect(taskInput).toHaveAttribute('autocomplete', 'off');
    await expect(taskInput).toHaveAttribute('id', 'new-task-title');

    // Vérifie qu'aucun champ mot de passe n'est présent dans le DOM
    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(0);
  });
});
