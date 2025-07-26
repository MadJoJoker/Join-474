import { getFirebaseData } from "../data/API.js";
import {
  addSubtask,
  clearSubtask,
  clearSubtasksList,
  renderSubtasks,
  toggleSubtaskEdit,
  deleteSubtask,
  toggleSubtaskInputIcons,
  addedSubtasks,
} from "../events/subtask-handler.js";
import {
  currentPriority,
  setMedium,
  initPriorityButtons,
} from "../events/priorety-handler.js";
import {
  selectedCategory,
  selectedContacts,
  initDropdowns,
  clearAssignedTo,
  clearCategory,
  toggleAssignedToDropdown,
  filterContacts,
  clearInvalidFields,
} from "../events/dropdown-menu.js";
import { autoFillLeftForm } from "../events/autofill-add-task.js";
import { autofillRightForm } from "../events/autofill-add-task.js";
import { firebaseData } from '../../main.js';

import { CWDATA } from "../data/task-to-firbase.js";

let picker = null;

let isResizing = false;
let startY, startHeight, currentTextarea;
let overlayPickerInstance;
export let fetchData = null;

export async function initTask() {
  try {
    const data = await getFirebaseData();
    console.log("Zugriff auf Firebase-Daten in add-task.js:", data);

    // Daten an das Dropdown-Menü-Modul übergeben und initialisieren
    initDropdowns(Object.values(data.contacts));

    fetchData = data;
    console.log("FETCH CHECK:", fetchData);
  } catch (error) {
    console.error("Fehler beim Laden der Firebase-Daten:", error);
  }
}

export function formatDate(input) {
  // @param {HTMLInputElement} input - Das zu formatierende Eingabe-Element.
  let value = input.value.replace(/\D/g, "");
  if (value.length > 8) value = value.slice(0, 8);

  let formatted = "";
  if (value.length > 4) {
    formatted =
      value.slice(0, 2) + "." + value.slice(2, 4) + "." + value.slice(4);
  } else if (value.length > 2) {
    formatted = value.slice(0, 2) + "." + value.slice(2);
  } else {
    formatted = value;
  }
  input.value = formatted;
}

export function openPicker() {
  if (picker) {
    picker.open();
  } else {
    console.error(
      "Flatpickr-Instanz 'picker' ist nicht initialisiert. Stellen Sie sicher, dass initAddTaskForm() aufgerufen wurde."
    );
  }
}

export function startResize(e) {
  // @param {MouseEvent} e - Mausereignis vom Klicken auf den Größenänderungs-Handle
  isResizing = true;
  currentTextarea = e.target
    .closest(".textarea-wrapper")
    .querySelector("textarea");
  startY = e.clientY;
  startHeight = currentTextarea.offsetHeight;

  document.addEventListener("mousemove", resizeTextarea);
  document.addEventListener("mouseup", stopResize);

  e.preventDefault();
}

export function resizeTextarea(e) {
  // @param {MouseEvent} e - Das Mausereignisobjekt mit der clientY-Position
  if (!isResizing) return;
  const newHeight = startHeight + e.clientY - startY + "px";
  currentTextarea.style.height = newHeight;
}

export function stopResize() {
  isResizing = false;
  document.removeEventListener("mousemove", resizeTextarea);
  document.removeEventListener("mouseup", stopResize);
}

export function clearForm() {
  const form = document.getElementById("add-task-form");
  if (form) {
    form.reset();
  }
  setMedium(); // Aus priority-handler.js
  clearCategory(); // Aus dropdown-menu.js
  clearSubtask(); // Aus subtask-handler.js
  clearSubtasksList(); // Aus subtask-handler.js
  clearAssignedTo(); // Setzen Sie selectedContacts direkt zurück (Import aus dropdown-menu.js)
  clearInvalidFields();

  renderSubtasks(); // Aus subtask-handler.js
}

function checkRequiredFields() {
  let isValid = true;
  const titleInput = document.getElementById("title");
  const datepickerInput = document.getElementById("datepicker");
  const categoryDropdown = document.getElementById("dropdown-category");
  const assignedToDropdown = document.getElementById("dropdown-assigned-to");
  const titleError = document.getElementById("title-error");
  const dueDateError = document.getElementById("due-date-error");
  const assignedToError = document.getElementById("assigned-to-error");
  const categoryError = document.getElementById("category-error");

  if (
    !titleInput ||
    !datepickerInput ||
    !categoryDropdown ||
    !assignedToDropdown
  )
    return false;

  if (!titleInput.value.trim()) {
    titleInput.classList.add("invalid");
    titleError?.classList.add("d-flex");
    isValid = false;
  } else {
    titleInput.classList.remove("invalid");
    titleError?.classList.remove("d-flex");
  }

  if (!datepickerInput.value.trim()) {
    datepickerInput.classList.add("invalid");
    dueDateError?.classList.add("d-flex");
    isValid = false;
  } else {
    datepickerInput.classList.remove("invalid");
    dueDateError?.classList.remove("d-flex");
  }

  if (!selectedCategory) {
    // Verwendet selectedCategory aus dropdown-menu.js
    categoryDropdown.classList.add("invalid");
    categoryError?.classList.add("d-flex");
    isValid = false;
  } else {
    categoryDropdown.classList.remove("invalid");
    categoryError?.classList.remove("d-flex");
  }

  if (selectedContacts.length === 0) {
    // Verwendet selectedContacts aus dropdown-menu.js
    assignedToDropdown.classList.add("invalid");
    assignedToError?.classList.add("d-flex");
    isValid = false;
  } else {
    assignedToDropdown.classList.remove("invalid");
    assignedToError?.classList.remove("d-flex");
  }

  const selectedCategorySpan = document.getElementById("selected-category");
  if (
    selectedCategorySpan &&
    selectedCategorySpan.textContent === "Select task category"
  ) {
    categoryDropdown.classList.add("invalid");
    isValid = false;
  }
  return isValid;
}

