import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('public/index.html aligns with NovaBudget reference icons and favicons', () => {
  const htmlPath = path.resolve('public/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // AC-01: No %PUBLIC_URL%, apple-touch-icon uses /apple-touch-icon.png
  assert.doesNotMatch(html, /%PUBLIC_URL%/, 'No %PUBLIC_URL% placeholder must remain in public/index.html');
  assert.match(html, /<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png" \/>/, 'apple-touch-icon must be /apple-touch-icon.png');

  // Favicon declarations
  assert.match(html, /sizes="32x32" href="\/favicon-32\.png"/, '32x32 favicon required');
  assert.match(html, /sizes="16x16" href="\/favicon-16\.png"/, '16x16 favicon required');
  assert.match(html, /sizes="64x64" href="\/favicon\.png"/, '64x64 favicon required');
  assert.match(html, /sizes="192x192" href="\/favicon-192\.png"/, '192x192 favicon required');
  assert.match(html, /sizes="512x512" href="\/icon-512\.png"/, '512x512 icon required');

  // PNG favicons must appear BEFORE shortcut icon
  const lastPngFaviconIndex = html.indexOf('/icon-512.png');
  const shortcutIconIndex = html.indexOf('rel="shortcut icon"');
  assert.ok(lastPngFaviconIndex !== -1 && shortcutIconIndex !== -1, 'Favicon links must exist');
  assert.ok(lastPngFaviconIndex < shortcutIconIndex, 'PNG favicons must precede shortcut icon for standard browser tab resolution');
});

test('NewTaskForm enforces anti-autofill props, web form isolation and inputMode', () => {
  const filePath = path.resolve('src/components/NewTaskForm.tsx');
  const source = fs.readFileSync(filePath, 'utf8');

  // AC-02: props anti-autofill
  assert.match(source, /id=["']new-task-title["']/, 'TextInput must have id="new-task-title"');
  assert.match(source, /nativeID=["']new-task-title["']/, 'TextInput must have nativeID="new-task-title"');
  assert.match(source, /testID=["']new-task-input["']/, 'TextInput must have testID="new-task-input"');
  assert.match(source, /autoComplete=["']off["']/, 'TextInput must have autoComplete="off"');
  assert.match(source, /textContentType=["']none["']/, 'TextInput must have textContentType="none"');
  assert.match(source, /importantForAutofill=["']no["']/, 'TextInput must have importantForAutofill="no"');
  assert.match(source, /inputMode=["']text["']/, 'TextInput must have inputMode="text"');

  // Web form isolation & honeypot
  assert.match(source, /<form/, 'Form encapsulation on web required');
  assert.match(source, /prevent_autofill/, 'Honeypot prevent_autofill required');
});

test('AuthModal returns null when not visible and sets explicit auth autofill props', () => {
  const filePath = path.resolve('src/components/AuthModal.tsx');
  const source = fs.readFileSync(filePath, 'utf8');

  // AC-02: if (!visible) return null;
  assert.match(source, /if\s*\(!visible\)\s*\{\s*return\s+null;\s*\}|if\s*\(!visible\)\s*return\s+null;/, 'AuthModal must unmount when !visible');

  // AC-02: explicit auth autoComplete and textContentType
  assert.match(source, /autoComplete=["']email["']/, 'Email input must specify autoComplete="email"');
  assert.match(source, /current-password/, 'Password input must specify current-password');
  assert.match(source, /new-password/, 'Password input must specify new-password');
  assert.match(source, /textContentType=.*password.*/i, 'Password input must specify textContentType');
});

test('Header conditionally renders AuthModal only when authModalVisible is true', () => {
  const filePath = path.resolve('src/components/Header.tsx');
  const source = fs.readFileSync(filePath, 'utf8');

  assert.match(source, /authModalVisible\s*&&[\s(]*<AuthModal/, 'Header must conditionally mount AuthModal');
});
