-- ============================================================
-- FANONYM - FIXED RLS SECURITY SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS spam_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS topup_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS creator_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sender_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ratings ENABLE ROW LEVEL SECURITY;

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

-- Chat Session
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_session;
DROP POLICY IF EXISTS "Anyone can view chat sessions" ON chat_session;
DROP POLICY IF EXISTS "Users can insert chat sessions" ON chat_session;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_session;
DROP POLICY IF EXISTS "chat_session_select" ON chat_session;
DROP POLICY IF EXISTS "chat_session_insert" ON chat_session;
DROP POLICY IF EXISTS "chat_session_update" ON chat_session;
DROP POLICY IF EXISTS "chat_session_delete" ON chat_session;

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

-- Topup Request
DROP POLICY IF EXISTS "Users can view own topup requests" ON topup_request;
DROP POLICY IF EXISTS "Users can insert own topup requests" ON topup_request;
DROP POLICY IF EXISTS "topup_request_select" ON topup_request;
DROP POLICY IF EXISTS "topup_request_insert" ON topup_request;

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

-- Ratings
DROP POLICY IF EXISTS "ratings_select" ON ratings;
DROP POLICY IF EXISTS "ratings_insert" ON ratings;

-- ============================================================
-- PART 3: CREATE NEW SECURE POLICIES
-- ============================================================

-- ==================== PROFILES ====================
CREATE POLICY "profiles_select" ON profiles
FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ==================== CREDITS ====================
CREATE POLICY "credits_select" ON credits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "credits_insert" ON credits
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "credits_update" ON credits
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- ==================== CHAT SESSION ====================
CREATE POLICY "chat_session_select" ON chat_session
FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = creator_id
);

CREATE POLICY "chat_session_insert" ON chat_session
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "chat_session_update" ON chat_session
FOR UPDATE USING (
  auth.uid() = sender_id OR auth.uid() = creator_id
);

CREATE POLICY "chat_session_delete" ON chat_session
FOR DELETE USING (auth.uid() = sender_id);


-- ==================== MESSAGES ====================
CREATE POLICY "messages_select" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM chat_session cs
    WHERE cs.id = messages.session_id
    AND (cs.sender_id = auth.uid() OR cs.creator_id = auth.uid())
  )
);

CREATE POLICY "messages_insert" ON messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM chat_session cs
    WHERE cs.id = session_id
    AND (cs.sender_id = auth.uid() OR cs.creator_id = auth.uid())
  )
);

CREATE POLICY "messages_update" ON messages
FOR UPDATE USING (auth.uid() = sender_id);


-- ==================== SPAM MESSAGES ====================
CREATE POLICY "spam_messages_select" ON spam_messages
FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "spam_messages_insert" ON spam_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "spam_messages_update" ON spam_messages
FOR UPDATE USING (auth.uid() = creator_id);


-- ==================== TOPUP REQUEST ====================
CREATE POLICY "topup_request_select" ON topup_request
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "topup_request_insert" ON topup_request
FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==================== EARNINGS ====================
CREATE POLICY "earnings_select" ON earnings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "earnings_insert" ON earnings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "earnings_update" ON earnings
FOR UPDATE USING (auth.uid() = user_id);


-- ==================== WITHDRAWALS ====================
CREATE POLICY "withdrawals_select" ON withdrawals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "withdrawals_insert" ON withdrawals
FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==================== CREATOR PRICING ====================
CREATE POLICY "creator_pricing_select" ON creator_pricing
FOR SELECT USING (true);

CREATE POLICY "creator_pricing_insert" ON creator_pricing
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "creator_pricing_update" ON creator_pricing
FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "creator_pricing_delete" ON creator_pricing
FOR DELETE USING (auth.uid() = creator_id);


-- ==================== REPORTS ====================
CREATE POLICY "reports_select" ON reports
FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "reports_insert" ON reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);


-- ==================== BLOCKS ====================
CREATE POLICY "blocks_select" ON blocks
FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "blocks_insert" ON blocks
FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "blocks_delete" ON blocks
FOR DELETE USING (auth.uid() = blocker_id);


-- ==================== SENDER REVIEWS ====================
CREATE POLICY "sender_reviews_select" ON sender_reviews
FOR SELECT USING (true);

CREATE POLICY "sender_reviews_insert" ON sender_reviews
FOR INSERT WITH CHECK (auth.uid() = reviewer_id);


-- ==================== RATINGS ====================
CREATE POLICY "ratings_select" ON ratings
FOR SELECT USING (true);

CREATE POLICY "ratings_insert" ON ratings
FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- PART 4: SECURITY FUNCTIONS
-- ============================================================

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


-- ============================================================
-- PART 5: VERIFICATION (Check results)
-- ============================================================

SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ============================================================
-- DONE!
-- ============================================================
