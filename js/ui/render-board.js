import { loadFirebaseData } from '../../main.js';

async function initBoard() {
  const data = await loadFirebaseData();

  if (data) {
    console.log('Daten im render-board:', data);
  } else {
    console.error('Keine Firebase-Daten verfügbar!');
  }
}

window.addEventListener('DOMContentLoaded', initBoard);


function renderBoard(data) {
  const tasks = data.tasks;
  const columnMap = {
    todo: 'to-do',
    inProgress: 'in-progress',
    review: 'await-feedback',
    done: 'done',
  };

  for (const id in tasks) {
    const task = tasks[id];
    const columnId = columnMap[task.columnID];

    if (!columnId) continue;

    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `
      <strong>${task.title}</strong>
      <p>${task.description || 'Keine Beschreibung'}</p>
    `;

    document.getElementById(columnId)?.appendChild(card);
  }
}
renderBoard(window.currentFirebaseData);
