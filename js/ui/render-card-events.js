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
import { refreshBoardSite } from "./render-board.js";
import { addedSubtasks } from "../events/subtask-handler.js";
import { extractSubtasksFromTask } from "../utils/subtask-utils.js";
import { extractTaskFormData } from "../utils/form-utils.js";
import { getFormattedDate } from "../utils/date-utils.js";

export let detailOverlayElement = null;
export let editOverlayElement = null;

/**
 * Loads the detail overlay HTML once and assigns it to detailOverlayElement.
 * @returns {Promise<void>} Resolves when the overlay is loaded.
 */
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
    setupDropdownMenuListeners(card, boardData);
    setupCardClickListener(card, boardData, updateBoardFunction);
  });
}

/**
 * Sets up dropdown menu listeners for a task card.
 * @param {Element} card - The task card DOM element.
 * @param {object} boardData - The board data object.
 */
function setupDropdownMenuListeners(card, boardData) {
  const dropdownBtn = card.querySelector(".dropdown-menu-board-site-btn");
  const dropdownMenu = card.querySelector(".dropdown-menu-board-site");
  if (!dropdownBtn || !dropdownMenu) return;
  dropdownBtn.addEventListener("click", (e) =>
    handleDropdownClick(e, dropdownMenu, dropdownBtn)
  );
  setupMoveTaskListeners(dropdownMenu, boardData);
}

/**
 * Handles click event for dropdown menu button.
 * @param {Event} e - The click event.
 * @param {Element} dropdownMenu - The dropdown menu DOM element.
 * @param {Element} dropdownBtn - The dropdown button DOM element.
 */
function handleDropdownClick(e, dropdownMenu, dropdownBtn) {
  if (window.innerWidth > 1025) return;
  e.stopPropagation();
  dropdownMenu.classList.toggle("show");
  document
    .querySelectorAll(".dropdown-menu-board-site.show")
    .forEach((menu) => {
      if (menu !== dropdownMenu) menu.classList.remove("show");
    });
  const closeDropdown = (ev) => {
    if (!dropdownMenu.contains(ev.target) && ev.target !== dropdownBtn) {
      dropdownMenu.classList.remove("show");
      document.removeEventListener("click", closeDropdown);
    }
  };
  setTimeout(() => document.addEventListener("click", closeDropdown), 0);
}

/**
 * Sets up listeners for moving tasks between columns.
 * @param {Element} dropdownMenu - The dropdown menu DOM element.
 * @param {object} boardData - The board data object.
 */
function setupMoveTaskListeners(dropdownMenu, boardData) {
  const moveUp = dropdownMenu.querySelector(".move-task-up");
  const moveDown = dropdownMenu.querySelector(".move-task-down");
  if (moveUp)
    moveUp.addEventListener("click", (ev) =>
      handleMoveTask(ev, boardData, "up")
    );
  if (moveDown)
    moveDown.addEventListener("click", (ev) =>
      handleMoveTask(ev, boardData, "down")
    );
}

/**
 * Handles moving a task up or down between columns.
 * @param {Event} ev - The click event.
 * @param {object} boardData - The board data object.
 * @param {string} direction - The direction to move ('up' or 'down').
 */
function handleMoveTask(ev, boardData, direction) {
  ev.preventDefault();
  ev.stopPropagation();
  const taskId = ev.currentTarget.dataset.taskId;
  const task = boardData.tasks[taskId];
  if (!task) return;
  const columnOrder = ["toDo", "inProgress", "review", "done"];
  const currentIdx = columnOrder.indexOf(task.columnID);
  let newIdx = direction === "up" ? currentIdx - 1 : currentIdx + 1;
  if (newIdx >= 0 && newIdx < columnOrder.length) {
    task.columnID = columnOrder[newIdx];
    CWDATA({ [taskId]: task }, boardData);
    window.location.href = "board-site.html";
  }
}

/**
 * Sets up click listener for a task card.
 * @param {Element} card - The task card DOM element.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
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
 */
