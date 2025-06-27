// overlay-handler.js
console.log('overlay-handler');

// Exportiere die Funktionen openOverlay und closeOverlay direkt
export function openOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        console.log("DEBUG: openOverlay wird ausgeführt.");
        overlay.classList.remove('overlay-hidden');
        document.body.style.overflow = 'hidden';
        console.log('Overlay geöffnet (Klasse overlay-hidden entfernt).');
        // Hier könntest du auch initAddTaskScript aufrufen, wenn das Overlay geöffnet wird
        // if (typeof initAddTaskScript === 'function') {
        //     initAddTaskScript();
        // }
    } else {
        console.error("DEBUG: Overlay-Element #overlay nicht gefunden in openOverlay.");
    }
}

export function closeOverlay() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        console.log("DEBUG: closeOverlay wird ausgeführt.");
        overlay.classList.add('overlay-hidden');
        document.body.style.overflow = '';
        console.log('Overlay geschlossen (Klasse overlay-hidden hinzugefügt).');
        // Optional: Formularfelder leeren, wenn das Overlay geschlossen wird
        // if (typeof clearAddTaskForm === 'function') {
        //     clearAddTaskForm();
        // }
    } else {
        console.error("DEBUG: Overlay-Element #overlay nicht gefunden in closeOverlay.");
    }
}


export function initOverlayListeners() {
    console.log("initOverlayListeners wird aufgerufen.");

    const overlay = document.getElementById('overlay');
    const addTaskButton = document.getElementById('add-task'); // Dein Button, der das Overlay öffnet
    const closeModalButton = document.querySelector('.close-modal-btn'); // Dein Button zum Schließen im Overlay

    if (!overlay) {
        console.error("DEBUG: Overlay-Element #overlay wurde nicht gefunden, wenn initOverlayListeners aufgerufen wurde.");
        return;
    } else {
        console.log("DEBUG: Overlay-Element #overlay gefunden.");
    }

    if (addTaskButton) {
        addTaskButton.addEventListener('click', openOverlay);
    } else {
        console.warn("DEBUG: 'add-task' Button nicht gefunden.");
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeOverlay);
    } else {
        console.warn("DEBUG: 'close-modal-btn' Button nicht gefunden.");
    }

    if (overlay) {
        overlay.addEventListener('click', function(event) {
            console.log("DEBUG: Klick auf Overlay-Hintergrund registriert. Target:", event.target);
            // Hier prüfen wir, ob das geklickte Element genau das Overlay selbst ist
            // und nicht ein Kindelement innerhalb des Overlays.
            if (event.target === overlay) {
                closeOverlay();
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && overlay && !overlay.classList.contains('overlay-hidden')) {
            closeOverlay();
        }
    });
}
console.log('overlayEnde');
