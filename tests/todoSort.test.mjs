import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

function loadTodoSort() {
  const file = path.resolve('src/utils/todoSort.ts');
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const wrapper = vm.runInThisContext(`(function(require, module, exports) { ${code}\n })`);
  wrapper(() => ({}), module, module.exports);
  return module.exports;
}

const { sortTodos } = loadTodoSort();

test('sortTodos places urgent todos before standard todos', () => {
  const todos = [
    { id: '1', title: 'Task 1', priority: 'standard', order: 1, createdAt: 1000 },
    { id: '2', title: 'Task 2', priority: 'urgent', order: 2, createdAt: 2000 },
  ];
  const sorted = sortTodos(todos);
  assert.equal(sorted[0].id, '2');
  assert.equal(sorted[1].id, '1');
});

test('sortTodos sorts by order when priorities are equal', () => {
  const todos = [
    { id: '1', title: 'Task 1', priority: 'standard', order: 3, createdAt: 1000 },
    { id: '2', title: 'Task 2', priority: 'standard', order: 1, createdAt: 2000 },
    { id: '3', title: 'Task 3', priority: 'standard', order: 2, createdAt: 3000 },
  ];
  const sorted = sortTodos(todos);
  assert.deepEqual(sorted.map(t => t.id), ['2', '3', '1']);
});

test('sortTodos falls back to createdAt when priorities and orders are equal', () => {
  const todos = [
    { id: '1', title: 'Task 1', priority: 'urgent', order: 1, createdAt: 5000 },
    { id: '2', title: 'Task 2', priority: 'urgent', order: 1, createdAt: 2000 },
    { id: '3', title: 'Task 3', priority: 'urgent', order: 1, createdAt: 3000 },
  ];
  const sorted = sortTodos(todos);
  assert.deepEqual(sorted.map(t => t.id), ['2', '3', '1']);
});

test('sortTodos does not mutate original array and handles empty array', () => {
  const empty = [];
  assert.deepEqual(sortTodos(empty), []);

  const original = [
    { id: '1', title: 'Task 1', priority: 'standard', order: 2, createdAt: 1000 },
    { id: '2', title: 'Task 2', priority: 'urgent', order: 1, createdAt: 1000 },
  ];
  const copy = [...original];
  const sorted = sortTodos(original);
  assert.notEqual(sorted, original);
  assert.deepEqual(original, copy);
});
