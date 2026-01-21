-- Create settings table for fundraiser configuration
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY DEFAULT 1,
    etransfer_email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read settings
CREATE POLICY "Allow public read access to settings"
ON settings FOR SELECT
TO public
USING (true);

-- Only allow authenticated users to update settings (admin only)
CREATE POLICY "Allow authenticated users to update settings"
ON settings FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to insert the initial row
CREATE POLICY "Allow authenticated users to insert settings"
ON settings FOR INSERT
TO authenticated
WITH CHECK (id = 1);

-- Insert default row if not exists
INSERT INTO settings (id, etransfer_email)
VALUES (1, 'YOUR_EMAIL@example.com')
ON CONFLICT (id) DO NOTHING;
