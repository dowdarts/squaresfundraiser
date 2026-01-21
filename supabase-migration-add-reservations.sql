-- Migration: Add reservation system to existing squares table
-- Run this if you already created the squares table without the reserved_until column

-- Add the reserved_until column
ALTER TABLE squares 
ADD COLUMN IF NOT EXISTS reserved_until TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on reservations
CREATE INDEX IF NOT EXISTS idx_squares_reserved ON squares(reserved_until);

-- Update the policy to allow reservation updates
DROP POLICY IF EXISTS "Anyone can purchase unsold squares" ON squares;

CREATE POLICY "Anyone can purchase unsold squares"
    ON squares
    FOR UPDATE
    TO anon, authenticated
    USING (sold = FALSE)
    WITH CHECK (sold = TRUE OR reserved_until IS NOT NULL);

-- Function to automatically release expired reservations
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void AS $$
BEGIN
    UPDATE squares
    SET reserved_until = NULL
    WHERE reserved_until < NOW()
    AND sold = FALSE;
END;
$$ LANGUAGE plpgsql;

-- You can manually run this to clean up expired reservations:
-- SELECT release_expired_reservations();
