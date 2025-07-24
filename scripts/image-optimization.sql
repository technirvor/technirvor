-- Add image optimization columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_sizes JSONB DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add image optimization columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_sizes JSONB DEFAULT '{}';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Add image optimization columns to hero_slides table
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS image_sizes JSONB DEFAULT '{}';

-- Create image_uploads table for tracking uploaded images
CREATE TABLE IF NOT EXISTS image_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_url TEXT NOT NULL,
  optimized_urls JSONB DEFAULT '{}',
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format VARCHAR(10),
  upload_provider VARCHAR(20) DEFAULT 'supabase',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_meta_title ON products(meta_title);
CREATE INDEX IF NOT EXISTS idx_image_uploads_created_by ON image_uploads(created_by);
CREATE INDEX IF NOT EXISTS idx_image_uploads_created_at ON image_uploads(created_at);

-- Function to clean up unused images
CREATE OR REPLACE FUNCTION cleanup_unused_images() RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER := 0;
  image_record RECORD;
BEGIN
  -- Find images that are not referenced in any table
  FOR image_record IN 
    SELECT id, original_url FROM image_uploads 
    WHERE created_at < NOW() - INTERVAL '7 days'
    AND original_url NOT IN (
      SELECT UNNEST(images) FROM products WHERE images IS NOT NULL
      UNION
      SELECT image_url FROM products WHERE image_url IS NOT NULL
      UNION
      SELECT image_url FROM categories WHERE image_url IS NOT NULL
      UNION
      SELECT image_url FROM hero_slides WHERE image_url IS NOT NULL
    )
  LOOP
    -- Delete the image record
    DELETE FROM image_uploads WHERE id = image_record.id;
    cleanup_count := cleanup_count + 1;
  END LOOP;
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-images', '0 2 * * *', 'SELECT cleanup_unused_images();');
