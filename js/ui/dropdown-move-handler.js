/**
 * Sets up dropdown menu listeners for a task card.
 * @param {HTMLElement} card The task card DOM element.
 * @param {Object} boardData The board data object containing all tasks and columns.
 * @param {Function} handleDropdownClick Function to handle dropdown click events.
 * @param {Function} setupMoveTaskListeners Function to set up move task listeners.
 */
export function setupDropdownMenuListeners(
  card,
  boardData,
  handleDropdownClick,
  setupMoveTaskListeners
) {
  const dropdownBtn = card.querySelector(".dropdown-menu-board-site-btn");
  const dropdownMenu = card.querySelector(".dropdown-menu-board-site");
  if (!dropdownBtn || !dropdownMenu) return;
  dropdownBtn.addEventListener("click", (e) =>
    handleDropdownClick(e, dropdownMenu, dropdownBtn)
  );
  setupMoveTaskListeners(dropdownMenu, boardData);
}

/**
 * Handles click event for dropdown menu button.
 * @param {Event} e The click event.
 * @param {HTMLElement} dropdownMenu The dropdown menu DOM element.
 * @param {HTMLElement} dropdownBtn The dropdown button DOM element.
 */
export function handleDropdownClick(e, dropdownMenu, dropdownBtn) {
  if (window.innerWidth > 1025) return;
  e.stopPropagation();
  dropdownMenu.classList.toggle("show");
  document
    .querySelectorAll(".dropdown-menu-board-site.show")
    .forEach((menu) => {
      if (menu !== dropdownMenu) menu.classList.remove("show");
    });
  const card = dropdownBtn.closest(".task-card");
  if (card) {
    card.style.position = "relative";
    dropdownMenu.style.position = "absolute";
    dropdownMenu.style.top = "0";
    dropdownMenu.style.left = "0";
    dropdownMenu.style.zIndex = "10000";
    dropdownMenu.style.width = `${card.offsetWidth}px`;
  }
}

/**
 * Sets up listeners for moving tasks between columns.
 * @param {HTMLElement} dropdownMenu The dropdown menu DOM element.
 * @param {Object} boardData The board data object containing all tasks and columns.
 * @param {Function} handleMoveTask Function to handle moving tasks.
 */
export function setupMoveTaskListeners(
  dropdownMenu,
  boardData,
  handleMoveTask
) {
  const moveUp = dropdownMenu.querySelector(".move-task-up");
  const moveDown = dropdownMenu.querySelector(".move-task-down");
  if (moveUp)
    moveUp.addEventListener("click", (ev) =>
      handleMoveTask(ev, boardData, "up")
    );
  if (moveDown)
    moveDown.addEventListener("click", (ev) =>
      handleMoveTask(ev, boardData, "down")
    );
}

/**
 * Handles moving a task up or down between columns.
 * @param {Event} ev The click event.
 * @param {Object} boardData The board data object containing all tasks and columns.
 * @param {string} direction The direction to move ('up' or 'down').
 * @param {Function} CWDATA Function to update the board data.
 */
export async function handleMoveTask(ev, boardData, direction, CWDATA) {
  ev.preventDefault();
  ev.stopPropagation();
  const taskId = ev.currentTarget.dataset.taskId;
  const task = boardData.tasks[taskId];
  if (!task) return;
  const columnOrder = ["toDo", "inProgress", "review", "done"];
  const currentIdx = columnOrder.indexOf(task.columnID);
  let newIdx = direction === "up" ? currentIdx - 1 : currentIdx + 1;
  if (newIdx >= 0 && newIdx < columnOrder.length) {
    task.columnID = columnOrder[newIdx];
    await CWDATA({ [taskId]: task }, boardData);
    window.location.href = "board-site.html";
  }
}
