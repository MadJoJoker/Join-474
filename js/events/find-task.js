import { loadFirebaseData } from "../../main.js";
import {
  showFindTaskInfoNoFoundMsg,
  hideFindTaskInfoNoFoundMsg,
} from "../pages/board-initializer.js";

/** Filters task cards based on the title input.
 * Searches for tasks that match the input value and displays them.
 */
export async function filterTaskCardsByTitle() {
  const searchTerm = document.getElementById("find-task").value.toLowerCase();
  const loadedData = await loadFirebaseData();

  if (!loadedData || !loadedData.tasks) {
    console.warn(
      "Filtering tasks (loadedData.tasks) are not available, or data has not been loaded."
    );
    return;
  }

  const allTaskCards = document.querySelectorAll(".task-card");
  const placeholders = document.querySelectorAll(".no-tasks-placeholder");
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

  let found = 0;
  const foundCount = filterAndDisplayTaskCards(
    allTaskCards,
    loadedData,
    searchTerm
  );
  if (foundCount === 0) {
    showFindTaskInfoNoFoundMsg();
  } else {
    hideFindTaskInfoNoFoundMsg();
  }
}

/**
 * Filters task cards based on the search term.
 * Displays only those cards whose title includes the search term.
 * @param {NodeList} allTaskCards - All task card DOM elements to filter.
 * @param {Object} loadedData - The loaded data object containing all tasks.
 * @param {string} searchTerm - The search term to filter task titles by.
 * @returns {number} The number of found tasks.
 */
function filterAndDisplayTaskCards(allTaskCards, loadedData, searchTerm) {
  let found = 0;
  allTaskCards.forEach((cardElement) => {
    const taskId = cardElement.id;
    const taskData = loadedData.tasks[taskId];
    if (taskData && (taskData.title || taskData.description)) {
      const taskTitle = (taskData.title || "").toLowerCase();
      const taskDescription = (taskData.description || "").toLowerCase();
      if (
        taskTitle.includes(searchTerm) ||
        taskDescription.includes(searchTerm)
      ) {
        cardElement.style.display = "";
        found++;
      } else {
        cardElement.style.display = "none";
      }
    } else {
      cardElement.style.display = "none";
    }
  });
  return found;
}
