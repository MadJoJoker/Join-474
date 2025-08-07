import {
    initTask,
    handleCreateTask,
    clearForm,
    startResize,
    openPicker,
    formatDate,
    handleInput,
} from "./add-task.js";
import {
    initPriorityButtons,
    setButtonIconsMobile
} from "../events/priorety-handler.js";
import {
    filterContacts
} from "../events/dropdown-menu.js";
import {
    addSubtask,
    clearSubtask,
    toggleSubtaskEdit,
    deleteSubtask,
    toggleSubtaskInputIcons,
} from "../events/subtask-handler.js";
import { autofillForms } from "../events/autofill-add-task.js";

export let picker = null;

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
export function initDatePicker() {
    picker = flatpickr("#datepicker", {
        dateFormat: "d.m.Y",
        allowInput: true,
        disableMobile: true,
        clickOpens: true,
        minDate: "today",
        onReady: function () {
            document.querySelectorAll(".numInput:not([name])").forEach((el) => {
                el.setAttribute("name", "flatpickr_day");
            });
            document.querySelectorAll(".flatpickr-monthDropdown-months:not([name])").forEach((el) => {
                el.setAttribute("name", "flatpickr_day");
            });
        },
    });
}

/** * Initializes event listeners for the form submission and reset.
 */
export function initFormEventListeners() {
    const addTaskForm = document.getElementById("add-task-form");
    if (addTaskForm) {
        addTaskForm.addEventListener("submit", handleCreateTask);
        addTaskForm.addEventListener("reset", clearForm);
    }
}

/** * Initializes event listeners for input fields.
 * This includes listeners for the title input, date picker, calendar icon, and auto-fill functionality.
 */
export function initInputFieldListeners() {
    initTitleInputListener();
    initDatePickerListeners();
    initCalendarIconListener();
    initAutoFillListeners();
}

/** * Initializes the title input field listener.
 * It listens for input events and calls the handleInput function to validate the title.
 */
function initTitleInputListener() {
    document
        .getElementById("title")
        ?.addEventListener("input", (event) => handleInput(event.target));
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
    document
        .getElementById("calendar-icon")
        ?.addEventListener("click", () =>
            document.getElementById("datepicker")?.focus()
        );
}

/** * Initializes listeners for auto-fill functionality on specific fields.
 * It adds focus event listeners to the title, task description, and date picker fields.
 */
function initAutoFillListeners() {
    const autofillBtn = document.getElementById("add-task-autofill-btn");
    if (autofillBtn) {
        autofillBtn.addEventListener("click", autofillForms);
    }
}

/** * Initializes listeners for the assigned to dropdown.
 * It adds an input event listener to the contact input field to filter contacts based on the input value.
 */
