-- ============================================================
-- FANONYM - COMPREHENSIVE RLS AUDIT & FIX SCRIPT
-- Run this in Supabase SQL Editor
-- Last Updated: February 2026
-- ============================================================

-- ============================================================
-- PART 1: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS spam_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS topup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS creator_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sender_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PART 2: DROP ALL EXISTING POLICIES (Clean Slate)
-- ============================================================

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- Credits
DROP POLICY IF EXISTS "Users can view own credits" ON credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON credits;
DROP POLICY IF EXISTS "Users can update own credits" ON credits;
DROP POLICY IF EXISTS "credits_select" ON credits;
DROP POLICY IF EXISTS "credits_insert" ON credits;
DROP POLICY IF EXISTS "credits_update" ON credits;

-- Chat Sessions
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Anyone can view chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_select" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_delete" ON chat_sessions;

-- Messages
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;

-- Spam Messages
DROP POLICY IF EXISTS "Creators can view their spam messages" ON spam_messages;
DROP POLICY IF EXISTS "Users can send spam messages" ON spam_messages;
DROP POLICY IF EXISTS "spam_messages_select" ON spam_messages;
DROP POLICY IF EXISTS "spam_messages_insert" ON spam_messages;
DROP POLICY IF EXISTS "spam_messages_update" ON spam_messages;

-- Topup Requests
DROP POLICY IF EXISTS "Users can view own topup requests" ON topup_requests;
DROP POLICY IF EXISTS "Users can insert own topup requests" ON topup_requests;
DROP POLICY IF EXISTS "topup_requests_select" ON topup_requests;
DROP POLICY IF EXISTS "topup_requests_insert" ON topup_requests;

-- Earnings
DROP POLICY IF EXISTS "Creators can view own earnings" ON earnings;
DROP POLICY IF EXISTS "earnings_select" ON earnings;
DROP POLICY IF EXISTS "earnings_insert" ON earnings;
DROP POLICY IF EXISTS "earnings_update" ON earnings;

-- Withdrawals
DROP POLICY IF EXISTS "Creators can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Creators can insert own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_select" ON withdrawals;
DROP POLICY IF EXISTS "withdrawals_insert" ON withdrawals;

-- Creator Pricing
DROP POLICY IF EXISTS "Anyone can view creator pricing" ON creator_pricing;
DROP POLICY IF EXISTS "Creators can manage own pricing" ON creator_pricing;
DROP POLICY IF EXISTS "creator_pricing_select" ON creator_pricing;
DROP POLICY IF EXISTS "creator_pricing_insert" ON creator_pricing;
DROP POLICY IF EXISTS "creator_pricing_update" ON creator_pricing;
DROP POLICY IF EXISTS "creator_pricing_delete" ON creator_pricing;

-- Reports
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert reports" ON reports;
DROP POLICY IF EXISTS "reports_select" ON reports;
DROP POLICY IF EXISTS "reports_insert" ON reports;

-- Blocks
DROP POLICY IF EXISTS "Users can view own blocks" ON blocks;
DROP POLICY IF EXISTS "Users can manage own blocks" ON blocks;
DROP POLICY IF EXISTS "blocks_select" ON blocks;
DROP POLICY IF EXISTS "blocks_insert" ON blocks;
DROP POLICY IF EXISTS "blocks_delete" ON blocks;

-- Sender Reviews
DROP POLICY IF EXISTS "sender_reviews_select" ON sender_reviews;
DROP POLICY IF EXISTS "sender_reviews_insert" ON sender_reviews;

-- ============================================================
-- PART 3: CREATE NEW SECURE POLICIES
-- ============================================================

-- ==================== PROFILES ====================
-- Everyone can view profiles (for browsing creators)
CREATE POLICY "profiles_select" ON profiles
FOR SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ==================== CREDITS ====================
-- Users can only view their own credits
CREATE POLICY "credits_select" ON credits
FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own credits (for new accounts)
CREATE POLICY "credits_insert" ON credits
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own credits
CREATE POLICY "credits_update" ON credits
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- ==================== CHAT SESSIONS ====================
-- Users can view chat sessions where they are sender OR creator
CREATE POLICY "chat_sessions_select" ON chat_sessions
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = creator_id
);

-- Any authenticated user can create a chat session
CREATE POLICY "chat_sessions_insert" ON chat_sessions
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Both sender and creator can update the session
CREATE POLICY "chat_sessions_update" ON chat_sessions
FOR UPDATE USING (
  auth.uid() = sender_id OR auth.uid() = creator_id
);

-- Only sender can delete their chat sessions
CREATE POLICY "chat_sessions_delete" ON chat_sessions
FOR DELETE USING (auth.uid() = sender_id);


-- ==================== MESSAGES ====================
-- Users can view messages only in their chat sessions
CREATE POLICY "messages_select" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_sessions cs
    WHERE cs.id = messages.session_id
    AND (cs.sender_id = auth.uid() OR cs.creator_id = auth.uid())
  )
);

-- Users can insert messages only in their chat sessions
CREATE POLICY "messages_insert" ON messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM chat_sessions cs
    WHERE cs.id = session_id
    AND (cs.sender_id = auth.uid() OR cs.creator_id = auth.uid())
  )
);

