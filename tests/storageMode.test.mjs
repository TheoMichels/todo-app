import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

function loadModule(file, mocks = {}, globals = {}) {
  const resolved = path.resolve(file);
  const source = fs.readFileSync(resolved, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  const requireFunc = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    return createRequire(resolved)(id);
  };
  const wrapper = vm.runInNewContext(
    `(function(require, module, exports) { ${code}\n })`,
    { console, process, ...globals },
    { filename: resolved }
  );
  wrapper(requireFunc, mod, mod.exports);
  return mod.exports;
}

test('resolveStorageMode resolves local mode for loopback hosts even with supabase build mode', () => {
  const { resolveStorageMode } = loadModule('src/config/storageMode.ts', {
    'expo-constants': { default: {} },
  });

  const loopbacks = [
    'localhost',
    'localhost.',
    'app.localhost',
    'SUB.LOCALHOST.',
    '127.0.0.1',
    '127.10.20.30',
    '::1',
    '[::1]',
  ];

  for (const host of loopbacks) {
    assert.equal(
      resolveStorageMode('supabase', host),
      'local',
      `Host ${host} should resolve to local`
    );
  }
});

test('resolveStorageMode resolves supabase mode only for non-loopback hosts with supabase build mode', () => {
  const { resolveStorageMode } = loadModule('src/config/storageMode.ts', {
    'expo-constants': { default: {} },
  });

  assert.equal(resolveStorageMode('supabase', 'todo.example.com'), 'supabase');
  assert.equal(resolveStorageMode('supabase', 'my-todo.vercel.app'), 'supabase');
});

test('resolveStorageMode resolves local mode for any host when build mode is not supabase', () => {
  const { resolveStorageMode } = loadModule('src/config/storageMode.ts', {
    'expo-constants': { default: {} },
  });

  assert.equal(resolveStorageMode('local', 'todo.example.com'), 'local');
  assert.equal(resolveStorageMode(undefined, 'todo.example.com'), 'local');
  assert.equal(resolveStorageMode(null, 'todo.example.com'), 'local');
  assert.equal(resolveStorageMode('', 'todo.example.com'), 'local');
  assert.equal(resolveStorageMode('other', 'todo.example.com'), 'local');
});

test('storageMode and isLocalMode exports default correctly without window', () => {
  const { storageMode, isLocalMode } = loadModule('src/config/storageMode.ts', {
    'expo-constants': { default: { expoConfig: { extra: { storageMode: 'local' } } } },
  });

  assert.equal(storageMode, 'local');
  assert.equal(isLocalMode, true);
});

test('app.config.js selects supabase only for non-development Vercel builds', () => {
  const config = createRequire(import.meta.url)('../app.config.js');
  const previousEnv = {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
  };

  try {
    const testCases = [
      { vercel: '', vercelEnv: '', expected: 'local' },
      { vercel: '1', vercelEnv: 'production', expected: 'supabase' },
      { vercel: '1', vercelEnv: 'preview', expected: 'supabase' },
      { vercel: '1', vercelEnv: 'development', expected: 'local' },
    ];

    for (const { vercel, vercelEnv, expected } of testCases) {
      process.env.VERCEL = vercel;
      process.env.VERCEL_ENV = vercelEnv;

      const generated = config({ config: { extra: { customField: 42 } } });
      assert.equal(
        generated.extra.storageMode,
        expected,
        `Expected ${expected} for VERCEL=${vercel}, VERCEL_ENV=${vercelEnv}`
      );
      assert.equal(generated.extra.customField, 42);
    }
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
