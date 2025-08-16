import { getTaskOverlay } from "../templates/task-details-template.js";
import { registerTaskCardDetailOverlay,  detailOverlayElement,  editOverlayElement,
} from "./render-card-events.js";
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

/**
 * @param {object} boardData - The complete board data object.
 * @param {string} taskID - The ID of the task.
 * @returns {boolean} True if the data is valid, otherwise false.
 */
function validateTaskCardInput(boardData, taskID) {
  /**
   * Validates the input for a task card.
   * @param {object} boardData - The complete board data object.
   * @param {string} taskID - The ID of the task.
   * @returns {boolean} True if the data is valid, otherwise false.
   */
  if (!boardData || !taskID || !boardData.tasks || !boardData.contacts) {
    return false;
  }
  const task = boardData.tasks[taskID];
  if (!task) {
    return false;
  }
  return true;
}

/**
 * @param {object} task - The task object.
 * @returns {{title: string, description: string, type: string, priority: string}} The extracted details.
 */
function getTaskDetails(task) {
  /**
   * Extracts details from a task object.
   * @param {object} task - The task object.
   * @returns {{title: string, description: string, type: string, priority: string}} The extracted details.
   */
  const title = task.title || "Kein Titel";
  const description = (task.description || "").trim();
  const type = task.type || "Unbekannt";
  const priority = task.priority || "Unbekannt";
  return { title, description, type, priority };
}

/**
 * @param {string} type - The type of the task (e.g., 'User Story').
 * @returns {string} The corresponding CSS class.
 */
function getCategoryClass(type) {
  /**
   * Returns the CSS class for a given task type.
   * @param {string} type - The type of the task (e.g., 'User Story').
   * @returns {string} The corresponding CSS class.
   */
  if (type === "User Story") return "category-user-story";
  if (type === "Technical Task") return "category-technical-task";
  if (type === "Meeting") return "category-meeting";
  return "category-default";
}

/**
 * @param {object} task - The task object.
 * @returns {{done: number, total: number, percent: number, subText: string}} The progress of the subtasks.
 */
/**
 * Calculates the progress of subtasks for a task.
 * @param {object} task - The task object.
 * @returns {{done: number, total: number, percent: number, subText: string}} The progress of the subtasks.
 */
function getSubtasksArray(task) {
  if (Array.isArray(task.subtasks) && task.subtasks.length > 0)
    return task.subtasks;
  if (
    Array.isArray(task.totalSubtasks) &&
    Array.isArray(task.checkedSubtasks) &&
    task.totalSubtasks.length === task.checkedSubtasks.length
  ) {
    return task.totalSubtasks.map((text, i) => ({
      text,
      completed: !!task.checkedSubtasks[i],
    }));
  }
  return [];
}

export function calculateSubtaskProgress(task) {
  const subtasksArray = getSubtasksArray(task);
  const done = subtasksArray.filter((sub) => sub.completed).length;
  const total = subtasksArray.length;
  const percent = total > 0 ? (done / total) * 100 : 0;
  const subText = total > 0 ? `${done}/${total} Subtasks` : "No subtasks";
  return { done, total, percent, subText };
}

/**
 * @param {string[]} assignedUserIDs - IDs of the assigned users.
 * @param {object} contacts - The contacts object.
 * @returns {string} The HTML string of the avatars.
 */
/**
 * Generates the HTML for assigned user avatars.
 * @param {string[]} assignedUserIDs - IDs of the assigned users.
 * @param {object} contacts - The contacts object.
 * @returns {string} The HTML string of the avatars.
 */
/**
 * @param {string[]} users - Array of user IDs.
 * @param {object} contacts - Contacts object.
 * @param {number} displayCount - Number of avatars to display.
 * @returns {string} HTML string of avatars.
 */
function getDisplayedAvatars(users, contacts, displayCount) {
  let html = "";
  for (let i = 0; i < Math.min(users.length, displayCount); i++) {
    const id = users[i];
    html += renderContactAvatar(contacts[id]);
  }
  return html;
}

/**
 * @param {string[]} assignedUserIDs - Array of assigned user IDs.
 * @param {object} contacts - Contacts object.
 * @returns {string} HTML string of assigned avatars.
 */
