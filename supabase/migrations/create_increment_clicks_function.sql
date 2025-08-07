-- Create function to increment clicks for short links
CREATE OR REPLACE FUNCTION increment_clicks(short_code TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE short_links 
  SET 
    clicks = clicks + 1,
    last_clicked_at = NOW()
  WHERE short_links.short_code = increment_clicks.short_code;
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION increment_clicks(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_clicks(TEXT) TO anon;