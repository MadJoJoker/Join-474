
import { loadFirebaseData } from '../../main.js';
export async function filterTaskCardsByTitle() {
    console.log("filterTaskCardsByTitle aufgerufen");

  const searchTerm = document.getElementById('find-task').value.toLowerCase();

  const loadedData = await loadFirebaseData();

  if (!loadedData || !loadedData.tasks) {
    console.warn("Aufgaben zum Filtern (loadedData.tasks) sind nicht verfügbar, oder Daten wurden nicht geladen.");
    return;
  }

  const allTaskCards = document.querySelectorAll('.task-card');

  allTaskCards.forEach(cardElement => {
    /** @param {HTMLElement} cardElement */
    const taskId = cardElement.id;
    const taskData = loadedData.tasks[taskId];

    if (taskData && taskData.title) {
      const taskTitle = taskData.title.toLowerCase();
      if (taskTitle.includes(searchTerm)) {
        cardElement.style.display = '';
      } else {
        cardElement.style.display = 'none';
      }
    } else {
      cardElement.style.display = 'none';
    }
  });
}