function generateAssignedAvatarsHtml(assignedUserIDs, contacts) {
  const users = Array.isArray(assignedUserIDs) ? assignedUserIDs : [];
  const displayCount = 3;
  let avatarsHtml = getDisplayedAvatars(users, contacts, displayCount);
  if (users.length > displayCount) {
    avatarsHtml += `<div class="assigned-initials-circle more-users-circle">+${
      users.length - displayCount
    }</div>`;
  }
  return avatarsHtml;
}

/**
 * @param {object} contact - The contact object.
 * @returns {string} The HTML string of the avatar.
 */
function renderContactAvatar(contact) {
  /**
   * Renders the avatar HTML for a contact.
   * @param {object} contact - The contact object.
   * @returns {string} The HTML string of the avatar.
   */
  if (!contact) {
    return `<div class="assigned-initials-circle" style="background-color: var(--grey);" title="Unknown">?</div>`;
  }
  const initials = (contact.initials || "").trim();
  const name = (contact.name || "").trim();
  const colorRaw = contact.avatarColor || "default";
  const colorStyle = colorRaw.startsWith("--") ? `var(${colorRaw})` : colorRaw;
  return `<div class="assigned-initials-circle" style="background-color: ${colorStyle};" title="${name}">${initials}</div>`;
}

/**
 * @param {string} prio - The priority ('low', 'medium', 'urgent').
 * @returns {{icon: string, prioText: string}} Icon path and priority text.
 */
function getPriorityIconAndText(prio) {
  /**
   * Returns the icon path and text for a given priority.
   * @param {string} prio - The priority ('low', 'medium', 'urgent').
   * @returns {{icon: string, prioText: string}} Icon path and priority text.
   */
  if (prio === "low")
    return { icon: `../assets/icons/property/low.svg`, prioText: "Low" };
  if (prio === "medium")
    return { icon: `../assets/icons/property/medium.svg`, prioText: "Medium" };
  if (prio === "urgent")
    return {
      icon: `../assets/icons/property/urgent.svg`,
      prioText: "Urgent",
    };
  return {
    icon: `../assets/icons/property/default.svg`,
    prioText: "Unknown",
  };
}

/**
 * Builds the HTML content for a task card.
 * @param {string} taskID - The ID of the task.
 * @param {object} taskDetails - The task details.
 * @param {object} subtaskProgress - The subtask progress.
 * @param {string} avatarsHtml - The avatars of the assigned users.
 * @param {object} priorityInfo - Priority information.
 * @returns {string} The HTML string of the task card.
 */
/**
 * @param {number} total - Total number of subtasks.
 * @param {number} percent - Completion percentage.
 * @param {string} subText - Subtask progress text.
 * @returns {string} HTML string for the progress bar.
 */
function getProgressBarHtml(total, percent, subText) {
  if (total > 0) {
    return `<div class="progress-container"><div class="progress-bar-track"><div class="progress-bar-fill" style="width: ${percent}%;"></div></div><span class="subtasks-text">${subText}</span></div>`;
  }
  return "";
}

/**
 * @param {string} taskID - Task ID.
 * @param {string} type - Task type.
 * @returns {string} HTML string for the card header.
 */
function getTaskCardHeader(taskID, type) {
  const categoryClass = getCategoryClass(type);
  return `<div class="d-flex space-between"><div class="task-category ${categoryClass}">${type}</div>${getTaskCardDropdown(
    taskID
  )}</div>`;
}

/**
 * @param {string} taskID - Task ID.
 * @returns {string} HTML string for the dropdown menu.
 */
