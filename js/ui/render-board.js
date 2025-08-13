import { loadFirebaseData } from "../../main.js";
import { initDragAndDrop } from "../events/drag-and-drop.js";
import { createSimpleTaskCard } from "./render-card.js";
import { allData } from "../data/task-to-firbase.js";
import { toggleCheckbox } from "../ui/toggle-checkbox.js";

window.toggleCheckbox = toggleCheckbox;

let tasksData = {};

/**
 * Validates the board data structure.
 * @param {object} boardData - The board data object to validate.
 * @returns {boolean} True if the board data is valid, false otherwise.
 */
function validateRenderBoardData(boardData) {
  if (!boardData || !boardData.tasks || !boardData.contacts) {
    return false;
  }
  return true;
}

const VALID_COLUMNS = ["to-do", "in-progress", "await-feedback", "done"];
const COLUMN_MAPPING = {
  toDo: "to-do",
  inProgress: "in-progress",
  review: "await-feedback",
  done: "done",
};

/**
 * Initializes the tasks by column structure.
 * @returns {object} An object with keys for each valid column and empty arrays as values.
 */
function initializeTasksByColumn() {
  const tasksByColumn = {};
  VALID_COLUMNS.forEach((col) => {
    tasksByColumn[col] = [];
  });
  return tasksByColumn;
}

/**
 * Processes a task and assigns it to the correct column in tasksByColumn.
 * @param {string} taskID - The ID of the task.
 * @param {object} task - The task object.
 * @param {object} tasksByColumn - The object grouping tasks by column.
 */
function processTaskForColumn(taskID, task, tasksByColumn) {
  const colID = task.columnID;
  const mappedColID = COLUMN_MAPPING[colID];
  if (!mappedColID || !VALID_COLUMNS.includes(mappedColID)) return;

  const createdAtDate = Array.isArray(task.createdAt)
    ? new Date(task.createdAt[0])
    : new Date(task.createdAt);
  tasksByColumn[mappedColID].push({ taskID, createdAt: createdAtDate });
}

/**
 * Groups tasks by their column ID.
 * @param {object} tasks - The tasks object to group.
 * @returns {object} An object with arrays of tasks for each column.
 */
function groupTasksByColumn(tasks) {
  const tasksByColumn = initializeTasksByColumn();
  Object.entries(tasks).forEach(([taskID, task]) => {
    if (task && typeof task.columnID !== "undefined") {
      processTaskForColumn(taskID, task, tasksByColumn);
    }
  });
  return tasksByColumn;
}

/**
 * Sorts tasks within each column by their creation date.
 * @param {object} tasksByColumn - The grouped tasks object to sort.
 */
function sortGroupedTasks(tasksByColumn) {
  VALID_COLUMNS.forEach((colID) => {
    tasksByColumn[colID].sort((a, b) => a.createdAt - b.createdAt);
  });
}

/**
 * Clears the column container and prepares it for rendering tasks.
 * @param {string} colID - The column ID.
 * @returns {HTMLElement|null} The container element or null if not found.
 */
function clearAndPrepareColumnContainer(colID) {
  const container = document.getElementById(colID);
  if (!container) return null;
  container.querySelectorAll(".task-card").forEach((card) => card.remove());
  return container;
}

/**
 * Retrieves or creates a placeholder for the column container.
 * @param {HTMLElement} container - The column container element.
 * @returns {HTMLElement} The placeholder element.
 */
function getOrCreatePlaceholder(container) {
  let placeholder = container.querySelector(".no-tasks-placeholder");
  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.className = "no-tasks-placeholder";
    placeholder.textContent = "No tasks to do";
    container.appendChild(placeholder);
  }
  return placeholder;
}

/**
 * Renders tasks in the specified column container.
 * @param {HTMLElement} container - The column container element.
 * @param {Array} tasksInColumn - Array of tasks in the column.
 * @param {object} boardData - The board data object.
 */
function renderColumnTasks(container, tasksInColumn, boardData) {
  const placeholder = getOrCreatePlaceholder(container);
  if (tasksInColumn.length > 0) {
    placeholder.style.display = "none";
    tasksInColumn.forEach(({ taskID }) => {
      container.insertAdjacentHTML(
        "beforeend",
        createSimpleTaskCard(boardData, taskID)
      );
    });
  } else {
    placeholder.style.display = "block";
  }
}

/**
 * Renders tasks by their column.
 * @param {object} boardData - The board data containing tasks and contacts.
 */
function renderTasksByColumn(boardData) {
  if (!validateRenderBoardData(boardData)) return;

  tasksData = boardData.tasks;
  window.allData = boardData;

  const groupedTasks = groupTasksByColumn(tasksData);
  sortGroupedTasks(groupedTasks);

  VALID_COLUMNS.forEach((colID) => {
    const container = clearAndPrepareColumnContainer(colID);
    if (container) {
      renderColumnTasks(container, groupedTasks[colID], boardData);
    }
  });

  import("../ui/render-card.js").then((module) => {
    import("../templates/task-details-template.js").then((templateModule) => {
      if (typeof module.registerTaskCardDetailOverlay === "function") {
        module.registerTaskCardDetailOverlay(
          boardData,
          templateModule.getTaskOverlay
        );
      }
    });
  });

  initDragAndDrop();
}

/**
 * Maps a client column ID to a Firebase column ID.
 * @param {string} clientColumnId - The client column ID.
 * @returns {string} The corresponding Firebase column ID.
 */
function mapClientToFirebaseColumnId(clientColumnId) {
  const firebaseColumnMapping = {
    "to-do": "toDo",
    "in-progress": "inProgress",
    "await-feedback": "review",
    done: "done",
  };
  return firebaseColumnMapping[clientColumnId];
}

/**
 * Updates the local task column data.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} firebaseColumnId - The new Firebase column ID.
 */
function updateLocalTaskColumn(taskId, firebaseColumnId) {
  if (tasksData[taskId]) {
    tasksData[taskId].columnID = firebaseColumnId;
  }
}

/**
 * Triggers a Firebase update for the task's column.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} firebaseColumnId - The new Firebase column ID.
 * @returns {Promise<void>} Resolves when the update is complete.
 */
async function triggerFirebaseUpdate(taskId, firebaseColumnId) {}

/**
 * Updates the task's column data and triggers updates.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newColumnId - The new column ID from the client.
 * @returns {Promise<void>} Resolves when the update is complete.
 */
export async function updateTaskColumnData(taskId, newColumnId) {
  if (!tasksData[taskId]) return;

  const firebaseColumnId = mapClientToFirebaseColumnId(newColumnId);
  if (!firebaseColumnId) return;

  updateLocalTaskColumn(taskId, firebaseColumnId);
  await triggerFirebaseUpdate(taskId, firebaseColumnId);
  await initializeBoard();
}

/**
 * Loads and renders the board with tasks.
 * @returns {Promise<void>} Resolves when the board is loaded and rendered.
 */
export async function loadAndRenderBoard() {
  const firebaseBoardData = await loadFirebaseData();
  if (firebaseBoardData) {
    renderTasksByColumn(firebaseBoardData);
  }
}

/**
 * Initializes the board when the DOM content is loaded.
 * @returns {Promise<void>} Resolves when the board is initialized.
 */
async function initializeBoard() {
  await loadAndRenderBoard();
}

document.addEventListener("DOMContentLoaded", initializeBoard);
