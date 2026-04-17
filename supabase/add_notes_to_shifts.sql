-- Ajout de la colonne notes dans la table shifts
ALTER TABLE shifts ADD COLUMN IF NOT EXISTS notes TEXT;

-- Politique RLS pour INSERT/UPDATE/DELETE sur shifts
CREATE POLICY "allow_insert_all" ON shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_all" ON shifts FOR UPDATE USING (true);
CREATE POLICY "allow_delete_all" ON shifts FOR DELETE USING (true);
