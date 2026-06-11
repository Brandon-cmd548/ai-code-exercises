## Task Priority Scoring System (JSDoc inline in @calc-task-priority.js)
The system calculates task importance using a weighted scoring algorithm:

- **Base Priority**: LOW (10) -> URGENT (40)
- **Due Date Impact**:
  - Overdue: +30
  - Due today: +20
  - Due soon: +10–15
- **Status Penalty**:
  - DONE: -50
  - REVIEW: -15
- **Tags Boost**:
  - "blocker", "critical", "urgent": +8
- **Recent Activity**:
  - Updated within 24 hours: +5

  ## Design Decisions

The scoring algorithm was designed to prioritize:
- Urgent and time-sensitive tasks
- Recently active work
- Tasks blocking progress

Completed tasks are heavily penalized to ensure focus remains on actionable items.

# Task Scoring Algorithm Documentation

## 1. High-Level Intent

This function implements a **multi-factor task prioritization algorithm** that converts various task attributes into a single numerical score.

The purpose is to determine which tasks should be tackled first by evaluating:

- **Urgency** (due date proximity)
- **Importance** (priority level)
- **Status** (progress/completion)
- **Relevance** (tags and recent updates)

Higher scores indicate higher priority.

## 2. Key Assumptions & Edge Cases

### Assumptions
- `task.priority` is always a valid `TaskPriority` enum value
- `task.dueDate` is a valid `Date` or parseable date string
- `task.tags` is always an array
- `task.updatedAt` is a valid date or date string
- System time is accurate

---

### Edge Cases & Potential Issues

| Issue | Impact | Example |
|------|--------|--------|
| Invalid date objects | Calculations fail (NaN result) | `task.updatedAt = "invalid"` |
| Missing tags array | Runtime error (`.some()` fails) | `task.tags = null` |
| Rounding issue (`Math.ceil`) | Inaccurate urgency classification | 12-hour difference treated as 2 days |
| 24-hour boundary | Recency bonus inconsistency | Updated at 3:59 PM vs 4:01 PM |
| Missing priority | Defaults to 0 score | May resemble LOW priority |
| Duplicate `Date()` calls | Minor inefficiency | Recalculates current time |

---

## 3. Suggested Improved Inline Comments

```js
/**
 * ALGORITHM DESIGN:
 * Combines multiple weighted factors into a single comparable score.
 * Higher scores = higher priority.
 * Additive structure allows urgency to override base priority when needed.
 */

// Base priority: 10–40 points
// Multiplier ensures balance between base and bonus adjustments
let score = (priorityWeights[task.priority] || 0) * 10;

// DUE DATE FACTOR:
// Converts milliseconds → days (using Math.ceil to capture "due today")
// Tier system ensures urgent tasks receive maximum boost
const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

// STATUS PENALTY:
// Completed tasks should not compete with active work
// DONE (-50) > REVIEW (-15) reflects workflow stage differences

// TAG BOOST:
// Explicit urgency indicators override calculated values

// RECENCY BONUS:
// Rewards active engagement with tasks
// Math.floor ensures only same-day updates qualify
```

## 4. Potinetial Improvements
**Input Validation**
```js
if (!task || typeof task.priority === 'undefined') {
  throw new Error('Task must have a priority property');
}

if (task.tags && !Array.isArray(task.tags)) {
  throw new Error('task.tags must be an array');
}
```

**Optimize data handling**
```js
const now = new Date();

if (task.dueDate) {
  const dueDate = task.dueDate instanceof Date
    ? task.dueDate
    : new Date(task.dueDate);

  const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
}

const updatedAt = task.updatedAt instanceof Date
  ? task.updatedAt
  : new Date(task.updatedAt);

const daysSinceUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
```

**Replace Magic Numbers with Constants**
```js
const SCORE_WEIGHTS = {
  BASE_MULTIPLIER: 10,
  OVERDUE: 30,
  DUE_TODAY: 20,
  DUE_IN_2_DAYS: 15,
  DUE_IN_WEEK: 10,
  STATUS_DONE_PENALTY: 50,
  STATUS_REVIEW_PENALTY: 15,
  CRITICAL_TAG_BONUS: 8,
  RECENT_UPDATE_BONUS: 5,
  HOURS_FOR_RECENCY: 24
};
```