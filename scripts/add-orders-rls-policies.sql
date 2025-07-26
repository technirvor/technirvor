ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.orders FOR SELECT USING (true);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.order_items FOR SELECT USING (true);
