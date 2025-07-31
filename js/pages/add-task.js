import { getFirebaseData } from "../data/API.js";
import {
  clearSubtask,
  clearSubtasksList,
  renderSubtasks,
  addedSubtasks,
} from "../events/subtask-handler.js";
import {
  currentPriority,
  setMedium,
} from "../events/priorety-handler.js";
import {
  selectedCategory,
  selectedContacts,
  clearAssignedTo,
  clearCategory,
} from "../events/dropdown-menu.js";
import {
  clearInvalidFields,
  initDropdowns,
} from "../events/dropdown-menu-auxiliary-function.js";
import { CWDATA } from "../data/task-to-firbase.js";
import {
  initAddTaskForm,
  picker,
  showTaskSuccessMsg,
} from "../pages/add-task-auxiliary-functions.js";

let isResizing = false;
let startY, startHeight, currentTextarea;
let overlayPickerInstance;

export let fetchData = null;

/** * Initializes the task view and loads the required data.
 * @returns {Promise<void>} - A promise that resolves when the initialization is complete.
 * @throws {Error} - If an error occurs while loading the Firebase data.
 */
export async function initTask() {
  try {
    const data = await getFirebaseData();

    initDropdowns(Object.values(data.contacts));

    fetchData = data;
  } catch (error) {
    console.error("Fehler beim Laden der Firebase-Daten:", error);
  }
}

/** * Formats the date input value.
 * @param {HTMLInputElement} input - The input element to format.
 */
export function formatDate(input) {
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

/** * Opens the date picker.
 */
export function openPicker() {
  if (picker) {
    picker.open();
  } else {
    console.error(
      "Flatpickr-Instanz 'picker' ist nicht initialisiert. Stellen Sie sicher, dass initAddTaskForm() aufgerufen wurde."
    );
  }
}

/** * Starts resizing the textarea when the resize handle is clicked.
 * @param {MouseEvent} e - The mouse event triggered by clicking the resize handle.
 */
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

/** * Resizes the textarea based on the mouse movement.
 * @param {MouseEvent} e - The mouse event with the clientY position.
 */
export function resizeTextarea(e) {
  if (!isResizing) return;
  const newHeight = startHeight + e.clientY - startY + "px";
  currentTextarea.style.height = newHeight;
}

/** * Stops the resizing of the textarea when the mouse button is released.
 * @param {MouseEvent} e - The mouse event triggered by releasing the mouse button.
 */
export function stopResize() {
  isResizing = false;
  document.removeEventListener("mousemove", resizeTextarea);
  document.removeEventListener("mouseup", stopResize);
}

/** * Clears the form fields and resets the state.
 */
export function clearForm() {
  const form = document.getElementById("add-task-form");
  if (form) {
    form.reset();
  }
  setMedium();
  clearCategory();
  clearSubtask();
  clearSubtasksList();
  clearAssignedTo();
  clearInvalidFields();

  renderSubtasks();
}

/** * Checks if all required fields are filled out.
 */
function checkRequiredFields() {
  let isValid = true;

  if (!checkTitle()) isValid = false;
  if (!checkDatepicker()) isValid = false;
  if (!checkCategory()) isValid = false;
  if (!checkAssignedTo()) isValid = false;
  if (!checkCategorySpan()) isValid = false;

  return isValid;
}

/** * Validates the title input field.
 * @returns {boolean} - Returns true if the title is valid, false otherwise.
 */
function checkTitle() {
  const input = document.getElementById("title");
  const error = document.getElementById("title-error");
  if (!input || !input.value.trim()) {
    showError(input, error);
    return false;
  }
  hideError(input, error);
  return true;
}

/** * Validates the datepicker input field.
 * @returns {boolean} - Returns true if the datepicker is valid, false otherwise.
 */
function checkDatepicker() {
  const input = document.getElementById("datepicker");
  const error = document.getElementById("due-date-error");
  if (!input || !input.value.trim()) {
    showError(input, error);
    return false;
  }
  hideError(input, error);
  return true;
}

/** * Validates the selected category.
 * @returns {boolean} - Returns true if a category is selected, false otherwise.
 */
function checkCategory() {
  const dropdown = document.getElementById("dropdown-category");
  const error = document.getElementById("category-error");
  if (!selectedCategory) {
    showError(dropdown, error);
    return false;
  }
  hideError(dropdown, error);
  return true;
}

/** * Validates the assigned contacts.
 * @returns {boolean} - Returns true if at least one contact is selected, false otherwise.
 */
function checkAssignedTo() {
  const dropdown = document.getElementById("dropdown-assigned-to");
  const error = document.getElementById("assigned-to-error");
  if (selectedContacts.length === 0) {
    showError(dropdown, error);
    return false;
  }
  hideError(dropdown, error);
  return true;
}

/** * Checks if the category span is valid.
 * @returns {boolean} - Returns true if the category span is valid, false otherwise.
 */
function checkCategorySpan() {
  const span = document.getElementById("selected-category");
  const dropdown = document.getElementById("dropdown-category");
  if (span && span.textContent === "Select task category") {
    dropdown?.classList.add("invalid");
    return false;
  }
  return true;
}

/** * Displays an error message for the specified input and error elements.
 * @param {HTMLInputElement} input - The input element to show the error for.
 * @param {HTMLElement} error - The error element to display the error message.
 */
function showError(input, error) {
  input?.classList.add("invalid");
  error?.classList.add("d-flex");
}

/** * Hides the error message for the specified input and error elements.
 * @param {HTMLInputElement} input - The input element to hide the error for.
 * @param {HTMLElement} error - The error element to hide the error message.
 */
function hideError(input, error) {
  input?.classList.remove("invalid");
  error?.classList.remove("d-flex");
}

/**
 * Handles input validation for the title field.
 *
 * @param {HTMLInputElement} inputElement - The input element to validate.
 */
export function handleInput(inputElement) {
  const titleError = document.getElementById("title-error");

  if (inputElement.value.trim()) {
    inputElement.classList.remove("invalid");
    titleError?.classList.remove("d-flex");
  }
}

/** * Creates a task object from the form data.
 * @returns {Object} - The task object containing all relevant data.
 */
function createTaskObject() {
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
  const subtasksCompleted = checkedSubtasks.filter((completed) => completed).length;
  const assignedUsers = selectedContacts.map((selectedContact) => {
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
        "WARNING: 'fetchData.contacts' is undefined or empty. Assigned user IDs could not be determined."
      );
    }
    return foundId;
  }).filter((id) => id !== undefined);

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

/** * Handles the form submission for creating a new task.
 * @param {Event} event - The form submission event.
 */
export async function handleCreateTask(event) {
  event.preventDefault();

  if (checkRequiredFields()) {
    await processNewTask();
    const overlay = document.getElementById("overlay");
    if (overlay) {
      overlay.classList.add("overlay-hidden");
      overlay.classList.remove("overlay-visible");
      initAddTaskForm();
    }
    window.location.href = "board-site.html";
  } 
}

/** * Processes the creation of a new task.
 * It creates a task object, sends it to the server, shows a success message, and clears the form.
 * @returns {Promise<void>} - A promise that resolves when the task is processed.
 */
async function processNewTask() {
  const newTask = createTaskObject();
  const rawNewObject = createTaskObject();
  await CWDATA(rawNewObject, fetchData);
  await showTaskSuccessMsg();
  clearForm();
  return;
}