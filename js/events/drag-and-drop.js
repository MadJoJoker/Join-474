/**
 * @file drag-and-drop.js
 */


import { updateTaskColumnData } from '../ui/render-board.js';

let currentDraggedElement = null;


export function initDragAndDrop() {
    console.log('Drag-and-Drop-Initialisierung gestartet.');

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

    console.log(`Drag-and-Drop für ${taskCards.length} Aufgabenkarten und ${taskColumns.length} Spalten eingerichtet.`);
}

/**
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
function dragStart(event) {
    currentDraggedElement = event.target;
    event.dataTransfer.setData('text/plain', currentDraggedElement.id);
    console.log(`Drag gestartet für Aufgabe: ${currentDraggedElement.id}`);

    setTimeout(() => {
        currentDraggedElement.classList.add('is-dragging');
    }, 0);
}

/**
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
function dragEnd(event) {
    console.log(`Drag beendet für Aufgabe: ${event.target.id}`);
    event.target.classList.remove('is-dragging');
    currentDraggedElement = null;

    document.querySelectorAll('.task-column').forEach(column => {
        column.classList.remove('drag-over');
    });
}

/**
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
function allowDrop(event) {
    event.preventDefault();

    if (event.target.classList.contains('task-column') && !event.target.classList.contains('drag-over')) {
        event.target.classList.add('drag-over');
    }
}

/**
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
function dragLeave(event) {
    if (event.target.classList.contains('task-column')) {
        event.target.classList.remove('drag-over');
    }
}

/**
 * @param {DragEvent} event - Das Drag-Ereignis.
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
            console.log(`Aufgabe ${taskId} von ${oldColumnId} nach ${newColumnId} verschoben.`);

            await updateTaskColumnData(taskId, newColumnId);
        }
    }
    if (targetColumn) {
        targetColumn.classList.remove('drag-over');
    }
}
