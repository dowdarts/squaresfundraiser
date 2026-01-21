-- Add reserved_by column to track which user reserved each square
-- Run this in your Supabase SQL Editor

ALTER TABLE squares 
ADD COLUMN IF NOT EXISTS reserved_by TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_squares_reserved_by ON squares(reserved_by);
