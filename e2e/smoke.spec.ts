import { test, expect } from './fixtures';

test.describe('Smoke test', () => {
  test('charge la page d’accueil sans erreur console', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root', { state: 'attached' });
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.getByText('Todo').first()).toBeVisible();
  });
});
