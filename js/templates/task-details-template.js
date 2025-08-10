// Global event handler for task delete buttons
import { CWDATA, allData } from "../data/task-to-firbase.js";
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".delete-task-btn");
  if (btn) {
    const taskId = btn.getAttribute("data-task-id");
    CWDATA({ [taskId]: null }, allData);
  }
});
// ...existing code...
import { renderAssignedToContacts } from "../templates/add-task-template.js";
import { firebaseData } from "../../main.js";

/**
 * Formats a date from "DD.MM.YYYY" to "DD/MM/YYYY".
 * @param {string} dateString - The date string in format "DD.MM.YYYY".
 * @returns {string} The formatted date string in format "DD/MM/YYYY".
 */
function getFormattedDate(dateString) {
  const parts = dateString.split(".");
  const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  return date
    .toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\./g, "/");
}

/**
 * Checks if a date string in format "DD.MM.YYYY" is valid.
 * @param {string} dateString - The date string to check.
 * @returns {boolean} True if the date is valid, otherwise false.
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  const parts = dateString.split(".");
  if (parts.length !== 3) return false;
  const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  return !isNaN(new Date(isoDate).getTime());
}

/**
 * Formats a deadline date string.
 * @param {string} deadline - The deadline date string.
 * @returns {string} The formatted deadline or an empty string if invalid.
 */
function formatDeadline(deadline) {
  return isValidDate(deadline) ? getFormattedDate(deadline) : "";
}

/**
 * Creates the HTML header for a task card.
 * @param {object} task - The task object.
 * @returns {string} The HTML string for the task header.
 */
function getTaskHeader(task) {
  // Gleiche Kategorie-Klassen wie auf den Board-Karten
  let taskTypeClass = "category-default";
  if (task.type === "User Story") taskTypeClass = "category-user-story";
  else if (task.type === "Technical Task")
    taskTypeClass = "category-technical-task";
  else if (task.type === "Meeting") taskTypeClass = "category-meeting";
  return `
    <div class="taskCardField titleBar">
      <div class="task-category ${taskTypeClass}">${task.type ?? ""}</div>
    </div>
    <div class="taskCardField titleText">${task.title ?? ""}</div>
  `;
}

/**
 * Creates the HTML description section for a task card.
 * @param {object} task - The task object.
 * @returns {string} The HTML string for the task description.
 */
function getTaskDescription(task) {
  return `
    <div class="taskCardField description">
      <p>${task.description ?? ""}</p>
    </div>
  `;
}

/**
 * Creates the HTML due date section for a task card.
 * @param {string} formattedDeadline - The already formatted due date.
 * @returns {string} The HTML string for the due date.
 */
function getTaskDueDate(formattedDeadline) {
  return `
    <div class="taskCardField date">
      <p>Due date:</p><p>${formattedDeadline}</p>
    </div>
  `;
}

/**
 * Returns the formatted priority text.
 * @param {string} priority - The priority string (e.g., "urgent").
 * @returns {string} The formatted priority text.
 */
function getPriorityText(priority) {
  return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "No";
}

/**
 * Creates the HTML display section for priority.
 * @param {string} priorityClass - The CSS class for the priority.
 * @param {string} priorityText - The priority text to display.
 * @returns {string} The HTML string for the priority display.
 */
function getPriorityDisplayHtml(priorityClass, priorityText) {
  return `
    <div class="priority-display ${priorityClass}" data-priority="${priorityClass}">
      <p>${priorityText}</p>
      <img src="../assets/icons/property/${priorityClass}.svg" alt="${priorityText} Priority Icon">
    </div>
  `;
}

/**
 * Creates the HTML priority section for a task card.
 * @param {object} task - The task object.
 * @returns {string} The HTML string for the task priority section.
 */
function getTaskPriority(task) {
  const priorityClass = task.priority?.toLowerCase() ?? "";
  const priorityText = getPriorityText(task.priority);
  return `
    <div class="taskCardField priority-section">
      <p>Priority:</p>${getPriorityDisplayHtml(priorityClass, priorityText)}
    </div>
  `;
}

/**
 * Checks if a contact matches the given details.
 * @param {object} contact - The contact object.
 * @param {string} name - The contact's name.
 * @param {string} initials - The contact's initials.
 * @param {string} avatarColor - The contact's avatar color.
 * @returns {boolean} True if the contact matches, otherwise false.
 */
function contactMatches(contact, name, initials, avatarColor) {
  return (
    contact.name === name &&
    contact.initials === initials &&
    contact.avatarColor === avatarColor
  );
}

