-- RLS : autoriser la lecture publique sur team_members et shifts
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_read_all" ON team_members FOR SELECT USING (true);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_read_all" ON shifts FOR SELECT USING (true);
