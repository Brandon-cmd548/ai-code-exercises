# Exercise 7 Overview: Performance Optimization Challenge

## Objective
The goal of this exercise was to analyze and improve the performance of a database-driven Node.js application. The focus was on identifying bottlenecks within a complex SQL query, applying optimization strategies, and evaluating the impact of those improvements on system performance.

---

## Selected Scenario

### Slow Database Query Analysis (Node.js with PostgreSQL)

The application retrieves detailed customer order information, including:
- Order details
- Customer information
- Order items
- Status history
- Shipping address

The query performs multiple joins and nested subqueries, making it computationally expensive and slow under larger datasets.

---

## Performance Issues Identified

### 1. Nested Subqueries
The query includes multiple `json_agg` subqueries for each order, which are executed repeatedly. This increases execution time significantly and behaves similarly to an N+1 query issue.

### 2. Inefficient Data Retrieval
All related data is fetched in a single query, which increases complexity and memory usage, especially when handling large datasets.

### 3. Lack of Indexing
The query filters on `customer_id` and `order_date`. Without proper indexing, the database may perform full table scans, resulting in slower performance.

### 4. Sorting Overhead
The use of `ORDER BY o.order_date DESC` adds additional processing cost when applied to large result sets.

### 5. Multiple Table Joins
Joining several tables (`orders`, `customers`, `addresses`) increases the computational cost of the query and may impact performance.

---

## Optimizations Implemented

### 1. Query Decomposition
The large query was split into smaller, focused queries:
- Retrieve base order data first
- Fetch related order items and status history separately
- Combine the results within the application layer

---

### 2. Indexing Strategy
Indexes were introduced to optimize query filtering and joining:

```sql
CREATE INDEX idx_orders_customer_date 
ON orders(customer_id, order_date);

CREATE INDEX idx_order_items_order_id 
ON order_items(order_id);

CREATE INDEX idx_status_history_order_id 
ON order_status_history(order_id);