-- =============================================
-- STORAGE SECURITY POLICIES
-- Run this in Supabase SQL Editor
-- =============================================

-- Payment proofs bucket: only owner can upload, only admin can view
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- KTP verification bucket: private
INSERT INTO storage.buckets (id, name, public)
VALUES ('ktp-photos', 'ktp-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Avatars bucket: public read, authenticated upload
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload their own payment proof" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment proof" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own KTP" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Payment proofs: only authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own payment proof"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Payment proofs: only the owner can view their own proof
CREATE POLICY "Users can view their own payment proof"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- KTP: only authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own KTP"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ktp-photos' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Avatars: anyone can view
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Avatars: authenticated users can upload their own
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Avatars: users can update their own
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (string_to_array(name, '/'))[1]
);
