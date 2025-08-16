
/**
 * Sets up click listener for a task card.
 * @param {HTMLElement} card - The task card DOM element.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @param {function} handleCardClick - Function to handle card click events.
 */
export function setupCardClickListener(
  card,
  boardData,
  updateBoardFunction,
  handleCardClick
) {
  const oldClickListener = card.getAttribute("data-has-click-listener");
  if (oldClickListener) {
    card.removeEventListener("click", card._currentClickListener);
  }
  const newClickListener = (e) =>
    handleCardClick(e, card, boardData, updateBoardFunction);
  card.addEventListener("click", newClickListener);
  card.setAttribute("data-has-click-listener", "true");
  card._currentClickListener = newClickListener;
}

/**
 * Handles click event for a task card.
 * @param {Event} e - The click event.
 * @param {HTMLElement} card - The task card DOM element.
 * @param {object} boardData - The board data object.
 * @param {function} updateBoardFunction - Callback to update the board.
 * @param {HTMLElement} detailOverlayElement - The detail overlay DOM element.
 * @param {function} renderDetailOverlay - Function to render the detail overlay.
 */
export function handleCardClick(
  e,
  card,
  boardData,
  updateBoardFunction,
  detailOverlayElement,
  renderDetailOverlay
) {
  if (
    e.target.classList.contains("assigned-initials-circle") ||
    e.target.closest(".priority-icon") ||
    e.target.closest(".dropdown-menu-board-site-btn")
  )
    return;
  const taskId = card.id;
  const task = boardData.tasks[taskId];
  if (!task || !detailOverlayElement) return;
  renderDetailOverlay(taskId, boardData, updateBoardFunction);
}

