-- Initialize all 50 squares for a fundraiser that's missing them
-- Replace '<FUNDRAISER_ID>' with your actual fundraiser ID

-- First, check which squares are missing
SELECT generate_series(1, 50) AS square_number
WHERE generate_series(1, 50) NOT IN (
    SELECT square_number 
    FROM squares 
    WHERE fundraiser_id = '62f3781c-f01e-4e72-a60b-ad69873287cd'
);

-- Then insert missing squares (run this after confirming which ones are missing)
INSERT INTO squares (fundraiser_id, square_number, sold)
SELECT 
    '62f3781c-f01e-4e72-a60b-ad69873287cd', 
    generate_series(1, 50), 
    false
ON CONFLICT (fundraiser_id, square_number) DO NOTHING;

-- Initialize the special winner square (square_number = 0)
INSERT INTO squares (fundraiser_id, square_number, sold)
VALUES ('62f3781c-f01e-4e72-a60b-ad69873287cd', 0, false)
ON CONFLICT (fundraiser_id, square_number) DO NOTHING;
