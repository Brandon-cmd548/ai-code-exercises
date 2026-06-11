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