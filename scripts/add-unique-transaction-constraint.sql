-- Add unique constraint for transaction_id to ensure no duplicate transaction IDs
-- This is critical for security to prevent transaction ID reuse

-- First, check for any existing duplicate transaction IDs
SELECT transaction_id, COUNT(*) as count
FROM orders 
WHERE transaction_id IS NOT NULL AND transaction_id != ''
GROUP BY transaction_id
HAVING COUNT(*) > 1;

-- If duplicates exist, you'll need to resolve them manually before applying the constraint
-- For example, you might need to update duplicate transaction IDs or set them to NULL

-- Add unique constraint for transaction_id (excluding NULL values)
ALTER TABLE orders ADD CONSTRAINT unique_transaction_id 
  UNIQUE (transaction_id);

-- Create a partial index for better performance (only on non-null, non-empty transaction_ids)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_unique_transaction_id 
  ON orders(transaction_id) 
  WHERE transaction_id IS NOT NULL AND transaction_id != '';

-- Add a comment to document the security requirement
COMMENT ON CONSTRAINT unique_transaction_id ON orders IS 
  'Ensures transaction IDs are unique across all orders for security purposes';