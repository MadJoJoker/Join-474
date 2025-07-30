import { loadFirebaseData } from "../../main.js";
import { showFindTaskInfoNoFoundMsg } from "../pages/board-initializer.js";

/** Filters task cards based on the title input.
 * Searches for tasks that match the input value and displays them.
 */
export async function filterTaskCardsByTitle() {
  const searchTerm = document.getElementById("find-task").value.toLowerCase();
  const loadedData = await loadFirebaseData();

  if (!loadedData || !loadedData.tasks) {
    console.warn("Filtering tasks (loadedData.tasks) are not available, or data has not been loaded.");
    return;
  }

  const allTaskCards = document.querySelectorAll(".task-card");
  let found = 0;
  const foundCount = filterAndDisplayTaskCards(allTaskCards, loadedData, searchTerm);
  if (found === 0) {
    showFindTaskInfoNoFoundMsg();
  }
}

/** Filters task cards based on the search term.
 * Displays only those cards whose title includes the search term.
 */
function filterAndDisplayTaskCards(allTaskCards, loadedData, searchTerm) {
  let found = 0;
  allTaskCards.forEach((cardElement) => {
    const taskId = cardElement.id;
    const taskData = loadedData.tasks[taskId];
    if (taskData && taskData.title) {
      const taskTitle = taskData.title.toLowerCase();
      if (taskTitle.includes(searchTerm)) {
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
