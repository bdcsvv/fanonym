-- =============================================
-- COMPREHENSIVE FIX FOR FANONYM
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: ENSURE COLUMNS EXIST
-- =============================================

-- Add is_accepted column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_sessions' AND column_name = 'is_accepted') THEN
        ALTER TABLE chat_sessions ADD COLUMN is_accepted BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add accepted_at column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_sessions' AND column_name = 'accepted_at') THEN
        ALTER TABLE chat_sessions ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Set default for is_accepted
ALTER TABLE chat_sessions ALTER COLUMN is_accepted SET DEFAULT false;

-- =============================================
-- STEP 2: FIX EXISTING DATA
-- =============================================

-- Update NULL is_accepted to false for PAID chats (these should be pending)
UPDATE chat_sessions 
SET is_accepted = false 
WHERE is_accepted IS NULL 
AND credits_paid > 0;

-- Update NULL is_accepted to true for FREE chats (spam yang udah di-accept)
UPDATE chat_sessions 
SET is_accepted = true,
    accepted_at = COALESCE(accepted_at, created_at)
WHERE is_accepted IS NULL 
AND (credits_paid = 0 OR credits_paid IS NULL);

-- Fix any chats with is_active but no is_accepted (from old spam accept)
UPDATE chat_sessions
SET is_accepted = true,
    accepted_at = COALESCE(accepted_at, created_at)
WHERE is_accepted IS NULL OR is_accepted = false
AND credits_paid = 0;

-- =============================================
-- STEP 3: FIX RLS POLICIES - CREDITS
-- =============================================
DROP POLICY IF EXISTS "Users can view own credits" ON credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON credits;
DROP POLICY IF EXISTS "Users can update own credits" ON credits;
DROP POLICY IF EXISTS "Anyone can view credits" ON credits;
DROP POLICY IF EXISTS "Anyone can insert credits" ON credits;
DROP POLICY IF EXISTS "Anyone can update credits" ON credits;

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view credits" ON credits FOR SELECT USING (true);
CREATE POLICY "Anyone can insert credits" ON credits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update credits" ON credits FOR UPDATE USING (true);

-- =============================================
-- STEP 4: FIX RLS POLICIES - CHAT_SESSIONS
-- =============================================
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Anyone can view chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Anyone can update chat sessions" ON chat_sessions;

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat sessions" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create chat sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat sessions" ON chat_sessions FOR UPDATE USING (true);

-- =============================================
-- STEP 5: FIX RLS POLICIES - TOPUP_REQUESTS
-- =============================================
DROP POLICY IF EXISTS "Users can view own topup requests" ON topup_requests;
DROP POLICY IF EXISTS "Users can insert own topup requests" ON topup_requests;
DROP POLICY IF EXISTS "Anyone can view topup requests" ON topup_requests;
DROP POLICY IF EXISTS "Anyone can update topup requests" ON topup_requests;

ALTER TABLE topup_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view topup requests" ON topup_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert topup requests" ON topup_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update topup requests" ON topup_requests FOR UPDATE USING (true);

-- =============================================
-- STEP 6: FIX RLS POLICIES - EARNINGS
-- =============================================
DROP POLICY IF EXISTS "Users can view own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can insert own earnings" ON earnings;
DROP POLICY IF EXISTS "Users can update own earnings" ON earnings;
DROP POLICY IF EXISTS "Anyone can view earnings" ON earnings;
DROP POLICY IF EXISTS "Anyone can insert earnings" ON earnings;
DROP POLICY IF EXISTS "Anyone can update earnings" ON earnings;

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view earnings" ON earnings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert earnings" ON earnings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update earnings" ON earnings FOR UPDATE USING (true);

-- =============================================
-- STEP 7: FIX RLS POLICIES - MESSAGES
-- =============================================
DROP POLICY IF EXISTS "Users can view messages in their sessions" ON messages;
DROP POLICY IF EXISTS "Users can insert messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON messages;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update messages" ON messages FOR UPDATE USING (true);

-- =============================================
-- STEP 8: FIX RLS POLICIES - WITHDRAWALS
-- =============================================
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Anyone can view withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Anyone can update withdrawals" ON withdrawals;

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view withdrawals" ON withdrawals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert withdrawals" ON withdrawals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update withdrawals" ON withdrawals FOR UPDATE USING (true);

-- =============================================
-- STEP 9: FIX RLS POLICIES - SPAM_MESSAGES
-- =============================================
DROP POLICY IF EXISTS "Users can view own spam messages" ON spam_messages;
DROP POLICY IF EXISTS "Users can insert spam messages" ON spam_messages;
DROP POLICY IF EXISTS "Anyone can view spam messages" ON spam_messages;
DROP POLICY IF EXISTS "Anyone can update spam messages" ON spam_messages;

ALTER TABLE spam_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spam messages" ON spam_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert spam messages" ON spam_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update spam messages" ON spam_messages FOR UPDATE USING (true);

-- =============================================
-- STEP 10: VERIFY - Check pending chats
-- =============================================
SELECT 
  id, 
  creator_id, 
  sender_id, 
  is_accepted, 
  credits_paid,
  duration_hours,
  created_at 
FROM chat_sessions 
WHERE is_accepted = false AND credits_paid > 0
ORDER BY created_at DESC
LIMIT 10;
