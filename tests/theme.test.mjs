import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

function loadThemeColors() {
  const file = path.resolve('src/theme/colors.ts');
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const wrapper = vm.runInThisContext(`(function(require, module, exports) { ${code}\n })`);
  wrapper(() => ({}), module, module.exports);
  return module.exports;
}

const { gradient, colors, shadows, radius, spacing } = loadThemeColors();

test('gradient retains the 4 pastel colors and structure', () => {
  assert.ok(gradient, 'gradient should be defined');
  assert.deepEqual(gradient.colors, ['#EAD6EE', '#A0F1EA', '#F5E6E8', '#D5E1FA']);
  assert.equal(gradient.locations.length, 4);
  assert.equal(typeof gradient.start.x, 'number');
  assert.equal(typeof gradient.start.y, 'number');
  assert.equal(typeof gradient.end.x, 'number');
  assert.equal(typeof gradient.end.y, 'number');
});

test('colors includes all canonical keys from stack-target §2', () => {
  assert.ok(colors, 'colors should be defined');
  const canonicalKeys = [
    'brand',
    'brandMuted',
    'primary',
    'primaryLight',
    'primarySoft',
    'primaryBackground',
    'textPrimary',
    'textSecondary',
    'textMuted',
    'textOnBrand',
    'panel',
    'panelSubtle',
    'surface',
    'surfaceActive',
    'border',
    'borderStrong',
    'divider',
    'warning',
    'warningSoft',
    'danger',
    'dangerSoft',
    'positive',
    'positiveSoft',
    'backdrop',
  ];

  for (const key of canonicalKeys) {
    assert.equal(
      typeof colors[key],
      'string',
      `colors.${key} should be defined as a non-empty string`
    );
    assert.ok(colors[key].length > 0, `colors.${key} should not be empty`);
  }
});

test('colors retains backward compatibility aliases', () => {
  const legacyAliases = ['accent', 'accentSoft', 'urgent', 'overlayPanel', 'sidebar'];
  for (const alias of legacyAliases) {
    assert.equal(
      typeof colors[alias],
      'string',
      `Legacy alias colors.${alias} should be preserved`
    );
  }
  assert.equal(colors.accent, colors.primary);
  assert.equal(colors.accentSoft, colors.primaryLight);
  assert.equal(colors.urgent, colors.danger);
});

test('shadows defines sm, md, lg with primary tinted shadowColor', () => {
  assert.ok(shadows, 'shadows should be defined');
  for (const level of ['sm', 'md', 'lg']) {
    assert.ok(shadows[level], `shadows.${level} should be defined`);
    assert.equal(typeof shadows[level].shadowColor, 'string');
    assert.equal(typeof shadows[level].shadowOpacity, 'number');
    assert.equal(typeof shadows[level].shadowRadius, 'number');
    assert.equal(typeof shadows[level].elevation, 'number');
  }
});

test('radius matches canon values', () => {
  assert.deepEqual(radius, {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  });
});

test('spacing matches canon values', () => {
  assert.deepEqual(spacing, {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  });
});
