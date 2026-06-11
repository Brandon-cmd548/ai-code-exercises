# Database Query Performance Guide - Junior Developer Edition

## 🎯 The Core Problem: N+1 Queries

Your original query has a **critical performance issue** called the **N+1 query problem**. Here's why it's slow:

### What Happens:

```
Query for 50 orders:
  ├─ Main query runs once (fetches 50 orders)
  ├─ For order #1: Subquery #1 runs (get items)
  ├─ For order #1: Subquery #2 runs (get status history)
  ├─ For order #2: Subquery #1 runs (get items)
  ├─ For order #2: Subquery #2 runs (get status history)
  ├─ ... repeat 50 times ...
  └─ Total: 1 main query + (50 × 2 subqueries) = 101 database calls!
```

**With 100,000 orders: 200,001 total queries!** 🔥

---

## 🔍 How to Spot N+1 Problems

### Red Flag Patterns:

```sql
-- ❌ BAD: Correlated subquery (runs per row)
SELECT o.order_id, (
  SELECT COUNT(*) FROM order_items oi 
  WHERE oi.order_id = o.order_id  -- <-- "= o.order_id" = correlated
) as item_count
FROM orders o;

-- ❌ BAD: Multiple subqueries in SELECT
SELECT 
  o.order_id,
  (SELECT ... FROM items WHERE order_id = o.order_id),   -- Query 1
  (SELECT ... FROM status WHERE order_id = o.order_id)   -- Query 2
FROM orders o;

-- ✅ GOOD: One query with proper joins
SELECT o.order_id, oi.*, s.*
FROM orders o
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN order_status os ON o.order_id = os.order_id;
```

---

## 📚 Essential Database Concepts

### 1. **Indexes - The Database Speedway**

**What it is:** A sorted lookup table that lets PostgreSQL find data without reading every row.

Think of a book: Without an index, finding "customer John" requires reading every page. With an index, you go straight to the page.

**Without index (Sequential Scan):**
```
Reading 1,000,000 rows to find 10 → reads all 1,000,000 rows
Time: SLOW ⚠️
```

**With index (Index Scan):**
```
Jump directly to "customer_id=123" using index → reads ~10 rows
Time: FAST ⚡
```

**Key types:**
- **Single column index:** `CREATE INDEX idx_name ON table(column)`
- **Composite index:** `CREATE INDEX idx_name ON table(col1, col2)` - Fast for queries using both columns
- **Foreign key index:** ALWAYS create on columns you JOIN on

```sql
-- Missing indexes in your schema
CREATE INDEX idx_order_items_order_id ON order_items(order_id);      -- ❌ MISSING
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);  -- ❌ MISSING
CREATE INDEX idx_orders_customer_id ON orders(customer_id);          -- ❌ MISSING
```

### 2. **JOINs vs. Subqueries**

**Subqueries (often slow):**
```sql
-- Query runs for EACH customer row
SELECT c.name, (
  SELECT COUNT(*) FROM orders o 
  WHERE o.customer_id = c.customer_id
) as order_count
FROM customers c;
```

**JOINs (usually fast):**
```sql
-- Single efficient query
SELECT c.name, COUNT(o.order_id) as order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name;
```

**Why JOINs are faster:**
- Database optimizer can use indexes on both tables
- Can parallelize the lookup
- Uses more efficient algorithms

### 3. **EXPLAIN ANALYZE - Your X-Ray Machine**

This shows you **exactly** where your query spends time:

```sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 1;
```

Output example:
```
Seq Scan on orders  (cost=0.00..35000.00 rows=100000) 
  Filter: (customer_id = 1)
  Actual rows: 15, loops: 1
  Planning time: 0.5ms, Execution time: 8234.3ms ← TOO SLOW!
```

**What the numbers mean:**
- `cost=0.00..35000.00` = Estimated cost (lower = better)
- `rows=100000` = Estimated rows to scan
- `Actual rows: 15` = Rows actually found
- `Execution time: 8234.3ms` = How long it actually took

**When you add an index:**
```
Index Scan using idx_orders_customer_id  (cost=0.42..8.44 rows=15)
  Actual rows: 15, loops: 1
  Execution time: 2.1ms ← MUCH FASTER!
```

### 4. **Query Optimization Strategies**

#### Strategy 1: Add Indexes (30-50% improvement)
```sql
-- For every column you filter on or join on
CREATE INDEX idx_table_column ON table_name(column_name);

-- For queries that sort/filter on multiple columns
CREATE INDEX idx_table_composite ON table_name(col1, col2);
```

#### Strategy 2: Avoid Correlated Subqueries (60-80% improvement)
```sql
-- ❌ SLOW: Correlated subquery
SELECT o.order_id, (
  SELECT SUM(amount) FROM payments p 
  WHERE p.order_id = o.order_id
) as total
FROM orders o;

-- ✅ FAST: JOIN with GROUP BY
SELECT o.order_id, SUM(p.amount) as total
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id
GROUP BY o.order_id;
```

#### Strategy 3: Use CTEs (Common Table Expressions) for Complex Queries
```sql
-- ✅ More readable and often faster
WITH customer_totals AS (
  SELECT customer_id, COUNT(*) as order_count
  FROM orders
  GROUP BY customer_id
)
SELECT c.*, ct.order_count
FROM customers c
LEFT JOIN customer_totals ct ON c.customer_id = ct.customer_id;
```

