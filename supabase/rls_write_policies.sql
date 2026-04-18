-- RLS : autoriser toutes les opérations sur shifts
CREATE POLICY IF NOT EXISTS "allow_insert_all" ON shifts FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_update_all" ON shifts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_delete_all" ON shifts FOR DELETE USING (true);

-- RLS : autoriser toutes les opérations sur team_members
CREATE POLICY IF NOT EXISTS "allow_insert_all" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_update_all" ON team_members FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_delete_all" ON team_members FOR DELETE USING (true);

-- RLS : autoriser toutes les opérations sur establishments
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_read_all"   ON establishments FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "allow_insert_all" ON establishments FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_update_all" ON establishments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_delete_all" ON establishments FOR DELETE USING (true);
