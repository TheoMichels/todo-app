import { test, expect } from './fixtures';

async function expectFocusGutter(input: import('@playwright/test').Locator, padding: string) {
  await input.focus();
  const gutter = await input.evaluate((element) => {
    let ancestor = element.parentElement;
    let paddingLeft: string | undefined;
    while (ancestor) {
      const style = getComputedStyle(ancestor);
      if (style.paddingLeft !== '0px') paddingLeft = style.paddingLeft;
      ancestor = ancestor.parentElement;
    }
    return paddingLeft;
  });
  expect(gutter).toBe(padding);
}

test('les champs d’édition gardent une marge visible dans leurs listes défilantes', async ({ page }) => {
  await page.goto('/');

  const taskInput = page.locator('[data-testid="new-task-input"]');
  await taskInput.fill('Tâche de test');
  await taskInput.press('Enter');
  await page.getByText('Tâche de test', { exact: true }).click();
  // Le panneau détail est le seul panneau positionné au-dessus de l’écran.
  const taskPanelInput = page.locator('input').last();
  await expectFocusGutter(taskPanelInput, '24px');
  await page.getByText('✕').last().click();

  await page.getByText('+ Nouveau', { exact: true }).click();
  const trackingTitle = page.getByPlaceholder('Ex : Livraison dépendance équipe A');
  await trackingTitle.fill('Point de test');
  await page.getByText('Sauvegarder', { exact: true }).click();
  await page.getByText('Point de test', { exact: true }).click();
  const trackingInput = page.locator('input').last();
  await expectFocusGutter(trackingInput, '24px');
  await page.getByText('✕').last().click();

  await page.getByText('+ Nouvelle Section', { exact: true }).click();
  const sectionInput = page.getByPlaceholder('Nom de la section');
  await sectionInput.fill('Section de test');
  await sectionInput.press('Enter');
  await page.getByText('Gérer sections', { exact: true }).click();
  await page.getByText('✎').last().click();
  const renameInput = page.locator('input[value="Section de test"]');
  await expectFocusGutter(renameInput, '12px');
  const scrollContentPaddingTop = await renameInput.evaluate((element) => {
    let ancestor = element.parentElement;
    while (ancestor) {
      if (['auto', 'scroll'].includes(getComputedStyle(ancestor).overflowY)) {
        return getComputedStyle(ancestor.firstElementChild as HTMLElement).paddingTop;
      }
      ancestor = ancestor.parentElement;
    }
    return undefined;
  });
  expect(scrollContentPaddingTop).toBe('8px');
});
