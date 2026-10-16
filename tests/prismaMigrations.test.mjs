import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { deployDatabase } from '../scripts/deploy-db.mjs';

const rootDir = process.cwd();
const migrationFile = 'prisma/migrations/20261016120000_todo_multischema/migration.sql';
const tables = ['sections', 'todos', 'notes', 'tracking_points'];
const userA = '00000000-0000-4000-8000-000000000001';
const userB = '00000000-0000-4000-8000-000000000002';
const missingUser = '00000000-0000-4000-8000-000000000003';

async function database() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO authenticated;
    INSERT INTO auth.users VALUES ('${userA}'), ('${userB}');
  `);
  return db;
}

function row(table, id, user) {
  switch (table) {
    case 'sections':
      return `(id, user_id, name) VALUES ('${id}', '${user}', 'Section ${id}')`;
    case 'todos':
      return `(id, user_id, title, done, priority, "order") VALUES ('${id}', '${user}', 'Tâche ${id}', false, 'standard', 0)`;
    case 'notes':
      return `(id, user_id, title, description) VALUES ('${id}', '${user}', 'Note ${id}', 'Contenu ${id}')`;
    case 'tracking_points':
      return `(id, user_id, title, status, next_step, due_date, "order") VALUES ('${id}', '${user}', 'Point ${id}', 'in_progress', 'Prochaine étape', '2026-12-31', 0)`;
    default:
      throw new Error(`Unknown table ${table}`);
  }
}

test('AC-01 / AC-02: prisma/schema.prisma est configuré en multiSchema (todo, auth) avec les 4 entités', () => {
  const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
  assert.ok(existsSync(schemaPath), 'prisma/schema.prisma doit exister');

  const content = readFileSync(schemaPath, 'utf8');
  assert.match(content, /schemas\s*=\s*\["todo",\s*"auth"\]/);
  assert.match(content, /previewFeatures\s*=\s*\["multiSchema"\]/);
  assert.match(content, /url\s*=\s*env\("DATABASE_URL"\)/);
  assert.match(content, /directUrl\s*=\s*env\("DIRECT_URL"\)/);

  for (const table of tables) {
    assert.match(content, new RegExp(`@@map\\("${table}"\\)`));
  }
  assert.match(content, /@@schema\("todo"\)/);
  assert.match(content, /@map\("user_id"\)/);
  assert.match(content, /@map\("created_at"\)/);
  assert.match(content, /@map\("updated_at"\)/);
  assert.match(content, /@@index\(\[userId\],\s*map:\s*"idx_todos_user_id"\)/);
  assert.match(content, /@@index\(\[userId,\s*sectionId\],\s*map:\s*"idx_todos_user_section"\)/);
});

test('AC-05: deployDatabase runner n’exécute que prisma migrate deploy avec DIRECT_URL et refuse db push', () => {
  const calls = [];
  const run = (...args) => {
    calls.push(args);
    return { status: 0 };
  };
  const env = {
    DIRECT_URL: 'postgresql://direct.invalid/db',
    DATABASE_URL: 'postgresql://pool.invalid/db',
  };

  assert.equal(deployDatabase(env, run), 0);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0][1], ['migrate', 'deploy']);
  assert.equal(calls[0][2].env.DATABASE_URL, env.DIRECT_URL);
  assert.equal(calls[0][2].env.DIRECT_URL, env.DIRECT_URL);
  assert.equal(calls[0][2].shell, false);

  assert.equal(deployDatabase({ POSTGRES_URL_NON_POOLING: env.DIRECT_URL }, run), 0);
  assert.throws(() => deployDatabase({}, run), /DIRECT_URL/);
  assert.equal(deployDatabase(env, () => ({ status: 42 })), 42);
  assert.throws(
    () => deployDatabase(env, () => ({ error: new Error('spawn failed') })),
    /spawn failed/
  );

  const pkg = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['db:push'], undefined, 'prisma db push ne doit pas être exposé en script');
  assert.equal(pkg.scripts['db:deploy'], 'node scripts/deploy-db.mjs');
});

test('AC-04 / AC-06: la migration SQL multischema applique RLS 100%, 4 policies par table, FK auth.users CASCADE et triggers', async () => {
  const migrationPath = path.join(rootDir, migrationFile);
  assert.ok(existsSync(migrationPath), 'Le fichier de migration SQL doit exister');

  const sql = readFileSync(migrationPath, 'utf8');
  assert.match(sql, /CREATE SCHEMA IF NOT EXISTS todo;/);
  assert.match(sql, /GRANT USAGE ON SCHEMA todo TO anon, authenticated, service_role;/);
  assert.match(sql, /CREATE OR REPLACE FUNCTION todo\.set_updated_at\(\)/);

  const db = await database();
  try {
    await db.exec(sql);

    for (const table of tables) {
      // 1. 4 policies pour authenticated (DELETE, INSERT, SELECT, UPDATE)
      const policies = (
        await db.query(
          'SELECT cmd, roles, qual, with_check FROM pg_policies WHERE schemaname = $1 AND tablename = $2 ORDER BY cmd',
          ['todo', table]
        )
      ).rows;
      assert.deepEqual(policies.map((p) => p.cmd), ['DELETE', 'INSERT', 'SELECT', 'UPDATE']);
      assert.ok(policies.every((p) => p.roles.length === 1 && p.roles[0] === 'authenticated'));

      // 2. RLS activé sur la table
      const rls = (
        await db.query(`SELECT relrowsecurity FROM pg_class WHERE oid = 'todo.${table}'::regclass`)
      ).rows[0];
      assert.equal(rls.relrowsecurity, true);

      // 3. Privilèges de rôles
      for (const role of ['authenticated', 'service_role']) {
        for (const privilege of ['SELECT', 'INSERT', 'UPDATE', 'DELETE']) {
          const check = (
            await db.query('SELECT has_table_privilege($1, $2, $3) AS allowed', [
              role,
              `todo.${table}`,
              privilege,
            ])
          ).rows[0];
          assert.equal(check.allowed, true);
        }
      }
      const anonCheck = (
        await db.query('SELECT has_table_privilege($1, $2, $3) AS allowed', [
          'anon',
          `todo.${table}`,
          'SELECT',
        ])
      ).rows[0];
      assert.equal(anonCheck.allowed, false);

      // 4. Contrainte FK vers auth.users(id) ON DELETE CASCADE
      await assert.rejects(
        db.exec(`INSERT INTO todo.${table} ${row(table, 'invalid_user', missingUser)};`),
        /foreign key/i
      );

      // 5. Insertion de données valides pour userA et userB
      await db.exec(`INSERT INTO todo.${table} ${row(table, 'row_a', userA)};`);
      await db.exec(`INSERT INTO todo.${table} ${row(table, 'row_b', userB)};`);

      // 6. RLS: sous le rôle authenticated avec token userA
      await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub = '${userA}';`);

      // SELECT voit uniquement userA
      const rowsA = (await db.query(`SELECT user_id FROM todo.${table}`)).rows;
      assert.deepEqual(rowsA, [{ user_id: userA }]);

      // INSERT pour userB rejeté par RLS WITH CHECK
      await assert.rejects(
        db.exec(`INSERT INTO todo.${table} ${row(table, 'row_b2', userB)};`),
        /row-level security/i
      );

      // UPDATE userB affecte 0 ligne
      const updateB = await db.query(
        `UPDATE todo.${table} SET updated_at = '2000-01-01' WHERE user_id = '${userB}' RETURNING *`
      );
      assert.equal(updateB.rows.length, 0);

      // UPDATE changeant le user_id vers userB rejeté
      await assert.rejects(
        db.exec(`UPDATE todo.${table} SET user_id = '${userB}' WHERE user_id = '${userA}';`),
        /row-level security/i
      );

      // UPDATE sur userA déclenche le trigger set_updated_at()
      const updatedRow = (
        await db.query(
          `UPDATE todo.${table} SET updated_at = '2000-01-01' WHERE user_id = '${userA}' RETURNING updated_at`
        )
      ).rows[0];
      assert.ok(new Date(updatedRow.updated_at).getFullYear() >= 2026);

      // DELETE userB affecte 0 ligne
      const deleteB = await db.query(
        `DELETE FROM todo.${table} WHERE user_id = '${userB}' RETURNING *`
      );
      assert.equal(deleteB.rows.length, 0);

      // DELETE userA supprime la ligne
      const deleteA = await db.query(
        `DELETE FROM todo.${table} WHERE user_id = '${userA}' RETURNING *`
      );
      assert.equal(deleteA.rows.length, 1);

      // Bascule vers userB et vérification de visibilité
      await db.exec(`SET request.jwt.claim.sub = '${userB}';`);
      const rowsB = (await db.query(`SELECT user_id FROM todo.${table}`)).rows;
      assert.deepEqual(rowsB, [{ user_id: userB }]);

      await db.exec('RESET ROLE;');
    }

    // 7. Fonction set_updated_at durcie (search_path=pg_catalog, invoker)
    const fn = (
      await db.query(
        "SELECT proconfig, prosecdef FROM pg_proc WHERE oid = 'todo.set_updated_at()'::regprocedure"
      )
    ).rows[0];
    assert.deepEqual(fn.proconfig, ['search_path=pg_catalog']);
    assert.equal(fn.prosecdef, false);

    // 8. Suppression en CASCADE depuis auth.users
    await db.exec(`DELETE FROM auth.users WHERE id = '${userB}';`);
    for (const table of tables) {
      const remaining = (await db.query(`SELECT * FROM todo.${table} WHERE user_id = '${userB}'`))
        .rows;
      assert.equal(remaining.length, 0);
    }
  } finally {
    await db.close();
  }
});
