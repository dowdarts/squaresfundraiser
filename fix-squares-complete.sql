-- COMPLETE FIX for squares initialization issues
-- Run this entire script in Supabase SQL Editor

-- Step 1: Fix the constraint issue
-- Drop the incorrect constraint that prevents multiple fundraisers from having the same square numbers
ALTER TABLE squares 
DROP CONSTRAINT IF EXISTS squares_square_number_key;

-- Add the correct constraint that allows same square numbers across different fundraisers
ALTER TABLE squares 
ADD CONSTRAINT squares_fundraiser_square_unique 
UNIQUE (fundraiser_id, square_number);

-- Step 2: Initialize ALL squares for your fundraiser (1-50 + special winner square 0)
INSERT INTO squares (fundraiser_id, square_number, sold, reserved_until, reserved_by, payment_status, buyer_name, pending_since)
SELECT 
    '62f3781c-f01e-4e72-a60b-ad69873287cd', 
    s.num, 
    false,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
FROM generate_series(0, 50) AS s(num)
WHERE NOT EXISTS (
    SELECT 1 FROM squares 
    WHERE fundraiser_id = '62f3781c-f01e-4e72-a60b-ad69873287cd' 
    AND square_number = s.num
);

-- Step 3: Verify all squares were created
SELECT COUNT(*) as total_squares 
FROM squares 
WHERE fundraiser_id = '62f3781c-f01e-4e72-a60b-ad69873287cd';
-- Should return 51 (squares 0-50)

-- Step 4: View the created squares
SELECT square_number, sold, reserved_until, payment_status
FROM squares 
WHERE fundraiser_id = '62f3781c-f01e-4e72-a60b-ad69873287cd'
ORDER BY square_number;
