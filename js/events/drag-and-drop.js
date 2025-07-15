/**
 * @file drag-and-drop.js
 * @description Implementiert Drag-and-Drop-Funktionalität für Aufgabenkarten auf dem Board.
 */


import { updateTaskColumnData } from '../ui/render-board.js';

let currentDraggedElement = null;


export function initDragAndDrop() {
    console.log('Drag-and-Drop-Initialisierung gestartet.');

    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(taskCard => {
        taskCard.setAttribute('draggable', 'true'); // Macht die Karte ziehbar
        taskCard.addEventListener('dragstart', dragStart); // Event beim Start des Ziehens
        taskCard.addEventListener('dragend', dragEnd);     // Event beim Ende des Ziehens
    });


    const taskColumns = document.querySelectorAll('.task-column');
    taskColumns.forEach(column => {
        column.addEventListener('dragover', allowDrop);  // Event, wenn ein Element über die Spalte gezogen wird
        column.addEventListener('dragleave', dragLeave); // Event, wenn ein Element die Spalte verlässt
        column.addEventListener('drop', drop);           // Event, wenn ein Element in die Spalte abgelegt wird
    });

    console.log(`Drag-and-Drop für ${taskCards.length} Aufgabenkarten und ${taskColumns.length} Spalten eingerichtet.`);
}

/**
 * Behandelt den Beginn eines Ziehvorgangs.
 * Speichert eine Referenz auf das gezogene Element und seine ID im DataTransfer-Objekt.
 * Fügt eine visuelle Klasse hinzu, um die gezogene Karte hervorzuheben.
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
function dragStart(event) {
    currentDraggedElement = event.target;
    // Speichert die ID der gezogenen Aufgabe. Diese ID wird im 'drop'-Event verwendet,
    // um die Aufgabe wiederzufinden.
    event.dataTransfer.setData('text/plain', currentDraggedElement.id);
    console.log(`Drag gestartet für Aufgabe: ${currentDraggedElement.id}`);

    // Fügt eine Klasse hinzu, um die gezogene Karte transparent zu machen.
    // Ein kleiner Timeout sorgt dafür, dass die Klasse nach dem Browser-Screenshot
    // des Elements (für den Drag-Vorgang) angewendet wird.
    setTimeout(() => {
        currentDraggedElement.classList.add('is-dragging');
    }, 0);
}

/**
 * Behandelt das Ende eines Ziehvorgangs.
 * Entfernt die visuelle Klasse von der gezogenen Aufgabe und setzt die globale Variable zurück.
 * Entfernt auch die 'drag-over'-Klasse von allen Spalten.
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
function dragEnd(event) {
    console.log(`Drag beendet für Aufgabe: ${event.target.id}`);
    event.target.classList.remove('is-dragging'); // Entfernt die Transparenz
    currentDraggedElement = null; // Setzt die globale Referenz zurück

    // Entfernt die 'drag-over'-Klasse von allen Spalten, falls der Drag außerhalb beendet wurde
    document.querySelectorAll('.task-column').forEach(column => {
        column.classList.remove('drag-over');
    });
}

/**
 * Erlaubt das Ablegen von Elementen in einer Spalte.
 * Verhindert das Standardverhalten des Browsers und fügt eine visuelle Klasse
 * zur Zielspalte hinzu, um anzuzeigen, dass ein Ablegen möglich ist.
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
function allowDrop(event) {
    event.preventDefault(); // Dies ist entscheidend, um das Ablegen zu erlauben

    // Fügt visuelles Feedback zur Spalte hinzu, über der sich das gezogene Element befindet.
    // Stellt sicher, dass es sich um eine Spalte handelt und die Klasse noch nicht gesetzt ist.
    if (event.target.classList.contains('task-column') && !event.target.classList.contains('drag-over')) {
        event.target.classList.add('drag-over');
    }
}

/**
 * Behandelt das Verlassen einer Spalte während des Ziehvorgangs.
 * Entfernt die visuelle Klasse von der Spalte.
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
function dragLeave(event) {
    // Entfernt visuelles Feedback von der Spalte, wenn das gezogene Element sie verlässt.
    if (event.target.classList.contains('task-column')) {
        event.target.classList.remove('drag-over');
    }
}

/**
 * Behandelt das Ablegen eines Elements in einer Spalte.
 * Verschiebt die Aufgabe im DOM und ruft die Funktion zur Datenaktualisierung auf.
 * @param {DragEvent} event - Das Drag-Ereignis.
 */
async function drop(event) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain'); // Holt die ID der gezogenen Aufgabe
    const draggedElement = document.getElementById(taskId); // Findet das gezogene DOM-Element

    // Findet die nächste Elternelement mit der Klasse 'task-column', um die Zielspalte zu identifizieren.
    // Dies ist wichtig, da das Event.target ein Kindelement der Spalte sein könnte.
    const targetColumn = event.target.closest('.task-column');

    if (draggedElement && targetColumn) {
        const newColumnId = targetColumn.id; // Die ID der Zielspalte (z.B. 'to-do', 'in-progress')
        const oldColumnId = draggedElement.closest('.task-column').id; // Die ID der ursprünglichen Spalte

        // Führe die Verschiebung nur aus, wenn sich die Spalte tatsächlich ändert
        if (newColumnId !== oldColumnId) {
            targetColumn.appendChild(draggedElement); // Verschiebt das Element im DOM
            console.log(`Aufgabe ${taskId} von ${oldColumnId} nach ${newColumnId} verschoben.`);

            // Ruft die externe Funktion auf, um die Änderung in der Datenstruktur (Firebase) zu speichern.
            // Diese Funktion wird aus render-board.js importiert.
            await updateTaskColumnData(taskId, newColumnId);
        }
    }
    // Entfernt visuelles Feedback von der Zielspalte nach dem Ablegen.
    if (targetColumn) {
        targetColumn.classList.remove('drag-over');
    }
}
