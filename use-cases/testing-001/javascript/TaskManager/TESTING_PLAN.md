# Testing Plan for Task Priority Functions

## Overview
This document outlines my learning journey and testing strategy for the `calculateTaskScore`, `sortTasksByImportance`, and `getTopPriorityTasks` functions in the TaskManager module.

---

## Part 1: Understanding the Functions

### calculateTaskScore(task)
The main function that assigns a priority score to tasks based on multiple factors:
- **Base Priority:** Weight of the task priority (LOW=1, MEDIUM=2, HIGH=3, URGENT=4) multiplied by 10
- **Due Date Factor:** Bonus points based on how soon the task is due (overdue +30, today +20, 1-2 days +15, 3-7 days +10)
- **Status Adjustment:** Penalty for completed tasks (-50) or tasks in review (-15)
- **Tag Boost:** Extra points for critical tags like "blocker", "critical", "urgent" (+8)
- **Recency Bonus:** Extra points if the task was updated recently (+5)

### sortTasksByImportance(tasks)
Sorts an array of tasks from highest to lowest priority score using the `calculateTaskScore` function as the comparison metric. Returns a new array without modifying the original.

### getTopPriorityTasks(tasks, limit = 5)
Returns the top N tasks (default 5) by importance after sorting them.

---

## Part 2: Key Discoveries Through Exploration

### Discovery 1: Negative Scores Are Possible
A task with LOW priority (base score = 10) that is DONE (penalty = -50) would result in a score of -40. This is a valid scenario and should be tested.

### Discovery 2: Missing updatedAt is Silently Handled
When I tested a task with `updatedAt: undefined`:
- `new Date(undefined)` creates an "Invalid Date" object
- `now - Invalid Date` results in `NaN`
- `NaN < 1` evaluates to `false`
- The +5 recency bonus is silently skipped (no crash, no error)

**Question:** Should this be a bug? Should missing `updatedAt` be penalized (-10) instead?

### Discovery 3: Missing Priority Defaults Gracefully
With the fallback `|| 0`, a task without a priority field won't crash—it just gets a base score of 0. This is defensive programming at work.

### Discovery 4: Due Date Thresholds Have Gaps
Tasks due in 3-7 days get +10, but tasks due 8+ days get no bonus at all. This is a design choice worth testing to verify it's intentional.

---

## Part 3: Edge Cases Identified

### Critical Edge Cases
1. **Null input to sortTasksByImportance** → Would crash (can't call .sort() on null)
2. **Empty array to sortTasksByImportance** → Should return empty array gracefully
3. **Missing priority field** → Should default score to 0
4. **Missing updatedAt field** → Currently skips the bonus (potential bug)

### Boundary Tests for Due Dates
- Exactly 0 days (due today)
- Exactly 1 day
- Exactly 2 days
- Exactly 3 days (first gap in bonus)
- Exactly 7 days
- Exactly 8 days (second gap in bonus)

### Score Combinations
- High priority + overdue + urgent tag = maximized score
- Low priority + DONE status = minimized score
- Tasks with conflicting signals (e.g., DONE but urgent tag) → which wins?

---

## Part 4: Testing Checklist (Prioritized)

### Priority 1: Foundation (Must Test First)
These tests verify the core scoring logic works correctly:
- [ ] LOW priority task gets base score of 10
- [ ] MEDIUM priority task gets base score of 20
- [ ] HIGH priority task gets base score of 30
- [ ] URGENT priority task gets base score of 40
- [ ] Missing priority field defaults to 0
- [ ] Score calculation returns a number (not NaN for valid inputs)

### Priority 2: Bug Investigation (Find Issues)
These tests identify potential bugs or unexpected behavior:
- [ ] Missing updatedAt doesn't crash (currently passes, but should we penalize?)
- [ ] Null input to sortTasksByImportance throws error
- [ ] Empty array to sortTasksByImportance returns empty array
- [ ] Negative scores are allowed and sort correctly

### Priority 3: Complex Behaviors (Verify Logic)
These tests verify that all scoring factors work correctly:

**Due Date Thresholds:**
- [ ] Overdue task (+30 bonus)
- [ ] Task due today (+20 bonus)
- [ ] Task due in 1 day (+15 bonus)
- [ ] Task due in 2 days (+15 bonus)
- [ ] Task due in 3 days (no additional bonus)
- [ ] Task due in 7 days (+10 bonus)
- [ ] Task due in 8 days (no additional bonus)

**Status Penalties:**
- [ ] DONE status reduces score by 50
- [ ] REVIEW status reduces score by 15
- [ ] PENDING status has no penalty

**Tag Boosts:**
- [ ] Task with "blocker" tag gets +8 boost
- [ ] Task with "critical" tag gets +8 boost
- [ ] Task with "urgent" tag gets +8 boost
- [ ] Task with non-matching tags gets no boost
- [ ] Multiple matching tags still only get +8 (not stacked)

**Recency Bonus:**
- [ ] Task updated today gets +5 bonus
- [ ] Task updated yesterday gets +5 bonus
- [ ] Task updated 2+ days ago gets no bonus

### Priority 4: Sorting & Selection (Full Function Tests)
These tests verify the helper functions work as intended:
- [ ] sortTasksByImportance returns tasks in descending score order
- [ ] sortTasksByImportance doesn't modify the original array
- [ ] getTopPriorityTasks returns the top 5 tasks by default
- [ ] getTopPriorityTasks respects custom limit parameter
- [ ] getTopPriorityTasks returns fewer tasks if array has fewer items
- [ ] getTopPriorityTasks returns empty array when given empty array

---

## Part 5: Test Structure Strategy

For each test, I should:
1. **Name it clearly** - describe what behavior it's testing
2. **Set up test data** - create a task object with only relevant fields
3. **Calculate expected value** - work through the math manually
4. **Assert the result** - verify it matches expectations
5. **Document why** - explain what behavior this validates

### Example Test Structure:
```javascript
test("should calculate HIGH priority base score as 30", () => {
  const task = {
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    dueDate: null,
    tags: [],
    updatedAt: new Date()
  };
  
  const score = calculateTaskScore(task);
  // Math: (3 * 10) = 30
  expect(score).toBe(30);
});
```

---

## Part 6: Recommendations for Improvement

Based on testing, I would suggest:
1. **Add input validation** - throw errors for null inputs rather than crash silently
2. **Document the missing updatedAt behavior** - decide if it should be penalized or if current behavior is intentional
3. **Consider adding a minimum score** - decide if negative scores should be allowed or clamped to 0
4. **Add JSDoc comments** - explain the scoring algorithm and assumptions in the code

---

## Next Steps

1. Write Priority 1 tests first to ensure the foundation is solid
2. Run tests to discover any bugs (especially with the edge cases)
3. Move to Priority 2-4 tests once foundation is verified
4. Use tests as documentation of intended behavior
5. Consider whether bugs should be fixed or documented as features
