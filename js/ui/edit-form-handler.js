// Handler für Cancel/Edit/Submit im Edit-Formular
import { extractTaskFormData } from "../utils/form-utils.js";
import { getFormattedDate } from "../utils/date-utils.js";
import { CWDATA } from "../data/task-to-firbase.js";
import { closeSpecificOverlay } from "../events/overlay-handler.js";
import { renderDetailOverlay } from "./render-card-events.js";
/**
 * Sets up the cancel button for the edit form overlay.
 * @param {HTMLElement} container - The container element for the edit form.
 * @param {string} taskToEditId - The ID of the task being edited.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
export function setupCancelEditBtn(
  container,
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  const cancelEditBtn = container.querySelector(".cancel-btn");
  if (cancelEditBtn) {
    cancelEditBtn.onclick = () => {
      closeSpecificOverlay("overlay-task-detail-edit");
      renderDetailOverlay(taskToEditId, boardData, updateBoardFunction);
    };
  }
}

/**
 * Sets up the submit listener for the edit form.
 * @param {HTMLElement} container - The container element for the edit form.
 * @param {object} taskToEdit - The task object being edited.
 * @param {string} taskToEditId - The ID of the task being edited.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 */
export function setupTaskEditFormListener(
  container,
  taskToEdit,
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  const taskEditForm = container.querySelector("#add-task-form");
  if (taskEditForm) {
    taskEditForm.addEventListener("submit", (formEvent) =>
      handleTaskEditFormSubmit(
        formEvent,
        taskEditForm,
        taskToEdit,
        taskToEditId,
        boardData,
        updateBoardFunction
      )
    );
  }
}

/**
 * Handles the submit event for the edit form.
 * @param {Event} formEvent - The submit event.
 * @param {HTMLFormElement} taskEditForm - The edit form element.
 * @param {object} taskToEdit - The task object being edited.
 * @param {string} taskToEditId - The ID of the task being edited.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @returns {Promise<void>} Resolves when the form is processed.
 */
export async function handleTaskEditFormSubmit(
  formEvent,
  taskEditForm,
  taskToEdit,
  taskToEditId,
  boardData,
  updateBoardFunction
) {
  if (!isSubmitEvent(formEvent)) return;
  formEvent.preventDefault();
  const fetchData = window.firebaseData || boardData;
  const contactsObj = fetchData && fetchData.contacts ? fetchData.contacts : {};
  const formData = extractTaskFormData(taskEditForm, contactsObj, taskToEdit);
  const editTaskObjekt = buildEditTaskObject(formData, taskToEdit);
  const currentTaskId =
    taskEditForm.getAttribute("data-task-id") || taskToEditId;
  await CWDATA({ [currentTaskId]: editTaskObjekt }, fetchData);
  closeSpecificOverlay("overlay-task-detail-edit");
  if (updateBoardFunction) await updateBoardFunction();
  renderDetailOverlay(taskToEditId, boardData, updateBoardFunction);
}

function isSubmitEvent(formEvent) {
  const submitter = formEvent.submitter;
  if (!submitter || submitter.type !== "submit") {
    formEvent.preventDefault();
    return false;
  }
  return true;
}

function buildEditTaskObject(formData, taskToEdit) {
  const subtasksCompleted = formData.checkedSubtasks.filter(Boolean).length;
  const updatedAt = getFormattedDate();
  return {
    assignedUsers: Array.isArray(formData.assignedUsers)
      ? formData.assignedUsers
      : [],
    boardID: "board-1",
    checkedSubtasks: formData.checkedSubtasks,
    columnID: taskToEdit.columnID || "inProgress",
    createdAt: taskToEdit.createdAt || updatedAt,
    deadline: formData.deadline,
    description: formData.description,
    priority: formData.priority,
    subtasksCompleted,
    title: formData.title,
    totalSubtasks: formData.totalSubtasks,
    type: formData.type,
    updatedAt,
  };
}
