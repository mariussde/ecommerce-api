-- Products and Categories
CREATE TABLE
  categories (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    NAME TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  products (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    NAME TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_featured BOOLEAN DEFAULT FALSE,
    image_url TEXT NOT NULL,
    category_id BIGINT REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

-- Cart and Orders
CREATE TABLE
  carts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  cart_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    cart_id BIGINT REFERENCES carts (id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products (id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_time DECIMAL(10, 2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  orders (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    status TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE
  order_items (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    order_id BIGINT REFERENCES orders (id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products (id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10, 2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

-- Indexes for better performance
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_featured ON products (is_featured);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);

------ Populate

-- Insert Categories
INSERT INTO categories (name, slug)
VALUES
  ('People', 'people'),
  ('Nature', 'nature'),
  ('Food', 'food'),
  ('Landmarks', 'landmarks'),
  ('Pets', 'pets'),
  ('Premium', 'premium'),
  ('Cities', 'cities');

-- Insert Products with direct category reference
INSERT INTO products (
  name, slug, description, price, stock_quantity, is_featured, image_url, category_id
)
VALUES
  ('Laptop Pro 2024', 'laptop-pro-2024', 'High-end laptop with powerful specs and sleek design', 1499.99, 10, TRUE, 'https://example.com/images/laptop-pro-2024.jpg', 6),
  ('Wireless Earbuds', 'wireless-earbuds', 'Noise-cancelling wireless earbuds with high-quality sound', 99.99, 50, FALSE, 'https://example.com/images/wireless-earbuds.jpg', 6),
  ('Smartphone Max', 'smartphone-max', 'Latest generation smartphone with enhanced camera and battery life', 999.99, 20, FALSE, 'https://example.com/images/smartphone-max.jpg', 6),
  ('4K Ultra Monitor', '4k-ultra-monitor', '32-inch 4K monitor with HDR support for immersive visuals', 499.99, 15, FALSE, 'https://example.com/images/4k-ultra-monitor.jpg', 6),
  ('Gaming Keyboard', 'gaming-keyboard', 'Mechanical keyboard with customizable RGB lighting', 79.99, 35, FALSE, 'https://example.com/images/gaming-keyboard.jpg', 6),
  ('External Hard Drive', 'external-hard-drive', 'Portable 1TB external hard drive for secure data storage', 59.99, 25, FALSE, 'https://example.com/images/external-hard-drive.jpg', 6),
  ('Smartwatch Series 5', 'smartwatch-series-5', 'Water-resistant smartwatch with fitness tracking features', 199.99, 40, FALSE, 'https://example.com/images/smartwatch-series-5.jpg', 6),
  ('Bluetooth Speaker', 'bluetooth-speaker', 'Portable Bluetooth speaker with long battery life', 49.99, 30, FALSE, 'https://example.com/images/bluetooth-speaker.jpg', 6),
  ('HD Webcam', 'hd-webcam', '1080p HD webcam with built-in microphone', 39.99, 20, FALSE, 'https://example.com/images/hd-webcam.jpg', 6),
  ('USB-C Hub', 'usb-c-hub', 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader', 29.99, 45, FALSE, 'https://example.com/images/usb-c-hub.jpg', 6);

-- Insert a Cart
WITH inserted_cart AS (
  INSERT INTO carts (created_at, updated_at)
  VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id
)
-- Insert Cart Items
INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time, created_at)
SELECT inserted_cart.id, product_id, quantity, price_at_time, CURRENT_TIMESTAMP
FROM inserted_cart,
  (VALUES
    (1, 1, 1, 1499.99),
    (1, 2, 2, 99.99),
    (1, 3, 1, 999.99)
  ) AS items(cart_id, product_id, quantity, price_at_time);

-- Insert an Order
WITH inserted_order AS (
  INSERT INTO orders (status, total_amount, created_at, updated_at)
  VALUES ('pending', 2599.97, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  RETURNING id
)
-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, price_at_time, created_at)
SELECT inserted_order.id, product_id, quantity, price_at_time, CURRENT_TIMESTAMP
FROM inserted_order,
  (VALUES
    (1, 1, 1, 1499.99),
    (1, 2, 2, 99.99),
    (1, 3, 1, 999.99)
  ) AS items(order_id, product_id, quantity, price_at_time);