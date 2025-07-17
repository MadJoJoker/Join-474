import { loadFirebaseData } from '../../main.js';
import { initDragAndDrop } from '../events/drag-and-drop.js';
import { createSimpleTaskCard } from './render-card.js';


let tasksData = {};


/**
 * Validiert das gesamte Board-Datenobjekt.
 * @param {object} boardData - Das Board-Datenobjekt, das 'tasks' und 'contacts' enthalten sollte.
 * @returns {boolean} True, wenn die Daten gültig sind, sonst false.
 */
function validateRenderBoardData(boardData) {
    if (!boardData || !boardData.tasks || !boardData.contacts) {
        console.error("Fehlende Daten im Board.");
        return false;
    }
    return true;
}

const VALID_COLUMNS = ['to-do', 'in-progress', 'await-feedback', 'done'];
const COLUMN_MAPPING = {
    toDo: 'to-do',
    inProgress: 'in-progress',
    review: 'await-feedback',
    done: 'done'
};

/**
 * Initialisiert ein leeres Objekt für die Gruppierung von Tasks nach Spalte.
 * @returns {object} Ein Objekt, dessen Schlüssel die Spalten-IDs sind und die Werte leere Arrays.
 */
function initializeTasksByColumn() {
    const tasksByColumn = {};
    VALID_COLUMNS.forEach(col => { tasksByColumn[col] = []; });
    return tasksByColumn;
}

/**
 * Verarbeitet eine einzelne Task und fügt sie der entsprechenden Spalte hinzu.
 * @param {string} taskID - Die ID der Task.
 * @param {object} task - Das Task-Objekt mit der Spalten-ID und Erstellungsdatum.
 * @param {object} tasksByColumn - Das Objekt, in dem Tasks nach Spalte gruppiert werden.
 */
function processTaskForColumn(taskID, task, tasksByColumn) {
    const colID = task.columnID;
    const mappedColID = COLUMN_MAPPING[colID];
    if (!mappedColID || !VALID_COLUMNS.includes(mappedColID)) {
        console.warn(`Task ${taskID} has unknown or invalid columnID: ${colID}`);
        return;
    }
    const createdAtDate = Array.isArray(task.createdAt) ? new Date(task.createdAt[0]) : new Date(task.createdAt);
    tasksByColumn[mappedColID].push({ taskID, createdAt: createdAtDate });
}

/**
 * Gruppiert alle Tasks nach ihrer Spalte.
 * @param {object} tasks - Ein Objekt aller Tasks, indiziert nach Task-ID.
 * @returns {object} Ein Objekt, das Tasks nach ihren Spalten-IDs gruppiert.
 */
function groupTasksByColumn(tasks) {
    const tasksByColumn = initializeTasksByColumn();
    Object.entries(tasks).forEach(([taskID, task]) => {
        if (task && typeof task.columnID !== 'undefined') {
            processTaskForColumn(taskID, task, tasksByColumn);
        }
    });
    return tasksByColumn;
}

/**
 * Sortiert die gruppierten Tasks innerhalb jeder Spalte nach ihrem Erstellungsdatum.
 * @param {object} tasksByColumn - Das Objekt, das Tasks nach Spalten gruppiert enthält.
 */
function sortGroupedTasks(tasksByColumn) {
    VALID_COLUMNS.forEach(colID => {
        tasksByColumn[colID].sort((a, b) => a.createdAt - b.createdAt);
    });
}

/**
 * Löscht alle vorhandenen Task-Karten in einem Spalten-Container und gibt ihn zurück.
 * @param {string} colID - Die ID des Spalten-Containers (z.B. 'to-do').
 * @returns {HTMLElement|null} Das HTML-Element des Containers oder null, wenn nicht gefunden.
 */
function clearAndPrepareColumnContainer(colID) {
    const container = document.getElementById(colID);
    if (!container) return null;
    container.querySelectorAll('.task-card').forEach(card => card.remove());
    return container;
}

/**
 * Ruft einen Platzhalter für "keine Tasks" ab oder erstellt ihn, falls er nicht existiert.
 * @param {HTMLElement} container - Der Spalten-Container, in dem der Platzhalter gesucht/erstellt wird.
 * @returns {HTMLElement} Das HTML-Element des Platzhalters.
 */
function getOrCreatePlaceholder(container) {
    let placeholder = container.querySelector('.no-tasks-placeholder');
    if (!placeholder) {
        placeholder = document.createElement('div');
        placeholder.className = 'no-tasks-placeholder';
        placeholder.textContent = 'No tasks to do';
        container.appendChild(placeholder);
    }
    return placeholder;
}

