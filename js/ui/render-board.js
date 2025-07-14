import { loadFirebaseData } from '../../main.js';
import { initDragAndDrop } from '../events/drag-and-drop.js';

let tasksData = {};

function createSimpleTaskCard(boardData, taskID) {
    if (!boardData || !taskID) return '';

    let task = boardData.tasks[taskID];
    let contacts = boardData.contacts;
    if (!task || !contacts) return '';

    let title = task.title || 'Kein Titel';
    // DEBUG-LOG: Überprüfe den Wert der Beschreibung hier
    let description = (task.description || task["description"] || 'Keine Beschreibung').trim();
    console.log(`DEBUG: Aufgabe ID: ${taskID}, Beschreibung: "${description}"`);

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
            avatars += `<div class="assigned-initials-circle" style="background-color: var(--grey);" title="Unbekannt">?</div>`;
            continue;
        }
        let initials = (c.initials || '').trim();
        let name = (c.name || '').trim();
        let colorRaw = c.avatarColor || 'default';
        let colorStyle = colorRaw.startsWith('--') ? `var(${colorRaw})` : colorRaw;
        avatars += `<div class="assigned-initials-circle" style="background-color: ${colorStyle};" title="${name}">${initials}</div>`;
    }

    let prio = task.priority;
    let icon;
    let prioText;

    if (prio === 'low') {
        icon = `../assets/icons/property/low.svg`;
        prioText = 'Niedrig';
    } else if (prio === 'medium') {
        icon = `../assets/icons/property/medium.svg`;
        prioText = 'Mittel';
    } else if (prio === 'urgent') {
        icon = `../assets/icons/property/urgent.svg`;
        prioText = 'Dringend';
    } else {
        console.warn('Unbekannte Priorität gefunden:', prio);
        icon = `../assets/icons/property/default.svg`;
        prioText = 'Unbekannt';
    }

    return `
        <div class="task-card" id="${taskID}">
            <div class="task-category ${categoryClass}">${type}</div>
            <div class="task-content">
                <h3 class="task-title">${title}</h3>
                <p class="task-description">${description}</p>
                ${total > 0 ? `
                    <div class="progress-container">
                        <div class="progress-bar-track">
                            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                        </div>
                        <span class="subtasks-text">${subText}</span>
                    </div>` : ''}
            </div>
            <div class="task-footer">
                <div class="assigned-users">${avatars}</div>
                <div class="priority-icon">
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

    tasksData = boardData.tasks;

    let validColumns = ['to-do', 'in-progress', 'await-feedback', 'done'];

    let tasksByColumn = {};
    validColumns.forEach(col => { tasksByColumn[col] = []; });

    Object.entries(tasksData).forEach(([taskID, task]) => {
        if (!task || typeof task.columnID === 'undefined') return;

        let colID = task.columnID;

        let colMapping = {
            toDo: 'to-do',
            inProgress: 'in-progress',
            review: 'await-feedback',
            done: 'done'
        };
        let mappedColID = colMapping[colID];
        if (!mappedColID || !validColumns.includes(mappedColID)) {
            console.warn(`Aufgabe ${taskID} hat unbekannte oder ungültige columnID: ${colID}`);
            return;
        }

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

        const existingTaskCards = container.querySelectorAll('.task-card');
        existingTaskCards.forEach(card => card.remove());

        let placeholder = container.querySelector('.no-tasks-placeholder');
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.className = 'no-tasks-placeholder';
            placeholder.textContent = 'No tasks to do';
            container.appendChild(placeholder);
        }

        if (tasksByColumn[colID].length > 0) {
            placeholder.style.display = 'none';
            tasksByColumn[colID].forEach(({ taskID }) => {
                container.insertAdjacentHTML('beforeend', createSimpleTaskCard(boardData, taskID));
            });
        } else {
            placeholder.style.display = 'block';
        }
    });

    initDragAndDrop();
    console.log('Board gerendert und Drag-and-Drop initialisiert.');
}

export async function updateTaskColumnData(taskId, newColumnId) {
    console.log(`Versuche, Aufgabe ${taskId} in LOKALEN Daten auf Spalte ${newColumnId} zu aktualisieren.`);

    if (tasksData[taskId]) {
        let oldColumnId = tasksData[taskId].columnID;

        let firebaseColumnId;
        if (newColumnId === 'to-do') firebaseColumnId = 'toDo';
        else if (newColumnId === 'in-progress') firebaseColumnId = 'inProgress';
        else if (newColumnId === 'await-feedback') firebaseColumnId = 'review';
        else if (newColumnId === 'done') firebaseColumnId = 'done';
        else {
            console.error(`Unbekannte neue Spalten-ID für lokale Aktualisierung: ${newColumnId}`);
            return;
        }

        tasksData[taskId].columnID = firebaseColumnId;
        console.log(`LOKALE Daten für Aufgabe ${taskId} von ${oldColumnId} auf ${firebaseColumnId} aktualisiert.`);

        console.log(`INFO: Datenbank-Upload für Aufgabe ${taskId} mit neuer Spalte ${firebaseColumnId} ist momentan AUSKOMMENTIERT.`);
        /*
        try {
            // HIER WÜRDE DEINE LOGIK ZUM SPEICHERN IN FIREBASE HINKOMMEN.
            // Beispiel: await updateFirebaseData(`tasks/${taskId}/columnID`, firebaseColumnId);
            console.log(`Aufgabe ${taskId} erfolgreich in Firebase aktualisiert.`);
        } catch (error) {
            console.error(`Fehler beim Speichern der Aufgabe ${taskId} in Firebase:`, error);
        }
        */

        await initializeBoard();

    } else {
        console.warn(`Aufgabe mit ID ${taskId} nicht in der LOKALEN Datenstruktur gefunden.`);
    }
}

async function initializeBoard() {
    const firebaseBoardData = await loadFirebaseData();
    if (firebaseBoardData) {
        renderTasksByColumn(firebaseBoardData);
    } else {
        console.error("Board konnte nicht geladen werden, da keine Firebase-Daten verfügbar sind.");
    }
}

document.addEventListener('DOMContentLoaded', initializeBoard);
