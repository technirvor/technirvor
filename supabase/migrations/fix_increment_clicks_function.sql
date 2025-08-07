-- Fix increment_clicks function to use correct column name
CREATE OR REPLACE FUNCTION increment_clicks(short_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE short_links 
  SET 
    click_count = click_count + 1,
    updated_at = NOW()
  WHERE short_links.short_code = increment_clicks.short_code;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_clicks(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_clicks(TEXT) TO anon;

-- Enable realtime for short_links table
ALTER PUBLICATION supabase_realtime ADD TABLE short_links;