-- Add payment_status column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Add constraint to ensure valid payment status values
ALTER TABLE orders ADD CONSTRAINT IF NOT EXISTS check_payment_status 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial_refund', 'cancelled'));

-- Create index for better performance on payment status queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update existing orders based on current logic
UPDATE orders SET payment_status = 
  CASE 
    WHEN status = 'delivered' THEN 'paid'
    WHEN status = 'cancelled' THEN 'cancelled'
    WHEN payment_method = 'cod' OR payment_method = 'COD' THEN 'pending'
    WHEN transaction_id IS NOT NULL AND transaction_id != '' THEN 'paid'
    ELSE 'pending'
  END
WHERE payment_status = 'pending';

-- Create payment tracking table for payment status history
CREATE TABLE IF NOT EXISTS payment_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  payment_status VARCHAR(50) NOT NULL,
  note TEXT,
  amount DECIMAL(10,2),
  transaction_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for payment tracking
CREATE INDEX IF NOT EXISTS idx_payment_tracking_order_id ON payment_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_tracking_created_at ON payment_tracking(created_at DESC);

-- Enable RLS for payment tracking
ALTER TABLE payment_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON payment_tracking FOR SELECT USING (true);

RAISE NOTICE 'Payment status system added successfully';