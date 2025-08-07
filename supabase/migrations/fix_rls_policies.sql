-- Remove RLS policies that reference auth.users table
-- These policies are causing permission errors

-- Drop problematic policies on short_links table
DROP POLICY IF EXISTS "Allow admins to manage all short links" ON short_links;
DROP POLICY IF EXISTS "Allow users to update own short links" ON short_links;
DROP POLICY IF EXISTS "Allow users to view own short links" ON short_links;

-- Drop problematic policies on short_link_clicks table
DROP POLICY IF EXISTS "Allow users to view own short link clicks" ON short_link_clicks;
DROP POLICY IF EXISTS "Allow admins to view all click logs" ON short_link_clicks;

-- Create simpler policies that don't reference auth.users
-- Allow all authenticated users to manage short links (simplified admin access)
CREATE POLICY "Allow authenticated users to manage short links" ON short_links
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow all authenticated users to view click logs (simplified admin access)
CREATE POLICY "Allow authenticated users to view click logs" ON short_link_clicks
    FOR SELECT USING (auth.role() = 'authenticated');