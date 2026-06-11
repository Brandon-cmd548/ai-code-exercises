# Exercise 6 Overview: Error Diagnosis Challenge

## Objective
The goal of this exercise was to develop the ability to analyze, understand, and diagnose programming errors using AI-assisted debugging techniques. The focus was on interpreting error messages, identifying root causes, and proposing effective solutions while strengthening understanding of underlying programming concepts.

---

## Selected Error Scenario

### Global Variable Being Overwritten (JavaScript)
#### Error Message
Uncaught TypeError: Cannot read properties of undefined (reading 'map')
    at displayTasks (taskManager.js:24)
    at addTask (taskManager.js:15)
    at HTMLButtonElement.onclick (index.html:1)
#### Code Context
```js
// taskManager.js
// Global variable to store tasks
let tasks = [];

// Function to initialize the application
function initApp() {
  console.log("Task Manager initialized");
  tasks = [
    { id: 1, name: "Complete project proposal", completed: false },
    { id: 2, name: "Meeting with team", completed: true }
  ];
  displayTasks();
}

// Function to add a new task
function addTask(taskName) {
  let tasks = { id: Date.now(), name: taskName, completed: false };  // Notice the 'let tasks' here!
  console.log("Task added:", tasks);
  displayTasks();
}

// Function to display all tasks
function displayTasks() {
  const taskListElement = document.getElementById('task-list');
  taskListElement.innerHTML = "";

  // Error occurs here - tasks is now a single object, not an array
  tasks.map(task => {
    const taskElement = document.createElement('div');
    taskElement.innerHTML = `
      <div class="task-item ${task.completed ? 'completed' : ''}">
        <span>${task.name}</span>
        <button onclick="toggleTaskStatus(${task.id})">Toggle</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskListElement.appendChild(taskElement);
  });
}

// Toggle task status
function toggleTaskStatus(taskId) {
  tasks = tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  displayTasks();
}

// Delete a task
function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  displayTasks();
}

// Initialize the app when page loads
window.onload = initApp;
```