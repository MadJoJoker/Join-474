import { loadFirebaseData } from '../../main.js';
import { initDragAndDrop } from '../events/drag-and-drop.js';

// NEU: Lokale Speicherung der Aufgaben-Daten.
// Dies wird von initializeBoard und renderTasksByColumn befüllt.
let tasksData = {};

/**
 * Erstellt das HTML für eine einzelne Aufgabenkarte.
 * @param {Object} boardData - Das gesamte Board-Datenobjekt (tasks, contacts).
 * @param {string} taskID - Die eindeutige ID der Aufgabe.
 * @returns {string} Das HTML für die Aufgabenkarte.
 */
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

    // Füge die taskID als 'id' Attribut zum task-card Div hinzu
    return `
        <div class="task-card" id="${taskID}">
            <div class="category-tag ${categoryClass}">${type}</div>
            <div class="task-content">
                <h3 class="task-title">${title}</h3>
                <p class="task-description">${description}</p>
                ${total > 0 ? `
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${percent}%;"></div>
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

/**
 * Rendert Aufgaben in die entsprechenden Spalten auf dem Board.
 * @param {Object} boardData - Das gesamte Board-Datenobjekt von Firebase.
 */
function renderTasksByColumn(boardData) {
    if (!boardData || !boardData.tasks || !boardData.contacts) {
        console.error("Fehlende Daten im Board.");
        return;
    }

    // NEU: Aktualisiere die lokale tasksData mit den geladenen Daten
    tasksData = boardData.tasks;

    let validColumns = ['to-do', 'in-progress', 'await-feedback', 'done'];

    // Leere alle Spalten zuerst
    validColumns.forEach(colID => {
        let container = document.getElementById(colID);
        if (container) {
            container.innerHTML = '';
            // Füge den Platzhalter hinzu, falls die Spalte leer ist
            const placeholder = document.createElement('div');
            placeholder.className = 'no-tasks-placeholder';
            placeholder.textContent = 'No tasks to do'; // Passe den Text an
            container.appendChild(placeholder);
        }
    });

    let tasksByColumn = {};
    validColumns.forEach(col => { tasksByColumn[col] = []; });

    Object.entries(tasksData).forEach(([taskID, task]) => { // Nutze tasksData
        if (!task || typeof task.columnID === 'undefined') return;

        let colID = task.columnID;

        // Mapping für Spalten-IDs (falls Firebase-IDs von DOM-IDs abweichen)
        let colMapping = {
            todo: 'to-do',
            inProgress: 'in-progress',
            awaitFeedback: 'await-feedback',
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

    // Sortiere Aufgaben innerhalb jeder Spalte nach Erstellungsdatum
    validColumns.forEach(colID => {
        tasksByColumn[colID].sort((a, b) => a.createdAt - b.createdAt);
    });

    // Füge die Aufgaben in die Spalten ein
    validColumns.forEach(colID => {
        let container = document.getElementById(colID);
        if (!container) return;

        // Entferne den "No tasks"-Platzhalter, wenn Aufgaben hinzugefügt werden
        const placeholder = container.querySelector('.no-tasks-placeholder');
        if (placeholder && tasksByColumn[colID].length > 0) {
            placeholder.remove();
        } else if (!placeholder && tasksByColumn[colID].length === 0) {
            // Falls der Platzhalter aus irgendeinem Grund fehlt und die Spalte leer ist, füge ihn hinzu
            const newPlaceholder = document.createElement('div');
            newPlaceholder.className = 'no-tasks-placeholder';
            newPlaceholder.textContent = 'No tasks to do';
            container.appendChild(newPlaceholder);
        }

        tasksByColumn[colID].forEach(({ taskID }) => {
            container.insertAdjacentHTML('beforeend', createSimpleTaskCard(boardData, taskID));
        });
    });

    // Initialisiere Drag-and-Drop, nachdem alle Aufgaben gerendert wurden
    initDragAndDrop();
    console.log('Board gerendert und Drag-and-Drop initialisiert.');
}

/**
 * Aktualisiert die Spalten-ID einer Aufgabe in der LOKALEN Datenstruktur.
 * Der Datenbank-Upload ist auskommentiert und zeigt nur einen Konsolen-Log.
 * @param {string} taskId - Die ID der zu aktualisierenden Aufgabe.
 * @param {string} newColumnId - Die neue Spalten-ID (z.B. 'to-do', 'in-progress').
 */
export async function updateTaskColumnData(taskId, newColumnId) {
    console.log(`Versuche, Aufgabe ${taskId} in LOKALEN Daten auf Spalte ${newColumnId} zu aktualisieren.`);

    // Überprüfe, ob die Aufgabe in der lokalen Datenstruktur existiert
    if (tasksData[taskId]) {
        // Aktualisiere die columnID in der lokalen tasksData
        let oldColumnId = tasksData[taskId].columnID;

        // Passe die columnID für die lokale Datenstruktur an, falls sie von den DOM-IDs abweicht
        let firebaseColumnId;
        if (newColumnId === 'to-do') firebaseColumnId = 'todo';
        else if (newColumnId === 'in-progress') firebaseColumnId = 'inProgress';
        else if (newColumnId === 'await-feedback') firebaseColumnId = 'awaitFeedback';
        else if (newColumnId === 'done') firebaseColumnId = 'done';
        else {
            console.error(`Unbekannte neue Spalten-ID für lokale Aktualisierung: ${newColumnId}`);
            return;
        }

        tasksData[taskId].columnID = firebaseColumnId;
        console.log(`LOKALE Daten für Aufgabe ${taskId} von ${oldColumnId} auf ${firebaseColumnId} aktualisiert.`);

        // --- Datenbank-Upload-Teil (auskommentiert) ---
        console.log(`INFO: Datenbank-Upload für Aufgabe ${taskId} mit neuer Spalte ${firebaseColumnId} ist momentan AUSKOMMENTIERT.`);
        /*
        try {
            // HIER WÜRDE DEINE LOGIK ZUM SPEICHERN IN FIREBASE HINKOMMEN.
            // Beispiel: Wenn du eine Funktion in storage.js hast, die lokale Daten synchronisiert:
            // import { saveBoardDataToFirebase } from './storage.js'; // Oder wo auch immer deine Speicherfunktion ist
            // await saveBoardDataToFirebase(tasksData); // Oder nur die geänderte Aufgabe

            // Oder wenn du direkt eine Firebase-Update-Funktion hast:
            // import { updateFirebaseData } from '../../main.js'; // Annahme: updateFirebaseData ist in main.js verfügbar
            // await updateFirebaseData(`tasks/${taskId}/columnID`, firebaseColumnId);

            console.log(`Aufgabe ${taskId} erfolgreich in Firebase aktualisiert.`);
            // Nach dem Speichern in Firebase könntest du das Board neu laden,
            // um sicherzustellen, dass alles synchron ist (optional, wenn Firebase-Listener aktiv sind)
            // await initializeBoard();
        } catch (error) {
            console.error(`Fehler beim Speichern der Aufgabe ${taskId} in Firebase:`, error);
        }
        */
        // --- Ende Datenbank-Upload-Teil ---

    } else {
        console.warn(`Aufgabe mit ID ${taskId} nicht in der LOKALEN Datenstruktur gefunden.`);
    }
}

/**
 * Initialisiert das Board durch Laden der Firebase-Daten und Rendern der Aufgaben.
 */
async function initializeBoard() {
    const firebaseBoardData = await loadFirebaseData();
    if (firebaseBoardData) {
        renderTasksByColumn(firebaseBoardData);
    } else {
        console.error("Board konnte nicht geladen werden, da keine Firebase-Daten verfügbar sind.");
    }
}

// Initialisiere das Board, wenn der DOM vollständig geladen ist
document.addEventListener('DOMContentLoaded', initializeBoard);
