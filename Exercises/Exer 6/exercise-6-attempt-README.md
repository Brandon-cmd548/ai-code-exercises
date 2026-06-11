# Error Analysis: [Error Type]

## Error Description:
The application is trying to use a function called .map() on something that doesn't exist (is undefined).

## Root Cause:
Line 16 - 22, function name: addTask, tasks is already a global varible but see:
```js
function addTask(taskName) {
  let tasks = { id: Date.now(), name: taskName, completed: false };  // Notice the 'let tasks' here!
  console.log("Task added:", tasks);
  displayTasks();
  return tasks; // Return for testing
}
```
'let' is declaring new object not adding object to global tasks array

## Solution:
Remove 'let' and push task to add task too global array
```js
function addTask(taskName) {
  tasks.push({ id: Date.now(), name: taskName, completed: false });
  console.log("Task added:", tasks);
  displayTasks();
  return tasks; // Return for testing
}
```

## Learning Points:
- Avoid varible shadowing, never declare a local varible with the same name as a global varible
    - I suggest using a tool similar to ESlint with no-shadow enabled.
    - Maybe when declaring global varibles use a tag to inform you that this varible is global, eg.
        ```js
        let g_tasks = [] // specificies global_tasks
        ```
- Write a unit test early which will run a test after each function change catching theses errors imediatly
    ```js
        addTask("Test task");
        console.assert(tasks.length === 3, "Should have 3 tasks"); 
    ```