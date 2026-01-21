-- Add payment approval system columns
-- Run this in your Supabase SQL Editor

-- Add payment_status and pending_since columns
ALTER TABLE squares 
ADD COLUMN IF NOT EXISTS payment_status TEXT,
ADD COLUMN IF NOT EXISTS pending_since TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_squares_payment_status ON squares(payment_status);
CREATE INDEX IF NOT EXISTS idx_squares_pending_since ON squares(pending_since);

-- Update existing sold squares to have approved status
UPDATE squares 
SET payment_status = 'approved'
WHERE sold = true AND payment_status IS NULL;
