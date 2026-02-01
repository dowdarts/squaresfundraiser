-- PostgreSQL Migration
-- Add missing payment tracking columns to squares table
ALTER TABLE squares ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE squares ADD COLUMN IF NOT EXISTS pending_since TIMESTAMP WITH TIME ZONE;
ALTER TABLE squares ADD COLUMN IF NOT EXISTS sold_at TIMESTAMP WITH TIME ZONE;

-- Create index for payment status queries
CREATE INDEX IF NOT EXISTS idx_squares_payment_status ON squares(payment_status);