export function handleInput(inputElement) {
  const titleError = document.getElementById("title-error");
  // @param {HTMLInputElement} inputElement - Das Eingabeelement.
  if (inputElement.value.trim()) {
    inputElement.classList.remove("invalid");
    titleError?.classList.remove("d-flex");
  }
}

function createTaskObject() {
  /**
@param {Array<Object>} selectedContacts - Ein Array von Objekten, die die ausgewählten Kontakte repräsentieren.
Jedes Objekt sollte eine 'name'-Eigenschaft enthalten.
@param {Object} object - Das globale Objekt, das die von api.js geladenen Daten enthält,
insbesondere 'object.contacts', das ein Objekt mit Kontakt-IDs als Schlüsseln
und Kontaktobjekten (mit 'name'-Eigenschaft) als Werten ist.
@param {string} selectedCategory - Die ausgewählte Kategorie für die Aufgabe.
@param {string} currentPriority - Die aktuelle Priorität für die Aufgabe.
@param {Array<Object>} addedSubtasks - Ein Array von Unteraufgaben-Objekten,
jedes mit 'text'- und 'completed'-Eigenschaften.*/

  const title = document.getElementById("title").value;
  const description = document.getElementById("task-description").value;
  const dueDate = document.getElementById("datepicker").value;

  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const formattedCreatedAt = `${day}.${month}.${year}`;

  const totalSubtask = addedSubtasks.map((subtask) => subtask.text);
  const checkedSubtasks = addedSubtasks.map((subtask) => subtask.completed);
  const subtasksCompleted = checkedSubtasks.filter(
    (completed) => completed
  ).length;
  const assignedUsers = selectedContacts
    .map((selectedContact) => {
      let foundId = undefined;
      if (fetchData && fetchData.contacts) {
        for (const contactId in fetchData.contacts) {
          if (
            Object.prototype.hasOwnProperty.call(fetchData.contacts, contactId)
          ) {
            if (fetchData.contacts[contactId].name === selectedContact.name) {
              foundId = contactId;
              break;
            }
          }
        }
      } else {
        console.warn(
          "WARNUNG: 'fetchData.contacts' ist nicht definiert oder leer. Zugewiesene Benutzer-IDs konnten nicht ermittelt werden."
        );
      }
      return foundId;
    })
    .filter((id) => id !== undefined);

  return {
    assignedUsers: assignedUsers,
    boardID: "board-1",
    checkedSubtasks: checkedSubtasks,
    columnID: "inProgress",
    createdAt: formattedCreatedAt,
    deadline: dueDate,
    description: description,
    priority: currentPriority,
    subtasksCompleted: subtasksCompleted,
    title: title,
    totalSubtask: totalSubtask,
    type: selectedCategory,
    updatedAt: formattedCreatedAt,
  };
}

export async function handleCreateTask(event) {
  // @param {Event} event - Das Submit-Ereignis.
  event.preventDefault();

  if (checkRequiredFields()) {
    const newTask = createTaskObject();
    console.log("New Task Data:", newTask);
    const rawNewObject = createTaskObject();
    console.log("add-task.js: Erzeugtes rawNewObject:", rawNewObject); // wird später evt entfernt//
     await CWDATA(rawNewObject, firebaseData);
          

    console.log("should be working");

    await showTaskSuccessMsg();
    clearForm();
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.classList.add("overlay-hidden");
      overlay.classList.remove("overlay-visible");
      initAddTaskForm();
    }
  } else {
    console.log("Formularvalidierung fehlgeschlagen.");
  }
}