function renderDetailOverlay(taskId, boardData, updateBoardFunction) {
  openSpecificOverlay("overlay-task-detail");
  const task = boardData.tasks[taskId];
  const container = detailOverlayElement.querySelector("#task-container");
  if (container) {
    renderTaskOverlayHtml(container, task, taskId, boardData);
    setupSubtaskCheckboxListener(container, task, taskId, boardData);
  }
  setupEditButtonListener(taskId, boardData, updateBoardFunction);
  setupDeleteButtonListener(taskId, boardData);
}

/**
 * Renders the HTML for the task overlay.
 * @param {Element} container - The container DOM element.
 * @param {object} task - The task object.
 * @param {string} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
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
function setupSubtaskCheckboxListener(container, task, taskId, boardData) {
  container.addEventListener("change", function (e) {
    if (e.target && e.target.classList.contains("subtask-checkbox")) {
      handleSubtaskCheckboxChange(e, task, taskId, boardData, container);
    }
  });
}

/**
 * Handles change event for subtask checkbox.
 * @param {Event} e - The change event.
 * @param {object} task - The task object.
 * @param {string} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 * @param {Element} container - The container DOM element.
 */
function handleSubtaskCheckboxChange(e, task, taskId, boardData, container) {
  const subtaskIndex = Number(e.target.dataset.subtaskIndex);
  const checked = e.target.checked;
  if (task && Array.isArray(task.checkedSubtasks)) {
    task.checkedSubtasks[subtaskIndex] = checked;
    task.subtasksCompleted = task.checkedSubtasks.filter(Boolean).length;
    CWDATA({ [taskId]: task }, boardData);
    const progress = calculateSubtaskProgress(task);
    const progressBar = container.querySelector(".progress-bar-fill");
    if (progressBar) progressBar.style.width = `${progress.percent}%`;
  }
}

/**
 * Sets up listener for the edit button in the detail overlay.
 * @param {string} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
function setupEditButtonListener(taskId, boardData, updateBoardFunction) {
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
 * Handles click event for the edit button.
 * @param {Event} event - The click event.
 * @param {string} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
function handleEditButtonClick(event, taskId, boardData, updateBoardFunction) {
  event.stopPropagation();
  closeSpecificOverlay("overlay-task-detail");
  if (typeof refreshBoardSite === "function") refreshBoardSite();
  renderEditOverlay(taskId, boardData, updateBoardFunction);
}

/**
 * Sets up listener for the delete button in the detail overlay.
 * @param {string} taskId - The ID of the task.
 * @param {object} boardData - The board data object.
 */
