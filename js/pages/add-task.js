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
  } else {
    console.log("Formularvalidierung fehlgeschlagen.");
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

export async function initAddTaskForm() {
  await initTask();

  initDatePicker();
  initPriorityButtons();
  initFormEventListeners();
  initInputFieldListeners();
  initAssignedToListeners();
  initSubtaskListeners();
  initWindowResizeListeners();
}

/** * Initializes the date picker using flatpickr.
 * It sets the date format, allows input, and configures the onReady event.
 */
function initDatePicker() {
  picker = flatpickr("#datepicker", {
    dateFormat: "d.m.Y",
    allowInput: true,
    mobileNative: true,
    clickOpens: true,
    onReady: function () {
      document.querySelectorAll(".numInput:not([name])").forEach((el) => {
        el.setAttribute("name", "flatpickr_day");
      });
      document.querySelectorAll(".flatpickr-monthDropdown-months:not([name])")
        .forEach((el) => {
          el.setAttribute("name", "flatpickr_day");
        });
    },
  });
}

/** * Initializes event listeners for the form submission and reset.
 */
function initFormEventListeners() {
  const addTaskForm = document.getElementById("add-task-form");
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", handleCreateTask);
    addTaskForm.addEventListener("reset", clearForm);
  }
}

/** * Initializes event listeners for input fields.
 * This includes listeners for the title input, date picker, calendar icon, and auto-fill functionality.
 */
function initInputFieldListeners() {
  initTitleInputListener();
  initDatePickerListeners();
  initCalendarIconListener();
  initAutoFillListeners();
}

/** * Initializes the title input field listener.
 * It listens for input events and calls the handleInput function to validate the title.
 */
function initTitleInputListener() {
  document.getElementById("title")?.addEventListener("input", (event) => 
    handleInput(event.target)
  );
}

/** * Initializes the date picker input field listeners.
 * It listens for input and focus events to format the date and open the date picker.
 */
function initDatePickerListeners() {
  const datepickerInput = document.getElementById("datepicker");
  if (!datepickerInput) return;

  datepickerInput.addEventListener("input", handleDatePickerInput);
  datepickerInput.addEventListener("focus", handleDatePickerFocus);
}

/** * Handles the date picker input event.
 * It formats the date input and removes the invalid class if the input is valid.
 */
function handleDatePickerInput(event) {
  formatDate(event.target);
  if (event.target.value > 0 && event.target.classList.contains("invalid")) {
    event.target.classList.remove("invalid");
  }
}

/** * Handles the date picker focus event.
 * It opens the date picker and removes the invalid class if the input is focused.
 */
function handleDatePickerFocus(event) {
  openPicker();
  if (event.target.classList.contains("invalid")) {
    event.target.classList.remove("invalid");
    document.getElementById("due-date-error")?.classList.remove("d-flex");
  }
}

/** * Initializes the calendar icon listener.
 * It listens for click events on the calendar icon to focus the date picker input.
 */
function initCalendarIconListener() {
  document.getElementById("calendar-icon")?.addEventListener("click", () => 
    document.getElementById("datepicker")?.focus()
  );
}

/** * Initializes listeners for auto-fill functionality on specific fields.
 * It adds focus event listeners to the title, task description, and date picker fields.
 */
function initAutoFillListeners() {
  const autoFillFields = ["title", "task-description", "datepicker"];
  autoFillFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.addEventListener("focus", autoFillLeftForm, { once: true });
    field.addEventListener("focus", autofillRightForm, { once: true });
  });
}

/** * Initializes listeners for the "assigned to" area and contact input.
 * It adds a click listener to the assigned to area and an input listener to the contact input.
 */
function initAssignedToListeners() {
  document.getElementById("assigned-to-area")?.addEventListener("click", toggleAssignedToArea);

  const contactInput = document.getElementById("select-contacts");
  if (contactInput) {
    contactInput.addEventListener("input", () => {
      const query = contactInput.value.trim().toLowerCase();
      const wrapper = document.getElementById("assigned-to-options-wrapper");
      if (wrapper && !wrapper.classList.contains("open-assigned-to")) {
        toggleAssignedToDropdown();
      }
      filterContacts(query);
    });
    filterContacts("");
  }
}

