/**
 * Extracts subtasks from a task object, handling all mapping and fallbacks.
 * @param {object} task - The task object to extract subtasks from.
 * @returns {Array<{text: string, completed: boolean}>}
 */
export function extractSubtasksFromTask(task) {
  let subtasks = [];
  if (
    Array.isArray(task.totalSubtasks) &&
    Array.isArray(task.checkedSubtasks) &&
    task.totalSubtasks.length === task.checkedSubtasks.length
  ) {
    subtasks = task.totalSubtasks.map((text, i) => ({
      text,
      completed: !!task.checkedSubtasks[i],
    }));
  } else if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
    subtasks = task.subtasks.map((st) =>
      typeof st === "string" ? { text: st, completed: false } : st
    );
  }
  return subtasks;
}