/**
 * Checks if a contact is in the list of assigned contacts.
 * @param {string} name - The name of the contact to check.
 * @param {string} initials - The initials of the contact to check.
 * @param {string} avatarColor - The avatar color of the contact to check.
 * @param {Array<object>} assignedContacts - The list of already assigned contact objects.
 * @returns {boolean} True if the contact is assigned, otherwise false.
 */
function isContactSelected(name, initials, avatarColor, assignedContacts) {
  return (
    assignedContacts?.some((c) =>
      contactMatches(c, name, initials, avatarColor)
    ) ?? false
  );
}

/**
 * Renders the HTML for a contact with selection status.
 * @param {object} contact - The contact object to render.
 * @param {Array<object>} assignedContactObjects - The list of already assigned contact objects for comparison.
 * @returns {string} The HTML string for the contact option.
 */
export function renderAssignedToContactsWithSelection(
  contact,
  assignedContactObjects
) {
  const { name, initials, avatarColor } = contact;
  const isSelected = isContactSelected(
    name,
    initials,
    avatarColor,
    assignedContactObjects
  );
  const assignedClass = isSelected ? "assigned" : "";
  return `
        <div class="contact-option ${assignedClass}" data-name="${name}" data-initials="${initials}" data-avatar-color="${avatarColor}">
            <div class="contact-checkbox">
                <div class="initials-container">
                    <div class="assigned-initials-circle" style="background-color: var(${avatarColor});">${initials}</div>
                    <div>${name}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Filters contact objects based on assigned user IDs.
 * @param {Array<string>} assignedUserIDs - A list of user IDs.
 * @param {object} allContactsObject - An object containing all contact objects by ID.
 * @returns {Array<object>} A filtered list of contact objects.
 */
function getFilteredContacts(assignedUserIDs, allContactsObject) {
  if (!assignedUserIDs) return [];
  return assignedUserIDs.map((id) => allContactsObject[id]).filter(Boolean);
}

/**
 * Generates the HTML string for assigned contacts.
 * @param {Array<string>} assignedUserIDs - A list of user IDs assigned to a task.
 * @param {object} allContactsObject - An object containing all contact objects by ID.
 * @returns {string} The HTML string for the list of assigned contacts.
 */
function getAssignedContactsHtml(assignedUserIDs, allContactsObject) {
  const assignedContacts = getFilteredContacts(
    assignedUserIDs,
    allContactsObject
  );
  return assignedContacts
    .map((c) => renderAssignedToContactsWithSelection(c, assignedContacts))
    .join("");
}

/**
 * Creates the HTML section for task assignment.
 * @param {object} task - The task object.
 * @param {object} allContactsObject - An object containing all contact objects by ID.
 * @returns {string} The HTML string for the task assignment section.
 */
function getTaskAssignmentSection(task, allContactsObject) {
  const contactsHtml = getAssignedContactsHtml(
    task.assignedUsers,
    allContactsObject
  );
  return `
    <div class="taskCardField assigned-section">
      <p class="assigned-title">Assigned To:</p>
      <div class="entryList assigned-list">${contactsHtml}</div>
    </div>
  `;
}

/**
 * Creates the HTML string for a single subtask.
 * @param {string} subtaskName - The name of the subtask.
 * @param {boolean} isChecked - Whether the subtask is checked.
 * @param {string} taskId - The ID of the parent task.
 * @param {number} subtaskIndex - The index of the subtask.
 * @returns {string} The HTML string for the subtask.
 */
function createSubtaskHtml(subtaskName, isChecked, taskId, subtaskIndex) {
  return `
    <div class="subtask-item">
      <label for="subtask-${taskId}-${subtaskIndex}" class="subtask-label" style="cursor:pointer;">
        <input type="checkbox" class="subtask-checkbox" id="subtask-${taskId}-${subtaskIndex}"
          data-task-id="${taskId}" data-subtask-index="${subtaskIndex}" ${
    isChecked ? "checked" : ""
  } onclick="toggleCheckbox(this)">
        <span class="checkbox-svg-wrapper" onclick="toggleCheckbox(this.parentElement.querySelector('input[type=checkbox]'))" style="display:inline-flex;align-items:center;cursor:pointer;">
          ${
            isChecked
              ? `<svg class="checkbox-icon checked" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2" fill="white"/>
                <path d="M3 9L7 13L15 3.5" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`
              : `<svg class="checkbox-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2" fill="white"/>
              </svg>`
          }
        </span>
        <span>${subtaskName}</span>
      </label>
    </div>
  `;
}

/**
 * Gets the checked status of a subtask.
 * @param {object} task - The task object containing the subtasks.
 * @param {number} index - The index of the subtask.
 * @returns {boolean} True if the subtask is checked, otherwise false.
 */
function getSubtaskCheckedStatus(task, index) {
  return (
    Array.isArray(task.checkedSubtasks) && task.checkedSubtasks[index] === true
  );
}

/**
 * Renders a single subtask.
 * @param {object} task - The task object containing the subtask.
 * @param {number} i - The index of the subtask.
 * @returns {string} The HTML string of the rendered subtask.
 */
function renderSingleSubtask(task, i) {
  const subtaskName = task.totalSubtask[i];
  const isChecked = getSubtaskCheckedStatus(task, i);
  return createSubtaskHtml(subtaskName, isChecked, task.id, i);
}

/**
 * Renders all subtasks for a given task.
 * @param {object} task - The task object.
 * @returns {string} The combined HTML string of all subtasks.
 */
function renderSubtasks(task) {
  if (!task?.totalSubtask || Object.keys(task.totalSubtask).length === 0)
    return "";
  let subtasksHtml = "";
  for (const i in task.totalSubtask) {
    subtasksHtml += renderSingleSubtask(task, i);
  }
  return subtasksHtml;
}

/**
 * Creates the HTML section for the subtasks of a task card.
 * @param {object} task - The task object.
 * @returns {string} The HTML string for the subtasks section.
 */
function getTaskSubtasksSection(task) {
  const subtasksHtml = renderSubtasks(task);
  if (subtasksHtml === "") return "";
  // Checkbox-Icon-Toggle für Subtasks im Overlay
  setTimeout(() => {
    document.querySelectorAll(".subtask-label").forEach((label) => {
      const checkbox = label.querySelector(".subtask-checkbox");
      const icon = label.querySelector(".checkbox-icon");
      if (!checkbox || !icon) return;
      label.addEventListener("click", function (e) {
        // Nur toggeln, wenn nicht auf das Label-Text-Span geklickt wurde (sonst Doppelklick)
        if (e.target.tagName === "SPAN") return;
        setTimeout(() => {
          if (checkbox.checked) {
            icon.src = "../assets/icons/btn/checkbox-filled-white.svg";
            icon.alt = "checkbox filled";
            icon.classList.add("checked");
          } else {
            icon.src = "../assets/icons/btn/checkbox-empty-black.svg";
            icon.alt = "checkbox empty";
            icon.classList.remove("checked");
          }
        }, 0);
      });
    });
  }, 0);
  return `
    <div class="taskCardField subtasks-section">
      <p class="subtasks-title">Subtasks:</p>
      <div class="subtaskList">${subtasksHtml}</div>
    </div>
  `;
}

/**
 * Returns the HTML for the edit button.
 * @param {string} taskId - The ID of the task.
 * @returns {string} The HTML string for the edit button.
 */
function getEditButtonHtml(taskId) {
  return `<button class="edit-task-btn" data-task-id="${taskId}"><svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2 13.5V16H4.5L14.13 6.37L11.63 3.87L2 13.5ZM16.73 5.04C17.1 4.67 17.1 4.09 16.73 3.72L15.28 2.27C14.91 1.9 14.33 1.9 13.96 2.27L12.54 3.69L15.04 6.19L16.73 5.04Z" fill="currentColor"/></svg>Edit</button>`;
}
function getVerticalSeparator() {
  return `<span class="task-detail-separator" style="display:flex;align-items:center;"><svg width="1" height="24" viewBox="0 0 1 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="24" fill="#D1D1D1"/></svg></span>`;
}
function getDeleteButtonSvgPaths() {
  return (
    `<path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.47917 5.2875 0.2875C5.47917 0.47917 5.71667 0.716667 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.47917 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" fill="#2A3647"/>` +
    `<path d="M4 12.5H0.409091V0.863636H4.15909C5.28788 0.863636 6.25379 1.09659 7.05682 1.5625C7.85985 2.02462 8.47538 2.68939 8.90341 3.55682C9.33144 4.42045 9.54545 5.45455 9.54545 6.65909C9.54545 7.87121 9.32955 8.91477 8.89773 9.78977C8.46591 10.661 7.83712 11.3314 7.01136 11.8011C6.18561 12.267 5.18182 12.5 4 12.5ZM1.81818 11.25H3.90909C4.87121 11.25 5.66856 11.0644 6.30114 10.6932C6.93371 10.322 7.4053 9.79356 7.71591 9.10795C8.02652 8.42235 8.18182 7.60606 8.18182 6.65909C8.18182 5.7197 8.02841 4.91098 7.72159 4.23295C7.41477 3.55114 6.95644 3.02841 6.34659 2.66477C5.73674 2.29735 4.97727 2.11364 4.06818 2.11364H1.81818V11.25ZM15.3864 12.6818C14.5455 12.6818 13.8201 12.4962 13.2102 12.125C12.6042 11.75 12.1364 11.2273 11.8068 10.5568C11.4811 9.88258 11.3182 9.09848 11.3182 8.20455C11.3182 7.31061 11.4811 6.52273 11.8068 5.84091C12.1364 5.1553 12.5947 4.62121 13.1818 4.23864C13.7727 3.85227 14.4621 3.65909 15.25 3.65909C15.7045 3.65909 16.1534 3.73485 16.5966 3.88636C17.0398 4.03788 17.4432 4.28409 17.8068 4.625C18.1705 4.96212 18.4602 5.40909 18.6761 5.96591C18.892 6.52273 19 7.20833 19 8.02273V8.59091H12.2727V7.43182H17.6364C17.6364 6.93939 17.5379 6.5 17.3409 6.11364C17.1477 5.72727 16.8712 5.42235 16.5114 5.19886C16.1553 4.97538 15.7348 4.86364 15.25 4.86364C14.7159 4.86364 14.2538 4.99621 13.8636 5.26136C13.4773 5.52273 13.1799 5.86364 12.9716 6.28409C12.7633 6.70455 12.6591 7.1553 12.6591 7.63636V8.40909C12.6591 9.06818 12.7727 9.62689 13 10.0852C13.2311 10.5398 13.5511 10.8864 13.9602 11.125C14.3693 11.3598 14.8447 11.4773 15.3864 11.4773C15.7386 11.4773 16.0568 11.428 16.3409 11.3295C16.6288 11.2273 16.8769 11.0758 17.0852 10.875C17.2936 10.6705 17.4545 10.4167 17.5682 10.1136L18.8636 10.4773C18.7273 10.9167 18.4981 11.303 18.1761 11.6364C17.8542 11.9659 17.4564 12.2235 16.983 12.4091C16.5095 12.5909 15.9773 12.6818 15.3864 12.6818ZM22.3807 0.863636V12.5H21.0398V0.863636H22.3807ZM28.4957 12.6818C27.6548 12.6818 26.9295 12.4962 26.3196 12.125C25.7135 11.75 25.2457 11.2273 24.9162 10.5568C24.5904 9.88258 24.4276 9.09848 24.4276 8.20455C24.4276 7.31061 24.5904 6.52273 24.9162 5.84091C25.2457 5.1553 25.7041 4.62121 26.2912 4.23864C26.8821 3.85227 27.5715 3.65909 28.3594 3.65909C28.8139 3.65909 29.2628 3.73485 29.706 3.88636C30.1491 4.03788 30.5526 4.28409 30.9162 4.625C31.2798 4.96212 31.5696 5.40909 31.7855 5.96591C32.0014 6.52273 32.1094 7.20833 32.1094 8.02273V8.59091H25.3821V7.43182H30.7457C30.7457 6.93939 30.6473 6.5 30.4503 6.11364C30.2571 5.72727 29.9806 5.42235 29.6207 5.19886C29.2647 4.97538 28.8442 4.86364 28.3594 4.86364C27.8253 4.86364 27.3632 4.99621 26.973 5.26136C26.5866 5.52273 26.2893 5.86364 26.081 6.28409C25.8726 6.70455 25.7685 7.1553 25.7685 7.63636V8.40909C25.7685 9.06818 25.8821 9.62689 26.1094 10.0852C26.3404 10.5398 26.6605 10.8864 27.0696 11.125C27.4787 11.3598 27.9541 11.4773 28.4957 11.4773C28.848 11.4773 29.1662 11.428 29.4503 11.3295C29.7382 11.2273 29.9863 11.0758 30.1946 10.875C30.4029 10.6705 30.5639 10.4167 30.6776 10.1136L31.973 10.4773C31.8366 10.9167 31.6075 11.303 31.2855 11.6364C30.9635 11.9659 30.5658 12.2235 30.0923 12.4091C29.6188 12.5909 29.0866 12.6818 28.4957 12.6818ZM37.9446 3.77273V4.90909H33.4219V3.77273H37.9446ZM34.7401 1.68182H36.081V10C36.081 10.3788 36.1359 10.6629 36.2457 11.0379C36.5033 11.1629 36.6776 11.2273 36.8556 11.2879C37.0431 11.3182 37.2401 11.3182 37.3878 11.3182L37.831 11.25L38.1037 12.4545C38.0128 12.4886 37.8859 12.5227 37.723 12.5568C37.5601 12.5947 37.3537 12.6136 37.1037 12.6136C36.7249 12.6136 36.3537 12.5322 35.9901 12.3693C35.6302 12.2064 35.331 11.9583 35.0923 11.625C34.8575 11.2917 34.7401 10.8712 34.7401 10.3636V1.68182ZM43.527 12.6818C42.6861 12.6818 41.9607 12.4962 41.3509 12.125C40.7448 11.75 40.277 11.2273 39.9474 10.5568C39.6217 9.88258 39.4588 9.09848 39.4588 8.20455C39.4588 7.31061 39.6217 6.52273 39.9474 5.84091C40.277 5.1553 40.7353 4.62121 41.3224 4.23864C41.9134 3.85227 42.6027 3.65909 43.3906 3.65909C43.8452 3.65909 44.294 3.73485 44.7372 3.88636C45.1804 4.03788 45.5838 4.28409 45.9474 4.625C46.3111 4.96212 46.6009 5.40909 46.8168 5.96591C47.0327 6.52273 47.1406 7.20833 47.1406 8.02273V8.59091H40.4134V7.43182H45.777C45.777 6.93939 45.6785 6.5 45.4815 6.11364C45.2884 5.72727 45.0118 5.42235 44.652 5.19886C44.2959 4.97538 43.8755 4.86364 43.3906 4.863664C42.8565 4.86364 42.3944 4.99621 42.0043 5.26136C41.6179 5.52273 41.3205 5.86364 41.1122 6.28409C40.9039 6.70455 40.7997 7.1553 40.7997 7.63636V8.40909C40.7997 9.06818 40.9134 9.62689 41.1406 10.0852C41.3717 10.5398 41.6918 10.8864 42.1009 11.125C42.5099 11.3598 42.9853 11.4773 43.527 11.4773C43.8793 11.4773 44.1974 11.428 44.4815 11.3295C44.7694 11.2273 45.0175 11.0758 45.2259 10.875C45.4342 10.6705 45.5952 10.4167 45.7088 10.1136L47.0043 10.4773C46.8679 10.9167 46.6387 11.303 46.3168 11.6364C45.9948 11.9659 45.5971 12.2235 45.1236 12.4091C44.6501 12.5909 44.1179 12.6818 43.527 12.6818Z" fill="#2A3647"/>`
  );
}

