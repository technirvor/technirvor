-- Add transaction_id field to orders table for mobile payment methods
DO $$ 
BEGIN
    -- Check if table exists first
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
        -- Add column if it doesn't exist
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
        
        -- Create index for transaction_id for faster lookups
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_orders_transaction_id') THEN
            CREATE INDEX idx_orders_transaction_id ON orders(transaction_id);
        END IF;

        -- Add comment to document the field
        COMMENT ON COLUMN orders.transaction_id IS 'Transaction ID for mobile payment methods (bKash, Nagad, Rocket, Upay)';
        
        RAISE NOTICE 'Payment transaction ID field added successfully!';
    ELSE
        RAISE EXCEPTION 'Table "orders" does not exist!';
    END IF;
END $$;

-- Display updated orders table structure
\d+ orders;
