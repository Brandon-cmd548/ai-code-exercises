# TaskManager

A Node.js command-line task management application that allows users to create, organize, and track tasks with priorities, due dates, and tags using a simple and efficient CLI interface.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
  - [Create a new task](#create-a-new-task)
  - [List tasks](#list-tasks)
  - [Update tasks](#update-tasks)
  - [Delete tasks](#delete-tasks)
  - [Manage tags](#manage-tags)
  - [View statistics](#view-statistics)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Project Structure](#project-structure)

## Description

TaskManager is a CLI-based task management tool built with Node.js and JavaScript. It supports task creation, organization, prioritization, due date tracking, and local JSON persistence so tasks remain saved between application runs.

## Features

- Task creation with title, description, priority, due date, and tags
- Task listing with status, priority, and deadline visibility
- Update task status, due dates, and priority levels
- Delete tasks when they are no longer needed
- Tag-based task organization and filtering
- Priority management with low, medium, high, and urgent levels
- Due date tracking for overdue and upcoming tasks
- Task statistics summarizing completed, pending, and overall tasks
- Local JSON storage that preserves all tasks automatically
- Fully CLI-controlled interaction for fast and efficient workflow
- Structured text parsing support for task creation
- Task prioritization engine that ranks tasks based on priority, due date, and status
- Extensible architecture designed for future improvements like task merging and advanced syncing

## Technologies

- Node.js
- JavaScript
- jest
- uuid
- CLI interface
- JSON file storage

## Installation

1. Ensure Node.js is installed on your machine. Install from [nodejs.org](https://nodejs.org/).
2. Open a terminal in the project folder.
3. Install dependencies:

```bash
npm install
```

## Usage

Run CLI commands from the project directory using:

```bash
node cli.js
```

### Example:
```bash
node cli.js create "Prepare presentation" -d "Create slides for the upcoming client meeting" -p 2 -u 2024-03-15 -t "work,coding,important"
```

### List tasks
```
node cli.js list
```

### Update tasks
```
node cli.js update <task-id> [options]
```

### Delete tasks
```
node cli.js delete <task-id>
```

### Tag management for tasks
```
node cli.js tag add <task-id> <tag>
node cli.js tag remove <task-id> <tag>
```

### View stats
```
node cli.js stats
```