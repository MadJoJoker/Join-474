// Edit overlay and form handling functions

/**
 * Renders the edit overlay for a task.
 * @param {string} taskToEditId - The ID of the task to edit.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @param {function} closeSpecificOverlay - Function to close a specific overlay.
 * @param {function} openSpecificOverlay - Function to open a specific overlay.
 * @param {HTMLElement} editOverlayElement - The edit overlay DOM element.
 * @param {function} renderEditFormHtml - Function to render the edit form HTML.
 * @param {function} setupEditFormModules - Function to setup modules for the edit form.
 * @param {function} setupCancelEditBtn - Function to setup the cancel button in the edit form.
 * @param {function} setupTaskEditFormListener - Function to setup the submit listener for the edit form.
 */
export function renderEditOverlay(
  taskToEditId,
  boardData,
  updateBoardFunction,
  closeSpecificOverlay,
  openSpecificOverlay,
  editOverlayElement,
  renderEditFormHtml,
  setupEditFormModules,
  setupCancelEditBtn,
  setupTaskEditFormListener
) {
  closeSpecificOverlay("overlay-task-detail");
  openSpecificOverlay("overlay-task-detail-edit");
  if (!editOverlayElement) return;
  const taskToEdit = boardData.tasks[taskToEditId];
  const taskEditContainer = editOverlayElement.querySelector(
    "#task-edit-container"
  );
  if (taskEditContainer) {
    renderEditFormHtml(taskEditContainer, taskToEdit);
    setupEditFormModules(taskEditContainer, taskToEdit, boardData);
    setupCancelEditBtn(
      taskEditContainer,
      taskToEditId,
      boardData,
      updateBoardFunction
    );
    setupTaskEditFormListener(
      taskEditContainer,
      taskToEdit,
      taskToEditId,
      boardData,
      updateBoardFunction
    );
  }
}

// ... weitere Funktionen wie renderEditFormHtml, setupEditFormModules, setupCancelEditBtn, setupTaskEditFormListener, handleTaskEditFormSubmit können hier analog ausgelagert werden ...
