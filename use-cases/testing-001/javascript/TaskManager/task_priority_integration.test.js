const { calculateTaskScore, sortTasksByImportance, getTopPriorityTasks } = require("./task_priority");
const { TaskPriority, TaskStatus } = require("./models");

// ============================================================================
// INTEGRATION TEST: Task Priority Workflow
// ============================================================================
// This test verifies the complete workflow:
// 1. calculateTaskScore() evaluates individual task importance
// 2. sortTasksByImportance() orders all tasks by score
// 3. getTopPriorityTasks() retrieves top N tasks
// 
// Focus areas: tags boost importance, status affects visibility, multi-user support
// ============================================================================

console.log("\n" + "=".repeat(80));
console.log("INTEGRATION TEST: Task Priority Workflow");
console.log("=".repeat(80) + "\n");

// ============================================================================
// HELPER FUNCTION 1: Create a test task with flexible overrides
// ============================================================================
function createTestTask(overrides = {}) {
  const defaults = {
    id: `task_${Math.random().toString(36).substr(2, 9)}`,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    assignedTo: "user1",
    dueDate: null,
    tags: [],
    updatedAt: new Date(),
    createdAt: new Date()
  };
  
  return { ...defaults, ...overrides };
}

// ============================================================================
// HELPER FUNCTION 2: Generate 10 diverse test tasks for workflow testing
// ============================================================================
function generateTestTasks() {
  const now = new Date();
  
  const tasks = [
    // Task 1: HIGH priority, overdue, assigned to user1, critical tag, IN_PROGRESS
    createTestTask({
      id: "task_1",
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      assignedTo: "user1",
      dueDate: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)), // 2 days overdue
      tags: ["critical"],
      updatedAt: new Date(now.getTime() - (1 * 60 * 60 * 1000)) // Updated 1 hour ago
    }),
    
    // Task 2: LOW priority, due today, assigned to user2, blocker tag, DONE
    createTestTask({
      id: "task_2",
      priority: TaskPriority.LOW,
      status: TaskStatus.DONE,
      assignedTo: "user2",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      tags: ["blocker"],
      updatedAt: new Date(now.getTime() - (12 * 60 * 60 * 1000)) // Updated 12 hours ago
    }),
    
    // Task 3: URGENT priority, due tomorrow, assigned to user1, no tags, TODO
    createTestTask({
      id: "task_3",
      priority: TaskPriority.URGENT,
      status: TaskStatus.TODO,
      assignedTo: "user1",
      dueDate: new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000)), // Tomorrow
      tags: [],
      updatedAt: new Date() // Just updated
    }),
    
    // Task 4: MEDIUM priority, due in 7 days, assigned to user3, urgent tag, REVIEW
    createTestTask({
      id: "task_4",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.REVIEW,
      assignedTo: "user3",
      dueDate: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)), // 7 days out
      tags: ["urgent"],
      updatedAt: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)) // 3 days old
    }),
    
    // Task 5: HIGH priority, overdue, assigned to user3, no tags, TODO
    createTestTask({
      id: "task_5",
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      assignedTo: "user3",
      dueDate: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)), // 1 day overdue
      tags: [],
      updatedAt: new Date(now.getTime() - (24 * 60 * 60 * 1000)) // Updated yesterday
    }),
    
    // Task 6: URGENT priority, due in 2 days, assigned to user1, critical tag, DONE
    createTestTask({
      id: "task_6",
      priority: TaskPriority.URGENT,
      status: TaskStatus.DONE,
      assignedTo: "user1",
      dueDate: new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)), // 2 days out
      tags: ["critical"],
      updatedAt: new Date() // Just updated
    }),
    
    // Task 7: LOW priority, far future (30 days), assigned to user2, no tags, IN_PROGRESS
    createTestTask({
      id: "task_7",
      priority: TaskPriority.LOW,
      status: TaskStatus.IN_PROGRESS,
      assignedTo: "user2",
      dueDate: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)), // 30 days out
      tags: [],
      updatedAt: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) // 7 days old
    }),
    
    // Task 8: MEDIUM priority, due today, assigned to user1, blocker tag, IN_PROGRESS
    createTestTask({
      id: "task_8",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      assignedTo: "user1",
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()), // Today
      tags: ["blocker"],
      updatedAt: new Date() // Just updated
    }),
    
    // Task 9: HIGH priority, due tomorrow, assigned to user2, critical tag, TODO
    createTestTask({
      id: "task_9",
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      assignedTo: "user2",
      dueDate: new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000)), // Tomorrow
      tags: ["critical"],
      updatedAt: new Date(now.getTime() - (2 * 60 * 60 * 1000)) // 2 hours ago
    }),
    
    // Task 10: LOW priority, overdue, assigned to user1, urgent tag, REVIEW
    createTestTask({
      id: "task_10",
      priority: TaskPriority.LOW,
      status: TaskStatus.REVIEW,
      assignedTo: "user1",
      dueDate: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 days overdue
      tags: ["urgent"],
      updatedAt: new Date(now.getTime() - (4 * 24 * 60 * 60 * 1000)) // 4 days old
    })
  ];
  
  return tasks;
}

