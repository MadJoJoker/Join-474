import { CWDATA } from '../data/task-to-firbase.js';
import { updateTaskColumnData } from '../ui/render-board.js';

let currentDraggedElement = null;

/** * Initializes the drag-and-drop functionality for task cards.
 * Adds event listeners for drag start, drag end, drag over, drag leave, and drop events.
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

/** * Handles the drag start event.
 * Sets the current dragged element and adds a class for styling.
 * @param {DragEvent} event
 */
function dragStart(event) {
    currentDraggedElement = event.target;
    event.dataTransfer.setData('text/plain', currentDraggedElement.id);
    setTimeout(() => {
        currentDraggedElement.classList.add('is-dragging');
    }, 0);
}

/** * Handles the drag end event.
 * Removes the dragging class and resets the current dragged element.
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

/** * Allows dropping on the target element.
 * Prevents the default behavior and adds a class for styling.
 * @param {DragEvent} event
 */
function allowDrop(event) {
    event.preventDefault();
    if (event.target.classList.contains('task-column') && !event.target.classList.contains('drag-over')) {
        event.target.classList.add('drag-over');
    }
}

/** * Handles the drag leave event.
 * Removes the drag-over class from the target element.
 * @param {DragEvent} event
 */
function dragLeave(event) {
    if (event.target.classList.contains('task-column')) {
        event.target.classList.remove('drag-over');
    }
}

/** * Handles the drop event.
 * Moves the dragged element to the new column and updates the task data.
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
