const {TaskPriority, TaskStatus} = require("./models");

/**
 * Calculates a numerical priority score for a task based on several factors.
 * 
 * This function implements a comprehensive scoring algorithm that evaluates task priority
 * based on multiple criteria including base priority level, due date proximity, completion
 * status, special tags, and recent activity. Higher scores indicate higher priority.
 * 
 * @param {Object} task - The task object to score
 * @param {string} task.priority - The base priority level (LOW, MEDIUM, HIGH, URGENT from TaskPriority)
 * @param {Date} [task.dueDate] - The due date of the task (optional). Tasks due sooner receive higher scores
 * @param {string} task.status - The current status of the task (from TaskStatus enum)
 * @param {Array<string>} task.tags - Array of tag strings associated with the task
 * @param {Date|string} task.updatedAt - The timestamp when the task was last updated
 * 
 * @returns {number} A numerical score representing the task's priority. Higher values indicate
 *                   higher priority. Score calculation:
 *                   - Base: 10-40 points depending on priority level
 *                   - Due date: 0-30 additional points based on urgency
 *                   - Status: -50 to 0 points (DONE tasks penalized by 50, REVIEW by 15)
 *                   - Tags: +8 points if contains "blocker", "critical", or "urgent"
 *                   - Recent update: +5 points if updated within 24 hours
 * 
 * @throws {Error} May throw if task.priority is not a valid TaskPriority value or if
 *                 date calculations fail due to invalid date formats
 * 
 * @example
 * // Calculate score for an overdue urgent task
 * const task = {
 *   priority: TaskPriority.URGENT,
 *   dueDate: new Date('2026-06-08'),
 *   status: TaskStatus.IN_PROGRESS,
 *   tags: ['critical', 'blocker'],
 *   updatedAt: new Date()
 * };
 * const score = calculateTaskScore(task);
 * // Returns: 40 + 30 (overdue) + 8 (tags) + 5 (recent) = 83
 * 
 * @note - Completed tasks (DONE status) are heavily penalized to deprioritize them
 *       - Tasks due today receive a 20-point boost; overdue tasks receive 30 points
 *       - The function creates new Date objects internally; ensure task.dueDate and
 *         task.updatedAt are valid Date objects or parseable date strings
 *       - For best results, use ISO 8601 date format (YYYY-MM-DDTHH:mm:ss.sssZ)
 */
function calculateTaskScore(task) {
  // Base priority weights
  const priorityWeights = {
    [TaskPriority.LOW]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.URGENT]: 4
  };

  // Calculate base score from priority
  let score = (priorityWeights[task.priority] || 0) * 10;

  // Add due date factor (higher score for tasks due sooner)
  if (task.dueDate) {
    const now = new Date();
    const dueDate =task.dueDate;
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {  // Overdue tasks
      score += 30;
    } else if (daysUntilDue === 0) {  // Due today
      score += 20;
    } else if (daysUntilDue <= 2) {  // Due in next 2 days
      score += 15;
    } else if (daysUntilDue <= 7) {  // Due in next week
      score += 10;
    }
  }

  // Reduce score for tasks that are completed or in review
  if (task.status === TaskStatus.DONE) {
    score -= 50;
  } else if (task.status === TaskStatus.REVIEW) {
    score -= 15;
  }

  // Boost score for tasks with certain tags
  if (task.tags.some(tag => ["blocker", "critical", "urgent"].includes(tag))) {
    score += 8;
  }

  // Boost score for recently updated tasks
  const now = new Date();
  const updatedAt = new Date(task.updatedAt);
  const daysSinceUpdate = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdate < 1) {
    score += 5;
  }

  return score;
}

/**
 * Sorts an array of tasks by their calculated priority score in descending order.
 * 
 * This function uses the {@link calculateTaskScore} algorithm to evaluate each task
 * and sorts them so that the highest priority tasks appear first. The original array
 * is not modified; a shallow copy is created and sorted instead.
 * 
 * @param {Array<Object>} tasks - An array of task objects to sort. Each task object
 *                                should contain all properties required by calculateTaskScore
 * @param {string} tasks[].priority - Priority level of each task
 * @param {Date} [tasks[].dueDate] - Optional due date for each task
 * @param {string} tasks[].status - Status of each task
 * @param {Array<string>} tasks[].tags - Tags associated with each task
 * @param {Date|string} tasks[].updatedAt - Last update timestamp for each task
 * 
 * @returns {Array<Object>} A new array of tasks sorted by priority score in descending order
 *                          (highest priority first). The original tasks array is unchanged.
 *                          Returns an empty array if an empty array is provided.
 * 
 * @throws {Error} May throw if any task in the array lacks required properties or if
 *                 date calculations fail within calculateTaskScore
 * 
 * @example
 * // Sort tasks and display in priority order
 * const unsortedTasks = [
 *   { priority: TaskPriority.LOW, dueDate: new Date('2026-07-01'), 
 *     status: TaskStatus.IN_PROGRESS, tags: [], updatedAt: new Date() },
 *   { priority: TaskPriority.URGENT, dueDate: new Date('2026-06-11'), 
 *     status: TaskStatus.IN_PROGRESS, tags: ['critical'], updatedAt: new Date() },
 *   { priority: TaskPriority.MEDIUM, dueDate: new Date('2026-06-15'), 
 *     status: TaskStatus.IN_PROGRESS, tags: [], updatedAt: new Date() }
 * ];
 * 
 * const sortedTasks = sortTasksByImportance(unsortedTasks);
 * // sortedTasks[0] is the URGENT task (highest score)
 * // sortedTasks[1] is the MEDIUM task
 * // sortedTasks[2] is the LOW task (lowest score)
 * // unsortedTasks remains unchanged
 * 
 * @note - The function uses a shallow copy via spread operator [...tasks]. If you need
 *         to preserve the exact order for some tasks, consider running this before
 *         any other sorting operations.
 *       - Stable sorting is not guaranteed; if two tasks have identical scores, their
 *         relative order may vary across different JavaScript engines.
 *       - This function internally calls calculateTaskScore for each task, so performance
 *         scales linearly with array size O(n log n) for the sort, O(n) for scoring.
 */
function sortTasksByImportance(tasks) {
  // Create a copy of the tasks array to avoid modifying the original
  return [...tasks].sort((a, b) => {
    return calculateTaskScore(b) - calculateTaskScore(a);
  });
}

function getTopPriorityTasks(tasks, limit = 5) {
  const sortedTasks = sortTasksByImportance(tasks);
  return sortedTasks.slice(0, limit);
}

// Export functions for testing
module.exports = { calculateTaskScore, sortTasksByImportance, getTopPriorityTasks };
