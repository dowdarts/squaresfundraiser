-- Initialize all 50 squares for a fundraiser that's missing them
-- Replace '62f3781c-f01e-4e72-a60b-ad69873287cd' with your actual fundraiser ID

-- First, check which squares are missing
SELECT s.num AS missing_square_number
FROM generate_series(1, 50) AS s(num)
WHERE s.num NOT IN (
    SELECT square_number 
    FROM squares 
    WHERE fundraiser_id = '62f3781c-f01e-4e72-a60b-ad69873287cd'
);

-- Option 1: Add unique constraint first (recommended for future use)
ALTER TABLE squares 
ADD CONSTRAINT squares_fundraiser_square_unique 
UNIQUE (fundraiser_id, square_number);

-- Option 2: Insert only missing squares (use this if constraint already exists or after adding it)
INSERT INTO squares (fundraiser_id, square_number, sold)
SELECT 
    '62f3781c-f01e-4e72-a60b-ad69873287cd', 
    s.num, 
    false
FROM generate_series(1, 50) AS s(num)
WHERE NOT EXISTS (
    SELECT 1 FROM squares 
    WHERE fundraiser_id = '62f3781c-f01e-4e72-a60b-ad69873287cd' 
    AND square_number = s.num
);

-- Initialize the special winner square (square_number = 0)
INSERT INTO squares (fundraiser_id, square_number, sold)
SELECT '62f3781c-f01e-4e72-a60b-ad69873287cd', 0, false
WHERE NOT EXISTS (
    SELECT 1 FROM squares 
    WHERE fundraiser_id = '62f3781c-f01e-4e72-a60b-ad69873287cd' 
    AND square_number = 0
);
