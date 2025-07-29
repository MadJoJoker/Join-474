
import { loadFirebaseData } from '../../main.js';
import { showFindTaskInfoNoFoundMsg } from '../pages/board-initializer.js';

export async function filterTaskCardsByTitle() {
    console.log("filterTaskCardsByTitle aufgerufen");

  const searchTerm = document.getElementById('find-task').value.toLowerCase();

  const loadedData = await loadFirebaseData();

  if (!loadedData || !loadedData.tasks) {
    console.warn("Aufgaben zum Filtern (loadedData.tasks) sind nicht verfügbar, oder Daten wurden nicht geladen.");
    return;
  }

  const allTaskCards = document.querySelectorAll('.task-card');
  let found = 0;
  allTaskCards.forEach(cardElement => {
    const taskId = cardElement.id;
    const taskData = loadedData.tasks[taskId];
    if (taskData && taskData.title) {
      const taskTitle = taskData.title.toLowerCase();
      if (taskTitle.includes(searchTerm)) {
        cardElement.style.display = '';
        found++;
      } else {
        cardElement.style.display = 'none';
      }
    } else {
      cardElement.style.display = 'none';
    }
  });
  if (found === 0) {
    showFindTaskInfoNoFoundMsg();
  }
}