#### Strategy 4: Move Logic to Application Layer
When combining complex data (like JSON building), do it in code:

```javascript
// ✅ Query returns normalized data, app combines it
const orders = await db.query('SELECT * FROM orders WHERE...');
const items = await db.query('SELECT * FROM items WHERE order_id = ANY($1)', [orderIds]);

// Build nested structure in JavaScript (fast!)
const result = orders.map(order => ({
  ...order,
  items: items.filter(i => i.order_id === order.order_id)
}));
```

---

## 📊 Your Query Improvement Roadmap

### Step 1: Add Indexes (Run these SQL commands)
```bash
# In psql or your DB client:
psql -U app_user -d ecommerce -f db/init/02-create-indexes.sql
```

**Expected improvement: 2-3x faster** ⚡

### Step 2: Measure with EXPLAIN ANALYZE
```bash
# Run the diagnostic queries
psql -U app_user -d ecommerce -f db/init/03-performance-analysis.sql

# Look for:
# - "Index Scan" (good!) vs "Sequential Scan" (bad!)
# - Execution time comparison
```

### Step 3: Rewrite Query (Choose one approach)
- **V1 (CTE approach):** Best for complex data relationships
- **V2 (Separate queries):** Best for N+1 problem, easiest to debug

### Step 4: Test Performance Improvement
```bash
# Run benchmarks (requires Node.js and DB running)
npm install  # if needed
node test-query-optimized.js

# Expected results:
# ❌ Original: ~8000ms (8-10 seconds)
# ✅ V1:       ~2000ms (60-80% faster)
# ✅ V2:       ~3000ms (50-70% faster)
```

---

## 🎓 Learning Resources

### Key Terms Every Junior Dev Should Know:

| Term | Simple Explanation | Performance Impact |
|------|-------------------|-------------------|
| **Index** | Sorted lookup table (like book index) | Makes queries 10-1000x faster |
| **Join** | Combine tables on matching columns | Usually faster than subqueries |
| **Correlated Subquery** | Subquery that references outer query | Runs multiple times - SLOW! |
| **Sequential Scan** | Read every row in table | Slow on large tables |
| **Index Scan** | Use index to find rows | Very fast |
| **Query Plan** | How database will execute query | Check with EXPLAIN ANALYZE |
| **N+1 Problem** | 1 main query + many subqueries | Scales poorly with data size |
| **CTE (WITH clause)** | Named subquery you can reuse | Often clearer and faster |

### Queries to Experiment With:

```sql
-- Practice 1: Add an index, measure difference
CREATE INDEX idx_test ON orders(customer_id);
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 1;

-- Practice 2: JOIN vs. Subquery
-- Write same query two ways, compare EXPLAIN output
SELECT * FROM customers WHERE customer_id IN (
  SELECT customer_id FROM orders
);
-- vs
SELECT DISTINCT c.* FROM customers c
JOIN orders o ON c.customer_id = o.customer_id;

-- Practice 3: Check actual index usage
SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC;
```

---

## ⚠️ Common Mistakes to Avoid

1. **Not indexing foreign keys**
   ```sql
   -- ❌ WRONG: No index on order_id
   CREATE TABLE order_items (
     item_id SERIAL,
     order_id INT,  -- Missing: CREATE INDEX
     product_id INT
   );
   
   -- ✅ RIGHT: Index on join column
   CREATE TABLE order_items (
     item_id SERIAL,
     order_id INT,
     product_id INT
   );
   CREATE INDEX idx_order_items_order_id ON order_items(order_id);
   ```

2. **Using SELECT * in correlated subqueries**
   ```sql
   -- ❌ SLOW: Runs per row
   SELECT (SELECT * FROM items WHERE order_id = o.order_id)
   FROM orders o;
   
   -- ✅ BETTER: Select only needed columns
   SELECT (SELECT json_agg(...) FROM items WHERE order_id = o.order_id)
   FROM orders o;
   ```

3. **Not running ANALYZE after schema changes**
   ```sql
   -- ✅ Always do this after adding indexes
   ANALYZE;
   ```

4. **Forgetting WHERE clause on large table joins**
   ```sql
   -- ❌ CARTESIAN PRODUCT: Generates 100k × 500k = 50 billion rows!
   SELECT * FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;
   
   -- ✅ RIGHT: Always filter by relevant criteria
   SELECT * FROM orders o 
   JOIN order_items oi ON o.order_id = oi.order_id
   WHERE o.customer_id = 1;
   ```

---

## 🚀 Next Steps

1. **Run the optimization steps** in order (indexes → measure → rewrite)
2. **Measure each step** with `EXPLAIN ANALYZE`
3. **Test with benchmarks** (`test-query-optimized.js`)
4. **Use Approach 2 (V2)** if you want the simplest code change
5. **Use Approach 1 (V1)** if you want the fastest performance

---

## 📞 Quick Reference: Performance Checklist

Before deploying ANY query to production:

- [ ] Run `EXPLAIN ANALYZE` and check for Sequential Scans
- [ ] All frequently-used filter columns have indexes
- [ ] All JOIN columns have indexes  
- [ ] No correlated subqueries in SELECT clause
- [ ] Tested performance with realistic data size
- [ ] Query completes in < 1 second for 99% of users

---

**Remember:** A 10-second query that takes 1 second is a 10x improvement. 
A 1-second query that takes 0.1 seconds is also a 10x improvement. 
Always measure first to know where the real problem is! 📊
