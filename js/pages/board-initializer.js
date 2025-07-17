import { openSpecificOverlay, initOverlayListeners } from "../../js/events/overlay-handler.js";
import { initAddTaskForm, clearForm } from "./add-task.js";
import { getAddTaskFormHTML } from "../templates/add-task-template.js";

/**
 * Lädt das HTML für das "Add Task" Overlay in den DOM und initialisiert es.
 * Stellt sicher, dass das Overlay nur einmal geladen und initialisiert wird.
 */
let isOverlayLoaded = false;

export async function loadAndInitAddTaskOverlay() {
    if (isOverlayLoaded) {
        console.log("Overlay bereits geladen und initialisiert. Überspringe Neuladen.");
        clearForm();
        openSpecificOverlay('overlay');
        return;
    }

    try {
        const response = await fetch("../js/templates/add-task-overlay.html");
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status} beim Abrufen von add-task-overlay.html`);
        }
        const addTaskOverlayHtml = await response.text();

        const overlayContainer = document.getElementById('overlay-container');
        if (overlayContainer) {
            const existingOverlay = document.getElementById('overlay');
            if (existingOverlay) {
                existingOverlay.remove();
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = addTaskOverlayHtml;
            const overlayElement = tempDiv.firstElementChild;
            overlayContainer.appendChild(overlayElement);

            isOverlayLoaded = true;
            console.log("Add Task Overlay HTML in den DOM geladen.");

            initOverlayListeners('overlay');

            const formContainerInOverlay = overlayElement.querySelector('#add-task-form-container');
            if (formContainerInOverlay) {
                formContainerInOverlay.innerHTML = getAddTaskFormHTML();
                console.log("Add Task Formular-HTML in den Overlay-Container eingefügt.");
                console.log('   Erste 100 Zeichen des Formular-Inhalts:', formContainerInOverlay.innerHTML.substring(0, 100) + '...');
            } else {
                console.error("DEBUG: Formular-Container (#add-task-form-container) im geladenen Overlay nicht gefunden.");
                return;
            }

            await initAddTaskForm();
            console.log("Add Task Formular erfolgreich initialisiert.");

        } else {
            console.error("DEBUG: Overlay-Container (#overlay-container) nicht im DOM gefunden.");
        }
    } catch (error) {
        console.error("Fehler beim Laden oder Initialisieren des Add Task Overlays:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addTaskButton = document.getElementById('add-task');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', async () => {
            console.log("Klick auf den 'Add task'-Button.");
            await loadAndInitAddTaskOverlay();
            openSpecificOverlay('overlay');
        });
    } else {
        console.warn("DEBUG: Haupt-Add Task Button (#add-task) nicht gefunden.");
    }

    const fastAddTaskButtons = document.querySelectorAll('[id^="fast-add-task-"]');
    fastAddTaskButtons.forEach(button => {
        /**
         * @param {Event} event - Das Klick-Ereignis des Buttons.
         */
        button.addEventListener('click', async (event) => {
            const columnId = event.currentTarget.id.replace('fast-add-task-', '');
            console.log(`Schnelles Hinzufügen einer Aufgabe für Spalte: ${columnId}`);
            await loadAndInitAddTaskOverlay();
            openSpecificOverlay('overlay');
        });
    });
});
