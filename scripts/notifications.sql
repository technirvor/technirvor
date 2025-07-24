-- Create admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('new_order', 'order_update', 'low_stock', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  order_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_order_id ON admin_notifications(order_id);

-- Enable Row Level Security
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
CREATE POLICY "Admin users can view notifications" ON admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can update notifications" ON admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin users can delete notifications" ON admin_notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can insert notifications" ON admin_notifications
  FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_admin_notifications_updated_at ON admin_notifications;
CREATE TRIGGER trigger_admin_notifications_updated_at
  BEFORE UPDATE ON admin_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_notifications_updated_at();

-- Function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_notifications 
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM admin_notifications
  WHERE is_read = FALSE;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for admin_notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;

-- Create a function to send notification to all active admins
CREATE OR REPLACE FUNCTION notify_all_admins(
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_order_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_notifications (type, title, message, order_id)
  VALUES (p_type, p_title, p_message, p_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to notify about new orders
CREATE OR REPLACE FUNCTION notify_new_order(
  p_order_id UUID,
  p_customer_name VARCHAR(255),
  p_total_amount DECIMAL(10,2)
)
RETURNS void AS $$
BEGIN
  PERFORM notify_all_admins(
    'new_order',
    'New Order Received!',
    'Order from ' || p_customer_name || ' - ৳' || p_total_amount::text,
    p_order_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to notify about low stock
CREATE OR REPLACE FUNCTION notify_low_stock(
  p_product_name VARCHAR(255),
  p_current_stock INTEGER
)
RETURNS void AS $$
BEGIN
  PERFORM notify_all_admins(
    'low_stock',
    'Low Stock Alert',
    p_product_name || ' has only ' || p_current_stock::text || ' items left'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically check stock levels after products are updated
CREATE OR REPLACE FUNCTION check_stock_after_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If stock is low (10 or less) and was higher before, send notification
  IF NEW.stock <= 10 AND NEW.stock > 0 AND OLD.stock > 10 THEN
    PERFORM notify_low_stock(NEW.name, NEW.stock);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stock checking on products table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    DROP TRIGGER IF EXISTS trigger_check_stock_after_update ON products;
    CREATE TRIGGER trigger_check_stock_after_update
      AFTER UPDATE OF stock ON products
      FOR EACH ROW
      EXECUTE FUNCTION check_stock_after_update();
  END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_all_admins(VARCHAR(50), VARCHAR(255), TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_new_order(UUID, VARCHAR(255), DECIMAL(10,2)) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_low_stock(VARCHAR(255), INTEGER) TO authenticated;

-- Insert a welcome notification for testing
INSERT INTO admin_notifications (type, title, message)
VALUES (
  'system',
  'Welcome to Admin Panel',
  'Your notification system is now active. You will receive real-time alerts for new orders and low stock items.'
);

-- Show final status
SELECT 'Admin notifications system setup completed successfully!' as status;
