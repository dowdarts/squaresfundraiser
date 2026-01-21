-- Admin Policy: Allow full updates for development/admin purposes
-- This policy allows resetting squares back to unsold state

CREATE POLICY "Allow admin resets"
    ON squares
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Note: In production, you should:
-- 1. Remove this policy
-- 2. Create an admin role with special permissions
-- 3. Or use service_role key server-side for admin operations
