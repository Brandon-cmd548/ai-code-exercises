# Testing Notes - Task Priority Function
# Refer to [task_priority.test.js](#)
## The Problem

I wrote a test that checked if `calculateTaskScore()` returns NaN when `updatedAt` is undefined:

```javascript
const taskWithUndefinedUpdatedAt = {
  priority: TaskPriority.HIGH,
  status: TaskStatus.PENDING,
  dueDate: null,
  tags: [],
  updatedAt: undefined
};

const score1 = calculateTaskScore(taskWithUndefinedUpdatedAt);
console.log("Is score NaN?", isNaN(score1));  // Testing for failure
```

## Wait, That's Backwards

My test was checking that it **breaks**. But I actually wanted it to **NOT break**. That's the wrong way around.

Turns out, `new Date(undefined)` creates an Invalid Date, which makes the calculation return NaN. That was a bug.

## The Fix

Added a guard clause before using `updatedAt`:

```javascript
// Boost score for recently updated tasks
if (task.updatedAt) {  // Check if it exists first
  const now = new Date();
  const updatedAt = new Date(task.updatedAt);
  const daysSinceUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdate < 1) {
    score += 5;
  }
}
```

Now if `updatedAt` is undefined, the boost just gets skipped. No NaN. Problem solved.

## Key Testing Principles I Learned

### 1. Know What You're Testing
- Are you testing a bug exists (documentation)?
- Or testing that something works correctly (behavior)?
- Don't test the opposite of what you want.

### 2. Test Behavior, Not Implementation Details
- Test **what the function should do**, not how it does it
- `isNaN()` checks internals; "returns a valid number" checks behavior

### 3. Isolate the Thing You're Testing
- Control all other factors (priority, status, tags, etc.)
- Only vary the one thing you care about
- Use helper functions to reduce noise

### 4. Make Expectations Explicit
- Comment shows expected calculation: `10 (LOW) + 30 (overdue) + 5 (recent) = 45`
- Reader sees the math, not magic numbers
- Future you won't wonder why the test expects 45

### 5. Test Boundaries
- Test transitions: overdue (< 0), today (= 0), 1-2 days (≤ 2), 1-7 days (≤ 7), 8+ days (no bonus)
- These are where bugs hide

### 6. Don't Rely on Time Moving
- Don't hardcode dates like `2026-06-10`
- Use `new Date()` and calculate relative dates
- Tests stay valid tomorrow and next year

## Better Due Date Test Example

```javascript
// Helper: Isolate due date bonus
function createTaskForDueDateTest(dueDate) {
  return {
    priority: TaskPriority.LOW,        // Base: 10 points
    status: TaskStatus.PENDING,        // No penalty
    dueDate: dueDate,
    tags: [],                          // No boost
    updatedAt: new Date()              // Recently updated: +5
  };
}

const now = new Date();

// Test: Overdue
const yesterday = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000));
const scoreOverdue = calculateTaskScore(createTaskForDueDateTest(yesterday));
console.log("Expected: 10 + 30 (overdue) + 5 (recent) = 45");
console.log("Actual:", scoreOverdue);
console.log("Passes:", scoreOverdue === 45);
```

Why this is better:
- Helper function hides the boilerplate
- Clear what's being tested (overdue = daysUntilDue < 0)
- Expected calculation shown step-by-step
- Uses relative dates, not hardcoded

## Edge Cases to Watch

- **Math.ceil() boundary**: What happens at exactly 11:59 PM today vs 12:01 AM tomorrow?
- **undefined vs null**: Both should skip the boost
- **Invalid date strings**: What if `updatedAt = "invalid"`?
- **Future dates**: Math works but semantics might be weird

## The No-Due-Date Question

I thought: "If there's no due date, there's no rush → penalty"

Actually: Code does neither. It just skips the bonus. No penalty, no rush.

Design question for next time: Should a task with no deadline be deprioritized, or just neutral?

