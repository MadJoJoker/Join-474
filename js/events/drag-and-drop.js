import { CWDATA } from '../data/task-to-firbase.js';
import { updateTaskColumnData } from '../ui/render-board.js';

let currentDraggedElement = null;

/**
 * Initialisiert Drag-and-Drop-Funktionalität für Task-Karten und Spalten.
 */
export function initDragAndDrop() {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(taskCard => {
        taskCard.setAttribute('draggable', 'true');
        taskCard.addEventListener('dragstart', dragStart);
        taskCard.addEventListener('dragend', dragEnd);
    });

    const taskColumns = document.querySelectorAll('.task-column');
    taskColumns.forEach(column => {
        column.addEventListener('dragover', allowDrop);
        column.addEventListener('dragleave', dragLeave);
        column.addEventListener('drop', drop);
    });
}

/**
 * Wird ausgelöst, wenn eine Task-Karte gezogen wird.
 * @param {DragEvent} event
 */
function dragStart(event) {
    currentDraggedElement = event.target;
    event.dataTransfer.setData('text/plain', currentDraggedElement.id);
    setTimeout(() => {
        currentDraggedElement.classList.add('is-dragging');
    }, 0);
}

/**
 * Wird ausgelöst, wenn das Ziehen einer Task-Karte endet.
 * @param {DragEvent} event
 */
function dragEnd(event) {
    event.target.classList.remove('is-dragging');
    currentDraggedElement = null;
    document.querySelectorAll('.task-column').forEach(column => {
        column.classList.remove('drag-over');
    });
    CWDATA();
}

/**
 * Ermöglicht das Ablegen von Elementen in eine Spalte.
 * @param {DragEvent} event
 */
function allowDrop(event) {
    event.preventDefault();
    if (event.target.classList.contains('task-column') && !event.target.classList.contains('drag-over')) {
        event.target.classList.add('drag-over');
    }
}

/**
 * Wird ausgelöst, wenn ein Element den Dropbereich verlässt.
 * @param {DragEvent} event
 */
function dragLeave(event) {
    if (event.target.classList.contains('task-column')) {
        event.target.classList.remove('drag-over');
    }
}

/**
 * Wird ausgelöst, wenn eine Task-Karte in eine neue Spalte gezogen wird.
 * @param {DragEvent} event
 */
async function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(taskId);
    const targetColumn = event.target.closest('.task-column');

    if (draggedElement && targetColumn) {
        const newColumnId = targetColumn.id;
        const oldColumnId = draggedElement.closest('.task-column').id;

        if (newColumnId !== oldColumnId) {
            targetColumn.appendChild(draggedElement);
            await updateTaskColumnData(taskId, newColumnId);
        }
    }

    if (targetColumn) {
        targetColumn.classList.remove('drag-over');
    }
}
