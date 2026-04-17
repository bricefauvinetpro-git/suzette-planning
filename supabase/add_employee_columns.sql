-- Colonnes profil employé
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC DEFAULT 12;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '{}';
