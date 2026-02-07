-- Migration: Add credits_transferred and refunded columns to chat_sessions
-- credits_transferred: tracks if credits have been transferred from sender to creator
-- refunded: tracks if pending chat expired and was cancelled

ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS credits_transferred BOOLEAN DEFAULT FALSE;

ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS refunded BOOLEAN DEFAULT FALSE;

ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Update existing accepted chats to have credits_transferred = true
UPDATE chat_sessions 
SET credits_transferred = true 
WHERE is_accepted = true;

-- Comment explaining the new flow
COMMENT ON COLUMN chat_sessions.credits_transferred IS 'Tracks if credits have been deducted from sender and added to creator. Only happens when creator accepts.';
COMMENT ON COLUMN chat_sessions.refunded IS 'Tracks if pending chat expired (24h no response) and was cancelled.';
COMMENT ON COLUMN chat_sessions.status IS 'Status: active, expired_no_response, cancelled';
