// Path: ../js/pages/board-initializer.js

import { openSpecificOverlay, initOverlayListeners } from "/js/events/overlay-handler.js";
import { initAddTaskOverlay } from "/js/pages/add-task.js";

/**
 * Lädt das HTML für das "Add Task" Overlay in den DOM und initialisiert es.
 * Stellt sicher, dass das Overlay nur einmal geladen und initialisiert wird.
 */
let isOverlayLoaded = false;

async function loadAndInitAddTaskOverlay() {
    if (isOverlayLoaded) {
        console.log("Overlay bereits geladen und initialisiert. Überspringe erneutes Laden.");
        return;
    }

    try {
        // Pfad zur add-task-overlay.html überprüfen!
        const response = await fetch("../js/templates/add-task-overlay.html");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} beim Laden von add-task-overlay.html`);
        }
        const data = await response.text();

        const overlayContainer = document.getElementById("overlay-container");
        if (overlayContainer) {
            overlayContainer.innerHTML = data;
            // Wichtig: initOverlayListeners muss NACH dem Einfügen des HTML aufgerufen werden,
            // da es die DOM-Elemente des Overlays sucht.
            initOverlayListeners('overlay'); // 'overlay' ist die ID des Haupt-Overlay-Divs
            initAddTaskOverlay(); // Initialisiert das Add Task Formular (Flatpickr, Event-Listener etc.)
            isOverlayLoaded = true;
            console.log("Add Task Overlay HTML geladen und Initialisierung gestartet.");
        } else {
            console.error("Fehler: Das Element #overlay-container wurde nicht im DOM gefunden.");
        }
    } catch (error) {
        console.error("Fehler beim Laden oder Initialisieren des Add Task Overlays:", error);
    }
}

// Event-Listener für den Haupt "Add Task" Button auf dem Board
document.addEventListener('DOMContentLoaded', () => {
    const addTaskButton = document.getElementById('add-task');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', async () => {
            console.log("Klick auf 'Add task' Button.");
            await loadAndInitAddTaskOverlay(); // Lade und initialisiere das Overlay, falls noch nicht geschehen
            openSpecificOverlay('overlay'); // Öffne das Overlay
        });
    } else {
        console.warn("DEBUG: Haupt-Add-Task-Button (#add-task) nicht gefunden.");
    }

    // Event-Listener für die "Plus"-Buttons in den Spalten
    const fastAddTaskButtons = document.querySelectorAll('[id^="fast-add-task-"]');
    fastAddTaskButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const columnId = event.currentTarget.id.replace('fast-add-task-', ''); // Z.B. 'todo', 'inProgress'
            console.log(`Schnell-Add-Task für Spalte: ${columnId}`);
            await loadAndInitAddTaskOverlay(); // Lade und initialisiere das Overlay
            openSpecificOverlay('overlay'); // Öffne das Overlay

            // Optional: Hier könntest du das Formular vorbesetzen, z.B. mit der Spalte
            // Beispiel: Eine Funktion in add-task.js aufrufen, die die Spalte setzt
            // setTaskColumn(columnId); // Diese Funktion müsstest du in add-task.js exportieren und hier importieren
        });
    });
});
