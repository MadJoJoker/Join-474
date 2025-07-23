import { getFirebaseData } from "../data/API.js";
import {
  addSubtask,
  clearSubtask,
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
  clearCategory,
  toggleAssignedToDropdown,
} from "../events/dropdown-menu.js";
import { autoFillLeftForm } from "../events/autofill-add-task.js";

import { CWDATA } from '../data/task-to-firbase.js';

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
  selectedContacts.length = 0; // Setzen Sie selectedContacts direkt zurück (Import aus dropdown-menu.js)

  renderSubtasks(); // Aus subtask-handler.js
}

function checkRequiredFields() {
  let isValid = true;
  const titleInput = document.getElementById("title");
  const datepickerInput = document.getElementById("datepicker");
  const categoryDropdown = document.getElementById("dropdown-category");
  const assignedToDropdown = document.getElementById("dropdown-assigned-to");

  if (
    !titleInput ||
    !datepickerInput ||
    !categoryDropdown ||
    !assignedToDropdown
  )
    return false;

  if (!titleInput.value.trim()) {
    titleInput.classList.add("invalid");
    isValid = false;
  } else {
    titleInput.classList.remove("invalid");
  }

  if (!datepickerInput.value.trim()) {
    datepickerInput.classList.add("invalid");
    isValid = false;
  } else {
    datepickerInput.classList.remove("invalid");
  }

  if (!selectedCategory) {
    // Verwendet selectedCategory aus dropdown-menu.js
    categoryDropdown.classList.add("invalid");
    isValid = false;
  } else {
    categoryDropdown.classList.remove("invalid");
  }

  if (selectedContacts.length === 0) {
    // Verwendet selectedContacts aus dropdown-menu.js
    assignedToDropdown.classList.add("invalid");
    isValid = false;
  } else {
    assignedToDropdown.classList.remove("invalid");
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
  // @param {HTMLInputElement} inputElement - Das Eingabeelement.
  if (inputElement.value.trim()) {
    inputElement.classList.remove("invalid");
  }
}

function createTaskObject() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("task-description").value;
  const dueDate = document.getElementById("datepicker").value;

  return {
    title,
    description,
    dueDate,
    category: selectedCategory,
    priority: currentPriority,
    assignedTo: selectedContacts.map((contact) => ({
      name: contact.name,
      initials: contact.initials,
      avatarColor: contact.avatarColor,
    })),
    subtasks: addedSubtasks.map((subtask) => ({
      text: subtask.text,
      completed: subtask.completed,
    })),
    createdAt: new Date().toISOString(),
    columnID: "todo",
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
    await CWDATA(rawNewObject);

    alert("Task created successfully! (Check console for data)");

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
    positionElement: document.getElementById("datepicker")
  });

  flatpickr("#calendar-icon", {});

  initPriorityButtons(); // Aus priority-handler.js

  const addTaskForm = document.getElementById("add-task-form");
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", handleCreateTask);
    addTaskForm.addEventListener("reset", clearForm);
  }

  document
    .getElementById("title")
    ?.addEventListener("input", (event) => handleInput(event.target));
  document
    .getElementById("datepicker")
    ?.addEventListener("input", (event) => formatDate(event.target));
  document.getElementById("datepicker")?.addEventListener("focus", openPicker);

  document.getElementById("calendar-icon")?.addEventListener("click", () => {
    document.getElementById("datepicker").focus();
  });

  document
    .getElementById("assigned-to-area")
    ?.addEventListener("click", toggleAssignedToArea);

  document
    .querySelector(".resize-handle")
    ?.addEventListener("mousedown", startResize);

      document.getElementById("title")?.addEventListener("focus", autoFillLeftForm, { once: true });
  document.getElementById("task-description")?.addEventListener("focus", autoFillLeftForm, { once: true });
  document.getElementById("datepicker")?.addEventListener("focus", autoFillLeftForm, { once: true });

  const subtaskInput = document.getElementById("subtask-input");
  const addSubtaskBtn = document.getElementById("add-subtask-btn");
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