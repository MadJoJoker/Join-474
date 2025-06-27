console.log('overlay-handler');

export function initOverlayListeners() {
    console.log("initOverlayListeners wird aufgerufen.");

    const overlay = document.getElementById('overlay');
    const addTaskButton = document.getElementById('add-task');
    const closeModalButton = document.querySelector('.close-modal-btn');

    if (!overlay) {
        console.error("DEBUG: Overlay-Element #overlay wurde nicht gefunden, wenn initOverlayListeners aufgerufen wurde.");
        return;
    } else {
        console.log("DEBUG: Overlay-Element #overlay gefunden.");
    }

    function openOverlay() {
        console.log("DEBUG: openOverlay wird ausgeführt.");
        overlay.classList.remove('overlay-hidden');
        document.body.style.overflow = 'hidden';
        console.log('Overlay geöffnet (Klasse overlay-hidden entfernt).');
    }

    function closeOverlay() {
        console.log("DEBUG: closeOverlay wird ausgeführt.");
        overlay.classList.add('overlay-hidden');
        document.body.style.overflow = '';
        console.log('Overlay geschlossen (Klasse overlay-hidden hinzugefügt).');
    }

    if (addTaskButton) {
        addTaskButton.addEventListener('click', openOverlay);
    } else {
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeOverlay);
    } else {
    }

    if (overlay) {
        overlay.addEventListener('click', function(event) {
            console.log("DEBUG: Klick auf Overlay-Hintergrund registriert. Target:", event.target);
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
