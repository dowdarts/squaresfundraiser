-- Clean up and fix RLS policies for squares table
-- This replaces all existing policies with a clean, working set

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow organizers to update their squares" ON squares;
DROP POLICY IF EXISTS "Allow public to read squares" ON squares;
DROP POLICY IF EXISTS "Allow public to update squares" ON squares;
DROP POLICY IF EXISTS "Anyone can purchase unsold squares" ON squares;
DROP POLICY IF EXISTS "Anyone can view squares" ON squares;
DROP POLICY IF EXISTS "Organizers can delete own squares" ON squares;
DROP POLICY IF EXISTS "Organizers can insert squares" ON squares;
DROP POLICY IF EXISTS "Organizers can manage own squares" ON squares;

-- Create new, clean policies

-- Anyone (authenticated or anonymous) can view squares in active fundraisers
CREATE POLICY "Public can view active fundraiser squares"
ON squares FOR SELECT
TO anon, authenticated
USING (
    fundraiser_id IN (
        SELECT id FROM fundraisers WHERE is_active = true
    )
);

-- Anyone can reserve/update unsold squares (for reservations and purchases)
CREATE POLICY "Public can reserve and purchase squares"
ON squares FOR UPDATE
TO anon, authenticated
USING (
    fundraiser_id IN (
        SELECT id FROM fundraisers WHERE is_active = true
    )
)
WITH CHECK (true);

-- Organizers can do anything with their own fundraiser's squares
CREATE POLICY "Organizers manage own squares"
ON squares FOR ALL
TO authenticated
USING (
    fundraiser_id IN (
        SELECT id FROM fundraisers WHERE organizer_id = auth.uid()
    )
)
WITH CHECK (
    fundraiser_id IN (
        SELECT id FROM fundraisers WHERE organizer_id = auth.uid()
    )
);
