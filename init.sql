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

-- Insert Products across all categories
INSERT INTO products (
  name, slug, description, price, stock_quantity, is_featured, image_url, category_id
)
VALUES
  -- People Category
  ('Portrait Photography Session', 'portrait-session', 'Professional portrait photography session', 299.99, 20, TRUE, 'https://example.com/images/portrait.jpg', 1),
  ('Wedding Photography Package', 'wedding-package', 'Complete wedding day photography coverage', 1499.99, 10, FALSE, 'https://example.com/images/wedding.jpg', 1),
  ('Family Photo Session', 'family-session', 'Outdoor family photography session', 199.99, 15, FALSE, 'https://example.com/images/family.jpg', 1),

  -- Nature Category
  ('Mountain Landscape Print', 'mountain-print', 'High-resolution mountain landscape print', 79.99, 50, FALSE, 'https://example.com/images/mountain.jpg', 2),
  ('Forest Photography', 'forest-photo', 'Mystical forest scene in autumn', 89.99, 30, FALSE, 'https://example.com/images/forest.jpg', 2),
  ('Ocean Sunset Canvas', 'ocean-sunset', 'Large canvas print of ocean sunset', 129.99, 25, FALSE, 'https://example.com/images/ocean.jpg', 2),

  -- Food Category
  ('Culinary Photography Pack', 'culinary-pack', 'Professional food photography collection', 149.99, 20, FALSE, 'https://example.com/images/culinary.jpg', 3),
  ('Restaurant Menu Shoot', 'menu-shoot', 'Complete restaurant menu photography service', 399.99, 15, FALSE, 'https://example.com/images/menu.jpg', 3),
  ('Food Blog Package', 'food-blog', 'Monthly food photography subscription', 199.99, 10, FALSE, 'https://example.com/images/food-blog.jpg', 3),

  -- Landmarks Category
  ('Famous Monuments Collection', 'monuments', 'Collection of world-famous monuments prints', 199.99, 30, FALSE, 'https://example.com/images/monuments.jpg', 4),
  ('Historical Sites Portfolio', 'historical-sites', 'Curated portfolio of historical landmarks', 149.99, 25, FALSE, 'https://example.com/images/historical.jpg', 4),
  ('Architecture Print Series', 'architecture', 'Modern architecture photography series', 179.99, 20, FALSE, 'https://example.com/images/architecture.jpg', 4),

  -- Pets Category
  ('Pet Portrait Session', 'pet-portrait', 'Professional pet photography session', 149.99, 30, FALSE, 'https://example.com/images/pet-portrait.jpg', 5),
  ('Pet Action Photography', 'pet-action', 'Dynamic pet photography in motion', 199.99, 20, FALSE, 'https://example.com/images/pet-action.jpg', 5),
  ('Pet Family Package', 'pet-family', 'Multi-pet family photo session', 249.99, 15, FALSE, 'https://example.com/images/pet-family.jpg', 5),

  -- Premium Category
  ('Aerial Photography Package', 'aerial-package', 'Professional drone photography service', 599.99, 10, FALSE, 'https://example.com/images/aerial.jpg', 6),
  ('Commercial License Pack', 'commercial-license', 'Commercial usage rights for selected photos', 999.99, 5, FALSE, 'https://example.com/images/commercial.jpg', 6),
  ('Private Event Coverage', 'private-event', 'Exclusive event photography service', 799.99, 8, FALSE, 'https://example.com/images/private-event.jpg', 6),

  -- Cities Category
  ('Cityscape Print Collection', 'cityscape', 'Urban landscape photography collection', 249.99, 25, FALSE, 'https://example.com/images/cityscape.jpg', 7),
  ('Night City Photography', 'night-city', 'City lights and nighttime urban scenes', 179.99, 30, FALSE, 'https://example.com/images/night-city.jpg', 7),
  ('Street Photography Series', 'street-series', 'Urban life and street photography collection', 199.99, 20, FALSE, 'https://example.com/images/street.jpg', 7);
  
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