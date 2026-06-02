# Code Understanding Journal – Part 1
## Task Creation & Status Updates

---

## Main Components

Files involved:
- `models.js`
- `storage.js`
- `app.js`
- `cli.js`
- `tests/`

---

## File Purposes

**models.js**
- Defines Task class (task objects)
- Task priority: 1 (LOW) → 4 (URGENT)
- Task status: `todo`, `in_progress`, `review`, `done`
- Uses `uuid` to generate unique IDs

**storage.js**
- Handles JSON file (`tasks.json`)
- Saves & loads tasks from disk
- Filters tasks (status, priority, overdue, all)

**app.js**
- Creates, updates, deletes tasks
- Uses `storage.js`
- Calculates stats:
  - Count by status
  - Count by priority
  - Overdue count
  - Completed in last 7 days

**cli.js**
- Frontend (CLI)
- Uses `commander` to parse commands
- Starts TaskManager
- Formats output
- Maps CLI commands → TaskManager functions

**tests/**
- Uses Jest for automated testing of modules

---

## Libraries Used

- **commander** → CLI command setup  
- **uuid** → Unique task IDs  
- **jest** → Testing  
- **Node.js** → Runtime environment  

---

## Execution Flow

### Create Task
```text
cli.js (node cli.js create "Fix Bug#68")
↓
commander parses command
↓
TaskManager.createTask() (app.js)
↓
new Task() (models.js)
↓
TaskStorage.addTask() (storage.js)
↓
saved to tasks.json
```

### Update Task
```text
node cli.js status [task-id] in_progress
↓
cli.js → TaskManager.updateTaskStatus()
↓
TaskStorage.updateTask()
↓
task.update() (models.js)
↓
storage.save() → tasks.json

```

## How data is stored and retrieved 
```text
tasks.json (persisted)
↓ load()
In-memory task object { id: Task }
↓ modify
Updated object
↓ save()
tasks.json (updated)
```
## Extra Understanding
### Uses layered architecture
```text
Presentation Layer  → cli.js (user interface)
                           ↓
Business Logic Layer → app.js (TaskManager)
                           ↓
Data Access Layer    → storage.js (TaskStorage)
                           ↓
Domain Models        → models.js (Task, enums)

```

### Storage and TaskManager seperation
**TaskManager** does not change how data is stored. Instead, it calls external storage methods, while `storage.js` handles JSON file serialization. This design allows for easier migration to a database later down the line.
