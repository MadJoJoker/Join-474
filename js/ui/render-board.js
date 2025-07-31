import { loadFirebaseData } from "../../main.js";
import { initDragAndDrop } from "../events/drag-and-drop.js";
import { createSimpleTaskCard } from "./render-card.js";
import { allData } from "../data/task-to-firbase.js";

let tasksData = {};

/** * Validates the board data structure.
 * Checks if the board data contains tasks and contacts.
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

/** * Initializes the tasks by column structure.
 * Creates an object with keys for each valid column and initializes them as empty arrays.
 */
function initializeTasksByColumn() {
  const tasksByColumn = {};
  VALID_COLUMNS.forEach((col) => {
    tasksByColumn[col] = [];
  });
  return tasksByColumn;
}

/** * Updates the current overlay reference.
 * @param {HTMLElement} overlay - The overlay element to set as current.
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

/** * Groups tasks by their column ID.
 * Iterates through the tasks and organizes them into an object with arrays for each column.
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

/** * Sorts tasks within each column by their creation date.
 * Iterates through each column's tasks and sorts them by the createdAt date.
 */
function sortGroupedTasks(tasksByColumn) {
  VALID_COLUMNS.forEach((colID) => {
    tasksByColumn[colID].sort((a, b) => a.createdAt - b.createdAt);
  });
}

/** * Clears the column container and prepares it for rendering tasks.
 * Removes all existing task cards and returns the container element.
 */
function clearAndPrepareColumnContainer(colID) {
  const container = document.getElementById(colID);
  if (!container) return null;
  container.querySelectorAll(".task-card").forEach((card) => card.remove());
  return container;
}

/** * Retrieves or creates a placeholder for the column container.
 * Checks if a placeholder exists, and if not, creates one with a message.
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

/** * Renders tasks in the specified column container.
 * Iterates through the tasks in the column and appends them to the container.
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

/** * Renders tasks by their column.
 * Groups tasks by their column ID, sorts them, and renders them in the respective containers.
 * @param {object} boardData - The board data containing tasks and contacts.
 */
function renderTasksByColumn(boardData) {
  if (!validateRenderBoardData(boardData)) return;

  tasksData = boardData.tasks;
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

/** * Initializes the board by loading and rendering tasks.
 * Loads the board data from Firebase and renders the tasks by column.
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

/** * Updates the local task column data.
 * Updates the task's column ID in the local tasksData object.
 */
function updateLocalTaskColumn(taskId, firebaseColumnId) {
  if (tasksData[taskId]) {
    tasksData[taskId].columnID = firebaseColumnId;
  }
}

/** * Triggers a Firebase update for the task's column.
 * This function is currently a placeholder and does not perform any action.
 */
async function triggerFirebaseUpdate(taskId, firebaseColumnId) {
  // Firebase update currently commented out or not implemented
}

/** * Initializes the board by loading and rendering tasks.
 * Loads the board data from Firebase and renders the tasks by column.
 */
export async function updateTaskColumnData(taskId, newColumnId) {
  if (!tasksData[taskId]) return;

  const firebaseColumnId = mapClientToFirebaseColumnId(newColumnId);
  if (!firebaseColumnId) return;

  updateLocalTaskColumn(taskId, firebaseColumnId);
  await triggerFirebaseUpdate(taskId, firebaseColumnId);
  await initializeBoard();
}

/** * Loads and renders the board with tasks.
 * Fetches the board data from Firebase and renders the tasks by column.
 */
async function loadAndRenderBoard() {
  const firebaseBoardData = await loadFirebaseData();
  if (firebaseBoardData) {
    renderTasksByColumn(firebaseBoardData);
  }
}

/** * Initializes the board when the DOM content is loaded.
 * Sets up the board by loading and rendering tasks.
 */
async function initializeBoard() {
  await loadAndRenderBoard();
}

document.addEventListener("DOMContentLoaded", initializeBoard);
