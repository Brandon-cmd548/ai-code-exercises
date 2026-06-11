# Understanding: mergeTaskLists Function

## My Explanation (In My Own Words)

The `mergeTaskLists` function is responsible for combining two sets of tasks remote and local:

- `localTasks` (tasks stored locally)
- `remoteTasks` (tasks from another source, like a server i would assume)

The goal is to create one final merged version of the tasks, while also figuring out:
- What needs to be added
- What needs to be updated
- On which side (local or remote) those changes should happen

---

## Core Idea

Instead of just merging everything blindly, the function:
1. Looks at all task IDs from both sources
2. Processes each task only once
3. Decides how to handle each task depending on where it exists

THIS AVOIDS DUPLICATION

---

## How It Works

### 1. Combine All Task IDs
- It creates a list of all unique task IDs from both local and remote
- This ensures no task is missed

---

### 2. Compare Where Each Task Exists

For each task ID:

#### Only in Local
- Add it to the merged result  
- Mark it to be created on remote

---

#### Only in Remote
- Add it to the merged result  
- Mark it to be created on local

---

#### Exists in Both -> Conflict Handling
- Calls another function: `resolveTaskConflict`
- This decides:
  - What the final merged task should look like
  - Whether local or remote needs updating

---

## Conflict Resolution

When both versions of a task exist:

### Base Rule
- Start with a copy of the local task
- Then compare differences with the remote version

---

### Timestamp Rule
- The task with the newer `updatedAt` wins
- Its values override the older version

---

### Special Rule
- If a task is marked as DONE, it wins even if it's older

---

### Tags Handling
- Tags from both tasks are combined (union)
- If tags differ:
  - Both local and remote may need updates

---

### Final Step
- The merged task's `updatedAt` is set to the most recent timestamp

---

## What the Function Returns

The function does not just return merged tasks — it returns multiple results:

- `mergedTasks` → final combined version of all tasks  
- `toCreateRemote` → tasks that need to be added to remote  
- `toUpdateRemote` → tasks that need to be updated on remote  
- `toCreateLocal` → tasks that need to be added locally  
- `toUpdateLocal` → tasks that need to be updated locally  

 This supports syncing both sides properly

---

## Pattern / Technique Being Used

This is a two-source merge with conflict resolution, using:

- Set union → to combine task IDs and tags  
- Last-write-wins → newer updates override older ones  
- Business rules override → "DONE" takes priority  
- Deterministic merging → same input = same result every time  

---

## Important Insight

This function is essentially solving a data synchronization problem.

It ensures:
- No duplicate tasks  
- No lost updates  
- Both local and remote stay consistent  

---

## My Understanding Summary

- The function merges two data sources into one clean version  
- It carefully handles conflicts instead of overwriting blindly  
- It tracks exactly what needs to be synced on each side  
- It uses timestamps + custom rules to decide which data is correct  

---

# Reflection Question

- 1. How did the AI’s explanation change your understanding of the algorithm?
    - Initially, I understood that the function was merging local and remote task lists and preventing duplication. The AI clarified that the function is not just merging data, but also managing synchronization between two systems, including determining exactly what needs to be created or updated on each side.
    - I generally understood that conflicts were handled but AI explained to me that most recent updates would win, un-completed tasks would be overridden to complted tasks where suitable and tags were mergeed using union.
    - The AI highlighted implementation details I did not initially consider like using `Set` to ensure IDs were prcoessed once, start with a shallow copy to reduce unessarary objects creation and avoid redundent updates unless data atucally needed it.
    - AI also pointed out some potential bugs that included: Only certain fields being updated when one side is newer, Risks with missing or invalid timestamps, Shallow copying potentially causing problems with nested data.
- 2. What aspects were still difficult to understand after AI explanation?
    - one confusing part was why when one task is newer the function only updates specific fields (such as title, description, priority and dueDate) instead of copying the entire newer task.
    - The algorithm creates the merged task using a shallow copy of the local task. This led to some uncertainty: If tasks contained nested objects, would changes affect both original and merged data? or Could this cause unintended side effects?
    - I was unsure how realisic this program was, like for eaxmaple if the datasets were 50000 tasks long how well would it perform though after further thought this program will msot lickley not be used in indudstry large tasks.

- 3. How would you explain this algorithm to another junior developer?
    - The function takes two task lists, compares them carefully, resolves any differences using rules (like latest update wins), and returns both a merged result and a set of actions needed to sync both sides.
- 4. How might you improve the algorithm based on your understanding?
    - Copy and merge all prperties from the new task, this allwos and new added fields to be taken into consideration aswell.
    - Only update the side that is missing tags instead of both, basically compare differences more precisely rather than triggering updates on both sides.
    - Integrate batch processing instead of procesing it all at once which will allow it to be more scalable.
