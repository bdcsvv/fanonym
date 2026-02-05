-- Fix is_accepted default value
ALTER TABLE chat_sessions ALTER COLUMN is_accepted SET DEFAULT false;

-- Update existing chats yang is_accepted NULL jadi false (kecuali yang gratis)
UPDATE chat_sessions 
SET is_accepted = false 
WHERE is_accepted IS NULL AND credits_paid > 0;

-- Update existing chats gratis jadi accepted
UPDATE chat_sessions 
SET is_accepted = true 
WHERE credits_paid = 0 OR credits_paid IS NULL;

-- Pastikan RLS untuk topup_requests bisa diakses admin
-- Drop existing policies jika ada
DROP POLICY IF EXISTS "Users can view own topup requests" ON topup_requests;
DROP POLICY IF EXISTS "Users can insert own topup requests" ON topup_requests;
DROP POLICY IF EXISTS "Admin can view all topup requests" ON topup_requests;
DROP POLICY IF EXISTS "Admin can update topup requests" ON topup_requests;

-- Create policies
CREATE POLICY "Users can view own topup requests" ON topup_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topup requests" ON topup_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view topup requests" ON topup_requests
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update topup requests" ON topup_requests
  FOR UPDATE USING (true);