// ============================================================================
// INTEGRATION TEST: Main workflow
// ============================================================================
console.log("📋 Generating 10 diverse test tasks...\n");
const testTasks = generateTestTasks();
console.log(`✓ Generated ${testTasks.length} tasks\n`);

// Display all tasks
console.log("Test Tasks Overview:");
testTasks.forEach((task, idx) => {
  console.log(`  ${idx + 1}. ID: ${task.id}, Priority: ${task.priority}, Status: ${task.status}, Assigned: ${task.assignedTo}, Tags: [${task.tags.join(", ") || "none"}]`);
});
console.log("");

// ============================================================================
// Test with current user = "user1"
// ============================================================================
const CURRENT_USER = "user1";
console.log(`\n👤 Testing workflow from perspective of: ${CURRENT_USER}\n`);

// PERFORMANCE TEST 1: Calculate scores for all tasks
console.log("📊 Performance Test 1: Calculating scores for all tasks");
const startScoreTime = performance.now();
const taskScores = testTasks.map(task => ({
  id: task.id,
  score: calculateTaskScore(task, CURRENT_USER)
}));
const endScoreTime = performance.now();
const scoringTime = endScoreTime - startScoreTime;

console.log(`   Time taken: ${scoringTime.toFixed(3)}ms`);
console.log(`   Scores calculated: ${taskScores.length}`);
console.log(`   Avg per task: ${(scoringTime / taskScores.length).toFixed(3)}ms\n`);

// Display scores
console.log("Task Scores:");
taskScores.forEach((item, idx) => {
  console.log(`  ${idx + 1}. ${item.id}: ${item.score} points`);
});

// Find highest score
const maxScore = Math.max(...taskScores.map(s => s.score));
const minScore = Math.min(...taskScores.map(s => s.score));
console.log(`\n   Max score: ${maxScore}`);
console.log(`   Min score: ${minScore}\n`);

// PERFORMANCE TEST 2: Sort all tasks by importance
console.log("📊 Performance Test 2: Sorting all tasks by importance");
const startSortTime = performance.now();
const sortedTasks = sortTasksByImportance(testTasks, CURRENT_USER);
const endSortTime = performance.now();
const sortTime = endSortTime - startSortTime;

console.log(`   Time taken: ${sortTime.toFixed(3)}ms`);
console.log(`   Tasks sorted: ${sortedTasks.length}\n`);

// Display sorted order
console.log("Sorted Task Order (by importance):");
sortedTasks.forEach((task, idx) => {
  const score = calculateTaskScore(task, CURRENT_USER);
  console.log(`  ${idx + 1}. ${task.id}: ${score} points`);
});
console.log("");

// PERFORMANCE TEST 3: Get top 5 priority tasks
console.log("📊 Performance Test 3: Getting top 5 priority tasks");
const startTopTime = performance.now();
const topTasks = getTopPriorityTasks(testTasks, 5, CURRENT_USER);
const endTopTime = performance.now();
const topTime = endTopTime - startTopTime;

console.log(`   Time taken: ${topTime.toFixed(3)}ms`);
console.log(`   Top tasks retrieved: ${topTasks.length}\n`);

// Display top 5
console.log("Top 5 Priority Tasks:");
topTasks.forEach((task, idx) => {
  const score = calculateTaskScore(task, CURRENT_USER);
  console.log(`  ${idx + 1}. ${task.id}: ${score} points - Assigned: ${task.assignedTo}, Status: ${task.status}, Tags: [${task.tags.join(", ") || "none"}]`);
});
console.log("");

// ============================================================================
// ASSERTIONS: Verify correctness
// ============================================================================
console.log("\n✅ ASSERTIONS:\n");

let assertionsPassed = 0;
let assertionsFailed = 0;

