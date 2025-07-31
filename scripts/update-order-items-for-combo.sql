-- Update order_items table to support combo products
ALTER TABLE order_items 
ADD COLUMN is_combo BOOLEAN DEFAULT FALSE,
ADD COLUMN combo_id UUID,
ADD COLUMN combo_name VARCHAR(255);

-- Add index for combo queries
CREATE INDEX idx_order_items_combo ON order_items(combo_id) WHERE combo_id IS NOT NULL;

-- Add comment to explain the combo fields
COMMENT ON COLUMN order_items.is_combo IS 'Indicates if this order item is part of a combo product';
COMMENT ON COLUMN order_items.combo_id IS 'Reference to the combo product ID if this item is part of a combo';
COMMENT ON COLUMN order_items.combo_name IS 'Name of the combo product for display purposes';