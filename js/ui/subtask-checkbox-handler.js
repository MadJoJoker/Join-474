import { CWDATA } from "../data/task-to-firbase.js";

/**
 * Sets up the event listener for subtask checkboxes in a container.
 * @param {HTMLElement} container - The container element holding the checkboxes.
 * @param {object} task - The task object.
 * @param {string|number} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 */
export function setupSubtaskCheckboxListener(
  container,
  task,
  taskId,
  boardData
) {
  container.addEventListener("change", function (e) {
    if (e.target && e.target.classList.contains("subtask-checkbox")) {
      handleSubtaskCheckboxChange(e, task, taskId, boardData, container);
    }
  });
}

/**
 * Handles the change event for a subtask checkbox.
 * @param {Event} e - The change event.
 * @param {object} task - The task object.
 * @param {string|number} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 * @param {HTMLElement} container - The container element holding the checkboxes.
 */
export function handleSubtaskCheckboxChange(
  e,
  task,
  taskId,
  boardData,
  container
) {
  const subtaskIndex = Number(e.target.dataset.subtaskIndex);
  const checked = e.target.checked;
  if (task && Array.isArray(task.checkedSubtasks)) {
    task.checkedSubtasks[subtaskIndex] = checked;
    task.subtasksCompleted = task.checkedSubtasks.filter(Boolean).length;
    CWDATA({ [taskId]: task }, boardData);
    updateSubtaskProgressBar(task, container);
  }
}

/**
 * Updates the progress bar for subtasks.
 * @param {object} task - The task object.
 * @param {HTMLElement} container - The container element holding the progress bar.
 */
function updateSubtaskProgressBar(task, container) {
  const progress = window.calculateSubtaskProgress
    ? window.calculateSubtaskProgress(task)
    : null;
  const progressBar = container.querySelector(".progress-bar-fill");
  if (progressBar && progress) progressBar.style.width = `${progress.percent}%`;
}
