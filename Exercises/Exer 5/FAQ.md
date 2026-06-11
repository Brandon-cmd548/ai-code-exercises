# TaskManager CLI FAQ

This FAQ is for users of the TaskManager command-line application. It answers common questions about setup, usage, troubleshooting, and task storage.

## 1. Getting Started

### Q: What do I need to use TaskManager?
A: You need Node.js installed on your system (v12 or higher recommended) and npm, which comes with Node.js. You also need to run `npm install` in the project folder before using the CLI.

### Q: How do I install TaskManager?
A: Clone or download the repository, open a terminal in the `TaskManager` folder, and run:
```bash
npm install
```
This installs the required dependencies: `commander` and `uuid`.

### Q: How do I run the CLI?
A: Use Node.js to run `cli.js` from the project directory:
```bash
node cli.js [command] [options]
```
Running `node cli.js` without any commands will show the help menu.

### Q: Can I use TaskManager on Windows?
A: Yes. The CLI runs with Node.js on Windows. Just open PowerShell or Command Prompt in the project folder and use `node cli.js`.

### Q: How do I see available commands?
A: Run:
```bash
node cli.js --help
```
This displays a list of available commands and options.

## 2. Common Features and Functionality

### Q: How do I create a new task?
A: Use the `create` command with a title and optional flags:
```bash
node cli.js create "Complete project" -d "Finish the task manager project" -p 3 -u 2023-12-31 -t "work,coding,important"
```

### Q: What priority values are supported?
A: Valid priorities are:
- `1` = LOW
- `2` = MEDIUM
- `3` = HIGH
- `4` = URGENT

### Q: How do I list all tasks?
A: Run:
```bash
node cli.js list
```
You can also filter by status, priority, or overdue tasks.

### Q: How do I filter tasks by status?
A: Use the `-s` or `--status` option with the `list` command:
```bash
node cli.js list -s todo
```
Valid statuses are `todo`, `in_progress`, `review`, and `done`.

### Q: How do I update a task's status?
A: Use the `status` command with the task ID and target status:
```bash
node cli.js status <task_id> in_progress
```

### Q: How do I change a task's due date?
A: Use the `due` command:
```bash
node cli.js due <task_id> 2023-12-31
```

### Q: How do I add or remove tags?
A: Add a tag with:
```bash
node cli.js tag <task_id> important
```
Remove a tag with:
```bash
node cli.js untag <task_id> important
```

### Q: How do I delete a task?
A: Use the `delete` command:
```bash
node cli.js delete <task_id>
```

### Q: How can I view task statistics?
A: Run:
```bash
node cli.js stats
```
It shows totals, status breakdown, priority breakdown, overdue tasks, and recent completions.

## 3. Troubleshooting Common Issues

### Q: Why are my tasks not saving?
A: Common causes:
- You are not in the correct directory when running `cli.js`.
- The `tasks.json` file is missing, corrupted, or has bad permissions.
- The application encountered an error while creating or updating the file.

### Q: Why does my command fail or not run?
A: Check the following:
- Node.js is installed and accessible from your PATH.
- Dependencies were installed with `npm install`.
- You typed the command and task ID correctly.

### Q: Why is my due date being rejected?
A: The CLI expects dates in `YYYY-MM-DD` format. Formats like `DD-MM-YYYY` or `MM/DD/YYYY` are not accepted.

### Q: Why are my tags not being applied?
A: When adding tags, use a comma-separated list without spaces inside the string:
```bash
node cli.js create "Task title" -t "work,coding,important"
```
If you use spaces between tags, the application may not parse them correctly.

### Q: What should I do if the JSON file becomes corrupted?
A: If `tasks.json` is corrupted, restore it from a backup if you have one. If not, you may need to recreate the file and re-add tasks manually.

### Q: How can I fix permission issues writing to `tasks.json`?
A: Ensure your terminal has write access to the project folder. On Windows, run the terminal as a regular user with write permissions or move the project to a directory where you can write files.

## 4. Questions About Data Storage and Backup

### Q: Where are tasks stored?
A: Tasks are saved locally in a file named `tasks.json` inside the project directory.

### Q: Is there cloud backup or sync?
A: No. TaskManager does not include built-in cloud sync or backup. You must manage backups manually by copying `tasks.json` or using your own cloud storage solution.

### Q: What happens if `tasks.json` is deleted?
A: If the file is deleted, all task data stored there is lost. The app may recreate a fresh file when you add a new task, but previously saved tasks cannot be recovered without a backup.

### Q: Can I move the project folder and still use TaskManager?
A: Yes, as long as all files remain in place and you run the CLI from the project directory. Renaming or relocating files like `cli.js`, `app.js`, or `storage.js` may break the application.

### Q: How can I reduce the risk of losing tasks?
A: Best practices:
- Keep a backup copy of `tasks.json`.
- Use version control (like Git) for the project directory.
- Avoid editing `tasks.json` manually unless necessary.

## 5. Known Limitations and Behavior

### Q: Does TaskManager have a graphical interface?
A: No. This project is a command-line application only. Users should be comfortable running commands in a terminal.

### Q: Can I change the task rules without editing code?
A: Most business rules are hardcoded in the source. Changing task priorities, status behavior, or validation rules requires editing the JavaScript code.

### Q: Why might invalid input cause unexpected behavior?
A: The application has limited error handling. Incorrect values for dates, priorities, or status may not always produce clear error messages.

### Q: What if I want a more robust task solution?
A: Consider using a dedicated task management app or enhancing this project with features such as better validation, backup, and a graphical interface.

## 6. Additional Tips

- Always run commands from the TaskManager project directory.
- Use `npm install` after cloning or downloading the repository.
- Keep your `tasks.json` file backed up if your tasks are important.
- If you are new to command-line tools, start by using `node cli.js --help` for command guidance.