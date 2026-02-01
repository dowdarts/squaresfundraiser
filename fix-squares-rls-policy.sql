-- Fix RLS policies for squares table to allow reservations
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to read squares" ON squares;
DROP POLICY IF EXISTS "Allow public to reserve squares" ON squares;
DROP POLICY IF EXISTS "Allow organizers to update their squares" ON squares;
DROP POLICY IF EXISTS "Allow public to update squares" ON squares;

-- Allow anyone to read all squares
CREATE POLICY "Allow public to read squares"
ON squares FOR SELECT
TO public
USING (true);

-- Allow anyone to update squares (for reservations and cart operations)
CREATE POLICY "Allow public to update squares"
ON squares FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Make sure RLS is enabled
ALTER TABLE squares ENABLE ROW LEVEL SECURITY;
