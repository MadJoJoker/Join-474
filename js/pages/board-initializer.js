// Path: ../js/pages/board-initializer.js

import { openSpecificOverlay, initOverlayListeners } from "/js/events/overlay-handler.js";
import { initAddTaskForm } from "/js/pages/add-task.js"; // Korrekter Importname initAddTaskForm

/**
 * Lädt das HTML für das "Add Task" Overlay in den DOM und initialisiert es.
 * Stellt sicher, dass das Overlay nur einmal geladen und initialisiert wird.
 */
let isOverlayLoaded = false;

async function loadAndInitAddTaskOverlay() {
    // Wenn das Overlay bereits geladen und initialisiert wurde, überspringen wir das erneute Laden.
    if (isOverlayLoaded) {
        console.log("Overlay bereits geladen und initialisiert. Überspringe erneutes Laden.");
        // Optional: Wenn das Formular nach dem erneuten Öffnen zurückgesetzt werden soll,
        // könnten Sie hier eine Reset-Funktion aus add-task.js aufrufen, z.B. clearForm().
        // Beachten Sie, dass clearForm() global gemacht oder exportiert werden müsste.
        // await clearForm(); // Beispiel, wenn clearForm exportiert wäre
        return;
    }

    try {
        // Schritt 1: Das HTML für das Overlay von der Server laden
        const response = await fetch("../js/templates/add-task-overlay.html");
        if (!response.ok) {
            // Wenn die HTTP-Antwort nicht OK ist, werfen wir einen Fehler
            throw new Error(`HTTP error! status: ${response.status} beim Laden von add-task-overlay.html`);
        }
        const data = await response.text(); // Den Inhalt der HTML-Datei als Text abrufen

        // Schritt 2: Den Container im DOM finden, in den das Overlay geladen werden soll
        const overlayContainer = document.getElementById("overlay-container");

        // Schritt 3: Prüfen, ob der Container existiert und dann das HTML einfügen und initialisieren
        if (overlayContainer) {
            overlayContainer.innerHTML = data; // Das geladene HTML in den Container einfügen

            // Wichtig: initOverlayListeners muss NACH dem Einfügen des HTML aufgerufen werden,
            // da es die DOM-Elemente des Overlays sucht.
            initOverlayListeners('overlay'); // 'overlay' ist die ID des Haupt-Overlay-Divs

            // Rufe die Initialisierungsfunktion für das Add Task Formular auf.
            // Diese Funktion initialisiert Flatpickr, Event-Listener etc.
            // Sie sollte await sein, da initAddTaskForm() selbst asynchrone Operationen (Firebase-Daten) ausführt.
            await initAddTaskForm(); // <--- HIER wird die umbenannte Funktion aufgerufen

            isOverlayLoaded = true; // Markiere das Overlay als geladen und initialisiert
            console.log("Add Task Overlay HTML geladen und Initialisierung gestartet.");
        } else {
            // Fehlermeldung, wenn der #overlay-container nicht im Haupt-HTML gefunden wird
            console.error("Fehler: Das Element #overlay-container wurde nicht im DOM gefunden. Stellen Sie sicher, dass es in der Haupt-HTML-Datei vorhanden ist.");
        }
    } catch (error) {
        // Fehlerbehandlung für Fetch-Probleme oder andere Initialisierungsfehler
        console.error("Fehler beim Laden oder Initialisieren des Add Task Overlays:", error);
    }
}


// Event-Listener für den Haupt "Add Task" Button auf dem Board
document.addEventListener('DOMContentLoaded', () => {
    const addTaskButton = document.getElementById('add-task');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', async () => {
            console.log("Klick auf 'Add task' Button.");
            // Lade und initialisiere das Overlay, falls noch nicht geschehen
            await loadAndInitAddTaskOverlay();
            // Öffne das Overlay, nachdem es geladen und initialisiert wurde
            openSpecificOverlay('overlay');
        });
    } else {
        console.warn("DEBUG: Haupt-Add-Task-Button (#add-task) nicht gefunden.");
    }

    // Event-Listener für die "Plus"-Buttons in den Spalten (schnelles Hinzufügen)
    const fastAddTaskButtons = document.querySelectorAll('[id^="fast-add-task-"]');
    fastAddTaskButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const columnId = event.currentTarget.id.replace('fast-add-task-', ''); // Z.B. 'todo', 'inProgress'
            console.log(`Schnell-Add-Task für Spalte: ${columnId}`);
            // Lade und initialisiere das Overlay
            await loadAndInitAddTaskOverlay();
            // Öffne das Overlay
            openSpecificOverlay('overlay');

            // Optional: Hier könntest du das Formular vorbesetzen, z.B. mit der Spalte.
            // Dazu müsste eine Funktion in add-task.js exportiert werden, die die Spalte setzt.
            // Beispiel: setTaskColumn(columnId); // Diese Funktion müsstest du in add-task.js exportieren und hier importieren
        });
    });
});
