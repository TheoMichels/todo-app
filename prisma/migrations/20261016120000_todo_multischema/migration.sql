-- Migration multiSchema cible pour Todo sur PostgreSQL Supabase partagé
-- Schéma : todo | Auth partagée : auth.users | RLS 100% avec policies auth.uid() = user_id
BEGIN;

CREATE SCHEMA IF NOT EXISTS todo;
GRANT USAGE ON SCHEMA todo TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA todo
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

CREATE OR REPLACE FUNCTION todo.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = pg_catalog AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION todo.set_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION todo.set_updated_at() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 1. Table todo.sections
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS todo.sections (
  id TEXT NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT sections_pkey PRIMARY KEY (id),
  CONSTRAINT sections_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sections_user_id ON todo.sections(user_id);

REVOKE ALL ON todo.sections FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON todo.sections TO authenticated, service_role;
ALTER TABLE todo.sections ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_sections_updated_at ON todo.sections;
CREATE TRIGGER trg_sections_updated_at BEFORE UPDATE ON todo.sections
  FOR EACH ROW EXECUTE FUNCTION todo.set_updated_at();

DROP POLICY IF EXISTS sections_select_policy ON todo.sections;
CREATE POLICY sections_select_policy ON todo.sections FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS sections_insert_policy ON todo.sections;
CREATE POLICY sections_insert_policy ON todo.sections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS sections_update_policy ON todo.sections;
CREATE POLICY sections_update_policy ON todo.sections FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS sections_delete_policy ON todo.sections;
CREATE POLICY sections_delete_policy ON todo.sections FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 2. Table todo.todos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS todo.todos (
  id TEXT NOT NULL,
  user_id UUID NOT NULL,
  section_id TEXT,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'standard',
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT todos_pkey PRIMARY KEY (id),
  CONSTRAINT todos_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todo.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_user_section ON todo.todos(user_id, section_id);

REVOKE ALL ON todo.todos FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON todo.todos TO authenticated, service_role;
ALTER TABLE todo.todos ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_todos_updated_at ON todo.todos;
CREATE TRIGGER trg_todos_updated_at BEFORE UPDATE ON todo.todos
  FOR EACH ROW EXECUTE FUNCTION todo.set_updated_at();

DROP POLICY IF EXISTS todos_select_policy ON todo.todos;
CREATE POLICY todos_select_policy ON todo.todos FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS todos_insert_policy ON todo.todos;
CREATE POLICY todos_insert_policy ON todo.todos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS todos_update_policy ON todo.todos;
CREATE POLICY todos_update_policy ON todo.todos FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS todos_delete_policy ON todo.todos;
CREATE POLICY todos_delete_policy ON todo.todos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. Table todo.notes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS todo.notes (
  id TEXT NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON todo.notes(user_id);

REVOKE ALL ON todo.notes FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON todo.notes TO authenticated, service_role;
ALTER TABLE todo.notes ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_notes_updated_at ON todo.notes;
CREATE TRIGGER trg_notes_updated_at BEFORE UPDATE ON todo.notes
  FOR EACH ROW EXECUTE FUNCTION todo.set_updated_at();

DROP POLICY IF EXISTS notes_select_policy ON todo.notes;
CREATE POLICY notes_select_policy ON todo.notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS notes_insert_policy ON todo.notes;
CREATE POLICY notes_insert_policy ON todo.notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS notes_update_policy ON todo.notes;
CREATE POLICY notes_update_policy ON todo.notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS notes_delete_policy ON todo.notes;
CREATE POLICY notes_delete_policy ON todo.notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. Table todo.tracking_points
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS todo.tracking_points (
  id TEXT NOT NULL,
  user_id UUID NOT NULL,
  section_id TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress',
  next_step TEXT NOT NULL DEFAULT '',
  due_date TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tracking_points_pkey PRIMARY KEY (id),
  CONSTRAINT tracking_points_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tracking_points_user_id ON todo.tracking_points(user_id);

REVOKE ALL ON todo.tracking_points FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON todo.tracking_points TO authenticated, service_role;
ALTER TABLE todo.tracking_points ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_tracking_points_updated_at ON todo.tracking_points;
CREATE TRIGGER trg_tracking_points_updated_at BEFORE UPDATE ON todo.tracking_points
  FOR EACH ROW EXECUTE FUNCTION todo.set_updated_at();

DROP POLICY IF EXISTS tracking_points_select_policy ON todo.tracking_points;
CREATE POLICY tracking_points_select_policy ON todo.tracking_points FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS tracking_points_insert_policy ON todo.tracking_points;
CREATE POLICY tracking_points_insert_policy ON todo.tracking_points FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS tracking_points_update_policy ON todo.tracking_points;
CREATE POLICY tracking_points_update_policy ON todo.tracking_points FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS tracking_points_delete_policy ON todo.tracking_points;
CREATE POLICY tracking_points_delete_policy ON todo.tracking_points FOR DELETE TO authenticated USING (auth.uid() = user_id);

COMMIT;
