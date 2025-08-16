import { loadFirebaseData } from "../../main.js";
import {
  showFindTaskInfoNoFoundMsg,
  hideFindTaskInfoNoFoundMsg,
} from "../pages/board-initializer.js";

/**
 * Filters task cards based on the title input and displays matching results.
 * @returns {Promise<void>} Resolves when filtering is complete.
 */
export async function filterTaskCardsByTitle() {
  const searchTerm = getSearchTerm();
  const loadedData = await loadFirebaseData();
  if (!isValidLoadedData(loadedData)) return;
  const allTaskCards = document.querySelectorAll(".task-card");
  const placeholders = document.querySelectorAll(".no-tasks-placeholder");
  handlePlaceholders(searchTerm, placeholders);
  const foundCount = filterAndDisplayTaskCards(
    allTaskCards,
    loadedData,
    searchTerm
  );
  handleNoFoundMsg(foundCount);
}

/**
 * Gets the search term from the input field.
 * @returns {string} The search term in lowercase.
 */
function getSearchTerm() {
  return document.getElementById("find-task").value.toLowerCase();
}

/**
 * Checks if loaded data is valid for filtering.
 * @param {object} loadedData - The loaded data object.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidLoadedData(loadedData) {
  if (!loadedData || !loadedData.tasks) {
    console.warn(
      "Filtering tasks (loadedData.tasks) are not available, or data has not been loaded."
    );
    return false;
  }
  return true;
}

/**
 * Handles the display of placeholders based on the search term.
 * @param {string} searchTerm - The search term.
 * @param {NodeList} placeholders - The placeholder elements.
 */
function handlePlaceholders(searchTerm, placeholders) {
  if (searchTerm.length > 0) {
    placeholders.forEach((ph) => (ph.style.display = "none"));
  } else {
    placeholders.forEach((ph) => {
      const parent = ph.parentElement;
      const visibleCards = parent.querySelectorAll(
        '.task-card:not([style*="display: none"])'
      );
      ph.style.display = visibleCards.length === 0 ? "" : "none";
    });
  }
}

/**
 * Handles showing or hiding the 'no found' message.
 * @param {number} foundCount - The number of found tasks.
 */
function handleNoFoundMsg(foundCount) {
  if (foundCount === 0) {
    showFindTaskInfoNoFoundMsg();
  } else {
    hideFindTaskInfoNoFoundMsg();
  }
}

/**
 * Filters task cards based on the search term and displays matches.
 * @param {NodeList} allTaskCards - All task card DOM elements to filter.
 * @param {object} loadedData - The loaded data object containing all tasks.
 * @param {string} searchTerm - The search term to filter task titles by.
 * @returns {number} The number of found tasks.
 */
function filterAndDisplayTaskCards(allTaskCards, loadedData, searchTerm) {
  let found = 0;
  allTaskCards.forEach((cardElement) => {
    if (isTaskMatch(cardElement, loadedData, searchTerm)) {
      cardElement.style.display = "";
      found++;
    } else {
      cardElement.style.display = "none";
    }
  });
  return found;
}

/**
 * Checks if a task card matches the search term.
 * @param {HTMLElement} cardElement - The task card DOM element.
 * @param {object} loadedData - The loaded data object containing all tasks.
 * @param {string} searchTerm - The search term to filter task titles by.
 * @returns {boolean} True if the card matches, false otherwise.
 */
function isTaskMatch(cardElement, loadedData, searchTerm) {
  const taskId = cardElement.id;
  const taskData = loadedData.tasks[taskId];
  if (taskData && (taskData.title || taskData.description)) {
    const taskTitle = (taskData.title || "").toLowerCase();
    const taskDescription = (taskData.description || "").toLowerCase();
    return (
      taskTitle.includes(searchTerm) || taskDescription.includes(searchTerm)
    );
  }
  return false;
}
