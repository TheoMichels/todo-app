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

test('AC-01 build Vercel servi sur localhost reste local sans afficher AuthScreen', async ({ page }) => {
  const cloudRequests: string[] = [];
  await page.route(/supabase\.(?:co|invalid)/, async (route) => {
    cloudRequests.push(route.request().url());
    await route.abort();
  });
  await page.goto('http://localhost:4174');
  await expect(page.getByTestId('storage-mode-badge')).toBeVisible();
  await expect(page.getByTestId('auth-screen')).toHaveCount(0);
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toHaveCount(0);
  expect(cloudRequests).toEqual([]);
});

test('AC-02 mode cloud non connecté affiche AuthScreen bloquant sans tableau de bord', async ({ page }) => {
  await serveRemoteBuild(page, 4174);
  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: 'null',
    });
  });

  await page.goto('https://todo.example');
  await expect(page.getByTestId('auth-screen')).toBeVisible();
  await expect(page.getByText('Todo', { exact: true })).toBeVisible();
  await expect(page.getByText('Gestion de tâches & suivi')).toBeVisible();
  await expect(page.getByTestId('tab-signin')).toBeVisible();
  await expect(page.getByTestId('tab-signup')).toBeVisible();
  await expect(page.getByTestId('btn-submit')).toBeVisible();

  // Le tableau de bord et ses éléments ne sont PAS rendus
  await expect(page.getByTestId('storage-mode-badge')).toHaveCount(0);
  await expect(page.getByLabel('Basculer le menu latéral')).toHaveCount(0);
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toHaveCount(0);
});

test('AC-03 validation formulaire AuthScreen affiche des erreurs sans appel réseau', async ({ page }) => {
  await serveRemoteBuild(page, 4174);

  const authCalls: string[] = [];
  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    authCalls.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.goto('https://todo.example');
  await expect(page.getByTestId('auth-screen')).toBeVisible();
  authCalls.length = 0; // Réinitialiser après les éventuels checks de démarrage

  // 1. Email invalide
  await page.getByTestId('input-email').fill('invalide');
  await page.getByTestId('input-password').fill('123456');
  await page.getByTestId('btn-submit').click();
  await expect(page.getByTestId('auth-error-banner')).toBeVisible();
  await expect(page.getByText(/email valide/i)).toBeVisible();
  expect(authCalls).toEqual([]);

  // 2. Mot de passe < 6 caractères
  await page.getByTestId('input-email').fill('valide@exemple.com');
  await page.getByTestId('input-password').fill('123');
  await page.getByTestId('btn-submit').click();
  await expect(page.getByTestId('auth-error-banner')).toBeVisible();
  await expect(page.getByText(/6 caractères/i)).toBeVisible();
  expect(authCalls).toEqual([]);

  // 3. Mots de passe non correspondants en inscription
  await page.getByTestId('tab-signup').click();
  await page.getByTestId('input-email').fill('valide@exemple.com');
  await page.getByTestId('input-password').fill('123456');
  await page.getByTestId('input-confirm-password').fill('654321');
  await page.getByTestId('btn-submit').click();
  await expect(page.getByTestId('auth-error-banner')).toBeVisible();
  await expect(page.getByText(/mots de passe ne correspondent pas/i)).toBeVisible();
  expect(authCalls).toEqual([]);
});