function getTaskCardDropdown(taskID) {
  return `<div><button class="dropdown-menu-board-site-btn"><div><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_294678_9764" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20"><rect y="20" width="20" height="20" transform="rotate(-90 0 20)" fill="#D9D9D9"/></mask><g mask="url(#mask0_294678_9764)"><path d="M13.3333 15.1457L14.8958 13.5832C15.0486 13.4304 15.2396 13.354 15.4688 13.354C15.6979 13.354 15.8958 13.4304 16.0625 13.5832C16.2292 13.7498 16.3125 13.9478 16.3125 14.1769C16.3125 14.4061 16.2292 14.604 16.0625 14.7707L13.0833 17.7498C13 17.8332 12.9097 17.8922 12.8125 17.9269C12.7153 17.9616 12.6111 17.979 12.5 17.979C12.3889 17.979 12.2847 17.9616 12.1875 17.9269C12.0903 17.8922 12 17.8332 11.9167 17.7498L8.91667 14.7498C8.75 14.5832 8.67014 14.3887 8.67708 14.1665C8.68403 13.9443 8.77083 13.7498 8.9375 13.5832C9.10417 13.4304 9.29861 13.3505 9.52083 13.3436C9.74306 13.3366 9.9375 13.4165 10.1042 13.5832L11.6667 15.1457V9.99984C11.6667 9.76373 11.7465 9.56581 11.9062 9.40609C12.066 9.24636 12.2639 9.1665 12.5 9.1665C12.7361 9.1665 12.934 9.24636 13.0938 9.40609C13.2535 9.56581 13.3333 9.76373 13.3333 9.99984V15.1457ZM8.33333 4.854V9.99984C8.33333 10.2359 8.25347 10.4339 8.09375 10.5936C7.93403 10.7533 7.73611 10.8332 7.5 10.8332C7.26389 10.8332 7.06597 10.7533 6.90625 10.5936C6.74653 10.4339 6.66667 10.2359 6.66667 9.99984L6.66667 4.854L5.10417 6.4165C4.95139 6.56928 4.76042 6.64567 4.53125 6.64567C4.30208 6.64567 4.10417 6.56928 3.9375 6.4165C3.77083 6.24984 3.6875 6.05192 3.6875 5.82275C3.6875 5.59359 3.77083 5.39567 3.9375 5.229L6.91667 2.24984C7 2.1665 7.09028 2.10748 7.1875 2.07275C7.28472 2.03803 7.38889 2.02067 7.5 2.02067C7.61111 2.02067 7.71528 2.03803 7.8125 2.07275C7.90972 2.10748 8 2.1665 8.08333 2.24984L11.0833 5.24984C11.25 5.4165 11.3299 5.61095 11.3229 5.83317C11.316 6.05539 11.2292 6.24984 11.0625 6.4165C10.8958 6.56928 10.7014 6.64914 10.4792 6.65609C10.2569 6.66303 10.0625 6.58317 9.89583 6.4165L8.33333 4.854Z" fill="#2A3647"/></g></svg></div></button><div id="dropdown-menu-board-site" class="dropdown-menu-board-site"><h3 class="dorpdown-headline">Move to</h3><div class="d-flex justify-content flex-direction"><a href="#" class="move-task-up" data-task-id="${taskID}">↑ Up</a><a href="#" class="move-task-down" data-task-id="${taskID}">↓ Down</a><a href="../index.html">Home <img src="../assets/icons/logo/joinLogo.svg" alt="joinLogo" width="20" height="15"></a></div></div></div>`;
}

/**
 * @param {string} title - Task title.
 * @param {string} description - Task description.
 * @param {number} total - Total subtasks.
 * @param {number} percent - Completion percentage.
 * @param {string} subText - Subtask progress text.
 * @returns {string} HTML string for the card content.
 */
function getTaskCardContent(title, description, total, percent, subText) {
  return `<div class="task-content"><h3 class="task-title">${title}</h3><p class="task-description">${description}</p>${getProgressBarHtml(
    total,
    percent,
    subText
  )}</div>`;
}

/**
 * @param {string} avatarsHtml - HTML string of avatars.
 * @param {string} icon - Priority icon path.
 * @param {string} prioText - Priority text.
 * @returns {string} HTML string for the card footer.
 */
function getTaskCardFooter(avatarsHtml, icon, prioText) {
  return `<div class="task-footer"><div class="assigned-users">${avatarsHtml}</div><div class="priority-icon"><img src="${icon}" alt="${prioText}" title="${prioText}"></div></div>`;
}

/**
 * @param {string} taskID - Task ID.
 * @param {object} taskDetails - Task details object.
 * @param {object} subtaskProgress - Subtask progress object.
 * @param {string} avatarsHtml - HTML string of avatars.
 * @param {object} priorityInfo - Priority info object.
 * @returns {string} HTML string for the task card.
 */
