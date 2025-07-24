-- First, let's check the current products table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check if we have both 'stock' and 'stock' columns
DO $$ 
DECLARE
    has_stock boolean := false;
    has_stock boolean := false;
BEGIN
    -- Check for 'stock' column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock'
    ) INTO has_stock;
    
    -- Check for 'stock' column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock'
    ) INTO has_stock;
    
    RAISE NOTICE 'Has stock column: %', has_stock;
    RAISE NOTICE 'Has stock column: %', has_stock;
    
    -- If we have 'stock' but not 'stock', rename it
    IF has_stock AND NOT has_stock THEN
        ALTER TABLE products RENAME COLUMN stock TO stock;
        RAISE NOTICE 'Renamed stock column to stock';
    END IF;
    
    -- If we don't have either, add stock
    IF NOT has_stock AND NOT has_stock THEN
        ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added stock column';
    END IF;
    
    -- If we have both, migrate data and drop old column
    IF has_stock AND has_stock THEN
        UPDATE products SET stock = COALESCE(stock, 0) WHERE stock = 0;
        ALTER TABLE products DROP COLUMN stock;
        RAISE NOTICE 'Migrated data from stock to stock and dropped old column';
    END IF;
END $$;

-- Ensure stock has proper constraints
ALTER TABLE products ALTER COLUMN stock SET NOT NULL;
ALTER TABLE products ALTER COLUMN stock SET DEFAULT 0;

-- Add constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_stock_positive' 
        AND table_name = 'products'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT check_stock_positive 
        CHECK (stock >= 0);
        RAISE NOTICE 'Added stock quantity constraint';
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);

-- Let's check current stock values
SELECT id, name, stock, is_featured, is_flash_sale 
FROM products 
ORDER BY created_at DESC 
LIMIT 10;

-- Update any NULL stock values to 0
UPDATE products SET stock = 0 WHERE stock IS NULL;

-- Set some sample stock for testing (you can remove this after verification)
UPDATE products SET stock = 50 WHERE stock = 0;

RAISE NOTICE 'Schema check and fix completed';
