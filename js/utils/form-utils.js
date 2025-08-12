/**
 * Extracts task data from the edit form.
 * @param {HTMLFormElement} form - The form element.
 * @param {object} contactsObj - The contacts object.
 * @param {object} taskToEdit - The original task object.
 * @returns {object} Extracted task data.
 */
export function extractTaskFormData(form, contactsObj, taskToEdit) {
  const title = form.querySelector("[name='title']")?.value || "";
  const description =
    form.querySelector("[name='task-description']")?.value || "";
  const deadline = form.querySelector("[name='datepicker']")?.value || "";
  let type = "";
  const selectedCategoryElem = form.querySelector("#selected-category");
  if (selectedCategoryElem) {
    type = selectedCategoryElem.textContent.trim();
  }
  let priority = "";
  const activePrioBtn = form.querySelector(".priority-btn.active");
  if (activePrioBtn) {
    priority = activePrioBtn.getAttribute("data-priority");
  }
  let assignedUsers = [];
  const assignedOptions = form.querySelectorAll(".contact-option.assigned");
  if (assignedOptions && contactsObj) {
    assignedUsers = Array.from(assignedOptions)
      .map((option) => {
        const name =
          option.getAttribute("data-name") || option.textContent.trim();
        return (
          Object.entries(contactsObj).find(
            ([id, contact]) => contact.name === name
          )?.[0] || null
        );
      })
      .filter(Boolean);
  }
  const subtaskInputs = form.querySelectorAll(".subtask-input");
  let totalSubtasks = Array.from(subtaskInputs)
    .map((input) => input.value.trim())
    .filter((text) => text !== "");
  let checkedSubtasks = Array.from(subtaskInputs).map((input) => input.checked);
  if (totalSubtasks.length === 0) {
    const subtaskTextNodes = form.querySelectorAll(".subtask-text");
    if (subtaskTextNodes.length > 0) {
      totalSubtasks = Array.from(subtaskTextNodes)
        .map((node) => node.textContent.trim())
        .filter((text) => text !== "");
    } else {
      const subtaskItemNodes = form.querySelectorAll(".subtask-item");
      totalSubtasks = Array.from(subtaskItemNodes)
        .map((node) => node.textContent.trim())
        .filter((text) => text !== "");
    }
    if (checkedSubtasks.length === 0) {
      checkedSubtasks = Array.from(form.querySelectorAll(".subtask-item")).map(
        (node) => node.classList.contains("completed")
      );
    }
    if (totalSubtasks.length === 0) {
      totalSubtasks = Array.isArray(taskToEdit.totalSubtasks)
        ? [...taskToEdit.totalSubtasks]
        : [];
      checkedSubtasks = Array.isArray(taskToEdit.checkedSubtasks)
        ? [...taskToEdit.checkedSubtasks]
        : [];
    }
  }
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
