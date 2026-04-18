-- Ajouter establishment_id sur team_members
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS establishment_id UUID REFERENCES establishments(id) ON DELETE SET NULL;

-- Rattacher les employés existants au premier établissement trouvé
UPDATE team_members
SET establishment_id = (
  SELECT id FROM establishments
  WHERE name = 'Suzette Crêperie Urbaine'
  LIMIT 1
)
WHERE establishment_id IS NULL;

-- Index pour accélérer le filtrage par établissement
CREATE INDEX IF NOT EXISTS idx_team_members_establishment_id
  ON team_members(establishment_id);
