-- Fix RLS policies for orders table to allow admin operations

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;

-- Create comprehensive policies for orders table
CREATE POLICY "Enable read access for all users" ON public.orders 
  FOR SELECT USING (true);

CREATE POLICY "Enable admin full access on orders" ON public.orders 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Create comprehensive policies for order_items table
CREATE POLICY "Enable read access for all users" ON public.order_items 
  FOR SELECT USING (true);

CREATE POLICY "Enable admin full access on order_items" ON public.order_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Also add policies for order_tracking table if it exists
ALTER TABLE public.order_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.order_tracking 
  FOR SELECT USING (true);

CREATE POLICY "Enable admin full access on order_tracking" ON public.order_tracking 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );