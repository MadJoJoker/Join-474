// Path: ../js/pages/board-initializer.js

import { openSpecificOverlay, initOverlayListeners } from "/js/events/overlay-handler.js";
import { initAddTaskForm, clearForm } from "/js/pages/add-task.js"; // Correct import for initAddTaskForm and clearForm

/**
 * Loads the HTML for the "Add Task" Overlay into the DOM and initializes it.
 * Ensures that the overlay is loaded and initialized only once.
 */
let isOverlayLoaded = false;

export async function loadAndInitAddTaskOverlay() {
    // If the overlay has already been loaded and initialized, we skip reloading it.
    if (isOverlayLoaded) {
        console.log("Overlay already loaded and initialized. Skipping reload.");
        // If the form should be reset after reopening,
        // you could call a reset function from add-task.js here, e.g. clearForm().
        clearForm(); // Call clearForm to reset the form when reopening
        return;
    }

    try {
        // Step 1: Load the HTML for the overlay from the server
        const response = await fetch("../js/templates/add-task-overlay.html");
        if (!response.ok) {
            // If the HTTP response is not OK, we throw an error
            throw new Error(`HTTP error! status: ${response.status} when fetching add-task-overlay.html`);
        }
        const addTaskOverlayHtml = await response.text();

        // Step 2: Insert the loaded HTML into a container element in board-site.html
        const overlayContainer = document.getElementById('overlay-container');
        if (overlayContainer) {
            overlayContainer.innerHTML = addTaskOverlayHtml;
            isOverlayLoaded = true; // Mark as loaded
            console.log("Add Task Overlay HTML loaded into DOM.");

            // Step 3: Initialize the Add Task form functionalities after the HTML is in the DOM
            // This will attach all event listeners and perform initial setup
            await initAddTaskForm();
            console.log("Add Task form initialized successfully.");
        } else {
            console.error("DEBUG: Overlay container (#overlay-container) not found in the DOM.");
        }
    } catch (error) {
        console.error("Error loading or initializing Add Task Overlay:", error);
    }
}

// Initial setup for existing overlay listeners (if any)
initOverlayListeners();

// Event listener for the main "Add task" button in the board
document.addEventListener('DOMContentLoaded', () => {
    const addTaskButton = document.getElementById('add-task');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', async () => {
            console.log("Click on 'Add task' button.");
            // Load and initialize the overlay if not already done
            await loadAndInitAddTaskOverlay();
            // Open the overlay after it has been loaded and initialized
            openSpecificOverlay('overlay');
        });
    } else {
        console.warn("DEBUG: Main Add Task Button (#add-task) not found.");
    }

    // Event listeners for the "Plus" buttons in the columns (quick add)
    const fastAddTaskButtons = document.querySelectorAll('[id^="fast-add-task-"]');
    fastAddTaskButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const columnId = event.currentTarget.id.replace('fast-add-task-', ''); // E.g. 'todo', 'inProgress'
            console.log(`Quick Add Task for column: ${columnId}`);
            // Load and initialize the overlay
            await loadAndInitAddTaskOverlay();
            // Open the overlay
            openSpecificOverlay('overlay');

            // Optional: Here you could pre-fill the form, e.g. with the column.
            // For this, a function in add-task.js would need to be exported that sets the column.
            // Example: setTaskColumn(columnId); // This function you would have to export in add-task.js
        });
    });
});