/** * Initializes listeners for subtask input, buttons, and the subtask list.
 * It sets up event listeners for adding, clearing, and editing subtasks.
 */
function initSubtaskListeners() {
  initSubtaskInputListeners();
  initSubtaskButtonListeners();
  initSubtaskListListener();
}

/** * Initializes listeners for the subtask input field.
 * It adds input and keydown event listeners to handle subtask input and submission.
 */
function initSubtaskInputListeners() {
  const subtaskInput = document.getElementById("subtask-input");
  if (!subtaskInput) return;

  subtaskInput.addEventListener("input", handleSubtaskInput);
  subtaskInput.addEventListener("keydown", handleSubtaskKeydown);
}

/** * Handles the subtask input event.
 * It toggles the visibility of the subtask input icons based on the input length.
 */
function handleSubtaskInput(event) {
  toggleSubtaskInputIcons(event.target.value.length > 0);
}

/** * Handles the keydown event for the subtask input field.
 * If the Enter key is pressed, it prevents the default action and adds the subtask.
 */
function handleSubtaskKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtask();
  }
}

/** * Initializes listeners for subtask buttons.
 * It sets up click event listeners for the add, clear, and subtask action buttons.
 */
function initSubtaskButtonListeners() {
  document.getElementById("add-subtask-btn")?.addEventListener("click", 
    () => toggleSubtaskInputIcons(true)
  );

  const clearButtons = [
    document.querySelector('.subtask-icons img[alt="Close"]'),
    document.getElementById("subtask-clear-btn")
  ];
  
  const addButtons = [
    document.querySelector('.subtask-icons img[alt="Add"]'),
    document.getElementById("subtask-add-task-btn")
  ];

  clearButtons.forEach(btn => btn?.addEventListener("click", clearSubtask));
  addButtons.forEach(btn => btn?.addEventListener("click", addSubtask));
}

/** * Initializes the subtask list listener.
 * It adds a click event listener to the subtask list to handle subtask actions.
 */
function initSubtaskListListener() {
  document.getElementById("subtasks-list")?.addEventListener("click", handleSubtaskListClick);
}

/** * Handles clicks on the subtask list.
 * It checks if the click was on the edit or delete action and calls the appropriate function.
 */
function handleSubtaskListClick(event) {
  const target = event.target;
  
  if (target.closest(".subtask-actions .left")) {
    toggleSubtaskEdit(target.closest(".subtask-actions .left"));
  } 
  else if (target.closest(".subtask-actions .right")) {
    const listItem = target.closest(".subtask-list");
    if (listItem) {
      deleteSubtask(parseInt(listItem.dataset.index));
    }
  }
}

/** * Initializes window resize listeners for responsive behavior.
 * It sets up listeners for the resize handle, responsive divs, max-width synchronization,
 * and sign info visibility.
 */
function initWindowResizeListeners() {
  document.querySelector(".resize-handle")?.addEventListener("mousedown", startResize);

  handleResponsiveDiv();
  window.addEventListener('resize', handleResponsiveDiv);

  syncMaxWidth();
  window.addEventListener('resize', syncMaxWidth);

  handleSignInfoMobile();
  window.addEventListener('resize', handleSignInfoMobile);
}

/** * Toggles the visibility of the "assigned to" area.
 */
export function toggleAssignedToArea() {
  const assignedToArea = document.getElementById("assigned-to-area");
  if (!assignedToArea) return;

  assignedToArea.classList.toggle("width-100");
}

/** * Adds a grey background color to the main content area.
 */
export function addBgColorGrey() {
  const content = document.getElementById("add-task-main");
  if (!content) return;

  content.classList.add("bg-color-grey");
}

