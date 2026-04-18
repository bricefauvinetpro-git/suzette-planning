-- Table des documents employés
CREATE TABLE IF NOT EXISTS employee_documents (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_select_all" ON employee_documents FOR SELECT USING (true);
CREATE POLICY "allow_insert_all" ON employee_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_delete_all" ON employee_documents FOR DELETE USING (true);

-- Bucket Supabase Storage "documents" (public)
-- À exécuter dans le SQL Editor Supabase :
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Policies storage
CREATE POLICY "allow_read_documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "allow_upload_documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "allow_delete_documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents');
