-- AADS Fundraiser Supabase Setup
-- Run this SQL in your Supabase SQL Editor

-- Create the squares table
CREATE TABLE IF NOT EXISTS squares (
    id BIGSERIAL PRIMARY KEY,
    square_number INTEGER UNIQUE NOT NULL CHECK (square_number >= 1 AND square_number <= 50),
    sold BOOLEAN DEFAULT FALSE,
    sold_at TIMESTAMP WITH TIME ZONE,
    reserved_until TIMESTAMP WITH TIME ZONE,
    buyer_email TEXT,
    buyer_name TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 50 squares
INSERT INTO squares (square_number, sold)
SELECT generate_series(1, 50), FALSE
ON CONFLICT (square_number) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE squares ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all squares
CREATE POLICY "Anyone can view squares"
    ON squares
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy: Anyone can update unsold squares to sold
CREATE POLICY "Anyone can purchase unsold squares"
    ON squares
    FOR UPDATE
    TO anon, authenticated
    USING (sold = FALSE)
    WITH CHECK (sold = TRUE OR reserved_until IS NOT NULL);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_squares_sold ON squares(sold);
CREATE INDEX IF NOT EXISTS idx_squares_number ON squares(square_number);
CREATE INDEX IF NOT EXISTS idx_squares_reserved ON squares(reserved_until);

-- Enable Realtime for the squares table
-- Note: You also need to enable this in Supabase Dashboard -> Database -> Replication
ALTER PUBLICATION supabase_realtime ADD TABLE squares;

-- Optional: Create a function to get fundraiser stats
CREATE OR REPLACE FUNCTION get_fundraiser_stats()
RETURNS TABLE (
    total_squares INTEGER,
    sold_count INTEGER,
    remaining_count INTEGER,
    total_raised NUMERIC,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        50 as total_squares,
        COUNT(*)::INTEGER as sold_count,
        (50 - COUNT(*))::INTEGER as remaining_count,
        (COUNT(*) * 5.00)::NUMERIC as total_raised,
        ROUND((COUNT(*)::NUMERIC / 50 * 100), 2) as completion_percentage
    FROM squares
    WHERE sold = TRUE;
END;
$$ LANGUAGE plpgsql;

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

-- You can manually run this or set up a cron job:
-- SELECT release_expired_reservations();

