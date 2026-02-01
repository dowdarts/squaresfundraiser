-- Multi-Tenant Fundraiser Platform Migration
-- Run this SQL in your Supabase SQL Editor after the basic setup

-- ============================================
-- 1. CREATE ORGANIZERS TABLE (links to Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS organizers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    organization_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on organizers
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

-- Organizers can view their own profile
CREATE POLICY "Organizers can view own profile"
    ON organizers
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Organizers can update their own profile
CREATE POLICY "Organizers can update own profile"
    ON organizers
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Organizers can insert their own profile (after signup)
CREATE POLICY "Organizers can insert own profile"
    ON organizers
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. CREATE FUNDRAISERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS fundraisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    square_price NUMERIC(10, 2) NOT NULL DEFAULT 5.00,
    banner_url TEXT,
    payment_method TEXT DEFAULT 'e-transfer',
    payment_email TEXT,
    payment_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on fundraisers
ALTER TABLE fundraisers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active fundraisers
CREATE POLICY "Anyone can view active fundraisers"
    ON fundraisers
    FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

-- Organizers can view their own fundraisers (including inactive)
CREATE POLICY "Organizers can view own fundraisers"
    ON fundraisers
    FOR SELECT
    TO authenticated
    USING (organizer_id = auth.uid());

-- Organizers can create fundraisers
CREATE POLICY "Organizers can create fundraisers"
    ON fundraisers
    FOR INSERT
    TO authenticated
    WITH CHECK (organizer_id = auth.uid());

-- Organizers can update their own fundraisers
CREATE POLICY "Organizers can update own fundraisers"
    ON fundraisers
    FOR UPDATE
    TO authenticated
    USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

-- Organizers can delete their own fundraisers
CREATE POLICY "Organizers can delete own fundraisers"
    ON fundraisers
    FOR DELETE
    TO authenticated
    USING (organizer_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fundraisers_organizer ON fundraisers(organizer_id);
CREATE INDEX IF NOT EXISTS idx_fundraisers_active ON fundraisers(is_active);
CREATE INDEX IF NOT EXISTS idx_fundraisers_created ON fundraisers(created_at DESC);

-- ============================================
-- 3. UPDATE SQUARES TABLE FOR MULTI-TENANT
-- ============================================

-- Add fundraiser_id column to squares table
ALTER TABLE squares ADD COLUMN IF NOT EXISTS fundraiser_id UUID REFERENCES fundraisers(id) ON DELETE CASCADE;

-- Create index for fundraiser_id
CREATE INDEX IF NOT EXISTS idx_squares_fundraiser ON squares(fundraiser_id);

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can view squares" ON squares;
DROP POLICY IF EXISTS "Anyone can purchase unsold squares" ON squares;

-- New Policy: Anyone can view squares for active fundraisers
CREATE POLICY "Anyone can view squares"
    ON squares
    FOR SELECT
    TO anon, authenticated
    USING (
        fundraiser_id IN (
            SELECT id FROM fundraisers WHERE is_active = TRUE
        )
    );

-- New Policy: Anyone can purchase unsold squares
CREATE POLICY "Anyone can purchase unsold squares"
    ON squares
    FOR UPDATE
    TO anon, authenticated
    USING (
        sold = FALSE AND 
        fundraiser_id IN (
            SELECT id FROM fundraisers WHERE is_active = TRUE
        )
    )
    WITH CHECK (sold = TRUE OR reserved_until IS NOT NULL);

-- New Policy: Organizers can insert squares for their fundraisers
CREATE POLICY "Organizers can insert squares"
    ON squares
    FOR INSERT
    TO authenticated
    WITH CHECK (
        fundraiser_id IN (
            SELECT id FROM fundraisers WHERE organizer_id = auth.uid()
        )
    );

-- New Policy: Organizers can update their fundraiser's squares
CREATE POLICY "Organizers can manage own squares"
    ON squares
    FOR UPDATE
    TO authenticated
    USING (
        fundraiser_id IN (
            SELECT id FROM fundraisers WHERE organizer_id = auth.uid()
        )
    );

-- New Policy: Organizers can delete their fundraiser's squares
CREATE POLICY "Organizers can delete own squares"
    ON squares
    FOR DELETE
    TO authenticated
    USING (
        fundraiser_id IN (
            SELECT id FROM fundraisers WHERE organizer_id = auth.uid()
        )
    );

-- ============================================
-- 4. CREATE STORAGE BUCKET FOR BANNERS
-- ============================================

-- Create storage bucket for fundraiser banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('fundraiser-banners', 'fundraiser-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Anyone can view banner images
CREATE POLICY "Anyone can view banners"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'fundraiser-banners');

-- Storage Policy: Organizers can upload banners for their fundraisers
CREATE POLICY "Organizers can upload banners"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'fundraiser-banners' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage Policy: Organizers can update their banners
CREATE POLICY "Organizers can update banners"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'fundraiser-banners' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Storage Policy: Organizers can delete their banners
CREATE POLICY "Organizers can delete banners"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'fundraiser-banners' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get fundraiser stats
CREATE OR REPLACE FUNCTION get_fundraiser_stats(fundraiser_uuid UUID)
RETURNS TABLE (
    total_squares INTEGER,
    sold_count INTEGER,
    remaining_count INTEGER,
    total_raised NUMERIC,
    completion_percentage NUMERIC
) AS $$
DECLARE
    square_price_val NUMERIC;
BEGIN
    -- Get the square price for this fundraiser
    SELECT square_price INTO square_price_val
    FROM fundraisers
    WHERE id = fundraiser_uuid;

    RETURN QUERY
    SELECT 
        50 as total_squares,
        COUNT(*)::INTEGER as sold_count,
        (50 - COUNT(*))::INTEGER as remaining_count,
        (COUNT(*) * square_price_val)::NUMERIC as total_raised,
        ROUND((COUNT(*)::NUMERIC / 50 * 100), 2) as completion_percentage
    FROM squares
    WHERE sold = TRUE AND fundraiser_id = fundraiser_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize squares for a new fundraiser
CREATE OR REPLACE FUNCTION initialize_fundraiser_squares(fundraiser_uuid UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO squares (square_number, sold, fundraiser_id)
    SELECT generate_series(1, 50), FALSE, fundraiser_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to release expired reservations (updated for multi-tenant)
CREATE OR REPLACE FUNCTION release_expired_reservations()
RETURNS void AS $$
BEGIN
    UPDATE squares
    SET reserved_until = NULL
    WHERE reserved_until < NOW()
    AND sold = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create organizer profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO organizers (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create organizer profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 6. ENABLE REALTIME
-- ============================================

-- Enable Realtime for fundraisers and updated squares table
ALTER PUBLICATION supabase_realtime ADD TABLE fundraisers;
-- squares is already added in the original setup

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Update your application code to use the new multi-tenant structure
-- 2. Consider migrating existing squares to a default fundraiser if needed
-- 3. Test all RLS policies thoroughly
