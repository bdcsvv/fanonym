-- Migration: Add credits_transferred column to chat_sessions
-- This tracks whether credits have been transferred from sender to creator
-- Credits are now only transferred when creator accepts the chat

ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS credits_transferred BOOLEAN DEFAULT FALSE;

-- Update existing accepted chats to have credits_transferred = true
UPDATE chat_sessions 
SET credits_transferred = true 
WHERE is_accepted = true;

-- Comment explaining the new flow
COMMENT ON COLUMN chat_sessions.credits_transferred IS 'Tracks if credits have been deducted from sender and added to creator. Only happens when creator accepts.';
