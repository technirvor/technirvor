-- Create admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin',
  permissions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin activity logs table
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create API rate limiting table
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address INET NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);
CREATE INDEX idx_admin_activity_logs_admin_user ON admin_activity_logs(admin_user_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX idx_api_rate_limits_ip_endpoint ON api_rate_limits(ip_address, endpoint);
CREATE INDEX idx_api_rate_limits_window_start ON api_rate_limits(window_start);

-- Row Level Security (RLS) policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only allow admin users to access admin tables
CREATE POLICY "Admin users can view their own data" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view activity logs" ON admin_activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50) DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id 
  FROM admin_users 
  WHERE user_id = auth.uid() AND is_active = true;
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO admin_activity_logs (
      admin_user_id,
      action,
      resource_type,
      resource_id,
      details,
      ip_address,
      user_agent
    ) VALUES (
      admin_user_id,
      p_action,
      p_resource_type,
      p_resource_id,
      p_details,
      p_ip_address,
      p_user_agent
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address INET,
  p_endpoint VARCHAR(255),
  p_limit INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Clean old entries
  DELETE FROM api_rate_limits 
  WHERE window_start < window_start;
  
  -- Get current count
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM api_rate_limits
  WHERE ip_address = p_ip_address 
    AND endpoint = p_endpoint
    AND window_start >= window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO api_rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (p_ip_address, p_endpoint, 1, NOW())
  ON CONFLICT (ip_address, endpoint) 
  DO UPDATE SET 
    request_count = api_rate_limits.request_count + 1,
    window_start = CASE 
      WHEN api_rate_limits.window_start < window_start THEN NOW()
      ELSE api_rate_limits.window_start
    END;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert a default admin user (update with your actual admin email)
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES ('admin@example.com', crypt('your-secure-password', gen_salt('bf')), NOW(), NOW(), NOW());

-- Then create the admin_users record
-- INSERT INTO admin_users (user_id, role, permissions)
-- SELECT id, 'super_admin', ARRAY['all'] FROM auth.users WHERE email = 'admin@example.com';
