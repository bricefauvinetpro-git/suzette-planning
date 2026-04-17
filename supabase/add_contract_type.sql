-- Ajout de la colonne contract_type dans team_members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS contract_type TEXT;

-- Politique RLS pour INSERT (permet l'ajout d'employés sans authentification)
-- À adapter selon vos besoins de sécurité
CREATE POLICY "allow_insert_all" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_all" ON team_members FOR UPDATE USING (true);
