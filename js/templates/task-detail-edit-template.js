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

/**
 * Speichert die Änderungen eines Tasks und übergibt sie an die Datenbank.
 * @param {string} taskId - Die ID des zu bearbeitenden Tasks.
 */
export async function saveEditedTask(taskId) {
  const form = document.querySelector("#add-task-form");
  if (!form) {
    console.error("[DEBUG] Edit-Formular nicht gefunden!");
    return;
  }

  // Titel
  const title = form.querySelector("[name='title']")?.value || "";
  // Beschreibung
  const description = form.querySelector("[name='description']")?.value || "";
  // Deadline
  const deadline = form.querySelector("[name='deadline']")?.value || "";

  // Kategorie (type)
  let type = "";
  const categoryDropdown = document.getElementById("dropdown-category");
  if (categoryDropdown) {
    const selected = categoryDropdown.querySelector(
      ".dropdown-selected, .selected-category"
    );
    type = selected ? selected.textContent.trim() : "";
  }

  // Priority
  let priority = "";
  const priorityInput = form.querySelector("[name='priority']:checked");
  if (priorityInput) {
    priority = priorityInput.value;
  } else {
    // Fallback falls als Button umgesetzt
    const prioBtn = form.querySelector(".priority-btn.selected");
    priority = prioBtn ? prioBtn.getAttribute("data-priority") : "";
  }

  // Subtasks
  const subtaskInputs = form.querySelectorAll(".subtask-input");
  const totalSubtask = Array.from(subtaskInputs).map((input) => input.value);
  const checkedSubtasks = Array.from(subtaskInputs).map(
    (input) => input.checked
  );
  const subtasksCompleted = checkedSubtasks.filter(Boolean).length;

  // Assigned Users (IDs aus Kontakten)
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

  // Zeitstempel
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const formattedDate = `${day}.${month}.${year}`;

  // Task-Objekt wie bei createTaskObject
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
    totalSubtask,
    type,
    updatedAt: formattedDate,
  };

  // Objekt mit ID für CWDATA vorbereiten
  const objForCWDATA = {
    [taskId]: editTaskObjekt,
  };

  console.log("[DEBUG] Übergabe an CWDATA:", objForCWDATA, window.firebaseData);

  // Übergabe an CWDATA mit fetchData
  await CWDATA(objForCWDATA, window.firebaseData);
}

// Event-Listener für Speichern-Button
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("save-edit-task-btn")) {
    const taskId = e.target.getAttribute("data-task-id");
    saveEditedTask(taskId);
  }
});
