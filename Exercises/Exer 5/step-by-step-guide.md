# Creating a Task in TaskManager

## Prerequisites

- Node.js must be installed and available in your terminal.
- You need access to the project folder containing `cli.js`.
- Dependencies must be installed with:

```bash
npm install
```

---

## Step-by-Step Guide

### 1. Open your terminal

Navigate to the TaskManager project folder where `cli.js` lives:

```bash
cd path/to/TaskManager
```

### 2. Verify the CLI entry point exists

Check that `cli.js` is present in the current directory:

```bash
ls
```

You should see:

```
cli.js
app.js
models.js
storage.js
```

### 3. Run the create command

Use the `create` command with a title and options:

```bash
node cli.js create "Prepare presentation" -d "Create slides for the upcoming client meeting" -p 2 -u 2024-03-15 -t "work,coding,important"
```

---

## Example Command

```bash
node cli.js create "Prepare presentation" -d "Create slides for the upcoming client meeting" -p 2 -u 2024-03-15 -t "work,coding,important"
```

This command creates a task with:

| Field       | Value                                            |
|-------------|--------------------------------------------------|
| Title       | Prepare presentation                             |
| Description | Create slides for the upcoming client meeting    |
| Priority    | 2                                                |
| Due date    | 2024-03-15                                       |
| Tags        | work, coding, important                          |

---

## Common Issues and Mistakes

| Issue | Cause |
|---|---|
| `node: command not found` | Node.js is not installed or not on PATH. |
| Incorrect current directory | Make sure you are in the folder containing `cli.js`. |
| Invalid due date format | Use `YYYY-MM-DD` exactly. |
| Missing quotes around multi-word values | Use `" "` around strings with spaces. |
| Tag list formatting error | Use comma-separated tags without spaces: `"work,coding,important"`. |

---

## Troubleshooting

### Command does nothing or errors
- Verify `node cli.js` runs in the current folder.
- Ensure `cli.js` is executable and not corrupted.

### Task does not appear afterward
- Check the local JSON storage file for saved tasks.
- Confirm the task was not rejected due to invalid data.

### Due date is rejected
- Use a valid date format: `YYYY-MM-DD`
- Avoid malformed formats like `15-03-2024` or `2024/03/15`.

### Priority not accepted
Use valid values: `1`, `2`, `3`, or `4`

| Value | Level  |
|-------|--------|
| 1     | LOW    |
| 2     | MEDIUM |
| 3     | HIGH   |
| 4     | URGENT |

### Tags are not recognized
Enter tags as a comma-separated string with no spaces inside the quotes:

```bash
-t "work,coding,important"
```

---

## Notes for Intermediate Users

- You can extend this workflow by inspecting `task_parser.js` and `task_priority.js`.
- If the app supports additional commands, run `node cli.js help` or check the source for command definitions.
- Tasks are saved using local JSON persistence — verify the storage file if tasks disappear unexpectedly.