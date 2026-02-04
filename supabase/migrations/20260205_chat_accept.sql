-- Add is_accepted and accepted_at columns to chat_sessions
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

-- Update existing chat sessions to be accepted (backward compatibility)
UPDATE chat_sessions 
SET is_accepted = true, accepted_at = created_at 
WHERE is_accepted IS NULL OR is_accepted = false;
