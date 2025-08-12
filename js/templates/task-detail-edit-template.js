import {
  getAddTaskFormHTML,
  renderLeftFormFields,
  renderRightFormFields,
  renderFormButtons,
} from "./add-task-template.js";
import { initPriorityButtonLogic } from "../events/priorety-handler.js";
import {
  openSpecificOverlay,
  initOverlayListeners,
} from "../events/overlay-handler.js";
import { initAssignedToDropdownLogic } from "../events/dropdown-menu.js";
import { renderAssignedToContacts } from "../templates/add-task-template.js";
import { initDatePicker } from "../events/animation.js";
import { initSubtaskManagementLogic } from "../events/subtask-handler.js";
import { getContacts } from "../data/storage.js";
import { CWDATA } from "../data/task-to-firbase.js";

/**
 * Opens the task detail edit overlay and initializes it with the provided task data.
 * @param {object} task - The task data to populate the form.
 * @returns {Promise<void>} Resolves when the overlay is opened and initialized.
 */
export async function openTaskDetailEditOverlay(task) {
  const response = await fetch("js/templates/task-detail-edit-overlay.html");
  const editOverlayHtml = await response.text();

  const overlayContainer = document.getElementById("overlay-container");
  if (!overlayContainer) {
    console.error("Overlay-Container not found!");
    return;
  }
  overlayContainer.innerHTML = editOverlayHtml;

  const overlayElement = document.getElementById("overlay-task-detail-edit");
  if (!overlayElement) {
    console.error("Edit-Overlay-Element not found!");
    return;
  }
  const container = overlayElement.querySelector("#task-edit-container");
  if (!container) {
    console.error("Edit-Formular-Container not found!");
    return;
  }

  container.innerHTML = getAddTaskFormHTML(task);

  if (typeof initPriorityButtonLogic === "function") {
    try {
      initPriorityButtonLogic(container);
    } catch (e) {
      console.error("Error initializing priority button logic:", e);
    }
  } else {
    console.error("initPriorityButtonLogic is not defined!");
  }

  if (typeof initAssignedToDropdownLogic === "function") {
    try {
      initAssignedToDropdownLogic(container);
    } catch (e) {
      console.error("Error initializing assignedTo dropdown:", e);
    }
  } else {
    console.error("initAssignedToDropdownLogic is not defined!");
  }

  if (typeof initDatePicker === "function") {
    try {
      initDatePicker(container);
    } catch (e) {
      console.error("Error initializing date picker:", e);
    }
  } else {
    console.error("initDatePicker is not defined!");
  }

  if (typeof initSubtaskManagementLogic === "function") {
    try {
      initSubtaskManagementLogic(container);
    } catch (e) {
      console.error("Error initializing subtask management:", e);
    }
  } else {
    console.error("initSubtaskManagementLogic is not defined!");
  }

  if (
    typeof addAssignedContactsToEditForm === "function" &&
    Array.isArray(task.assignedTo)
  ) {
    let contacts = [];
    try {
      contacts = await getContacts();
    } catch (e) {
      console.error("Error loading contacts:", e);
    }
    addAssignedContactsToEditForm(task.assignedTo, contacts);
  }

  const form = container.querySelector("#add-task-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }

  openSpecificOverlay("overlay-task-detail-edit");
  initOverlayListeners("overlay-task-detail-edit");
}

/**
 * Saves the changes of a task and passes them to the database.
 * @param {string} taskId - The ID of the task to be edited.
 * @returns {Promise<void>} Resolves when the task is saved.
 */
export async function saveEditedTask(taskId) {
  const form = document.querySelector("#add-task-form");
  if (!form) {
    console.error("Edit form not found!");
    return;
  }

  const title = form.querySelector("[name='title']")?.value || "";
  const description = form.querySelector("[name='description']")?.value || "";
  const deadline = form.querySelector("[name='deadline']")?.value || "";

  let type = "";
  const categoryDropdown = document.getElementById("dropdown-category");
  if (categoryDropdown) {
    const selected = categoryDropdown.querySelector(
      ".dropdown-selected, .selected-category"
    );
    type = selected ? selected.textContent.trim() : "";
  }

  let priority = "";
  const priorityInput = form.querySelector("[name='priority']:checked");
  if (priorityInput) {
    priority = priorityInput.value;
  } else {
    const prioBtn = form.querySelector(".priority-btn.selected");
    priority = prioBtn ? prioBtn.getAttribute("data-priority") : "";
  }

  const subtaskInputs = form.querySelectorAll(".subtask-input");
  let totalSubtasks = Array.from(subtaskInputs).map((input) => input.value);
  let checkedSubtasks = Array.from(subtaskInputs).map((input) => input.checked);
  if (totalSubtasks.length === 0 || totalSubtasks.every((v) => v === "")) {
    const task = window.firebaseData?.tasks?.[taskId];
    if (task) {
      totalSubtasks = Array.isArray(task.totalSubtasks)
        ? [...task.totalSubtasks]
        : [];
      checkedSubtasks = Array.isArray(task.checkedSubtasks)
        ? [...task.checkedSubtasks]
        : [];
    }
  }
  const subtasksCompleted = checkedSubtasks.filter(Boolean).length;

  let assignedUsers = [];
  const assignedCheckboxes = form.querySelectorAll(
    ".assigned-contact-checkbox:checked"
  );
  if (window.firebaseData && window.firebaseData.contacts) {
    assignedUsers = Array.from(assignedCheckboxes)
      .map((cb) => {
        const name = cb.getAttribute("data-name");
        const contact = Object.entries(window.firebaseData.contacts).find(
          ([id, obj]) => obj.name === name
        );
        return contact ? contact[0] : null;
      })
      .filter(Boolean);
  }

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const formattedDate = `${day}.${month}.${year}`;

  const editTaskObjekt = {
    assignedUsers,
    boardID: "board-1",
    checkedSubtasks,
    columnID: "inProgress",
    createdAt: formattedDate,
    deadline,
    description,
    priority,
    subtasksCompleted,
    title,
    totalSubtasks,
    type,
    updatedAt: formattedDate,
  };

  const objForCWDATA = {
    [taskId]: editTaskObjekt,
  };

  await CWDATA(objForCWDATA, window.firebaseData);
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("save-edit-task-btn")) {
    const taskId = e.target.getAttribute("data-task-id");
    saveEditedTask(taskId);
  }
});