function setupDeleteButtonListener(taskId, boardData) {
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
 * Handles click event for the delete button.
 * @param {Event} event - The click event.
 * @param {object} boardData - The board data object.
 */
function handleDeleteButtonClick(event, boardData) {
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

/**
 * Renders the edit overlay for a task.
 * @param {string} taskToEditId - The ID of the task to edit.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
function renderEditOverlay(taskToEditId, boardData, updateBoardFunction) {
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
 */
function renderEditFormHtml(container, taskToEdit) {
  container.innerHTML = getAddTaskFormHTML(taskToEdit);
}

/**
 * Sets up modules for the edit form (priority, dropdowns, date picker, subtasks).
 * @param {Element} container - The container DOM element.
 * @param {object} taskToEdit - The task object to edit.
 * @param {object} boardData - The board data object.
 */
function setupEditFormModules(container, taskToEdit, boardData) {
  import("../events/priorety-handler.js").then((mod) => {
    mod.initPriorityButtons();
    const prio = taskToEdit.priority || "medium";
    const prioBtn = container.querySelector(
      `.priority-btn[data-priority="${prio}"]`
    );
    if (prioBtn) mod.setPriority(prioBtn, prio);
    mod.setButtonIconsMobile();
    if (!window._hasSetButtonIconsMobileListener) {
      window.addEventListener("resize", mod.setButtonIconsMobile);
      window._hasSetButtonIconsMobileListener = true;
    }
  });
  import("../events/dropdown-menu-auxiliary-function.js").then(async (mod) => {
    await mod.initDropdowns(Object.values(boardData.contacts), container);
    await setCategoryFromTaskForCard(taskToEdit.type);
    await setAssignedContactsFromTaskForCard(taskToEdit.assignedUsers);
  });
  import("../templates/add-task-template.js").then((mod) => {
    if (mod.initDatePicker) mod.initDatePicker(container);
  });
  import("../events/subtask-handler.js").then((mod) => {
    mod.addedSubtasks.length = 0;
    extractSubtasksFromTask(taskToEdit).forEach((st) =>
      mod.addedSubtasks.push({ ...st })
    );
    mod.initSubtaskManagementLogic(container);
    mod.renderSubtasks();
  });
}

/**
 * Sets up the cancel button in the edit form.
 * @param {Element} container - The container DOM element.
 * @param {string} taskToEditId - The ID of the task to edit.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
function setupCancelEditBtn(
  container,
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  const cancelEditBtn = container.querySelector(".cancel-btn");
  if (cancelEditBtn) {
    cancelEditBtn.onclick = () => {
      closeSpecificOverlay("overlay-task-detail-edit");
      renderDetailOverlay(taskToEditId, boardData, updateBoardFunction);
    };
  }
}

/**
 * Sets up the submit listener for the edit task form.
 * @param {Element} container - The container DOM element.
 * @param {object} taskToEdit - The task object to edit.
 * @param {string} taskToEditId - The ID of the task to edit.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
function setupTaskEditFormListener(
  container,
  taskToEdit,
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  const taskEditForm = container.querySelector("#add-task-form");
  if (taskEditForm) {
    taskEditForm.addEventListener("submit", (formEvent) =>
      handleTaskEditFormSubmit(
        formEvent,
        taskEditForm,
        taskToEdit,
        taskToEditId,
        boardData,
        updateBoardFunction
      )
    );
  }
}

/**
 * Handles the submit event for the edit task form.
 * @param {Event} formEvent - The submit event.
 * @param {Element} taskEditForm - The edit form DOM element.
 * @param {object} taskToEdit - The task object to edit.
 * @param {string} taskToEditId - The ID of the task to edit.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
async function handleTaskEditFormSubmit(
  formEvent,
  taskEditForm,
  taskToEdit,
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  const submitter = formEvent.submitter;
  if (!submitter || submitter.type !== "submit") {
    formEvent.preventDefault();
    return;
  }
  formEvent.preventDefault();
  const fetchData = window.firebaseData || boardData;
  const contactsObj = fetchData && fetchData.contacts ? fetchData.contacts : {};
  const {
    title,
    description,
    deadline,
    type,
    priority,
    assignedUsers,
    totalSubtasks,
    checkedSubtasks,
  } = extractTaskFormData(taskEditForm, contactsObj, taskToEdit);
  const subtasksCompleted = checkedSubtasks.filter(Boolean).length;
  const updatedAt = getFormattedDate();
  let currentTaskId = taskEditForm.getAttribute("data-task-id") || taskToEditId;
  const editTaskObjekt = {
    assignedUsers: Array.isArray(assignedUsers) ? assignedUsers : [],
    boardID: "board-1",
    checkedSubtasks,
    columnID: taskToEdit.columnID || "inProgress",
    createdAt: taskToEdit.createdAt || updatedAt,
    deadline,
    description,
    priority,
    subtasksCompleted: subtasksCompleted,
    title,
    totalSubtasks,
    type,
    updatedAt,
  };
  const objForCWDATA = { [currentTaskId]: editTaskObjekt };
  await CWDATA(objForCWDATA, fetchData);
  closeSpecificOverlay("overlay-task-detail-edit");
  if (updateBoardFunction) await updateBoardFunction();
  renderDetailOverlay(taskToEditId, boardData, updateBoardFunction);
}