export function initAssignedToListeners() {

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
export function initSubtaskListeners() {
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
    document.getElementById("add-subtask-btn")?.addEventListener("click", () => toggleSubtaskInputIcons(true));

    const clearButtons = [
        document.querySelector('.subtask-icons img[alt="Close"]'),
        document.getElementById("subtask-clear-btn"),
    ];

    const addButtons = [
        document.querySelector('.subtask-icons img[alt="Add"]'),
        document.getElementById("subtask-add-task-btn"),
    ];

    clearButtons.forEach((btn) => btn?.addEventListener("click", clearSubtask));
    addButtons.forEach((btn) => btn?.addEventListener("click", addSubtask));
}

/** * Initializes the subtask list listener.
 * It adds a click event listener to the subtask list to handle subtask actions.
 */
export function initSubtaskListListener() {
    document.getElementById("subtasks-list")?.addEventListener("click", handleSubtaskListClick);
}

/** * Handles clicks on the subtask list.
 * It checks if the click was on the edit or delete action and calls the appropriate function.
 */
function handleSubtaskListClick(event) {
    const target = event.target;

    if (target.closest(".subtask-actions .left")) {
        toggleSubtaskEdit(target.closest(".subtask-actions .left"));
    } else if (target.closest(".subtask-actions .right")) {
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
export function initWindowResizeListeners() {
    document.querySelector(".resize-handle")?.addEventListener("mousedown", startResize);

    handleResponsiveDiv();
    window.addEventListener("resize", handleResponsiveDiv);

    syncMaxWidth();
    window.addEventListener("resize", syncMaxWidth);

    handleSignInfoMobile();
    window.addEventListener("resize", handleSignInfoMobile);

    setButtonIconsMobile();
    window.addEventListener("resize", setButtonIconsMobile);
}

/** * Toggles the visibility of the "assigned to" area.
 */
// export function toggleAssignedToArea() {
//     const assignedToArea = document.getElementById("assigned-to-area");
//     if (!assignedToArea) return;

//     assignedToArea.classList.toggle("width-100");
// }

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
    const divOne = document.getElementById("responsive-div-one");
    const divTwo = document.getElementById("responsive-div-two");

    if (window.innerWidth <= 1024) {
        createResponsiveDivs(container, divOne, divTwo);
    } else {
        removeResponsiveDivs(divOne, divTwo);
    }
}

/** * Creates responsive divs if they don't already exist.
 */
export function createResponsiveDivs(container, existingOne, existingTwo) {
    if (!existingOne) {
        const newDiv = createResponsiveDiv("responsive-div-one");
        container?.prepend(newDiv);
    }
    if (!existingTwo) {
        const newDiv = createResponsiveDiv("responsive-div-two");
        container?.appendChild(newDiv);
    }
}

/** * Removes the responsive divs if they exist.
 * @param {HTMLElement} divOne - The first responsive div to remove.
 * @param {HTMLElement} divTwo - The second responsive div to remove.
 */
export function removeResponsiveDivs(divOne, divTwo) {
    divOne?.remove();
    divTwo?.remove();
}

/** * Creates a responsive div with the specified ID.
 * @param {string} id - The ID for the new div.
 * @returns {HTMLElement} - The created div element.
 */
export function createResponsiveDiv(id) {
    const div = document.createElement("div");
    div.id = id;
    div.className = "responsive-div";
    return div;
}

/** * Handles the visibility of the sign info message based on the screen size.
 * If the screen width is less than or equal to 768px, it shows the mobile version of the sign info.
 * Otherwise, it shows the desktop version.
 */
export function handleSignInfoMobile() {
    const container = document.querySelector(".right-form");
    const desktop = document.getElementById("sign-info-desktop");
    const mobile = document.getElementById("sign-info-mobile");
    const autofillBtn = document.getElementById("add-task-autofill-btn");

    if (window.innerWidth <= 768) {
        handleMobileView(container, desktop, mobile, autofillBtn);
    } else {
        handleDesktopView(mobile, desktop, autofillBtn);
    }
}

/** * Handles the mobile view of the sign info message.
 * If the mobile version does not exist and the desktop version does, it creates a new mobile div and button.
 * It also hides the desktop version and the autofill button.
 */
export function handleMobileView(container, desktop, mobile, autofillBtn) {
    if (!mobile && desktop) {
        const newDiv = document.createElement("div");
        newDiv.id = "sign-info-mobile";
        newDiv.className = "sign-info";
        newDiv.textContent = "This field is required";
        const newButton = document.createElement("button");
        newButton.type = "button";
        newButton.textContent = "Autofill";
        newButton.addEventListener("click", autofillForms);
        newButton.id = "add-task-autofill-btn-mobile";
        newButton.className = "autofill-mobile-btn";
        container?.appendChild(newDiv);
        container?.appendChild(newButton);
        desktop.classList.add("d-none");
        autofillBtn.classList.add("d-none");
    }
}

/** * Handles the desktop view of the sign info message.
 * If both mobile and desktop versions exist, it removes the mobile version and button,
 */
export function handleDesktopView(mobile, desktop, autofillBtn) {
    const mobileAutofillBtn = document.getElementById("add-task-autofill-btn-mobile");

    if (mobile && desktop && mobileAutofillBtn) {
        mobile.remove();
        mobileAutofillBtn.remove();
        desktop.classList.remove("d-none");
        autofillBtn.classList.remove("d-none");
    }
}

/** * Synchronizes the max-width of the assigned-to area with the dropdown width.
 */
export function syncMaxWidth() {
    const source = document.getElementById("dropdown-assigned-to");
    const target = document.getElementById("assigned-to-area");
    const width = source.getBoundingClientRect().width;

    target.style.maxWidth = width + "px";
}