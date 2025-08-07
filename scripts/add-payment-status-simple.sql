-- Add payment_status column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Add check constraint for valid payment status values
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_payment_status 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'cancelled'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update existing orders to set initial payment_status based on current data
UPDATE orders SET payment_status = 
  CASE 
    WHEN status = 'delivered' THEN 'paid'
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN transaction_id IS NOT NULL AND transaction_id != '' THEN 'paid'
    ELSE 'pending'
  END
WHERE payment_status = 'pending';