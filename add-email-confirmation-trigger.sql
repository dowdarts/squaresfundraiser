-- Email confirmation is now handled directly from the admin page
-- No database trigger needed!

-- This file is kept for reference only.
-- The admin page calls the Edge Function directly when approving payments.

-- If you still want to use a database trigger approach, you would need to:
-- 1. Enable pg_net extension: CREATE EXTENSION IF NOT EXISTS pg_net;
-- 2. Set up the service role key
-- 3. Use the trigger function below

-- However, the simpler approach is to let the admin page handle it,
-- which is already implemented in admin.html

