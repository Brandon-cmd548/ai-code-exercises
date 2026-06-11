const { calculateTaskScore } = require("./task_priority");
const { TaskPriority, TaskStatus } = require("./models");

// Test 1: Exploring undefined updatedAt
console.log("=== Test 1: Task with undefined updatedAt ===");
const taskWithUndefinedUpdatedAt = {
  priority: TaskPriority.HIGH,
  status: TaskStatus.PENDING,
  dueDate: null,
  tags: [],
  updatedAt: undefined  // This is the edge case we're testing
};

const score1 = calculateTaskScore(taskWithUndefinedUpdatedAt);
console.log("Score:", score1);
console.log("Is score NaN?", isNaN(score1));
console.log("");

// Test 2: Task with valid updatedAt (for comparison)
console.log("=== Test 2: Task with valid updatedAt (same config) ===");
const taskWithValidUpdatedAt = {
  priority: TaskPriority.HIGH,
  status: TaskStatus.PENDING,
  dueDate: null,
  tags: [],
  updatedAt: new Date()  // Valid date
};

const score2 = calculateTaskScore(taskWithValidUpdatedAt);
console.log("Score:", score2);
console.log("Is score NaN?", isNaN(score2));
console.log("");

// Test 3: Let's also explore what new Date(undefined) actually is
console.log("=== Understanding new Date(undefined) ===");
const invalidDate = new Date(undefined);
console.log("new Date(undefined) =", invalidDate);
console.log("Type:", typeof invalidDate);
console.log("Is it valid?", !isNaN(invalidDate));
const currentTime = new Date();
const result = currentTime - invalidDate;
console.log("now - new Date(undefined) =", result);

// ===== DUE DATE BONUS TESTS =====
console.log("=== Due Date Bonus Calculation Tests ===\n");

// Helper: Create a task with controlled factors to isolate due date bonus
function createTaskForDueDateTest(dueDate) {
  return {
    priority: TaskPriority.LOW,        // Base: 10 points (isolates due date bonus)
    status: TaskStatus.PENDING,        // No status penalty
    dueDate: dueDate,
    tags: [],                          // No tag boost
    updatedAt: new Date()              // Recently updated: +5
  };
}

const now = new Date();

// Test 1: Overdue task (daysUntilDue < 0)
console.log("Test 1: Overdue task");
const yesterday = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000));
const scoreOverdue = calculateTaskScore(createTaskForDueDateTest(yesterday));
console.log("Expected: 10 (LOW) + 30 (overdue) + 5 (recent) = 45");
console.log("Actual:", scoreOverdue);
console.log("Passes:", scoreOverdue === 45);
console.log("");

// Test 2: Due today (daysUntilDue === 0)
console.log("Test 2: Due today");
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const scoreToday = calculateTaskScore(createTaskForDueDateTest(today));
console.log("Expected: 10 (LOW) + 20 (due today) + 5 (recent) = 35");
console.log("Actual:", scoreToday);
console.log("Passes:", scoreToday === 35);
console.log("");

// Test 3: Due in 2 days (daysUntilDue <= 2)
console.log("Test 3: Due in 2 days");
const inTwoDays = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
const scoreTwoDays = calculateTaskScore(createTaskForDueDateTest(inTwoDays));
console.log("Expected: 10 (LOW) + 15 (2 days) + 5 (recent) = 30");
console.log("Actual:", scoreTwoDays);
console.log("Passes:", scoreTwoDays === 30);
console.log("");

// Test 4: Due in 7 days (daysUntilDue <= 7)
console.log("Test 4: Due in 7 days");
const inSevenDays = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
const scoreSevenDays = calculateTaskScore(createTaskForDueDateTest(inSevenDays));
console.log("Expected: 10 (LOW) + 10 (next week) + 5 (recent) = 25");
console.log("Actual:", scoreSevenDays);
console.log("Passes:", scoreSevenDays === 25);
console.log("");

// Test 5: Due more than 7 days away (no bonus)
console.log("Test 5: Due in 10 days (no bonus)");
const inTenDays = new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000));
const scoreTenDays = calculateTaskScore(createTaskForDueDateTest(inTenDays));
console.log("Expected: 10 (LOW) + 0 (no bonus) + 5 (recent) = 15");
console.log("Actual:", scoreTenDays);
console.log("Passes:", scoreTenDays === 15);
console.log("");

// Test 6: No due date (no bonus)
console.log("Test 6: No due date");
const scoreNoDueDate = calculateTaskScore(createTaskForDueDateTest(null));
console.log("Expected: 10 (LOW) + 0 (no due date) + 5 (recent) = 15");
console.log("Actual:", scoreNoDueDate);
console.log("Passes:", scoreNoDueDate === 15);

// ===== CURRENT USER ASSIGNMENT TESTS =====
console.log("=== Test 1: Task Assigned to Current User ===");
const taskAssignedToUser = {
  priority: TaskPriority.MEDIUM,
  status: TaskStatus.TODO,
  dueDate: null,
  tags: [],
  updatedAt: new Date(),
  assignedTo: "EMP001"
};

const userIdMatch = "EMP001";
const scoreWithMatchingUser = calculateTaskScore(taskAssignedToUser, userIdMatch);
console.log("Expected: 37 (20 base + 12 boost + 5 recent)");
console.log("Actual:", scoreWithMatchingUser);
console.log("Passes:", scoreWithMatchingUser === 37);
console.log("");

// Test 2: Task NOT assigned to current user
console.log("=== Test 2: Task NOT Assigned to Current User ===");
const taskAssignedToOther = {
  priority: TaskPriority.MEDIUM,
  status: TaskStatus.TODO,
  dueDate: null,
  tags: [],
  updatedAt: new Date(),
  assignedTo: "EMP001"  // Assigned to different user
};

const userIdDifferent = "EMP002";  // Different user
const scoreWithDifferentUser = calculateTaskScore(taskAssignedToOther, userIdDifferent);
console.log("Expected: 25 (20 base + 0 boost + 5 recent)");
console.log("Actual:", scoreWithDifferentUser);
console.log("Passes:", scoreWithDifferentUser === 25);




