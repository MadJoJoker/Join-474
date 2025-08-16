/**
 * Sets up modules for the edit form (priority, dropdowns, date picker, subtasks).
 * @param {HTMLElement} container - The container element for the edit form.
 * @param {object} taskToEdit - The task object to edit.
 * @param {object} boardData - The board data object.
 */
export function setupEditFormModules(container, taskToEdit, boardData) {
  setupPriorityModule(container, taskToEdit);
  setupDropdownModule(container, taskToEdit, boardData);
  setupDatePickerModule(container);
  setupSubtaskModule(container, taskToEdit);
}

function setupPriorityModule(container, taskToEdit) {
  import("../events/priorety-handler.js").then((mod) => {
    mod.initPriorityButtons();
    const prio = taskToEdit.priority || "medium";
    const prioBtn = container.querySelector(
      `.priority-btn[data-priority="${prio}"]`
    );
    if (prioBtn) mod.setPriority(prioBtn, prio);
    mod.setButtonIconsMobile();
    if (!window._hasSetButtonIconsMobileListener) {
      window.addEventListener("resize", mod.setButtonIconsMobile);
      window._hasSetButtonIconsMobileListener = true;
    }
  });
}

function setupDropdownModule(container, taskToEdit, boardData) {
  import("../events/dropdown-menu-auxiliary-function.js").then(async (mod) => {
    await mod.initDropdowns(Object.values(boardData.contacts), container);
    await mod.setCategoryFromTaskForCard(taskToEdit.type);
    await mod.setAssignedContactsFromTaskForCard(taskToEdit.assignedUsers);
  });
}

function setupDatePickerModule(container) {
  import("../templates/add-task-template.js").then((mod) => {
    if (mod.initDatePicker) mod.initDatePicker(container);
  });
}

function setupSubtaskModule(container, taskToEdit) {
  import("../events/subtask-handler.js").then((mod) => {
    import("../utils/subtask-utils.js").then(({ extractSubtasksFromTask }) => {
      mod.addedSubtasks.length = 0;
      extractSubtasksFromTask(taskToEdit).forEach((st) =>
        mod.addedSubtasks.push({ ...st })
      );
      mod.initSubtaskManagementLogic(container);
      mod.renderSubtasks();
    });
  });
}
