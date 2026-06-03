-- ============================================================
-- Setup Supabase Storage — Semua Bucket GRAFENDA
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. Bucket 'avatars' (foto profil user) ───────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- ── 2. Bucket 'services' (gambar jasa seller) ─────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('services', 'services', true, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- ── 3. Bucket 'order-results' (hasil pengerjaan order) ────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('order-results', 'order-results', true, 52428800,
  ARRAY['image/jpeg','image/png','image/gif','image/webp',
        'application/pdf','application/zip','video/mp4','video/quicktime'])
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

-- ── 4. Hapus semua policy lama ────────────────────────────────
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Service images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update service images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete service images" ON storage.objects;
DROP POLICY IF EXISTS "Order results are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload order results" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update order results" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete order results" ON storage.objects;

-- ── 5. Policy bucket 'avatars' ────────────────────────────────
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload avatars"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- ── 6. Policy bucket 'services' ───────────────────────────────
CREATE POLICY "Service images are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'services');
CREATE POLICY "Anyone can upload service images"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'services');
CREATE POLICY "Anyone can update service images"
ON storage.objects FOR UPDATE USING (bucket_id = 'services');
CREATE POLICY "Anyone can delete service images"
ON storage.objects FOR DELETE USING (bucket_id = 'services');

-- ── 7. Policy bucket 'order-results' ──────────────────────────
CREATE POLICY "Order results are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'order-results');
CREATE POLICY "Anyone can upload order results"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'order-results');
CREATE POLICY "Anyone can update order results"
ON storage.objects FOR UPDATE USING (bucket_id = 'order-results');
CREATE POLICY "Anyone can delete order results"
ON storage.objects FOR DELETE USING (bucket_id = 'order-results');

-- ── 8. Verifikasi ─────────────────────────────────────────────
SELECT id, name, public, file_size_limit FROM storage.buckets
WHERE id IN ('avatars', 'services', 'order-results');
