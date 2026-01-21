-- Allow inserting/updating square_number = 0 for storing lottery winner
-- This is a special row used only for winner storage

-- First, drop the check constraint that prevents square_number = 0
ALTER TABLE squares DROP CONSTRAINT IF EXISTS squares_square_number_check;

-- Add a new check constraint that allows 0-50 instead of just 1-50
ALTER TABLE squares ADD CONSTRAINT squares_square_number_check CHECK (square_number >= 0 AND square_number <= 50);

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow winner storage" ON squares;

-- Create policy to allow operations on square 0
CREATE POLICY "Allow winner storage"
ON squares
FOR ALL
USING (square_number = 0)
WITH CHECK (square_number = 0);

-- Ensure square 0 row exists (initialize it)
INSERT INTO squares (square_number, sold, buyer_name)
VALUES (0, false, NULL)
ON CONFLICT (square_number) DO NOTHING;
