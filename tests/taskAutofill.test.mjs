import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('NewTaskForm enforces anti-autofill props on task title TextInput', () => {
  const filePath = path.resolve('src/components/NewTaskForm.tsx');
  const source = fs.readFileSync(filePath, 'utf8');

  // AC-01: autoComplete="off", textContentType="none", importantForAutofill="no", id="new-task-title"
  assert.match(source, /id=["']new-task-title["']/, 'TextInput must have id="new-task-title"');
  assert.match(source, /autoComplete=["']off["']/, 'TextInput must have autoComplete="off"');
  assert.match(source, /textContentType=["']none["']/, 'TextInput must have textContentType="none"');
  assert.match(source, /importantForAutofill=["']no["']/, 'TextInput must have importantForAutofill="no"');
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
