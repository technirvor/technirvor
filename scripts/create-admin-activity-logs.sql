-- Create admin activity logs table for security monitoring
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user_id ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_ip_address ON admin_activity_logs(ip_address);

-- Enable RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin users can view all activity logs" ON admin_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.is_active = true
    )
  );

CREATE POLICY "System can insert activity logs" ON admin_activity_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create a function to clean up old logs (optional)
CREATE OR REPLACE FUNCTION cleanup_old_admin_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM admin_activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON admin_activity_logs TO authenticated;
GRANT INSERT ON admin_activity_logs TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_admin_logs() TO service_role;

-- Add comment
COMMENT ON TABLE admin_activity_logs IS 'Logs all admin activities for security monitoring and audit purposes';