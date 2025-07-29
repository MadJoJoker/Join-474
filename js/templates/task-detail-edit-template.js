import { getAddTaskFormHTML, renderLeftFormFields, renderRightFormFields, renderFormButtons } from "./add-task-template.js";
import { initPriorityButtonLogic } from "../events/priorety-handler.js";
import {
  openSpecificOverlay,
  initOverlayListeners,
} from "../events/overlay-handler.js";
import { initAssignedToDropdownLogic, addAssignedContactsToEditForm } from "../events/dropdown-menu.js";
import { initDatePicker } from "../events/animation.js";
import { initSubtaskManagementLogic } from "../events/subtask-handler.js";
import { getContacts } from "../data/storage.js";

/**
 * Öffnet das Edit-Overlay und zeigt das ausgefüllte Add-Task-Formular an.
 * @param {Object} task - Das Aufgabenobjekt.
 */
export async function openTaskDetailEditOverlay(task) {
  // Lade das Overlay-HTML
  const response = await fetch("js/templates/task-detail-edit-overlay.html");
  const editOverlayHtml = await response.text();

  const overlayContainer = document.getElementById("overlay-container");
  if (!overlayContainer) {
    console.error("Overlay-Container nicht gefunden!");
    return;
  }
  overlayContainer.innerHTML = editOverlayHtml;

  const overlayElement = document.getElementById("overlay-task-detail-edit");
  if (!overlayElement) {
    console.error("Edit-Overlay-Element nicht gefunden!");
    return;
  }
  const container = overlayElement.querySelector("#task-edit-container");
  if (!container) {
    console.error("Edit-Formular-Container nicht gefunden!");
    return;
  }
  // Nutze direkt die synchron befüllte Form-HTML
  container.innerHTML = getAddTaskFormHTML(task);


  // --- Initialisiere alle Event-Listener wie im Add-Task ---
  console.debug('[DEBUG] Initialisiere Priority-Button-Logik...');
  if (typeof initPriorityButtonLogic === "function") {
    try {
      initPriorityButtonLogic(container);
      console.debug('[DEBUG] Priority-Button-Logik initialisiert.');
    } catch (e) {
      console.error('[DEBUG] Fehler bei Priority-Button-Logik:', e);
    }
  } else {
    console.warn('[DEBUG] initPriorityButtonLogic ist nicht definiert!');
  }

  console.debug('[DEBUG] Initialisiere AssignedTo Dropdown...');
  if (typeof initAssignedToDropdownLogic === "function") {
    try {
      initAssignedToDropdownLogic(container);
      console.debug('[DEBUG] AssignedTo Dropdown initialisiert.');
    } catch (e) {
      console.error('[DEBUG] Fehler bei AssignedTo Dropdown:', e);
    }
  } else {
    console.warn('[DEBUG] initAssignedToDropdownLogic ist nicht definiert!');
  }

  console.debug('[DEBUG] Initialisiere Datepicker...');
  if (typeof initDatePicker === "function") {
    try {
      initDatePicker(container);
      console.debug('[DEBUG] Datepicker initialisiert.');
    } catch (e) {
      console.error('[DEBUG] Fehler bei Datepicker:', e);
    }
  } else {
    console.warn('[DEBUG] initDatePicker ist nicht definiert!');
  }

  console.debug('[DEBUG] Initialisiere Subtask-Management...');
  if (typeof initSubtaskManagementLogic === "function") {
    try {
      initSubtaskManagementLogic(container);
      console.debug('[DEBUG] Subtask-Management initialisiert.');
    } catch (e) {
      console.error('[DEBUG] Fehler bei Subtask-Management:', e);
    }
  } else {
    console.warn('[DEBUG] initSubtaskManagementLogic ist nicht definiert!');
  }

  // --- Assigned Contacts wie im Add-Task anzeigen ---
  if (typeof addAssignedContactsToEditForm === "function" && Array.isArray(task.assignedTo)) {
    // Kontakte sauber per Import holen
    let contacts = [];
    try {
      contacts = await getContacts();
    } catch (e) {
      console.error("Fehler beim Laden der Kontakte:", e);
    }
    addAssignedContactsToEditForm(task.assignedTo, contacts);
  }

  // --- Event-Handler für das Edit-Formular wie im Add-Task ---
  const form = container.querySelector("#add-task-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // Hier kann die Logik zum Speichern/Updaten des Tasks wie im Add-Task eingebunden werden
      // z.B. exportiere die Daten, führe Validierung durch, etc.
      // ...
    });
  }

  openSpecificOverlay("overlay-task-detail-edit");
  initOverlayListeners("overlay-task-detail-edit");
}
