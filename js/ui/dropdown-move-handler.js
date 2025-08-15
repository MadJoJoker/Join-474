
/**
 * Sets up dropdown menu listeners for a task card.
 * @param {HTMLElement} card - The task card DOM element.
 * @param {object} boardData - The board data object.
 * @param {function} handleDropdownClick - Function to handle dropdown click events.
 * @param {function} setupMoveTaskListeners - Function to setup move task listeners.
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
 * @param {Event} e - The click event.
 * @param {HTMLElement} dropdownMenu - The dropdown menu DOM element.
 * @param {HTMLElement} dropdownBtn - The dropdown button DOM element.
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
  const closeDropdown = (ev) => {
    if (!dropdownMenu.contains(ev.target) && ev.target !== dropdownBtn) {
      dropdownMenu.classList.remove("show");
      document.removeEventListener("click", closeDropdown);
    }
  };
  setTimeout(() => document.addEventListener("click", closeDropdown), 0);
}

/**
 * Sets up listeners for moving tasks between columns.
 * @param {HTMLElement} dropdownMenu - The dropdown menu DOM element.
 * @param {object} boardData - The board data object.
 * @param {function} handleMoveTask - Function to handle moving tasks.
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
 * @param {Event} ev - The click event.
 * @param {object} boardData - The board data object.
 * @param {string} direction - The direction to move ('up' or 'down').
 * @param {function} CWDATA - Function to update the board data.
 */
export function handleMoveTask(ev, boardData, direction, CWDATA) {
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
    CWDATA({ [taskId]: task }, boardData);
    window.location.href = "board-site.html";
  }
}
