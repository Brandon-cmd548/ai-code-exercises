-- Performance optimization: Add missing indexes
-- This script should be run AFTER 01-create-user.sql and table creation

-- Index on order_items to support joins and subqueries
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

-- Index on order_status_history to support joins and subqueries
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id 
ON order_status_history(order_id);

-- Index on orders customer_id for faster customer lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_id 
ON orders(customer_id);

-- Composite index for date range queries on orders
CREATE INDEX IF NOT EXISTS idx_orders_customer_date 
ON orders(customer_id, order_date DESC);

-- Index on order_items product_id for joins with products
CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
ON order_items(product_id);

-- Index on orders shipping_address_id for address joins
CREATE INDEX IF NOT EXISTS idx_orders_shipping_address_id 
ON orders(shipping_address_id);

-- Optional: Analyze tables so PostgreSQL knows about the new indexes
ANALYZE orders;
ANALYZE order_items;
ANALYZE order_status_history;
ANALYZE customers;
ANALYZE products;
ANALYZE addresses;
