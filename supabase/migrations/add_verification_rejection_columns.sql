-- Add verification rejection columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_rejected BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selfie_ktp_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ;