export async function initAddTaskForm() {
  await initTask(); // Ruft initDropdowns auf

  picker = flatpickr("#datepicker", {
    dateFormat: "d.m.Y",
    allowInput: true,
    mobileNative: true,
    clickOpens: true,
    onReady: function () {
      // Setze name-Attribute für interne Inputs
      document.querySelectorAll(".numInput:not([name])").forEach((el) => {
        el.setAttribute("name", "flatpickr_day");
      });
      document
        .querySelectorAll(".flatpickr-monthDropdown-months:not([name])")
        .forEach((el) => {
          el.setAttribute("name", "flatpickr_day");
        });
    },
    // positionElement: document.getElementById("datepicker")
  });

  // flatpickr("#calendar-icon", {});

  initPriorityButtons(); // Aus priority-handler.js

  const addTaskForm = document.getElementById("add-task-form");
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", showTaskSuccessMsg);

    addTaskForm.addEventListener("submit", handleCreateTask);

    addTaskForm.addEventListener("reset", clearForm);
  }

  document
    .getElementById("title")
    ?.addEventListener("input", (event) => handleInput(event.target));

  const datepickerInput = document.getElementById("datepicker");

  datepickerInput?.addEventListener("input", (event) => {
    formatDate(event.target);
    if (event.target.value > 0 && event.target.classList.contains("invalid")) {
      event.target.classList.remove("invalid");
    }
  });

  datepickerInput?.addEventListener("focus", (event) => {
    openPicker();

    if (event.target.classList.contains("invalid")) {
      event.target.classList.remove("invalid");
      const dueDateError = document.getElementById("due-date-error");
      dueDateError?.classList.remove("d-flex");
    }
  });

  document.getElementById("calendar-icon")?.addEventListener("click", () => {
    document.getElementById("datepicker").focus();
  });

  document
    .getElementById("assigned-to-area")
    ?.addEventListener("click", toggleAssignedToArea);

  // Kontakte im Input-Feld Filtern:
  const contactInput = document.getElementById("select-contacts");
  if (contactInput) {
    contactInput.addEventListener("input", () => {
      const query = contactInput.value.trim().toLowerCase();

      // Dropdown öffnen, falls noch nicht offen
      const wrapper = document.getElementById("assigned-to-options-wrapper");
      if (wrapper && !wrapper.classList.contains("open-assigned-to")) {
        toggleAssignedToDropdown();
      }

      filterContacts(query);
    });

    filterContacts("");
  }

  document
    .querySelector(".resize-handle")
    ?.addEventListener("mousedown", startResize);

  document
    .getElementById("title")
    ?.addEventListener("focus", autoFillLeftForm, { once: true });
  document
    .getElementById("title")
    ?.addEventListener("focus", autofillRightForm, { once: true });

  document
    .getElementById("task-description")
    ?.addEventListener("focus", autoFillLeftForm, { once: true });
  document
    .getElementById("task-description")
    ?.addEventListener("focus", autofillRightForm, { once: true });

  document
    .getElementById("datepicker")
    ?.addEventListener("focus", autoFillLeftForm, { once: true });
  document
    .getElementById("datepicker")
    ?.addEventListener("focus", autofillRightForm, { once: true });

  const subtaskInput = document.getElementById("subtask-input");
  const addSubtaskBtn = document.getElementById("add-subtask-btn");
  const subtaskXBtn = document.getElementById("subtask-clear-btn");
  const subtaskCheckBtn = document.getElementById("subtask-add-task-btn");
  const clearSubtaskIcon = document.querySelector(
    '.subtask-icons img[alt="Close"]'
  );
  const addSubtaskIcon = document.querySelector(
    '.subtask-icons img[alt="Add"]'
  );

  if (subtaskInput) {
    subtaskInput.addEventListener("input", (event) =>
      toggleSubtaskInputIcons(event.target.value.length > 0)
    );
    subtaskInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addSubtask();
      }
    });
  }
  addSubtaskBtn?.addEventListener("click", () => {
    toggleSubtaskInputIcons(true);
  });

  clearSubtaskIcon?.addEventListener("click", clearSubtask);
  addSubtaskIcon?.addEventListener("click", addSubtask);
  subtaskXBtn?.addEventListener("click", clearSubtask);
  subtaskCheckBtn?.addEventListener("click", addSubtask);

  document
    .getElementById("subtasks-list")
    ?.addEventListener("click", (even) => {
      const target = even.target;
      if (target.closest(".subtask-actions .left")) {
        toggleSubtaskEdit(target.closest(".subtask-actions .left"));
      } else if (target.closest(".subtask-actions .right")) {
        const listItem = target.closest(".subtask-list");
        if (listItem) {
          const index = parseInt(listItem.dataset.index);
          deleteSubtask(index);
        }
      }
    });
}

export function toggleAssignedToArea() {
  const assignedToArea = document.getElementById("assigned-to-area");
  if (!assignedToArea) return;

  assignedToArea.classList.toggle("width-100");
}

export function addBgColorGrey() {
  const content = document.getElementById("add-task-main");
  if (!content) return;

  content.classList.add("bg-color-grey");
}
export async function showTaskSuccessMsg() {
  const msg = document.getElementById("taskSuccessMsg");
  if (!msg) return;

  msg.classList.remove("hidden", "slide-out");
  msg.classList.add("slide-in");

  await new Promise((resolve) => setTimeout(resolve, 1500));

  msg.classList.remove("slide-in");
  msg.classList.add("slide-out");

  await new Promise((resolve) => setTimeout(resolve, 500));

  msg.classList.add("hidden");
}
