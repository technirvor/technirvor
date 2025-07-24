DROP FUNCTION IF EXISTS decrement_stock(uuid, integer);

-- Now recreate the function
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS INTEGER AS $$
DECLARE
    new_stock INTEGER;
BEGIN
    UPDATE products
    SET stock = GREATEST(stock - quantity, 0)
    WHERE id = product_id
    RETURNING stock INTO new_stock;

    RETURN new_stock;
END;
$$ LANGUAGE plpgsql;