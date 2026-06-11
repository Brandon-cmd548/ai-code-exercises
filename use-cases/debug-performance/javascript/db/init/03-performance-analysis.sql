-- Script to diagnose slow query performance using EXPLAIN ANALYZE
-- Run this AFTER you've added indexes from 02-create-indexes.sql

-- STEP 1: Analyze the ORIGINAL SLOW QUERY to see the execution plan
-- This shows you EXACTLY where the time is spent
EXPLAIN ANALYZE
SELECT
  o.order_id,
  o.order_date,
  o.total_amount,
  o.status,
  c.customer_name,
  c.email,
  (
    SELECT json_agg(
      json_build_object(
        'product_id', p.product_id,
        'product_name', p.name,
        'quantity', oi.quantity,
        'unit_price', p.price,
        'subtotal', (oi.quantity * p.price)
      )
    )
    FROM order_items oi
    JOIN products p ON oi.product_id = p.product_id
    WHERE oi.order_id = o.order_id
  ) as items,
  (
    SELECT 
      array_to_json(
        array_agg(
          json_build_object(
            'status', s.status,
            'date', s.status_date,
            'notes', s.notes
          )
          ORDER BY s.status_date DESC
        )
      )
    FROM order_status_history s
    WHERE s.order_id = o.order_id
  ) as status_history,
  a.street,
  a.city,
  a.state,
  a.postal_code,
  a.country
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN addresses a ON o.shipping_address_id = a.address_id
WHERE o.customer_id = 1
  AND o.order_date BETWEEN '2023-01-01' AND '2023-12-31'
ORDER BY o.order_date DESC;

-- STEP 2: Analyze the OPTIMIZED QUERY to compare
-- This should show much lower "Total Runtime" and "Execution Time"
EXPLAIN ANALYZE
WITH order_data AS (
  SELECT
    o.order_id,
    o.order_date,
    o.total_amount,
    o.status,
    c.customer_id,
    c.customer_name,
    c.email,
    a.street,
    a.city,
    a.state,
    a.postal_code,
    a.country
  FROM orders o
  JOIN customers c ON o.customer_id = c.customer_id
  LEFT JOIN addresses a ON o.shipping_address_id = a.address_id
  WHERE o.customer_id = 1
    AND o.order_date BETWEEN '2023-01-01' AND '2023-12-31'
  ORDER BY o.order_date DESC
),
items_data AS (
  SELECT
    oi.order_id,
    p.product_id,
    p.name as product_name,
    oi.quantity,
    p.price as unit_price
  FROM order_items oi
  JOIN products p ON oi.product_id = p.product_id
  WHERE oi.order_id IN (
    SELECT order_id FROM order_data
  )
),
status_data AS (
  SELECT
    osh.order_id,
    osh.status,
    osh.status_date,
    osh.notes
  FROM order_status_history osh
  WHERE osh.order_id IN (
    SELECT order_id FROM order_data
  )
  ORDER BY osh.order_id, osh.status_date DESC
)
SELECT * FROM order_data
LEFT JOIN items_data USING (order_id)
LEFT JOIN status_data USING (order_id);

-- STEP 3: Check if indexes are being used
-- Look for "Index Scan" or "Bitmap Index Scan" in the EXPLAIN output above
-- If you see "Sequential Scan" with high cost, it means the index isn't being used

-- STEP 4: View table statistics (helps optimize query planning)
ANALYZE;

-- Check index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
