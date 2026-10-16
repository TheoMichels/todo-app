import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

async function serveRemoteBuild(page: Page, port: number) {
  // Origine distante virtuelle ; les octets du build sont servis uniquement depuis localhost.
  await page.route('https://todo.example/**', async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: `http://localhost:${port}${url.pathname}${url.search}`,
    });
    await route.fulfill({ response });
  });
}

const syntheticUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
};

async function cloudSession(page: Page) {
  await page.addInitScript((user) => {
    localStorage.setItem(
      'sb-synthetic-auth-token',
      JSON.stringify({
        access_token: 'synthetic-access-token',
        refresh_token: 'synthetic-refresh-token',
        token_type: 'bearer',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        user,
      })
    );
  }, syntheticUser);
}

test('AC-03 build Vercel servi sur localhost reste local', async ({ page }) => {
  const cloudRequests: string[] = [];
  await page.route(/supabase\.(?:co|invalid)/, async (route) => {
    cloudRequests.push(route.request().url());
    await route.abort();
  });
  await page.goto('http://localhost:4174');
  await expect(page.getByTestId('storage-mode-badge')).toBeVisible();
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toHaveCount(0);
  expect(cloudRequests).toEqual([]);
});

test('AC-03 Vercel distant sans clés n’affiche pas le badge local et signale la configuration manquante', async ({ page }) => {
  await serveRemoteBuild(page, 4175);
  await page.goto('https://todo.example');
  await expect(page.getByTestId('storage-mode-badge')).toHaveCount(0);
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toBeVisible();

  await page.getByLabel('Gérer mon compte et synchronisation').click();
  await expect(page.getByText('Configuration Supabase Requise')).toBeVisible();
});

test('AC-03/04 Vercel avec session synthétique affiche les contrôles de synchronisation et déconnexion', async ({ page }) => {
  await serveRemoteBuild(page, 4174);
  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.includes('/auth/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(syntheticUser),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    });
  });

  await cloudSession(page);
  await page.goto('https://todo.example');

  await expect(page.getByTestId('storage-mode-badge')).toHaveCount(0);
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toBeVisible();
  await expect(page.getByLabel('Se déconnecter', { exact: true })).toBeVisible();
});

test('AC-S01/02 synchronisation push et pull dans AuthModal', async ({ page }) => {
  await serveRemoteBuild(page, 4174);
  await cloudSession(page);

  type Row = Record<string, unknown>;
  const tables: Record<string, Row[]> = {
    sections: [],
    todos: [],
    notes: [],
    tracking_points: [],
  };
  const writes: string[] = [];

  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.startsWith('/auth/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(syntheticUser),
      });
      return;
    }
    const table = url.pathname.split('/').pop()!;
    const method = request.method();

    if (method === 'POST') {
      writes.push(table);
      const payload: Row | Row[] = request.postDataJSON();
      for (const row of Array.isArray(payload) ? payload : [payload]) {
        const index = (tables[table] || []).findIndex((item) => item.id === row.id);
        const merged = { created_at: '2026-01-01T00:00:00Z', ...(tables[table] || [])[index], ...row };
        if (index < 0) {
          if (!tables[table]) tables[table] = [];
          tables[table].push(merged);
        } else {
          tables[table][index] = merged;
        }
      }
      await route.fulfill({ status: 201, contentType: 'application/json', body: 'null' });
      return;
    }

    if (method === 'DELETE') {
      writes.push(table);
      const id = url.searchParams.get('id')?.replace(/^eq\./, '');
      if (tables[table]) {
        tables[table] = tables[table].filter((row) => row.id !== id);
      }
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tables[table] || []),
    });
  });

  await page.goto('https://todo.example');
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toBeVisible();

  // Ouvrir AuthModal
  await page.getByLabel('Gérer mon compte et synchronisation').click();
  await expect(page.getByText('Espace Cloud Synchronisé')).toBeVisible();
  await expect(page.getByText('Connecté')).toBeVisible();

  // Test Pull
  await page.getByText('⬇️ Restaurer (Pull)', { exact: true }).click();
  await expect(page.getByText('Données restaurées depuis le Cloud avec succès !', { exact: true })).toBeVisible();

  // Test Push
  await page.getByText('⬆️ Sauvegarder (Push)', { exact: true }).click();
  await expect(page.getByText('Données sauvegardées sur le Cloud avec succès !', { exact: true })).toBeVisible();

  // Fermer la modal
  await page.getByText('Fermer', { exact: true }).click();
  await expect(page.getByText('Espace Cloud Synchronisé')).toHaveCount(0);

  // Déconnexion
  await page.getByLabel('Se déconnecter', { exact: true }).click();
  await expect(page.getByLabel('Se déconnecter', { exact: true })).toHaveCount(0);
});
