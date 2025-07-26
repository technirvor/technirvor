CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    order_number text NOT NULL,
    phone_number text NOT NULL,
    review_text text NOT NULL,
    review_images text[] DEFAULT '{}'::text[] NOT NULL,
    rating integer NOT NULL DEFAULT 0, -- Added rating column
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT reviews_order_number_key UNIQUE (order_number) -- Ensure one review per order number
);

ALTER TABLE public.reviews ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.reviews FOR SELECT USING (true);
-- Modified policy to allow anonymous inserts for testing. Revert to auth.uid() IS NOT NULL if authentication is required.
CREATE POLICY "Enable insert for all users" ON public.reviews FOR INSERT WITH CHECK (true);
