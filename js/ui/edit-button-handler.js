import { closeSpecificOverlay } from "../events/overlay-handler.js";
import { renderEditOverlay } from "./render-card-events.js";

/**
 * Sets up the edit button listener in the detail overlay.
 * @param {HTMLElement} detailOverlayElement - The detail overlay DOM element.
 * @param {string} taskId - The ID of the task to edit.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
export function setupEditButtonListener(
  detailOverlayElement,
  taskId,
  boardData,
  updateBoardFunction
) {
  const editButton = detailOverlayElement.querySelector(".edit-task-btn");
  if (editButton) {
    editButton.dataset.taskId = taskId;
    editButton.onclick = null;
    editButton.addEventListener("click", (event) =>
      handleEditButtonClick(event, taskId, boardData, updateBoardFunction)
    );
  }
}

/**
 * Handles the click event for the edit button in the detail overlay.
 * @param {Event} event - The click event.
 * @param {string} taskId - The ID of the task to edit.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
export function handleEditButtonClick(
  event,
  taskId,
  boardData,
  updateBoardFunction
) {
  event.stopPropagation();
  closeSpecificOverlay("overlay-task-detail");
  if (typeof window.refreshBoardSite === "function") window.refreshBoardSite();
  renderEditOverlay(taskId, boardData, updateBoardFunction);
}