-- Users can update their own messages
CREATE POLICY "messages_update" ON messages
FOR UPDATE USING (auth.uid() = sender_id);


-- ==================== SPAM MESSAGES ====================
-- Creators can view spam messages sent to them
CREATE POLICY "spam_messages_select" ON spam_messages
FOR SELECT USING (auth.uid() = creator_id);

-- Authenticated users can send spam messages
CREATE POLICY "spam_messages_insert" ON spam_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Creators can update spam messages (mark as read, etc)
CREATE POLICY "spam_messages_update" ON spam_messages
FOR UPDATE USING (auth.uid() = creator_id);


-- ==================== TOPUP REQUESTS ====================
-- Users can only view their own topup requests
CREATE POLICY "topup_requests_select" ON topup_requests
FOR SELECT USING (auth.uid() = user_id);

-- Users can only create their own topup requests
CREATE POLICY "topup_requests_insert" ON topup_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==================== EARNINGS ====================
-- Creators can only view their own earnings
CREATE POLICY "earnings_select" ON earnings
FOR SELECT USING (auth.uid() = creator_id);

-- System can insert earnings (via triggers or service role)
CREATE POLICY "earnings_insert" ON earnings
FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own earnings
CREATE POLICY "earnings_update" ON earnings
FOR UPDATE USING (auth.uid() = creator_id);


-- ==================== WITHDRAWALS ====================
-- Creators can only view their own withdrawals
CREATE POLICY "withdrawals_select" ON withdrawals
FOR SELECT USING (auth.uid() = creator_id);

-- Creators can only create their own withdrawals
CREATE POLICY "withdrawals_insert" ON withdrawals
FOR INSERT WITH CHECK (auth.uid() = creator_id);


-- ==================== CREATOR PRICING ====================
-- Everyone can view creator pricing
CREATE POLICY "creator_pricing_select" ON creator_pricing
FOR SELECT USING (true);

-- Creators can insert their own pricing
CREATE POLICY "creator_pricing_insert" ON creator_pricing
FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Creators can update their own pricing
CREATE POLICY "creator_pricing_update" ON creator_pricing
FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their own pricing
CREATE POLICY "creator_pricing_delete" ON creator_pricing
FOR DELETE USING (auth.uid() = creator_id);


-- ==================== REPORTS ====================
-- Users can view reports they made
CREATE POLICY "reports_select" ON reports
FOR SELECT USING (auth.uid() = reporter_id);

-- Authenticated users can create reports
CREATE POLICY "reports_insert" ON reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);


-- ==================== BLOCKS ====================
-- Users can view their own blocks
CREATE POLICY "blocks_select" ON blocks
FOR SELECT USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "blocks_insert" ON blocks
FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks
CREATE POLICY "blocks_delete" ON blocks
FOR DELETE USING (auth.uid() = blocker_id);


-- ==================== SENDER REVIEWS ====================
-- Everyone can view reviews (for transparency)
CREATE POLICY "sender_reviews_select" ON sender_reviews
FOR SELECT USING (true);

-- Creators can create reviews
CREATE POLICY "sender_reviews_insert" ON sender_reviews
FOR INSERT WITH CHECK (auth.uid() = creator_id);


-- ============================================================
-- PART 4: ADDITIONAL SECURITY MEASURES
-- ============================================================

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_blocked(blocker_uuid UUID, blocked_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocks 
    WHERE blocker_id = blocker_uuid 
    AND blocked_id = blocked_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to check if user can message creator
CREATE OR REPLACE FUNCTION can_message_creator(sender_uuid UUID, creator_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_blocked_by_creator BOOLEAN;
  creator_is_banned BOOLEAN;
BEGIN
  -- Check if sender is blocked by creator
  SELECT EXISTS (
    SELECT 1 FROM blocks 
    WHERE blocker_id = creator_uuid 
    AND blocked_id = sender_uuid
  ) INTO is_blocked_by_creator;
  
  -- Check if creator is banned
  SELECT COALESCE(is_banned, false) INTO creator_is_banned
  FROM profiles WHERE id = creator_uuid;
  
  RETURN NOT is_blocked_by_creator AND NOT creator_is_banned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- PART 5: STORAGE POLICIES
-- ============================================================

-- Note: Run these in the Supabase Dashboard > Storage > Policies
-- Or use the SQL below if buckets already exist

-- For 'avatars' bucket
-- DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- CREATE POLICY "Avatar images are publicly accessible"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload their own avatar"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- For 'media' bucket (chat files)
-- CREATE POLICY "Chat media is accessible to chat participants"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'media');

-- CREATE POLICY "Users can upload chat media"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'media' AND auth.uid() IS NOT NULL);

-- For 'ktp' bucket (verification documents)
-- CREATE POLICY "KTP only accessible by owner and admin"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'ktp' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can upload their own KTP"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'ktp' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================================
-- PART 6: VERIFICATION QUERIES (Run to check)
-- ============================================================

-- Check all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- ============================================================
-- DONE! Your database should now be secure.
-- ============================================================
