-- Fix products table schema by adding stock column
-- This script handles the migration from 'stock' to 'stock'

-- First, add the new stock column if it doesn't exist
DO $$ 
BEGIN
    -- Check if stock column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'stock'
    ) THEN
        -- Add stock column
        ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0;
        
        -- Migrate data from stock column if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'stock'
        ) THEN
            UPDATE products SET stock = COALESCE(stock, 0);
            -- Drop the old stock column
            ALTER TABLE products DROP COLUMN IF EXISTS stock;
        END IF;
        
        -- Add constraint to ensure stock is not negative
        ALTER TABLE products ADD CONSTRAINT check_stock_positive 
        CHECK (stock >= 0);
        
        -- Add index for better performance on stock queries
        CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
        
        RAISE NOTICE 'Successfully added stock column and migrated data';
    ELSE
        RAISE NOTICE 'stock column already exists';
    END IF;
END $$;

-- Create function to automatically update stock when orders are placed
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease stock when order item is inserted
    IF TG_OP = 'INSERT' THEN
        UPDATE products 
        SET stock = stock - NEW.quantity
        WHERE id = NEW.product_id;
        
        -- Check if stock went negative
        IF (SELECT stock FROM products WHERE id = NEW.product_id) < 0 THEN
            RAISE EXCEPTION 'Insufficient stock for product ID: %', NEW.product_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Increase stock when order item is deleted (order cancelled)
    IF TG_OP = 'DELETE' THEN
        UPDATE products 
        SET stock = stock + OLD.quantity
        WHERE id = OLD.product_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stock management
DROP TRIGGER IF EXISTS trigger_update_product_stock ON order_items;
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Drop the dependent trigger and function
DROP TRIGGER IF EXISTS trigger_low_stock_notification ON products;
DROP FUNCTION IF EXISTS check_low_stock();

-- Create function to check low stock and send notifications
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TABLE(product_id UUID, product_name TEXT, current_stock INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.stock
    FROM products p
    WHERE p.stock <= 10 AND p.stock > 0
    ORDER BY p.stock ASC;
END;
$$ LANGUAGE plpgsql;

-- Update existing products to have proper stock if they don't
UPDATE products 
SET stock = COALESCE(stock, 0) 
WHERE stock IS NULL;