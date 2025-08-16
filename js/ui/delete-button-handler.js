import { CWDATA } from "../data/task-to-firbase.js";
import { closeSpecificOverlay } from "../events/overlay-handler.js";
/**
 * Sets up the delete button listener in the detail overlay.
 * @param {HTMLElement} detailOverlayElement - The detail overlay DOM element.
 * @param {string} taskId - The ID of the task to delete.
 * @param {object} boardData - The board data object.
 */
export function setupDeleteButtonListener(
  detailOverlayElement,
  taskId,
  boardData
) {
  const deleteButton = detailOverlayElement.querySelector(".delete-task-btn");
  if (deleteButton) {
    deleteButton.dataset.taskId = taskId;
    deleteButton.onclick = null;
    deleteButton.addEventListener("click", (event) =>
      handleDeleteButtonClick(event, boardData)
    );
  }
}

/**
 * Handles the click event for the delete button in the detail overlay.
 * @param {Event} event - The click event.
 * @param {object} boardData - The board data object.
 */
export function handleDeleteButtonClick(event, boardData) {
  event.stopPropagation();
  const deleteId = event.currentTarget.dataset.taskId;
  if (boardData.tasks[deleteId]) {
    CWDATA({ [deleteId]: null }, boardData);
    delete boardData.tasks[deleteId];
    if (window.firebaseData && window.firebaseData.tasks) {
      delete window.firebaseData.tasks[deleteId];
    }
    closeSpecificOverlay("overlay-task-detail");
    window.location.href = "board-site.html";
  }
}
