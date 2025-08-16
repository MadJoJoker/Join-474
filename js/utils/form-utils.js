/**
 * Extracts task data from the edit form.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} contactsObj - The contacts object.
 * @param {object} taskToEdit - The original task object.
 * @returns {object} The extracted task data.
 */

/**
 * Extracts the title from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted title.
 */
function extractTitle(form) {
  return form.querySelector("[name='title']")?.value || "";
}

/**
 * Extracts the description from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted description.
 */
function extractDescription(form) {
  return form.querySelector("[name='task-description']")?.value || "";
}

/**
 * Extracts the deadline from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted deadline.
 */
function extractDeadline(form) {
  return form.querySelector("[name='datepicker']")?.value || "";
}

/**
 * Extracts the type/category from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted type/category.
 */
function extractType(form) {
  const selectedCategoryElem = form.querySelector("#selected-category");
  return selectedCategoryElem ? selectedCategoryElem.textContent.trim() : "";
}

/**
 * Extracts the priority from the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string} The extracted priority.
 */
function extractPriority(form) {
  const activePrioBtn = form.querySelector(".priority-btn.active");
  return activePrioBtn ? activePrioBtn.getAttribute("data-priority") : "";
}

/**
 * Extracts assigned user IDs from the form using the contacts object.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} contactsObj - The contacts object.
 * @returns {string[]} Array of assigned user IDs.
 */
function extractAssignedUsers(form, contactsObj) {
  const assignedOptions = form.querySelectorAll(".contact-option.assigned");
  if (assignedOptions && contactsObj) {
    return Array.from(assignedOptions)
      .map((option) => {
        const id = option.getAttribute("data-id");
        if (id && contactsObj[id]) return id;
        const name =
          option.getAttribute("data-name") || option.textContent.trim();
        return (
          Object.entries(contactsObj).find(
            ([cid, contact]) => contact.name === name
          )?.[0] || null
        );
      })
      .filter(Boolean);
  }
  return [];
}

/**
 * Extracts subtasks and their checked status from the form.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} taskToEdit - The original task object (for fallback values).
 * @returns {{ totalSubtasks: string[], checkedSubtasks: boolean[] }} Subtasks and their checked status.
 */
/**
 * Gets subtasks from input fields in the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string[]} Array of subtask strings.
 */
function getSubtasksFromInputs(form) {
  return Array.from(form.querySelectorAll(".subtask-input"))
    .map((input) => input.value.trim())
    .filter((text) => text !== "");
}

/**
 * Gets subtasks from text nodes in the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string[]} Array of subtask strings.
 */
function getSubtasksFromTextNodes(form) {
  return Array.from(form.querySelectorAll(".subtask-text"))
    .map((node) => node.textContent.trim())
    .filter((text) => text !== "");
}

/**
 * Gets subtasks from item nodes in the form.
 * @param {HTMLFormElement} form - The form element.
 * @returns {string[]} Array of subtask strings.
 */
function getSubtasksFromItems(form) {
  return Array.from(form.querySelectorAll(".subtask-item"))
    .map((node) => node.textContent.trim())
    .filter((text) => text !== "");
}

function extractSubtasks(form, taskToEdit) {
  let totalSubtasks = getSubtasksFromInputs(form);
  let checkedSubtasks = Array.from(form.querySelectorAll(".subtask-text")).map(
    (node) => node.classList.contains("completed")
  );
  if (totalSubtasks.length === 0) {
    totalSubtasks = getSubtasksFromTextNodes(form);
    if (totalSubtasks.length === 0) totalSubtasks = getSubtasksFromItems(form);
    if (totalSubtasks.length === 0) {
      totalSubtasks = Array.isArray(taskToEdit.totalSubtasks)
        ? [...taskToEdit.totalSubtasks]
        : [];
      checkedSubtasks = Array.isArray(taskToEdit.checkedSubtasks)
        ? [...taskToEdit.checkedSubtasks]
        : [];
    }
  }
  return { totalSubtasks, checkedSubtasks };
}

/**
 * Extracts all relevant task data from the form.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} contactsObj - The contacts object.
 * @param {object} taskToEdit - The original task object.
 * @returns {object} The extracted task data.
 */
export function extractTaskFormData(form, contactsObj, taskToEdit) {
  const title = extractTitle(form);
  const description = extractDescription(form);
  const deadline = extractDeadline(form);
  const type = extractType(form);
  const priority = extractPriority(form);
  const assignedUsers = extractAssignedUsers(form, contactsObj);
  const { totalSubtasks, checkedSubtasks } = extractSubtasks(form, taskToEdit);
  return {
    title,
    description,
    deadline,
    type,
    priority,
    assignedUsers,
    totalSubtasks,
    checkedSubtasks,
  };
}
