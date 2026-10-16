import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadTypeScript } from './helpers/load-typescript.mjs';

function auth(api) {
  return loadTypeScript('src/services/authService.ts', {
    './supabaseClient': { supabase: api ? { auth: api } : null },
  });
}

test('authService traduit les erreurs auth en français sans exposer les détails backend', async () => {
  const service = auth({
    signInWithPassword: async () => ({
      data: {},
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    }),
    signUp: async () => ({
      data: {},
      error: { code: 'user_already_exists', message: 'User already registered' },
    }),
    signOut: async () => ({
      error: { message: 'private database detail' },
    }),
  });

  const signInRes = await service.signIn('test@example.com', 'secret12');
  assert.match(signInRes.error.message, /identifiants|mot de passe|incorrect/i);

  const signUpRes = await service.signUp('test@example.com', 'secret12');
  assert.match(signUpRes.error.message, /compte|adresse/i);

  const signOutRes = await service.signOut();
  assert.match(signOutRes.error.message, /déconnexion/i);
  assert.doesNotMatch(signOutRes.error.message, /private|database/i);

  const offline = auth({
    signInWithPassword: async () => {
      throw new Error('Failed to fetch');
    },
  });
  const offlineRes = await offline.signIn('test@example.com', 'secret12');
  assert.match(offlineRes.error.message, /connexion|réseau/i);
});

test('authService succès signIn, signUp, getSession, onAuthStateChange et client nul', async () => {
  const user = { id: 'synthetic-user', email: 'test@example.com' };
  const session = { user };
  let unsubscribed = false;

  const service = auth({
    signInWithPassword: async () => ({ data: { user, session }, error: null }),
    signUp: async () => ({ data: { user, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session }, error: null }),
    onAuthStateChange(callback) {
      callback('SIGNED_IN', session);
      return {
        data: {
          subscription: {
            unsubscribe() {
              unsubscribed = true;
            },
          },
        },
      };
    },
  });

  const signInRes = await service.signIn('test@example.com', 'secret12');
  assert.equal(signInRes.user.id, user.id);
  assert.equal(signInRes.error, null);

  const signUpRes = await service.signUp('test@example.com', 'secret12');
  assert.equal(signUpRes.user.id, user.id);
  assert.equal(signUpRes.session, null);

  const currentSession = await service.getSession();
  assert.equal(currentSession.user.id, user.id);

  let capturedEvent;
  const sub = service.onAuthStateChange((_s, _u, e) => {
    capturedEvent = e;
  });
  sub.unsubscribe();
  assert.equal(capturedEvent, 'SIGNED_IN');
  assert.equal(unsubscribed, true);

  const signOutRes = await service.signOut();
  assert.equal(signOutRes.error, null);

  // Client local (supabase = null)
  const local = auth(null);
  const localSignIn = await local.signIn('test@example.com', 'secret12');
  assert.match(localSignIn.error.message, /configur/i);
  assert.equal(await local.getSession(), null);
  assert.equal(await local.getCurrentUser(), null);
});

test('supabaseClient est configuré avec le schéma todo et options conformes', () => {
  for (const os of ['web', 'ios']) {
    let options;
    loadTypeScript('src/services/supabaseClient.ts', {
      '../config/supabase': {
        isSupabaseConfigured: true,
        supabaseUrl: 'https://synthetic.supabase.invalid',
        supabaseAnonKey: 'public-key',
      },
      '../config/storageMode': { isLocalMode: false },
      'react-native': { Platform: { OS: os } },
      '@react-native-async-storage/async-storage': {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
      },
      '@supabase/supabase-js': {
        createClient(_url, _key, config) {
          options = config;
          return {};
        },
      },
    });

    assert.equal(options.db.schema, 'todo');
    assert.equal(options.db.retry, false);
    assert.equal(options.db.timeout, 10000);
    assert.equal(options.auth.detectSessionInUrl, os === 'web');
    assert.equal(options.auth.persistSession, true);
  }
});
