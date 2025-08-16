import { getTaskOverlay } from "../templates/task-details-template.js";
import {
  openSpecificOverlay,
  closeSpecificOverlay,
  initOverlayListeners,
  loadOverlayHtmlOnce,
} from "../events/overlay-handler.js";
import { getAddTaskFormHTML } from "../templates/add-task-template.js";
import {
  setCategoryFromTaskForCard,
  setAssignedContactsFromTaskForCard,
} from "../events/dropdown-menu-auxiliary-function.js";
import { CWDATA } from "../data/task-to-firbase.js";
import { editedTaskData, calculateSubtaskProgress } from "./render-card.js";
import {
  setupDropdownMenuListeners,
  handleDropdownClick,
  setupMoveTaskListeners,
  handleMoveTask,
} from "./dropdown-move-handler.js";
import { refreshBoardSite } from "./render-board.js";
import {
  setupSubtaskCheckboxListener,
  handleSubtaskCheckboxChange,
} from "./subtask-checkbox-handler.js";
import {
  setupEditButtonListener,
  handleEditButtonClick,
} from "./edit-button-handler.js";
import {
  setupDeleteButtonListener,
  handleDeleteButtonClick,
} from "./delete-button-handler.js";
import { setupEditFormModules } from "./edit-form-modules.js";
import {
  setupCancelEditBtn,
  setupTaskEditFormListener,
  handleTaskEditFormSubmit,
} from "./edit-form-handler.js";

export let detailOverlayElement = null;
export let editOverlayElement = null;

/**
 * Loads the detail overlay HTML once and assigns it to detailOverlayElement.
 * @returns {Promise<void>} Resolves when the overlay is loaded.
 */
async function loadDetailOverlayHtmlOnce() {
  if (detailOverlayElement) return;
  detailOverlayElement = await loadOverlayHtmlOnce(
    "../js/templates/task-details-overlay.html",
    "overlay-task-detail"
  );
}

/**
 * Loads the edit overlay HTML once and assigns it to editOverlayElement.
 * @returns {Promise<void>} Resolves when the overlay is loaded.
 */
async function loadEditOverlayHtmlOnce() {
  if (editOverlayElement) return;
  editOverlayElement = await loadOverlayHtmlOnce(
    "../js/templates/task-detail-edit-overlay.html",
    "overlay-task-detail-edit"
  );
}

/**
 * Registers event listeners for task card detail overlays.
 * @param {object} boardData - The board data object containing tasks, contacts, etc.
 * @param {function} updateBoardFunction - Callback function to update the board after changes.
 * @returns {Promise<void>} Resolves when listeners are registered.
 */
export async function registerTaskCardDetailOverlay(
  boardData,
  updateBoardFunction
) {
  await loadDetailOverlayHtmlOnce();
  await loadEditOverlayHtmlOnce();
  const cards = document.querySelectorAll(".task-card");
  cards.forEach((card) => {
    setupDropdownMenuListeners(
      card,
      boardData,
      handleDropdownClick,
      (dropdownMenu, boardData) =>
        setupMoveTaskListeners(
          dropdownMenu,
          boardData,
          (ev, boardData, direction) =>
            handleMoveTask(ev, boardData, direction, CWDATA)
        )
    );
    setupCardClickListener(card, boardData, updateBoardFunction);
  });
}

// ...existing code...

/**
 * Sets up click listener for a task card.
 * @param {Element} card - The task card DOM element.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @returns {void}
 */
function setupCardClickListener(card, boardData, updateBoardFunction) {
  const oldClickListener = card.getAttribute("data-has-click-listener");
  if (oldClickListener) {
    card.removeEventListener("click", card._currentClickListener);
  }
  const newClickListener = (e) =>
    handleCardClick(e, card, boardData, updateBoardFunction);
  card.addEventListener("click", newClickListener);
  card.setAttribute("data-has-click-listener", "true");
  card._currentClickListener = newClickListener;
}

/**
 * Handles click event for a task card.
 * @param {Event} e - The click event.
 * @param {Element} card - The task card DOM element.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @returns {void}
 */
function handleCardClick(e, card, boardData, updateBoardFunction) {
  if (
    e.target.classList.contains("assigned-initials-circle") ||
    e.target.closest(".priority-icon") ||
    e.target.closest(".dropdown-menu-board-site-btn")
  )
    return;
  const taskId = card.id;
  const task = boardData.tasks[taskId];
  if (!task || !detailOverlayElement) return;
  renderDetailOverlay(taskId, boardData, updateBoardFunction);
}

/**
 * Renders the detail overlay for a task.
 * @param {string} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @returns {void}
 */
export function renderDetailOverlay(taskId, boardData, updateBoardFunction) {
  openSpecificOverlay("overlay-task-detail");
  const task = boardData.tasks[taskId];
  const container = detailOverlayElement.querySelector("#task-container");
  if (container) {
    renderTaskOverlayHtml(container, task, taskId, boardData);
    setupSubtaskCheckboxListener(container, task, taskId, boardData);
  }
  setupEditButtonListener(
    detailOverlayElement,
    taskId,
    boardData,
    updateBoardFunction
  );
  setupDeleteButtonListener(detailOverlayElement, taskId, boardData);
}

/**
 * Renders the HTML for the task overlay.
 * @param {Element} container - The container DOM element.
 * @param {object} task - The task object.
 * @param {string} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 * @returns {void}
 */
function renderTaskOverlayHtml(container, task, taskId, boardData) {
  const html = getTaskOverlay(task, taskId, boardData.contacts);
  container.innerHTML = html;
}

/**
 * Sets up listener for subtask checkbox changes.
 * @param {Element} container - The container DOM element.
 * @param {object} task - The task object.
 * @param {string} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 */

/**
 * Renders the edit overlay for a task.
 * @param {string} taskToEditId - The ID of the task to edit.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @returns {void}
 */
export function renderEditOverlay(
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  closeSpecificOverlay("overlay-task-detail");
  openSpecificOverlay("overlay-task-detail-edit");
  if (!editOverlayElement) return;
  const taskToEdit = boardData.tasks[taskToEditId];
  const taskEditContainer = editOverlayElement.querySelector(
    "#task-edit-container"
  );
  if (taskEditContainer) {
    renderEditFormHtml(taskEditContainer, taskToEdit);
    setupEditFormModules(taskEditContainer, taskToEdit, boardData);
    setupCancelEditBtn(
      taskEditContainer,
      taskToEditId,
      boardData,
      updateBoardFunction
    );
    setupTaskEditFormListener(
      taskEditContainer,
      taskToEdit,
      taskToEditId,
      boardData,
      updateBoardFunction
    );
  }
}

/**
 * Renders the HTML for the edit form.
 * @param {Element} container - The container DOM element.
 * @param {object} taskToEdit - The task object to edit.
 * @returns {void}
 */
function renderEditFormHtml(container, taskToEdit) {
  container.innerHTML = getAddTaskFormHTML(taskToEdit);
}
