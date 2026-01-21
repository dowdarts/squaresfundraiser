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
USING (true);

-- Allow anyone to update settings (admin page access)
CREATE POLICY "Allow update settings"
ON settings FOR UPDATE
USING (true)
WITH CHECK (id = 1);

-- Allow anyone to insert the initial settings row
CREATE POLICY "Allow insert settings"
ON settings FOR INSERT
WITH CHECK (id = 1);

-- Insert default row if not exists
INSERT INTO settings (id, etransfer_email)
VALUES (1, 'YOUR_EMAIL@example.com')
ON CONFLICT (id) DO NOTHING;