function buildTaskCardHtmlContent(
  taskID,
  taskDetails,
  subtaskProgress,
  avatarsHtml,
  priorityInfo
) {
  const { title, description, type } = taskDetails;
  const { total, percent, subText } = subtaskProgress;
  const { icon, prioText } = priorityInfo;
  return `<div class="task-card" id="${taskID}" draggable="true">${getTaskCardHeader(
    taskID,
    type
  )}${getTaskCardContent(
    title,
    description,
    total,
    percent,
    subText
  )}${getTaskCardFooter(avatarsHtml, icon, prioText)}</div>`;
}

/**
 * @param {object} boardData - The complete board data object (tasks, contacts, etc.).
 * @param {string} taskID - The ID of the task to be rendered.
 * @returns {string} The HTML string of the task card.
 */
/**
 * @param {object} boardData - Board data object.
 * @param {string} taskID - Task ID.
 * @returns {object} Object containing all card data.
 */
function getTaskCardData(boardData, taskID) {
  const task = boardData.tasks[taskID];
  const contacts = boardData.contacts;
  return {
    taskDetails: getTaskDetails(task),
    subtaskProgress: calculateSubtaskProgress(task),
    avatarsHtml: generateAssignedAvatarsHtml(task.assignedUsers, contacts),
    priorityInfo: getPriorityIconAndText(task.priority),
  };
}

/**
 * Creates a simple task card HTML string.
 * @param {object} boardData - The complete board data object (tasks, contacts, etc.).
 * @param {string} taskID - The ID of the task to be rendered.
 * @returns {string} The HTML string of the task card.
 */
export function createSimpleTaskCard(boardData, taskID) {
  if (!validateTaskCardInput(boardData, taskID)) return "";
  const { taskDetails, subtaskProgress, avatarsHtml, priorityInfo } =
    getTaskCardData(boardData, taskID);
  return buildTaskCardHtmlContent(
    taskID,
    taskDetails,
    subtaskProgress,
    avatarsHtml,
    priorityInfo
  );
}

const columnOrder = ["toDo", "inProgress", "review", "done"];
/**
 * Handles click events for moving tasks up or down in columns.
 * @param {MouseEvent} e - The click event.
 */
/**
 * @param {MouseEvent} e - Click event.
 * @returns {object} Object with upBtn and downBtn elements.
 */
function getMoveTaskButton(e) {
  return {
    upBtn: e.target.closest(".move-task-up"),
    downBtn: e.target.closest(".move-task-down"),
  };
}

/**
 * @param {Element} upBtn - Up button element.
 * @param {Element} downBtn - Down button element.
 * @returns {string} Task ID from button.
 */
function getTaskIdFromButton(upBtn, downBtn) {
  return (upBtn || downBtn).getAttribute("data-task-id");
}

/**
 * @param {object} boardData - Board data object.
 * @param {string} taskId - Task ID.
 * @param {number} newIndex - New column index.
 */
function updateTaskColumn(boardData, taskId, newIndex) {
  boardData.tasks[taskId].columnID = columnOrder[newIndex];
  if (window.CWDATA && window.firebaseData)
    window.CWDATA({ [taskId]: boardData.tasks[taskId] }, window.firebaseData);
}

/**
 * Refreshes the board site view.
 */
function refreshBoardSite() {
  if (window.board && typeof window.board.site === "function")
    window.board.site();
  else if (typeof window.boardSiteHtml === "function") window.boardSiteHtml();
}

/**
 * Handles click events for moving tasks up or down in columns.
 * @param {MouseEvent} e - The click event.
 */
function handleMoveTaskClick(e) {
  const { upBtn, downBtn } = getMoveTaskButton(e);
  if (!upBtn && !downBtn) return;
  e.preventDefault();
  const taskId = getTaskIdFromButton(upBtn, downBtn);
  const boardData = window.firebaseData;
  if (!boardData || !boardData.tasks || !boardData.tasks[taskId]) return;
  const originalTask = boardData.tasks[taskId];
  const currentIndex = columnOrder.indexOf(originalTask.columnID);
  let newIndex = currentIndex;
  if (upBtn && currentIndex > 0) newIndex = currentIndex - 1;
  else if (downBtn && currentIndex < columnOrder.length - 1)
    newIndex = currentIndex + 1;
  if (newIndex !== currentIndex) {
    updateTaskColumn(boardData, taskId, newIndex);
    refreshBoardSite();
  }
}

document.addEventListener("click", handleMoveTaskClick);

export const editedTaskData = {};

export { registerTaskCardDetailOverlay } from "./render-card-events.js";
