-- Create coupon system tables
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user notifications table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('order', 'offer', 'status', 'message', 'coupon', 'reward')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for user-to-user and user-to-admin messaging
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation table to group messages
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID REFERENCES public.users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

-- Create admin users table if not exists (for messaging with admin)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON public.coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON public.coupons(expires_at);
CREATE INDEX IF NOT EXISTS idx_coupons_is_used ON public.coupons(is_used);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON public.user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON public.user_notifications(type);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
CREATE POLICY "Users can view their own coupons" ON public.coupons
  FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own coupons" ON public.coupons
  FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for user notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE USING (user_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    sender_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    receiver_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (receiver_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (
    participant_1 = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    participant_2 = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    participant_1 = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()) OR
    participant_2 = (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
  );

-- Function to generate random 6-character coupon code
CREATE OR REPLACE FUNCTION generate_coupon_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 6 character alphanumeric code (uppercase)
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || EXTRACT(EPOCH FROM NOW())::TEXT) FROM 1 FOR 6));
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_check
    FROM public.coupons
    WHERE code = code;
    
    -- If code doesn't exist, return it
    IF exists_check = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create welcome coupon for new users
CREATE OR REPLACE FUNCTION create_welcome_coupon(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  coupon_code TEXT;
BEGIN
  -- Generate unique coupon code
  coupon_code := generate_coupon_code();
  
  -- Create coupon with 72 hours expiry
  INSERT INTO public.coupons (
    code,
    user_id,
    discount_type,
    discount_value,
    minimum_order_amount,
    expires_at
  ) VALUES (
    coupon_code,
    p_user_id,
    'percentage',
    10.00, -- 10% discount
    500.00, -- Minimum order 500 BDT
    NOW() + INTERVAL '72 hours'
  );
  
  -- Send notification to user
  INSERT INTO public.user_notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_user_id,
    'coupon',
    'Welcome Coupon!',
    'Congratulations! You have received a 10% discount coupon. Use code: ' || coupon_code,
    jsonb_build_object('coupon_code', coupon_code, 'discount', '10%', 'expires_in', '72 hours')
  );
  
  RETURN coupon_code;
END;
$$ LANGUAGE plpgsql;

-- Function to send notification to user
CREATE OR REPLACE FUNCTION send_user_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.user_notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_data
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create or get conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE (participant_1 = p_user1_id AND participant_2 = p_user2_id)
     OR (participant_1 = p_user2_id AND participant_2 = p_user1_id)
  LIMIT 1;
  
  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1, participant_2)
    VALUES (p_user1_id, p_user2_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to send message
CREATE OR REPLACE FUNCTION send_message(
  p_sender_id UUID,
  p_receiver_id UUID,
  p_message TEXT,
  p_message_type VARCHAR(20) DEFAULT 'text',
  p_attachment_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  message_id UUID;
  conversation_id UUID;
BEGIN
  -- Get or create conversation
  conversation_id := get_or_create_conversation(p_sender_id, p_receiver_id);
  
  -- Insert message
  INSERT INTO public.messages (
    sender_id,
    receiver_id,
    message,
    message_type,
    attachment_url
  ) VALUES (
    p_sender_id,
    p_receiver_id,
    p_message,
    p_message_type,
    p_attachment_url
  ) RETURNING id INTO message_id;
  
  -- Update conversation with last message
  UPDATE public.conversations
  SET last_message_id = message_id,
      last_message_at = NOW()
  WHERE id = conversation_id;
  
  -- Send notification to receiver
  PERFORM send_user_notification(
    p_receiver_id,
    'message',
    'New Message',
    'You have received a new message',
    jsonb_build_object('message_id', message_id, 'sender_id', p_sender_id)
  );
  
  RETURN message_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create welcome coupon after user registration
CREATE OR REPLACE FUNCTION trigger_create_welcome_coupon()
RETURNS TRIGGER AS $$
DECLARE
  coupon_code TEXT;
BEGIN
  -- Create welcome coupon for new user
  coupon_code := create_welcome_coupon(NEW.id);
  
  RAISE NOTICE 'Welcome coupon created for user %: %', NEW.full_name, coupon_code;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for welcome coupon
DROP TRIGGER IF EXISTS trigger_welcome_coupon ON public.users;
CREATE TRIGGER trigger_welcome_coupon
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_welcome_coupon();

-- Function to notify user about order status changes
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
  status_message TEXT;
BEGIN
  -- Only notify if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Find user by phone number
    SELECT * INTO user_record
    FROM public.users
    WHERE phone = normalize_bd_phone(NEW.customer_phone)
    LIMIT 1;
    
    IF FOUND THEN
      -- Create status message based on new status
      CASE NEW.status
        WHEN 'confirmed' THEN
          status_message := 'Your order #' || NEW.order_number || ' has been confirmed and is being prepared.';
        WHEN 'processing' THEN
          status_message := 'Your order #' || NEW.order_number || ' is now being processed.';
        WHEN 'shipped' THEN
          status_message := 'Great news! Your order #' || NEW.order_number || ' has been shipped.';
        WHEN 'delivered' THEN
          status_message := 'Your order #' || NEW.order_number || ' has been delivered. Thank you for shopping with us!';
        WHEN 'cancelled' THEN
          status_message := 'Your order #' || NEW.order_number || ' has been cancelled.';
        ELSE
          status_message := 'Your order #' || NEW.order_number || ' status has been updated to: ' || NEW.status;
      END CASE;
      
      -- Send notification
      PERFORM send_user_notification(
        user_record.id,
        'order',
        'Order Status Update',
        status_message,
        jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number, 'status', NEW.status)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status notifications
DROP TRIGGER IF EXISTS trigger_order_status_notification ON public.orders;
CREATE TRIGGER trigger_order_status_notification
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

GRANT EXECUTE ON FUNCTION generate_coupon_code() TO authenticated;
GRANT EXECUTE ON FUNCTION create_welcome_coupon(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION send_user_notification(UUID, VARCHAR(50), VARCHAR(255), TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION send_message(UUID, UUID, TEXT, VARCHAR(20), TEXT) TO authenticated;

-- Insert sample admin user for testing (you should update this with real admin data)
INSERT INTO public.admin_users (user_id, full_name, email, role)
SELECT 
  auth.uid(),
  'System Admin',
  'admin@technirvor.com',
  'super_admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_users WHERE email = 'admin@technirvor.com'
);

RAISE NOTICE 'Coupon, notification, and messaging system created successfully!';