-- Insert sample categories
INSERT INTO categories (name, slug, image_url) VALUES
('Electronics', 'electronics', '/placeholder.svg?height=100&width=100'),
('Fashion', 'fashion', '/placeholder.svg?height=100&width=100'),
('Home & Garden', 'home-garden', '/placeholder.svg?height=100&width=100'),
('Sports', 'sports', '/placeholder.svg?height=100&width=100'),
('Books', 'books', '/placeholder.svg?height=100&width=100'),
('Beauty', 'beauty', '/placeholder.svg?height=100&width=100');

-- Insert sample products
INSERT INTO products (name, slug, description, price, sale_price, image_url, category_id, is_featured, is_flash_sale, stock) 
SELECT 
  'Smartphone Pro Max',
  'smartphone-pro-max',
  'Latest smartphone with advanced features',
  85000,
  75000,
  '/placeholder.svg?height=400&width=400',
  c.id,
  true,
  true,
  50
FROM categories c WHERE c.slug = 'electronics'
UNION ALL
SELECT 
  'Wireless Headphones',
  'wireless-headphones',
  'Premium wireless headphones with noise cancellation',
  12000,
  9500,
  '/placeholder.svg?height=400&width=400',
  c.id,
  true,
  false,
  100
FROM categories c WHERE c.slug = 'electronics'
UNION ALL
SELECT 
  'Cotton T-Shirt',
  'cotton-t-shirt',
  'Comfortable cotton t-shirt for everyday wear',
  1500,
  1200,
  '/placeholder.svg?height=400&width=400',
  c.id,
  true,
  false,
  200
FROM categories c WHERE c.slug = 'fashion'
UNION ALL
SELECT 
  'Running Shoes',
  'running-shoes',
  'Professional running shoes for athletes',
  8500,
  7000,
  '/placeholder.svg?height=400&width=400',
  c.id,
  true,
  true,
  75
FROM categories c WHERE c.slug = 'sports'
UNION ALL
SELECT 
  'Coffee Maker',
  'coffee-maker',
  'Automatic coffee maker for perfect brew',
  15000,
  NULL,
  '/placeholder.svg?height=400&width=400',
  c.id,
  false,
  false,
  30
FROM categories c WHERE c.slug = 'home-garden'
UNION ALL
SELECT 
  'Programming Book',
  'programming-book',
  'Complete guide to modern programming',
  2500,
  2000,
  '/placeholder.svg?height=400&width=400',
  c.id,
  false,
  false,
  150
FROM categories c WHERE c.slug = 'books';

-- Insert hero slides
INSERT INTO hero_slides (title, subtitle, image_url, link_url, order_index) VALUES
('Welcome to Our Store', 'Discover amazing products at great prices', '/placeholder.svg?height=400&width=800', '/products', 1),
('Flash Sale Now Live', 'Up to 70% off on selected items', '/placeholder.svg?height=400&width=800', '/flash-sale', 2),
('New Arrivals', 'Check out our latest products', '/placeholder.svg?height=400&width=800', '/products?filter=new', 3);

-- Insert districts with delivery charges
INSERT INTO districts (name, delivery_charge) VALUES
('Dhaka', 60),
('Chittagong', 100),
('Rajshahi', 120),
('Khulna', 120),
('Barisal', 150),
('Sylhet', 150),
('Rangpur', 150),
('Mymensingh', 120);
