-- Add free delivery system to products and orders
-- This script adds the ability for admins to set free delivery on products

-- Add free delivery columns to products table
ALTER TABLE products 
ADD COLUMN has_free_delivery BOOLEAN DEFAULT FALSE,
ADD COLUMN free_delivery_note TEXT;

-- Add free delivery tracking to orders table
ALTER TABLE orders 
ADD COLUMN has_free_delivery BOOLEAN DEFAULT FALSE,
ADD COLUMN delivery_charge DECIMAL(10,2) DEFAULT 0,
ADD COLUMN original_delivery_charge DECIMAL(10,2) DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_free_delivery ON products(has_free_delivery);
CREATE INDEX IF NOT EXISTS idx_orders_free_delivery ON orders(has_free_delivery);

-- Function to calculate delivery charge for an order
CREATE OR REPLACE FUNCTION calculate_order_delivery_charge(
  p_district VARCHAR(100),
  p_product_ids UUID[]
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  base_delivery_charge DECIMAL(10,2) := 0;
  has_any_free_delivery BOOLEAN := FALSE;
BEGIN
  -- Get base delivery charge for district
  SELECT delivery_charge INTO base_delivery_charge
  FROM districts
  WHERE name = p_district
  LIMIT 1;
  
  -- If no district found, use default charge
  IF base_delivery_charge IS NULL THEN
    base_delivery_charge := 60;
  END IF;
  
  -- Check if any product in the order has free delivery
  SELECT EXISTS(
    SELECT 1 FROM products 
    WHERE id = ANY(p_product_ids) 
    AND has_free_delivery = TRUE
  ) INTO has_any_free_delivery;
  
  -- If any product has free delivery, return 0
  IF has_any_free_delivery THEN
    RETURN 0;
  END IF;
  
  RETURN base_delivery_charge;
END;
$$ LANGUAGE plpgsql;

-- Function to check if order qualifies for free delivery
CREATE OR REPLACE FUNCTION check_free_delivery_eligibility(
  p_product_ids UUID[]
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM products 
    WHERE id = ANY(p_product_ids) 
    AND has_free_delivery = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing orders to have delivery charge information
UPDATE orders 
SET 
  delivery_charge = COALESCE(
    (SELECT delivery_charge FROM districts WHERE name = orders.district LIMIT 1), 
    60
  ),
  original_delivery_charge = COALESCE(
    (SELECT delivery_charge FROM districts WHERE name = orders.district LIMIT 1), 
    60
  )
WHERE delivery_charge = 0;

-- Create a view for products with delivery information
CREATE OR REPLACE VIEW products_with_delivery AS
SELECT 
  p.*,
  CASE 
    WHEN p.has_free_delivery THEN 'Free Delivery'
    ELSE 'Standard Delivery'
  END as delivery_status,
  CASE 
    WHEN p.has_free_delivery THEN 0
    ELSE (
      SELECT AVG(delivery_charge) 
      FROM districts
    )
  END as estimated_delivery_charge
FROM products p;

-- Grant permissions
GRANT SELECT ON products_with_delivery TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_order_delivery_charge(VARCHAR(100), UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION check_free_delivery_eligibility(UUID[]) TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN products.has_free_delivery IS 'Indicates if this product qualifies for free delivery';
COMMENT ON COLUMN products.free_delivery_note IS 'Optional note about free delivery conditions';
COMMENT ON COLUMN orders.has_free_delivery IS 'Indicates if this order qualified for free delivery';
COMMENT ON COLUMN orders.delivery_charge IS 'Actual delivery charge applied to this order';
COMMENT ON COLUMN orders.original_delivery_charge IS 'Original delivery charge before any free delivery discounts';

-- Insert some sample data for testing
WITH featured_products AS (
  SELECT id FROM products
  WHERE is_featured = TRUE
  LIMIT 2
)
UPDATE products
SET 
  has_free_delivery = TRUE,
  free_delivery_note = 'Free delivery on this premium product'
WHERE id IN (SELECT id FROM featured_products);

-- Final status message
SELECT 'Free delivery system setup completed successfully!' AS status;