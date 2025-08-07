-- Fix RLS policies for short_links table to allow service role operations

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow authenticated users to create short links" ON short_links;
DROP POLICY IF EXISTS "Allow admins to manage all short links" ON short_links;

-- Create new policy that allows service role to bypass RLS for all operations
CREATE POLICY "Allow service role full access" ON short_links
    FOR ALL USING (true) WITH CHECK (true);

-- Create policy for authenticated users to create short links
CREATE POLICY "Allow authenticated users to create short links" ON short_links
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- Create policy for users to manage their own short links
CREATE POLICY "Allow users to manage own short links" ON short_links
    FOR ALL USING (
        auth.uid() = created_by OR 
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Ensure service role has full privileges
GRANT ALL PRIVILEGES ON short_links TO service_role;
GRANT ALL PRIVILEGES ON short_link_clicks TO service_role;