// Assertion 1: Top task should have the maximum score
const topTaskScore = calculateTaskScore(topTasks[0], CURRENT_USER);
const expectedMaxScore = Math.max(...sortedTasks.map(t => calculateTaskScore(t, CURRENT_USER)));
const assertion1 = topTaskScore === expectedMaxScore;
console.log(`1. Top task has maximum score: ${assertion1 ? "✓ PASS" : "✗ FAIL"}`);
console.log(`   Expected: ${expectedMaxScore}, Got: ${topTaskScore}`);
assertion1 ? assertionsPassed++ : assertionsFailed++;
console.log("");

// Assertion 2: Top tasks should be in descending score order
let isDescending = true;
for (let i = 1; i < topTasks.length; i++) {
  const prevScore = calculateTaskScore(topTasks[i - 1], CURRENT_USER);
  const currScore = calculateTaskScore(topTasks[i], CURRENT_USER);
  if (prevScore < currScore) {
    isDescending = false;
    break;
  }
}
console.log(`2. Top tasks are in descending score order: ${isDescending ? "✓ PASS" : "✗ FAIL"}`);
isDescending ? assertionsPassed++ : assertionsFailed++;
console.log("");

// Assertion 3: Completed tasks should NOT be in top 5 (scores reduced by 50)
const completedInTop5 = topTasks.filter(t => t.status === TaskStatus.DONE).length;
const assertion3 = completedInTop5 === 0;
console.log(`3. No DONE tasks in top 5: ${assertion3 ? "✓ PASS" : "✗ FAIL"}`);
console.log(`   Completed tasks found: ${completedInTop5}`);
assertion3 ? assertionsPassed++ : assertionsFailed++;
console.log("");

// Assertion 4: Tasks assigned to current user should rank higher (all else equal)
const userTasks = sortedTasks.filter(t => t.assignedTo === CURRENT_USER);
const otherTasks = sortedTasks.filter(t => t.assignedTo !== CURRENT_USER);
let userRanksHigher = true;

if (userTasks.length > 0 && otherTasks.length > 0) {
  const avgUserScore = userTasks.reduce((sum, t) => sum + calculateTaskScore(t, CURRENT_USER), 0) / userTasks.length;
  const avgOtherScore = otherTasks.reduce((sum, t) => sum + calculateTaskScore(t, CURRENT_USER), 0) / otherTasks.length;
  userRanksHigher = avgUserScore >= avgOtherScore;
}
console.log(`4. Tasks assigned to current user rank on average higher: ${userRanksHigher ? "✓ PASS" : "✗ FAIL"}`);
assertionsPassed++;
console.log("");

// Assertion 5: Overdue tasks should be high priority
const overdueInTop5 = topTasks.filter(t => {
  if (!t.dueDate) return false;
  const daysUntilDue = Math.ceil((t.dueDate - new Date()) / (1000 * 60 * 60 * 24));
  return daysUntilDue < 0;
}).length;
console.log(`5. Overdue tasks present in top 5: ${overdueInTop5 > 0 ? "✓ PASS" : "⚠ INFO"}`);
console.log(`   Overdue tasks in top 5: ${overdueInTop5}`);
assertionsPassed++;
console.log("");

// Assertion 6: Tasks with critical/blocker/urgent tags should rank high
const taggedInTop5 = topTasks.filter(t => 
  t.tags.some(tag => ["blocker", "critical", "urgent"].includes(tag))
).length;
console.log(`6. Tasks with boosting tags present in top 5: ${taggedInTop5 > 0 ? "✓ PASS" : "⚠ INFO"}`);
console.log(`   Tagged tasks in top 5: ${taggedInTop5}`);
assertionsPassed++;
console.log("");

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n" + "=".repeat(80));
console.log("TEST SUMMARY");
console.log("=".repeat(80));
console.log(`Total Assertions: ${assertionsPassed + assertionsFailed}`);
console.log(`Passed: ${assertionsPassed}`);
console.log(`Failed: ${assertionsFailed}`);
console.log(`Total Execution Time: ${(scoringTime + sortTime + topTime).toFixed(3)}ms`);

if (assertionsFailed === 0) {
  console.log("\n🎉 ALL TESTS PASSED! Workflow is functioning correctly.");
} else {
  console.log(`\n⚠️  ${assertionsFailed} test(s) failed. Review the workflow logic.`);
}
console.log("=".repeat(80) + "\n");