/**
/**
 * Erstellt den HTML-String für den Löschen-Button einer Aufgabe.
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {string} Der HTML-String des Löschen-Buttons.
 */
function getDeleteButtonHtml(taskId) {
  return `
    <button class="delete-task-btn" data-task-id="${taskId}">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 7V13H8V7H6ZM10 7V13H12V7H10ZM4 15V5H14V15C14 15.55 13.55 16 13 16H5C4.45 16 4 15.55 4 15ZM16 3H13.5L12.71 2.21C12.53 2.03 12.28 1.92 12 1.92H6C5.72 1.92 5.47 2.03 5.29 2.21L4.5 3H2V5H16V3Z" fill="currentColor"/>
      </svg>
      Delete
    </button>
  `;
}

/**
 * Erstellt das HTML-Menü für eine Aufgabenkarte (Bearbeiten und Löschen).
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {string} Der HTML-String für das Kartenmenü.
 */
function getCardMenu(taskId) {
  return `
    <div class="cardMenu" style="display:flex;align-items:center;gap:16px;">
      ${getDeleteButtonHtml(taskId)}
      ${getVerticalSeparator()}
      ${getEditButtonHtml(taskId)}
    </div>
  `;
}

/**
 * Erstellt das vollständige HTML-Overlay für eine Aufgabe.
 * @param {object} task - Das Aufgabenobjekt, das angezeigt werden soll.
 * @param {string} taskId - Die ID der Aufgabe.
 * @returns {string} Der komplette HTML-String des Aufgaben-Overlays.
 */
export function getTaskOverlay(task, taskId) {
  if (!firebaseData?.contacts) return `<div class="task-overlay-error"></div>`;
  if (!task) return `<div class="task-overlay-error">Task data missing</div>`;
  const contactsObject = firebaseData.contacts;
  const formattedDeadline = formatDeadline(task.deadline ?? "");
  return `
    <main class="content-task">
      ${getTaskHeader(task)}
      ${getTaskDescription(task)}
      ${getTaskDueDate(formattedDeadline)}
      ${getTaskPriority(task)}
      ${getTaskAssignmentSection(task, contactsObject)}
      ${getTaskSubtasksSection(task)}${getCardMenu(taskId)}
    </main>
  `;
}
