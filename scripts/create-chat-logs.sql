-- Create chat logs table to track user conversations
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL, -- To group messages in a conversation
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  response_type VARCHAR(50), -- product_search, category_search, recommendations, etc.
  user_ip INET,
  user_agent TEXT,
  products_returned JSONB, -- Store product IDs if products were returned
  conversation_context JSONB, -- Store additional context like search queries
  response_time_ms INTEGER, -- Track response performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_response_type ON chat_logs(response_type);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user_ip ON chat_logs(user_ip);

-- Enable Row Level Security
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access only
CREATE POLICY "Admin users can view chat logs" ON chat_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "System can insert chat logs" ON chat_logs
  FOR INSERT WITH CHECK (true);

-- Function to clean up old chat logs (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_chat_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to get chat analytics
CREATE OR REPLACE FUNCTION get_chat_analytics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_conversations BIGINT,
  total_messages BIGINT,
  avg_response_time NUMERIC,
  popular_response_types JSONB,
  daily_message_count JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT session_id) as total_conversations,
    COUNT(*) as total_messages,
    AVG(response_time_ms) as avg_response_time,
    (
      SELECT jsonb_object_agg(response_type, count)
      FROM (
        SELECT response_type, COUNT(*) as count
        FROM chat_logs 
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY response_type
        ORDER BY count DESC
        LIMIT 10
      ) t
    ) as popular_response_types,
    (
      SELECT jsonb_object_agg(date, count)
      FROM (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM chat_logs 
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY DATE(created_at)
        ORDER BY date
      ) t
    ) as daily_message_count
  FROM chat_logs
  WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular search queries
CREATE OR REPLACE FUNCTION get_popular_search_queries(
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  query TEXT,
  count BIGINT,
  last_searched TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (conversation_context->>'query')::TEXT as query,
    COUNT(*) as count,
    MAX(created_at) as last_searched
  FROM chat_logs
  WHERE response_type IN ('product_search', 'category_search')
    AND conversation_context->>'query' IS NOT NULL
    AND created_at > NOW() - INTERVAL '30 days'
  GROUP BY conversation_context->>'query'
  ORDER BY count DESC, last_searched DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for chat_logs table (optional, for real-time admin monitoring)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_logs;

-- Notify creation success
DO $$
BEGIN
  RAISE NOTICE 'Chat logs table created successfully with analytics functions';
END;
$$;