/** * Shows a success message after a task is successfully created.
 * The message slides in, stays visible for a short time, and then slides out.
 */
export async function showTaskSuccessMsg() {
  const msg = document.getElementById("taskSuccessMsg");
  if (!msg) return;

  msg.classList.remove("hidden", "slide-out");
  msg.classList.add("slide-in");
  await new Promise((resolve) => setTimeout(resolve, 300));

  msg.classList.remove("slide-in");
  msg.classList.add("slide-out");

  await new Promise((resolve) => setTimeout(resolve, 1600));

  msg.classList.add("hidden");
}

/** * Handles the creation and removal of responsive divs based on the screen size.
 * If the screen width is less than or equal to 1024px, it creates two responsive divs.
 * Otherwise, it removes them.
 */
export function handleResponsiveDiv() {
  const container = document.getElementById("content");
  const divOne = document.getElementById('responsive-div-one');
  const divTwo = document.getElementById('responsive-div-two');

  if (window.innerWidth <= 1024) {
    createResponsiveDivs(container, divOne, divTwo);
  } else {
    removeResponsiveDivs(divOne, divTwo);
  }
}

/** * Creates responsive divs if they don't already exist.
 */
function createResponsiveDivs(container, existingOne, existingTwo) {
  if (!existingOne) {
    const newDiv = createResponsiveDiv('responsive-div-one');
    container?.prepend(newDiv);
  }
  if (!existingTwo) {
    const newDiv = createResponsiveDiv('responsive-div-two');
    container?.appendChild(newDiv);
  }
}

/** * Removes the responsive divs if they exist.
 * @param {HTMLElement} divOne - The first responsive div to remove.
 * @param {HTMLElement} divTwo - The second responsive div to remove.
 */
function removeResponsiveDivs(divOne, divTwo) {
  divOne?.remove();
  divTwo?.remove();
}

/** * Creates a responsive div with the specified ID.
 * @param {string} id - The ID for the new div.
 * @returns {HTMLElement} - The created div element.
 */
function createResponsiveDiv(id) {
  const div = document.createElement('div');
  div.id = id;
  div.className = 'responsive-div';
  return div;
}

/** * Handles the visibility of the sign info message based on the screen size.
 * If the screen width is less than or equal to 768px, it shows a mobile version of the sign info.
 * Otherwise, it shows the desktop version.
 */
export function handleSignInfoMobile() {
  const container = document.querySelector(".right-form");
  const desktop = document.getElementById('sign-info-desktop');
  const mobile = document.getElementById('sign-info-mobile');

  if (window.innerWidth <= 768) {
    handleMobileView(container, desktop, mobile);
  } else {
    handleDesktopView(mobile, desktop);
  }
}

/** * Handles the mobile view of the sign info message.
 * If the desktop version exists, it hides it and shows the mobile version.
 * 
 * @param {HTMLElement} container - The container to append the mobile sign info.
 * @param {HTMLElement} desktop - The desktop sign info element.
 * @param {HTMLElement} mobile - The mobile sign info element.
 */
function handleMobileView(container, desktop, mobile) {
  if (!mobile && desktop) {
    const newDiv = document.createElement('div');
    newDiv.id = 'sign-info-mobile';
    newDiv.className = 'sign-info';
    newDiv.textContent = 'This field is required';
    container?.appendChild(newDiv);
    desktop.classList.add('d-none');
  }
}

/** * Handles the desktop view of the sign info message.
 * If the mobile version exists, it removes it and shows the desktop version.
 */
function handleDesktopView(mobile, desktop) {
  if (mobile && desktop) {
    mobile.remove();
    desktop.classList.remove('d-none');
  }
}

/**
 * Synchronizes the max-width of the assigned-to area with the dropdown width.
 */
function syncMaxWidth() {
  const source = document.getElementById('dropdown-assigned-to');
  const target = document.getElementById('assigned-to-area');
  const width = source.getBoundingClientRect().width;

  target.style.maxWidth = width + 'px';
}