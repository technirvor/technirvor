-- Create users table for customer registration
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  district VARCHAR(100),
  address TEXT,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user rewards table
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  current_tier VARCHAR(20) DEFAULT 'bronze' CHECK (current_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  tier_progress INTEGER DEFAULT 0,
  next_tier_threshold INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reward transactions table
CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')),
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reward tiers table
CREATE TABLE IF NOT EXISTS public.reward_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name VARCHAR(20) UNIQUE NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  benefits JSONB DEFAULT '{}',
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  free_delivery_threshold DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user referrals table
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  reward_points INTEGER DEFAULT 100,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions table for tracking login sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create phone verification table
CREATE TABLE IF NOT EXISTS public.phone_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  attempts INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_district ON public.users(district);
CREATE INDEX IF NOT EXISTS idx_users_registration_date ON public.users(registration_date);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON public.user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_tier ON public.user_rewards(current_tier);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_user_id ON public.reward_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_type ON public.reward_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_reward_transactions_created_at ON public.reward_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON public.user_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_referred ON public.user_referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON public.user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON public.phone_verifications(phone);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view and update their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- Allow user registration (insert)
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- User rewards policies
CREATE POLICY "Users can view own rewards" ON public.user_rewards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_rewards.user_id AND auth_user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage rewards" ON public.user_rewards
  FOR ALL USING (true);

-- Reward transactions policies
CREATE POLICY "Users can view own transactions" ON public.reward_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = reward_transactions.user_id AND auth_user_id = auth.uid()
    )
  );

-- Reward tiers are public
CREATE POLICY "Reward tiers are public" ON public.reward_tiers
  FOR SELECT USING (true);

-- User referrals policies
CREATE POLICY "Users can view own referrals" ON public.user_referrals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_referrals.referrer_id AND auth_user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_referrals.referred_id AND auth_user_id = auth.uid()
    )
  );

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = user_sessions.user_id AND auth_user_id = auth.uid()
    )
  );

-- Phone verification policies (allow anonymous access for registration)
CREATE POLICY "Allow phone verification" ON public.phone_verifications
  FOR ALL USING (true);

-- Insert default reward tiers
INSERT INTO public.reward_tiers (tier_name, min_points, max_points, benefits, discount_percentage, free_delivery_threshold) VALUES
('bronze', 0, 999, '{"welcome_bonus": 50, "birthday_bonus": 100}', 0, 1000),
('silver', 1000, 4999, '{"welcome_bonus": 50, "birthday_bonus": 200, "early_access": true}', 5, 800),
('gold', 5000, 19999, '{"welcome_bonus": 50, "birthday_bonus": 300, "early_access": true, "priority_support": true}', 10, 500),
('platinum', 20000, NULL, '{"welcome_bonus": 50, "birthday_bonus": 500, "early_access": true, "priority_support": true, "exclusive_products": true}', 15, 0)
ON CONFLICT (tier_name) DO NOTHING;

