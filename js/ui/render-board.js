

import { loadFirebaseData } from '../../main.js';
function createSimpleTaskCard(boardData, taskID) {
  if (!boardData || !taskID) return '';

  let task = boardData.tasks[taskID];
  let contacts = boardData.contacts;
  if (!task || !contacts) return '';

  let title = task.title || 'Kein Titel';
  let description = (task.description || task["description"] || 'Keine Beschreibung').trim();
  let type = task.type || 'Unbekannt';
  let categoryClass = 'category-default';
  if (type === 'User Story') categoryClass = 'category-user-story';
  else if (type === 'Technical Task') categoryClass = 'category-technical-task';
  else if (type === 'Meeting') categoryClass = 'category-meeting';

  let done = parseInt(task.subtasksCompleted || task.subtaskCompleted || 0, 10);

  let totalSubtasksArray = task.totalSubtask || task.totalSubtasks;
  let total = Array.isArray(totalSubtasksArray)
    ? totalSubtasksArray.length
    : parseInt(totalSubtasksArray || 0, 10);

  let percent = total > 0 ? (done / total) * 100 : 0;
  let subText = total > 0 ? `${done}/${total} Subtasks` : 'Keine Unteraufgaben';

  let avatars = '';
  let users = Array.isArray(task.assignedUsers) ? task.assignedUsers : [];
  for (let i = 0; i < users.length; i++) {
    let id = users[i];
    let c = contacts[id];
    if (!c) {
      avatars += `<div class="avatar avatar-color-default" title="Unbekannt">?</div>`;
      continue;
    }
    let initials = (c.initials || '').trim();
    let name = (c.name || '').trim();
    let colorRaw = c.avatarColor || 'default';
    let color = colorRaw.replace(/^--/, '') || 'default';
    avatars += `<div class="avatar avatar-color-${color}" title="${name}">${initials}</div>`;
  }

 let prio = task.priority;
  let icon; // Hier deklarieren wir 'icon'

  // Hier stellen wir sicher, dass der Dateiname im Pfad mit dem tatsächlichen Dateinamen übereinstimmt
  if (prio === 'low') {
      icon = `../../assets/icons/property/low.svg`;
  } else if (prio === 'medium') {
      // KORREKTUR: Der Dateiname ist 'medium.svg', nicht 'medium-priority.svg'
      icon = `../../assets/icons/property/medium.svg`;
  } else if (prio === 'urgent') {
      icon = `../../assets/icons/property/urgent.svg`;
  } else {
      // Optional: Ein Fallback-Pfad, falls 'priority' einen unerwarteten Wert hat
      console.warn('Unbekannte Priorität gefunden:', prio);
      icon = `../../assets/icons/property/default.svg`; // Stelle sicher, dass du ein 'default.svg' hast oder wähle einen anderen Fallback
  }

  // Übersetzung des Prioritätstextes
  let prioText;
  if (prio === 'low') {
    prioText = 'Niedrig';
  } else if (prio === 'medium') {
    prioText = 'Mittel';
  } else if (prio === 'urgent') {
    prioText = 'Dringend'; // Habe 'urgent' auch übersetzt, um konsistent zu sein
  } else {
    prioText = 'Unbekannt';
  }


  return `
    <div class="task-card">
      <div class="task-category ${categoryClass}">${type}</div>
      <h3 class="task-title">${title}</h3>
      <p class="task-description">${description}</p>Thecnicaal Task
      <div class="task-progress-bar">
        <div class="task-progress-fill" style="width:${percent}%;"></div>
      </div>
      <div class="task-subtasks-count">${subText}</div>
      <div class="task-footer">
        <div class="assigned-users-avatars">${avatars}</div>
        <div class="task-priority-icon">
          <img src="${icon}" alt="${prioText}" title="${prioText}">
        </div>
      </div>
    </div>
  `;
}

function renderTasksByColumn(boardData) {
  if (!boardData || !boardData.tasks || !boardData.contacts) {
    console.error("Fehlende Daten im Board.");
    return;
  }

  let validColumns = ['to-do', 'in-progress', 'await-feedback', 'done'];

  validColumns.forEach(colID => {
    let container = document.getElementById(colID);
    if (container) container.innerHTML = '';
  });

  let tasksByColumn = {};
  validColumns.forEach(col => { tasksByColumn[col] = []; });

  Object.entries(boardData.tasks).forEach(([taskID, task]) => {

    if (!task || typeof task.columnID === 'undefined') return;

    let colID = task.columnID;

    let colMapping = {
      todo: 'to-do',
      inProgress: 'in-progress',
      review: 'await-feedback',
      done: 'done'
    };

    let mappedColID = colMapping[colID];
    if (!mappedColID || !validColumns.includes(mappedColID)) return;


    let createdAtDate;
    if (Array.isArray(task.createdAt)) {
      createdAtDate = new Date(task.createdAt[0]);
    } else {
      createdAtDate = new Date(task.createdAt);
    }

    tasksByColumn[mappedColID].push({ taskID, createdAt: createdAtDate });
  });

  validColumns.forEach(colID => {
    tasksByColumn[colID].sort((a, b) => a.createdAt - b.createdAt);
  });

  validColumns.forEach(colID => {
    let container = document.getElementById(colID);
    if (!container) return;

    let html = '';
    tasksByColumn[colID].forEach(({ taskID }) => {
      html += createSimpleTaskCard(boardData, taskID);
    });
    container.innerHTML = html;
  });
}

async function initializeBoard() {
  const firebaseBoardData = await loadFirebaseData();
  if (firebaseBoardData) {
    renderTasksByColumn(firebaseBoardData);
  } else {
    console.error("Board konnte nicht geladen werden, da keine Firebase-Daten verfügbar sind.");
  }
}

initializeBoard();
