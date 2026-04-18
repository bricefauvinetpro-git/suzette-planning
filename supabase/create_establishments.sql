-- Table établissements
CREATE TABLE IF NOT EXISTS establishments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  postal_code TEXT,
  city        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON establishments FOR ALL USING (true) WITH CHECK (true);

-- Établissement par défaut
INSERT INTO establishments (name, city)
VALUES ('Suzette Crêperie Urbaine', 'Paris')
ON CONFLICT DO NOTHING;
