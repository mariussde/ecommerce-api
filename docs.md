# E-commerce API Documentation

## Overview

This is a NestJS-based RESTful API for an e-commerce platform, built with TypeScript and integrated with Supabase as the database backend. The API provides endpoints for managing products, categories, shopping carts, and orders.

## Table of Contents
1. [Setup](#setup)
2. [Architecture](#architecture)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Environment Configuration](#environment-configuration)
6. [Testing](#testing)

## Setup

### Prerequisites
- Node.js ≥ 16.0.0
- npm ≥ 8.0.0
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with Supabase credentials:
```
SUPABASE_URL=your-project-url
SUPABASE_KEY=your-anon-key
```

4. Initialize the database using the SQL commands in:

```1:153:init.sql
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

CREATE TABLE related_products (
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    related_product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, related_product_id)
  );

-- Indexes for better performance
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_featured ON products (is_featured);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX idx_related_products ON related_products(product_id);

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
  ('Portrait Photography Session', 'portrait-session', 'Professional portrait photography session', 299.99, 20, TRUE, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', 1),
  ('Wedding Photography Package', 'wedding-package', 'Complete wedding day photography coverage', 1499.99, 10, FALSE, 'https://images.unsplash.com/photo-1519741497674-611481863552', 1),
  ('Family Photo Session', 'family-session', 'Outdoor family photography session', 199.99, 15, FALSE, 'https://images.unsplash.com/photo-1511895426328-dc8714191300', 1),
  -- Nature Category
  ('Mountain Landscape Print', 'mountain-print', 'High-resolution mountain landscape print', 79.99, 50, FALSE, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', 2),
  ('Forest Photography', 'forest-photo', 'Mystical forest scene in autumn', 89.99, 30, FALSE, 'https://images.unsplash.com/photo-1448375240586-882707db888b', 2),
  ('Ocean Sunset Canvas', 'ocean-sunset', 'Large canvas print of ocean sunset', 129.99, 25, FALSE, 'https://images.unsplash.com/photo-1518837695005-2083093ee35b', 2),
  -- Food Category
  ('Culinary Photography Pack', 'culinary-pack', 'Professional food photography collection', 149.99, 20, FALSE, 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327', 3),
  ('Restaurant Menu Shoot', 'menu-shoot', 'Complete restaurant menu photography service', 399.99, 15, FALSE, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', 3),
  ('Food Blog Package', 'food-blog', 'Monthly food photography subscription', 199.99, 10, FALSE, 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a', 3),
  -- Landmarks Category
  ('Famous Monuments Collection', 'monuments', 'Collection of world-famous monuments prints', 199.99, 30, FALSE, 'https://images.unsplash.com/photo-1562767332-ce0bde8bdaa7', 4),
  ('Historical Sites Portfolio', 'historical-sites', 'Curated portfolio of historical landmarks', 149.99, 25, FALSE, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', 4),
  ('Architecture Print Series', 'architecture', 'Modern architecture photography series', 179.99, 20, FALSE, 'https://images.unsplash.com/photo-1487958449943-2429e8be8625', 4),
  -- Pets Category
  ('Pet Portrait Session', 'pet-portrait', 'Professional pet photography session', 149.99, 30, FALSE, 'https://images.unsplash.com/photo-1450778869180-41d0601e046e', 5),
  ('Pet Action Photography', 'pet-action', 'Dynamic pet photography in motion', 199.99, 20, FALSE, 'https://images.unsplash.com/photo-1444212477490-ca407925329e', 5),
  ('Pet Family Package', 'pet-family', 'Multi-pet family photo session', 249.99, 15, FALSE, 'https://images.unsplash.com/photo-1573865526739-10659fec78a5', 5),
  -- Premium Category
  ('Aerial Photography Package', 'aerial-package', 'Professional drone photography service', 599.99, 10, FALSE, 'https://images.unsplash.com/photo-1473773508845-188df298d2d1', 6),
  ('Commercial License Pack', 'commercial-license', 'Commercial usage rights for selected photos', 999.99, 5, FALSE, 'https://images.unsplash.com/photo-1542744095-291d1f67b221', 6),
  ('Private Event Coverage', 'private-event', 'Exclusive event photography service', 799.99, 8, FALSE, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622', 6),
  -- Cities Category
  ('Cityscape Print Collection', 'cityscape', 'Urban landscape photography collection', 249.99, 25, FALSE, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000', 7),
  ('Night City Photography', 'night-city', 'City lights and nighttime urban scenes', 179.99, 30, FALSE, 'https://images.unsplash.com/photo-1514565131-fce0801e5785', 7),
  ('Street Photography Series', 'street-series', 'Urban life and street photography collection', 199.99, 20, FALSE, 'https://images.unsplash.com/photo-1476973422084-5b37b8f53a03', 7);
  
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

INSERT INTO related_products (product_id, related_product_id)
VALUES 
    (1, 2),  -- Wedding Photography Package
    (1, 3),  -- Family Photo Session
    (1, 4)
```


5. Start the development server:
```bash
npm run start:dev
```

The server will run on port 4000 by default.

## Architecture

### Project Structure

```
src/
├── controllers/     # Route handlers
├── services/       # Business logic
├── models/         # Data models/interfaces
├── config/         # Configuration files
└── main.ts         # Application entry point
```

### Key Components

1. **Controllers**: Handle HTTP requests and route them to appropriate services
2. **Services**: Contain business logic and database interactions
3. **Models**: Define TypeScript interfaces for data structures
4. **Config**: Contains configuration like Supabase setup

### Database Integration

The application uses Supabase as its database backend, configured through the SupabaseConfig service:


```1:18:src/config/supabase.config.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseConfig {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_KEY || '',
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
```


## API Endpoints

### Products

- `GET /products` - List all products (with pagination)
  - Query parameters:
    - `category`: Filter by category slug
    - `sortBy`: Sort field (currently supports 'price')
    - `order`: Sort order ('asc' or 'desc')
    - `page`: Page number
    - `limit`: Items per page

- `GET /products/:slug` - Get product by slug
- `POST /products` - Create new product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Categories

- `GET /categories` - List all categories
- `GET /categories/:slug` - Get category by slug
- `POST /categories` - Create new category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Cart

- `POST /carts` - Create new cart
- `GET /carts/:id` - Get cart by ID
- `POST /carts/:cartId/items` - Add item to cart
- `PUT /carts/items/:id` - Update cart item quantity
- `DELETE /carts/:cartId/items/:itemId` - Remove item from cart
- `DELETE /carts/:id` - Delete cart

### Orders

- `POST /orders` - Create new order
- `GET /orders` - List all orders
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id/status` - Update order status
- `DELETE /orders/:id` - Cancel order

## Database Schema

The database schema includes tables for products, categories, carts, and orders. Key tables include:


```1:61:init.sql
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

CREATE TABLE related_products (
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    related_product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, related_product_id)
  );

-- Indexes for better performance
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_featured ON products (is_featured);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX idx_related_products ON related_products(product_id);

```


## Environment Configuration

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/public key

## Testing

The project includes both unit tests and e2e tests:

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

## CORS Configuration

The API has CORS enabled with the following configuration:


```4:13:src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    //origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });
  await app.listen(4000);
}
```


## API Examples

A complete Postman collection with example requests is available in the api-calls.json file, import it into Postman to test all available endpoints.
