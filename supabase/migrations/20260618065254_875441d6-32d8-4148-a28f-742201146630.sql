CREATE POLICY "Users read own progress media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'progress-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload own progress media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'progress-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own progress media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'progress-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own progress media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'progress-media' AND (storage.foldername(name))[1] = auth.uid()::text);