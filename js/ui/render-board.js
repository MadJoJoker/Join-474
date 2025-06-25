function createSimpleTaskCard(board, taskID) {
  if (!board || !taskID) return '';

  let task = board.tasks[taskID]; // unveränderlich
  let contacts = board.contacts; // unveränderlich
  if (!task || !contacts) return '';

  let title = task.title || 'Kein Titel'; // unveränderlich
  let description = (task.description || task["description"] || 'Keine Beschreibung').trim(); // unveränderlich
  let type = task.type || 'Unbekannt'; // unveränderlich

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

  let prio = task.priority || 'medium';
  let icon = `../assets/icons/property/${prio}.svg`; // unveränderlich
  let prioText = prio === 'low' ? 'Niedrig' : prio === 'urgent' ? 'Urgent' : 'Mittel';

  return `
    <div class="task-card">
      <div class="task-category ${categoryClass}">${type}</div>
      <h3 class="task-title">${title}</h3>
      <p class="task-description">${description}</p>
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

function renderTasksByColumn(board) {
  if (!board || !board.tasks || !board.contacts) {
    console.error("Fehlende Daten im Board.");
    return;
  }

  let validColumns = ['to-do', 'in-progress', 'await-feedback', 'done']; // unveränderlich

  validColumns.forEach(colID => {
    let container = document.getElementById(colID);
    if (container) container.innerHTML = '';
  });

  let tasksByColumn = {};
  validColumns.forEach(col => { tasksByColumn[col] = []; });

  Object.entries(board.tasks).forEach(([taskID, task]) => {
    if (!task) return;
    let colID = task.columnID;

    let colMapping = {
      todo: 'to-do',
      inProgress: 'in-progress',
      review: 'await-feedback',
      done: 'done'
    }; // unveränderlich

    let mappedColID = colMapping[colID];
    if (!mappedColID || !validColumns.includes(mappedColID)) return;

    tasksByColumn[mappedColID].push({ taskID, createdAt: new Date(task.createdAt) });
  });

  validColumns.forEach(colID => {
    tasksByColumn[colID].sort((a, b) => a.createdAt - b.createdAt);
  });

  validColumns.forEach(colID => {
    let container = document.getElementById(colID);
    if (!container) return;

    let html = '';
    tasksByColumn[colID].forEach(({ taskID }) => {
      html += createSimpleTaskCard(board, taskID);
    });
    container.innerHTML = html;
  });
}

let board = {

  "boards": {
    "board1": {
      "columns": {
        "done": {
          "name": "Done",
          "order": 3
        },
        "inProgress": {
          "name": "In Progress",
          "order": 1
        },
        "review": {
          "name": "Review",
          "order": 2
        },
        "todo": {
          "name": "To Do",
          "order": 0
        }
      },
      "name": "Demo Board"
    }
  },
  "contacts": {
    "contact1": {
      "assignedTo": [
        "demo-user-1-uid"
      ],
      "avatarColor": "--lila",
      "email": "Mathias@voigt-vital.de",
      "initials": "MV",
      "name": "Mathias Voigt",
      "phone": "0151-17276037"
    },
    "contact10": {
      " initials": "FF",
      " name": "Frederike Fuchs-Schreck",
      "assignedTo": [
        "contact9",
        "contact11"
      ],
      "avatarColor": "",
      "email": "Fuchs-Schreck@Hühnerstall.de",
      "phone": "030-33223"
    },
    "contact11": {
      " initials": "GG",
      " name": "Gisela Gänsehaut",
      "assignedTo": {
        "0": "contact9",
        "contact10": ""
      },
      "avatarColor": "",
      "email": "Gänsehaut@hotmail.de",
      "phone": "+49 151 56 57 89"
    },
    "contact2": {
      "assignedTo": [
        "contact1"
      ],
      "avatarColor": "--orange",
      "email": "claudia@wick.test.de",
      "initials": "CW",
      "name": "Claudia Wick",
      "phone": "02042-1234567"
    },
    "contact3": {
      "assignedTo": [
        "contact1",
        "contact2"
      ],
      "avatarColor": "--yellow",
      "email": "dominik.rapp@join.de",
      "initials": "DR",
      "name": "Dominik Rapp",
      "phone": "0151-34434"
    },
    "contact4": {
      "assignedTo": [
        "contact2"
      ],
      "avatarColor": "--red",
      "email": "eugen-birich@join.de",
      "initials": "EB",
      "name": "Eugen Birich",
      "phone": "0201-787878"
    },
    "contact5": {
      "assignedTo": [
        "contact1",
        "contact7"
      ],
      "avatarColor": "--petrol",
      "email": "anna.schmidt@example.de",
      "initials": "AS",
      "name": "Anna Schmidt",
      "phone": "0152-46578"
    },
    "contact6": {
      "assignedTo": [
        "contact3",
        "contact8"
      ],
      "avatarColor": "--menthol",
      "email": "peter.pauli@Hamburg.de",
      "initials": "PP",
      "name": "Peter Paulsen",
      "phone": "0201-223344"
    },
    "contact7": {
      "assignedTo": [
        "contact4",
        "contact5"
      ],
      "avatarColor": "--darkViolet",
      "email": "s.meier@demo.au",
      "initials": "SM",
      "name": "Sara Meier",
      "phone": "+49152-234968"
    },
    "contact8": {
      "assignedTo": [
        "contact2",
        "contact3"
      ],
      "avatarColor": "--pink",
      "email": "Fritz.W@lter.de",
      "initials": "FW",
      "name": "Fritz Walter",
      "phone": "0800-234567"
    },
    "contact9": {
      " initials": "MM",
      " name": "Monika Möwenherz",
      "assignedTo": [
        "contact10",
        "contact11"
      ],
      "avatarColor": "",
      "email": "M.M@join.de",
      "phone": "0208-64646"
    }
  },
  "tasks": {
    "priority": "medium",
    "task1": {
      "assignedUsers": [
        "contact1",
        "contact2",
        "contact3",
        "contact4"
      ],
      "boardID": "board1",
      "columnID": "inProgress",
      "createdAt": [
        "2025-06-20T10:00:00Z"
      ],
      "description": "Nach Erstellung des Kanban Projektes und der Überprüfung der Checkliste wird das Projekt eingereicht",
      "subtasksCompleted": 1,
      "title": "Join abgeben",
      "totalSubtask": [
        1,
        "Auf Projektseite hochgeladen"
      ],
      "type": "User Story",
      "updatedAt": [
        "2025-06-20T12:00:00Z",
        "2025-06-20T15:00:00Z"
      ]
    },
    "task2": {
      "assignedUsers": [
        "contact4",
        "contact3",
        "contact2"
      ],
      "boardID": "board1",
      "columnID": "review",
      "createdAt": "2025-06-19T14:30:00Z",
      "description": "Es gilt, GitHub zu überprüfen und alle Branches in den 'main'-Branch zu mergen, damit alle Änderungen dort konsolidiert sind",
      "priority": "medium",
      "subtasksCompleted": 1,
      "title": "Finale Github  Kontrolle",
      "totalSubtasks": [
        "Jeder hat alles gepusht",
        "All Pulls sind abgeschlossen"
      ],
      "type": "User Story",
      "updatedAt": [
        "2025-06-20T10:00:00Z"
      ]
    },
    "task3": {
      " description": "Alle Bugs und Design Probleme werden in einer Checkliste zusammengefasst um sie im Anschluss abzuarbeiten.",
      "assignedUsers": [
        "contact9"
      ],
      "boardID": "board1",
      "columnID": "done",
      "createdAt": "2025-06-12T14:30:00Z",
      "priority": "urgent",
      "subtaskCompleted": "5",
      "title": "Punchliste erstellen",
      "totalSubtask": [
        "Claudias´ Liste erstellen",
        "Eugens Liste erstellen",
        "Dominiks Liste erstellen",
        "Mathias´ Liste  erstellen",
        "Alle Listen zusammenführen und sortieren"
      ],
      "type": "Technical Task",
      "updatedAt": [
        "2025-06-16T11:30:00Z"
      ]
    },
    "task4": {
      " description": "Der Content wird über eine Funktion dynamisch erzeugt, funktioniert diese nicht wird der Content auf keiner Seite angezeigt",
      "assignedUsers": [
        "contact10"
      ],
      "boardID": "board1",
      "columnID": "review",
      "createdAt": "2025-06-22T14:30:00Z",
      "priority": "urgent",
      "subtaskCompleted": "0",
      "title": "Fetch des Contents prüfen",
      "type": "Technical Task",
      "updatedAt": [
        "2025-07-19T14:30:00Z"
      ]
    },
    "task5": {
      " description": "In dieser Besprechung wird festgelegt in welcher Reihenfolge die Aufgaben der Punch Liste erledigt werden",
      "assignedUsers": [
        "contact4"
      ],
      "boardID": "board1",
      "columnID": "inProgress",
      "createdAt": "2025-06-19T17:30:00Z",
      "priority": "low",
      "subtaskCompleted": "1",
      "title": "Besprechung der Aufgaben Priorisierung ",
      "totalSubtask": [
        "Punch Liste erstellen"
      ],
      "type": "Meeting",
      "updatedAt": [
        "2025-06-19T19:30:00Z"
      ]
    },
    "task6": {
      " description": "In dieser Besprechung soll geklärt werden wie lange jeder für seine Aufgaben braucht damit wir einen Abgabetermin eingrenzen können",
      "assignedUsers": [
        "contact3"
      ],
      "boardID": "board1",
      "columnID": "done",
      "createdAt": "2025-06-09T14:30:00Z",
      "priority": "medium",
      "subtaskCompleted": "4",
      "title": "Besprechung zum Abgabetermin",
      "totalSubtask": [
        "Vorgespräch Mathias",
        "Vorgespräch Claudia",
        "Vorgespräch Eugen",
        "Vorgespräch Dominik"
      ],
      "type": "Meeting",
      "updatedAt": [
        "2025-06-11T09:30:00Z"
      ]
    }
  },
  "users": {
    "demo-user-1-uid": {
      "associatedContacts": [
        "contact1",
        "contact2",
        "contact3",
        "contact4",
        "contact5",
        "contact6",
        "contact7",
        "contact8"
      ],
      "displayName": "Demo User1",
      "email": "demo1@example.de"
    }
  }
};

renderTasksByColumn(board);
