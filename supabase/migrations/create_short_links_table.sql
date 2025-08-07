-- Create short_links table for URL shortening system
CREATE TABLE IF NOT EXISTS short_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_short_links_short_code ON short_links(short_code);
CREATE INDEX IF NOT EXISTS idx_short_links_created_by ON short_links(created_by);
CREATE INDEX IF NOT EXISTS idx_short_links_created_at ON short_links(created_at);
CREATE INDEX IF NOT EXISTS idx_short_links_is_active ON short_links(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_short_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_short_links_updated_at
    BEFORE UPDATE ON short_links
    FOR EACH ROW
    EXECUTE FUNCTION update_short_links_updated_at();

-- Enable Row Level Security
ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow public to read active short links (for redirects)
CREATE POLICY "Allow public read access to active short links" ON short_links
    FOR SELECT USING (is_active = true);

-- Allow authenticated users to create short links
CREATE POLICY "Allow authenticated users to create short links" ON short_links
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own short links
CREATE POLICY "Allow users to update own short links" ON short_links
    FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to view their own short links
CREATE POLICY "Allow users to view own short links" ON short_links
    FOR SELECT USING (auth.uid() = created_by);

-- Allow admins to manage all short links
CREATE POLICY "Allow admins to manage all short links" ON short_links
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON short_links TO anon;
GRANT ALL PRIVILEGES ON short_links TO authenticated;

-- Create click_logs table to track clicks
CREATE TABLE IF NOT EXISTS short_link_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    short_link_id UUID REFERENCES short_links(id) ON DELETE CASCADE,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(50)
);

-- Create indexes for click_logs
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_short_link_id ON short_link_clicks(short_link_id);
CREATE INDEX IF NOT EXISTS idx_short_link_clicks_clicked_at ON short_link_clicks(clicked_at);

-- Enable RLS for click_logs
ALTER TABLE short_link_clicks ENABLE ROW LEVEL SECURITY;

-- Allow public to insert click logs (for tracking)
CREATE POLICY "Allow public to insert click logs" ON short_link_clicks
    FOR INSERT WITH CHECK (true);

-- Allow users to view click logs for their short links
CREATE POLICY "Allow users to view own short link clicks" ON short_link_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM short_links 
            WHERE short_links.id = short_link_clicks.short_link_id 
            AND short_links.created_by = auth.uid()
        )
    );

-- Allow admins to view all click logs
CREATE POLICY "Allow admins to view all click logs" ON short_link_clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant permissions
GRANT INSERT ON short_link_clicks TO anon;
GRANT ALL PRIVILEGES ON short_link_clicks TO authenticated;

-- Create function to increment click count
CREATE OR REPLACE FUNCTION increment_click_count(short_code_param VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE short_links 
    SET click_count = click_count + 1 
    WHERE short_code = short_code_param AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_click_count(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION increment_click_count(VARCHAR) TO authenticated;