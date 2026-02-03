-- Add cover_photo_url to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_url TEXT;

-- Create sender_reviews table
CREATE TABLE IF NOT EXISTS sender_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_good BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, reviewer_id)
);

-- Enable RLS
ALTER TABLE sender_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view sender reviews" ON sender_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON sender_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sender_reviews_sender ON sender_reviews(sender_id);
CREATE INDEX IF NOT EXISTS idx_sender_reviews_reviewer ON sender_reviews(reviewer_id);