/**
 * Rendert die Task-Karten für eine bestimmte Spalte.
 * @param {HTMLElement} container - Der HTML-Container der Spalte.
 * @param {Array<object>} tasksInColumn - Ein Array von Task-Objekten, die zu dieser Spalte gehören.
 * @param {object} boardData - Das gesamte Board-Datenobjekt.
 */
function renderColumnTasks(container, tasksInColumn, boardData) {
    const placeholder = getOrCreatePlaceholder(container);
    if (tasksInColumn.length > 0) {
        placeholder.style.display = 'none';
        tasksInColumn.forEach(({ taskID }) => {
            container.insertAdjacentHTML('beforeend', createSimpleTaskCard(boardData, taskID));
        });
    } else {
        placeholder.style.display = 'block';
    }
}

/**
 * Rendert alle Tasks, gruppiert nach ihren Spalten, auf dem Board.
 * @param {object} boardData - Das gesamte Board-Datenobjekt.
 */
function renderTasksByColumn(boardData) {
    if (!validateRenderBoardData(boardData)) return;
    tasksData = boardData.tasks;
    const groupedTasks = groupTasksByColumn(tasksData);
    sortGroupedTasks(groupedTasks);

    VALID_COLUMNS.forEach(colID => {
        const container = clearAndPrepareColumnContainer(colID);
        if (container) {
            renderColumnTasks(container, groupedTasks[colID], boardData);
        }
    });
    initDragAndDrop();
    console.log('Board gerendert und Drag-and-Drop initialisiert.');
}

/**
 * Mappt eine Client-seitige Spalten-ID auf eine Firebase-spezifische Spalten-ID.
 * @param {string} clientColumnId - Die Client-seitige Spalten-ID (z.B. 'to-do').
 * @returns {string|undefined} Die entsprechende Firebase-Spalten-ID oder undefined, wenn nicht gefunden.
 */
function mapClientToFirebaseColumnId(clientColumnId) {
    const firebaseColumnMapping = {
        'to-do': 'toDo',
        'in-progress': 'inProgress',
        'await-feedback': 'review',
        'done': 'done'
    };
    const firebaseId = firebaseColumnMapping[clientColumnId];
    if (!firebaseId) {
        console.error(`Unknown client column ID for Firebase mapping: ${clientColumnId}`);
    }
    return firebaseId;
}

/**
 * Aktualisiert die Spalten-ID einer Task in den lokalen Daten.
 * @param {string} taskId - Die ID der zu aktualisierenden Task.
 * @param {string} firebaseColumnId - Die neue Spalten-ID im Firebase-Format.
 */
function updateLocalTaskColumn(taskId, firebaseColumnId) {
    const oldColumnId = tasksData[taskId].columnID;
    tasksData[taskId].columnID = firebaseColumnId;
    console.log(`Local data for task ${taskId} updated from ${oldColumnId} to ${firebaseColumnId}.`);
}

/**
 * Simuliert oder löst ein Firebase-Update für die Spalten-ID einer Task aus.
 * @param {string} taskId - Die ID der Task, die aktualisiert werden soll.
 * @param {string} firebaseColumnId - Die neue Spalten-ID im Firebase-Format.
 */
async function triggerFirebaseUpdate(taskId, firebaseColumnId) {
    console.log(`INFO: Database upload for task ${taskId} with new column ${firebaseColumnId} is currently commented out.`);
   
}

/**
 * Aktualisiert die Spalten-Daten einer Task lokal und versucht ein Firebase-Update.
 * @param {string} taskId - Die ID der Task, deren Spalte aktualisiert werden soll.
 * @param {string} newColumnId - Die neue Spalten-ID im Client-Format.
 */
export async function updateTaskColumnData(taskId, newColumnId) {
    console.log(`Attempting to update task ${taskId} to column ${newColumnId} in LOCAL data.`);
    if (!tasksData[taskId]) {
        console.warn(`Task with ID ${taskId} not found in local data structure.`);
        return;
    }
    const firebaseColumnId = mapClientToFirebaseColumnId(newColumnId);
    if (!firebaseColumnId) return;

    updateLocalTaskColumn(taskId, firebaseColumnId);
    await triggerFirebaseUpdate(taskId, firebaseColumnId);
    await initializeBoard();
}

/**
 * Lädt die Board-Daten von Firebase und rendert das Board.
 */
async function loadAndRenderBoard() {
    const firebaseBoardData = await loadFirebaseData();
    if (firebaseBoardData) {
        renderTasksByColumn(firebaseBoardData);
    } else {
        console.error("Board could not be loaded as no Firebase data is available.");
    }
}

/**
 * Initialisiert das Board beim Laden der Seite.
 */
async function initializeBoard() {
    await loadAndRenderBoard();
}

document.addEventListener('DOMContentLoaded', initializeBoard);