test('AC-04 connexion réussie masque AuthScreen et ouvre le tableau de bord avec le compte', async ({ page }) => {
  await serveRemoteBuild(page, 4174);

  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/auth/v1/token')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'synthetic-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'synthetic-refresh-token',
          user: syntheticUser,
        }),
      });
      return;
    }
    if (url.pathname.startsWith('/auth/')) {
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

  await page.goto('https://todo.example');
  await expect(page.getByTestId('auth-screen')).toBeVisible();

  await page.getByTestId('input-email').fill('test@example.com');
  await page.getByTestId('input-password').fill('secret123');
  await page.getByTestId('btn-submit').click();

  // AuthScreen disparaît et le tableau de bord complet s'affiche
  await expect(page.getByTestId('auth-screen')).toHaveCount(0);
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toBeVisible();
  await expect(page.getByText('test', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Se déconnecter', { exact: true })).toBeVisible();
});

test('AC-05 déconnexion nettoie la session et renvoie immédiatement sur AuthScreen', async ({ page }) => {
  await serveRemoteBuild(page, 4174);

  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname.includes('/auth/v1/logout')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
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

  await expect(page.getByLabel('Se déconnecter', { exact: true })).toBeVisible();

  // Déconnexion
  await page.getByLabel('Se déconnecter', { exact: true }).click();

  // Retour immédiat sur AuthScreen et suppression des contrôles du dashboard
  await expect(page.getByTestId('auth-screen')).toBeVisible();
  await expect(page.getByLabel('Se déconnecter', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toHaveCount(0);
});

test('AC-06 mode cloud sans clés Supabase affiche la bannière de configuration requise sur AuthScreen', async ({ page }) => {
  await serveRemoteBuild(page, 4175);
  await page.goto('https://todo.example');

  await expect(page.getByTestId('auth-screen')).toBeVisible();
  await expect(page.getByTestId('unconfigured-banner')).toBeVisible();
  await expect(page.getByText('Configuration Supabase requise')).toBeVisible();
  await expect(page.getByText('EXPO_PUBLIC_SUPABASE_URL')).toBeVisible();
  await expect(page.getByText('EXPO_PUBLIC_SUPABASE_ANON_KEY')).toBeVisible();
  await expect(page.getByTestId('storage-mode-badge')).toHaveCount(0);
});

test('AC-08 restauration cloud bloque le cache local et garde le compte vide après rechargement', async ({ page }) => {
  await serveRemoteBuild(page, 4174);
  await cloudSession(page);
  await page.addInitScript(() => {
    localStorage.setItem('@todo_sections_v1', JSON.stringify([
      { id: 'local-section', name: 'Cache local privé', createdAt: 1767225600000 },
    ]));
  });

  let releaseSections!: () => void;
  const delayedSections = new Promise<void>((resolve) => { releaseSections = resolve; });
  let sectionPulls = 0;
  const writes: string[] = [];
  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.startsWith('/auth/')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(syntheticUser) });
      return;
    }
    if (request.method() !== 'GET') writes.push(`${request.method()} ${url.pathname}`);
    if (request.method() === 'GET' && url.pathname.endsWith('/sections')) {
      sectionPulls += 1;
      if (sectionPulls === 1) await delayedSections;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  await page.goto('https://todo.example');
  await expect(page.getByTestId('storage-mode-badge')).toHaveCount(0);
  await expect(page.getByText('Cache local privé', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Général', { exact: true })).toHaveCount(0);
  releaseSections();
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toBeVisible();
  await expect(page.getByText('Cache local privé', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Général', { exact: true })).toHaveCount(0);
  expect(writes).toEqual([]);

  await page.reload();
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toBeVisible();
  await expect(page.getByText('Cache local privé', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Général', { exact: true })).toHaveCount(0);
  expect(writes).toEqual([]);
});

test('AC-09 erreur du pull cloud reste bloquante et Réessayer autorise le chargement', async ({ page }) => {
  await serveRemoteBuild(page, 4174);
  await cloudSession(page);
  let sectionPulls = 0;
  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.startsWith('/auth/')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(syntheticUser) });
      return;
    }
    if (request.method() === 'GET' && url.pathname.endsWith('/sections')) {
      sectionPulls += 1;
      if (sectionPulls === 1) {
        // A malformed successful response exercises pull's failure result without a browser 5xx.
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"offline"}' });
        return;
      }
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  await page.goto('https://todo.example');
  await expect(page.getByTestId('cloud-pull-error')).toBeVisible();
  await expect(page.getByText(/Impossible de charger les données depuis le Cloud/i)).toBeVisible();
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toHaveCount(0);
  await page.getByTestId('cloud-pull-retry').click();
  await expect(page.getByLabel('Gérer mon compte et synchronisation')).toBeVisible();
  expect(sectionPulls).toBe(2);
});

test('AC-S01/02 synchronisation push et pull dans AuthModal pour utilisateur connecté', async ({ page }) => {
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
    if (url.pathname.includes('/auth/v1/logout')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
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
});

test('AC-07 mauvais mot de passe en mode cloud conserve AuthScreen, affiche l\'erreur et préserve l\'email', async ({ page }) => {
  await serveRemoteBuild(page, 4174);

  await page.route('https://synthetic.supabase.invalid/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/auth/v1/token')) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'invalid_credentials',
          message: 'Invalid login credentials',
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: 'null',
    });
  });

  await page.goto('https://todo.example');
  await expect(page.getByTestId('auth-screen')).toBeVisible();

  await page.getByTestId('input-email').fill('test@example.com');
  await page.getByTestId('input-password').fill('mauvaismdp');
  await page.getByTestId('btn-submit').click();

  // AuthScreen reste affiché, la bannière d'erreur apparaît et l'email est conservé
  await expect(page.getByTestId('auth-screen')).toBeVisible();
  await expect(page.getByTestId('auth-error-banner')).toBeVisible();
  await expect(page.getByText('Adresse e-mail ou mot de passe incorrect.')).toBeVisible();
  await expect(page.getByTestId('input-email')).toHaveValue('test@example.com');
});
