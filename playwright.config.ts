import { defineConfig, devices } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

// Prépare les bundles de test (local, cloud, cloud-unconfigured) si absents
for (const [name, vercel, keys] of [
  ['local', '', true],
  ['cloud', '1', true],
  ['cloud-unconfigured', '1', false],
] as const) {
  const targetDir = `.agents/state/test-builds/${name}`;
  if (!fs.existsSync(targetDir)) {
    const env = {
      ...process.env,
      EXPO_NO_DOTENV: '1',
      EXPO_NO_TELEMETRY: '1',
      VERCEL: vercel,
      VERCEL_ENV: 'preview',
      EXPO_PUBLIC_SUPABASE_URL: keys ? 'https://synthetic.supabase.invalid' : '',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: keys ? 'synthetic-public-key-for-tests' : '',
    };
    spawnSync(process.execPath, ['node_modules/expo/bin/cli', 'export', '-p', 'web', '--clear', '--output-dir', targetDir], {
      env,
      stdio: 'inherit',
    });
  }
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1000 },
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'npx serve .agents/state/test-builds/local -l 4173', url: 'http://localhost:4173', reuseExistingServer: false },
    { command: 'npx serve .agents/state/test-builds/cloud -l 4174', url: 'http://localhost:4174', reuseExistingServer: false },
    { command: 'npx serve .agents/state/test-builds/cloud-unconfigured -l 4175', url: 'http://localhost:4175', reuseExistingServer: false },
  ],
});
