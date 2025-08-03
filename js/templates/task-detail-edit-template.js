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
      console.error("[DEBUG] Error initializing priority button logic:", e);
    }
  } else {
    console.warn("[DEBUG] initPriorityButtonLogic is not defined!");
  }

  if (typeof initAssignedToDropdownLogic === "function") {
    try {
      initAssignedToDropdownLogic(container);
    } catch (e) {
      console.error("[DEBUG] Error initializing assignedTo dropdown:", e);
    }
  } else {
    console.warn("[DEBUG] initAssignedToDropdownLogic is not defined!");
  }

  if (typeof initDatePicker === "function") {
    try {
      initDatePicker(container);
    } catch (e) {
      console.error("[DEBUG] Error initializing date picker:", e);
    }
  } else {
    console.warn("[DEBUG] initDatePicker is not defined!");
  }

  if (typeof initSubtaskManagementLogic === "function") {
    try {
      initSubtaskManagementLogic(container);
    } catch (e) {
      console.error("[DEBUG] Error initializing subtask management:", e);
    }
  } else {
    console.warn("[DEBUG] initSubtaskManagementLogic is not defined!");
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
