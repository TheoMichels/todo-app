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

    // Vérification des balises favicons et touch icon dans le <head>
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveAttribute('href', '/apple-touch-icon.png');
    const favicon32 = page.locator('link[rel="icon"][sizes="32x32"]');
    await expect(favicon32).toHaveAttribute('href', '/favicon-32.png');
    const favicon64 = page.locator('link[rel="icon"][sizes="64x64"]');
    await expect(favicon64).toHaveAttribute('href', '/favicon.png');
  });

  test('le champ de tâche a les attributs anti-autofill et aucun champ mot de passe n’est présent', async ({ page }) => {
    await page.goto('/');
    const taskInput = page.locator('[data-testid="new-task-input"]');
    await expect(taskInput).toBeVisible();
    await expect(taskInput).toHaveAttribute('autocomplete', 'off');
    await expect(taskInput).toHaveAttribute('id', 'new-task-title');
    await expect(taskInput).toHaveAttribute('inputmode', 'text');

    // Vérifie qu'aucun champ mot de passe n'est présent dans le DOM
    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs).toHaveCount(0);
  });
});