-- Function to validate Bangladeshi phone numbers
CREATE OR REPLACE FUNCTION validate_bd_phone(phone_number TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Remove any spaces, dashes, or plus signs
  phone_number := REGEXP_REPLACE(phone_number, '[\s\-\+]', '', 'g');
  
  -- Check if it starts with 880 (country code) and has 13 digits total
  IF phone_number ~ '^880[1-9][0-9]{8}$' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if it starts with 01 and has 11 digits total (local format)
  IF phone_number ~ '^01[3-9][0-9]{8}$' THEN
    RETURN TRUE;
  END IF;
  
  -- Check if it starts with 1 and has 10 digits total (without leading 0)
  IF phone_number ~ '^1[3-9][0-9]{8}$' THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to normalize Bangladeshi phone numbers
CREATE OR REPLACE FUNCTION normalize_bd_phone(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Remove any spaces, dashes, or plus signs
  phone_number := REGEXP_REPLACE(phone_number, '[\s\-\+]', '', 'g');
  
  -- If it starts with 880, keep as is
  IF phone_number ~ '^880[1-9][0-9]{8}$' THEN
    RETURN phone_number;
  END IF;
  
  -- If it starts with 01, convert to 8801 format
  IF phone_number ~ '^01[3-9][0-9]{8}$' THEN
    RETURN '880' || SUBSTRING(phone_number FROM 2);
  END IF;
  
  -- If it starts with 1 (without 0), convert to 8801 format
  IF phone_number ~ '^1[3-9][0-9]{8}$' THEN
    RETURN '8801' || phone_number;
  END IF;
  
  -- Return original if no pattern matches
  RETURN phone_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate reward points for orders
CREATE OR REPLACE FUNCTION calculate_order_points(order_amount DECIMAL)
RETURNS INTEGER AS $$
BEGIN
  -- 1 point for every 10 BDT spent
  RETURN FLOOR(order_amount / 10)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Function to update user tier based on lifetime points
CREATE OR REPLACE FUNCTION update_user_tier(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  user_lifetime_points INTEGER;
  new_tier VARCHAR(20);
  new_threshold INTEGER;
BEGIN
  -- Get user's lifetime points
  SELECT lifetime_points INTO user_lifetime_points
  FROM public.user_rewards
  WHERE user_id = p_user_id;
  
  -- Determine new tier
  IF user_lifetime_points >= 20000 THEN
    new_tier := 'platinum';
    new_threshold := NULL;
  ELSIF user_lifetime_points >= 5000 THEN
    new_tier := 'gold';
    new_threshold := 20000;
  ELSIF user_lifetime_points >= 1000 THEN
    new_tier := 'silver';
    new_threshold := 5000;
  ELSE
    new_tier := 'bronze';
    new_threshold := 1000;
  END IF;
  
  -- Update user tier
  UPDATE public.user_rewards
  SET 
    current_tier = new_tier,
    next_tier_threshold = new_threshold,
    tier_progress = CASE 
      WHEN new_threshold IS NULL THEN 100
      ELSE ROUND((user_lifetime_points::DECIMAL / new_threshold) * 100)
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add reward points
CREATE OR REPLACE FUNCTION add_reward_points(
  p_user_id UUID,
  p_points INTEGER,
  p_description TEXT,
  p_order_id UUID DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO public.reward_transactions (
    user_id,
    transaction_type,
    points,
    description,
    order_id,
    expires_at
  ) VALUES (
    p_user_id,
    'earned',
    p_points,
    p_description,
    p_order_id,
    COALESCE(p_expires_at, NOW() + INTERVAL '1 year')
  );
  
  -- Update user rewards
  UPDATE public.user_rewards
  SET 
    total_points = total_points + p_points,
    lifetime_points = lifetime_points + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Update user tier
  PERFORM update_user_tier(p_user_id);
END;
$$ LANGUAGE plpgsql;

-- Function to redeem reward points
CREATE OR REPLACE FUNCTION redeem_reward_points(
  p_user_id UUID,
  p_points INTEGER,
  p_description TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_points INTEGER;
BEGIN
  -- Get current points
  SELECT total_points INTO current_points
  FROM public.user_rewards
  WHERE user_id = p_user_id;
  
  -- Check if user has enough points
  IF current_points < p_points THEN
    RETURN FALSE;
  END IF;
  
  -- Insert transaction record
  INSERT INTO public.reward_transactions (
    user_id,
    transaction_type,
    points,
    description
  ) VALUES (
    p_user_id,
    'redeemed',
    -p_points,
    p_description
  );
  
  -- Update user rewards
  UPDATE public.user_rewards
  SET 
    total_points = total_points - p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user rewards when user is created
CREATE OR REPLACE FUNCTION create_user_rewards()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_rewards (user_id)
  VALUES (NEW.id);
  
  -- Give welcome bonus
  PERFORM add_reward_points(NEW.id, 50, 'Welcome bonus for new registration');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_rewards
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_rewards();

-- Trigger to award points when order is completed
CREATE OR REPLACE FUNCTION award_order_points()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
  points_to_award INTEGER;
BEGIN
  -- Only award points when order status changes to 'delivered'
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    -- Find user by phone number
    SELECT * INTO user_record
    FROM public.users
    WHERE phone = normalize_bd_phone(NEW.customer_phone)
    LIMIT 1;
    
    IF FOUND THEN
      -- Calculate points
      points_to_award := calculate_order_points(NEW.total_amount);
      
      -- Award points
      PERFORM add_reward_points(
        user_record.id,
        points_to_award,
        'Points earned from order #' || NEW.order_number,
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_order_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION award_order_points();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_check
    FROM public.user_referrals
    WHERE referral_code = code;
    
    -- If code doesn't exist, return it
    IF exists_check = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

RAISE NOTICE 'User registration and rewards system created successfully!';