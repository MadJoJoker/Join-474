// Path: ../js/events/overlay-handler.js

console.log('overlay-handler loaded');

let currentOverlay = null; // Variable, um das aktuell geöffnete Overlay zu speichern

/**
 * Initialisiert die Event-Listener für ein spezifisches Overlay.
 * Diese Funktion muss aufgerufen werden, NACHDEM das Overlay-HTML in den DOM geladen wurde.
 * @param {string} overlayId - Die ID des Overlays, das verwaltet werden soll (z.B. 'overlay' aus add-task-overlay.html).
 */
export function initOverlayListeners(overlayId) {
    console.log(`initOverlayListeners wird für Overlay '${overlayId}' aufgerufen.`);

    const overlay = document.getElementById(overlayId);
    if (!overlay) {
        console.error(`DEBUG: Overlay-Element #${overlayId} wurde nicht gefunden, wenn initOverlayListeners aufgerufen wurde.`);
        return;
    } else {
        console.log(`DEBUG: Overlay-Element #${overlayId} gefunden.`);
    }

    // --- Selektiert das modal-content Element ---
    const modalContent = overlay.querySelector('.modal-content');
    if (!modalContent) {
        console.error(`DEBUG: .modal-content Element im Overlay #${overlayId} wurde nicht gefunden.`);
    }
    // --- Ende der Selektion ---


    const closeModalButton = overlay.querySelector('.close-modal-btn'); // Schließen-Button IM Overlay

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => closeSpecificOverlay(overlayId));
    } else {
        console.warn(`DEBUG: Der Schließen-Button im Overlay #${overlayId} wurde nicht gefunden.`);
    }

    // Klick auf Overlay-Hintergrund (außerhalb des modal-content)
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) { // Sicherstellen, dass nur der Hintergrund geklickt wurde
            closeSpecificOverlay(overlayId);
        }
    });

    // --- Verhindert, dass Klicks innerhalb von modalContent das Overlay schließen ---
    if (modalContent) { // Nur hinzufügen, wenn modalContent tatsächlich existiert
        modalContent.addEventListener('click', function(event) {
            event.stopPropagation(); // <-- Dies ist der Befehl, der das Event-Bubbling stoppt
        });
    }
    // --- Ende der event.stopPropagation() Logik ---

    // ESC-Taste zum Schließen des Overlays
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && overlay && !overlay.classList.contains('overlay-hidden')) {
            closeSpecificOverlay(overlayId);
        }
    });
} // <--- Dies ist die EINE und EINZIGE schließende Klammer für initOverlayListeners

/**
 * Öffnet ein spezifisches Overlay.
 * Diese Funktion kann exportiert und von anderen Modulen aufgerufen werden.
 * @param {string} overlayId - Die ID des zu öffnenden Overlays.
 */
export function openSpecificOverlay(overlayId) {
    // Die Logik für currentOverlay gehört HIERHER
    if (currentOverlay && currentOverlay.id !== overlayId) { // Wenn bereits ein ANDERES Overlay offen ist, schließe es zuerst
        closeSpecificOverlay(currentOverlay.id);
    }

    const overlay = document.getElementById(overlayId);
    if (overlay) {
        console.log(`DEBUG: openSpecificOverlay für ${overlayId} wird ausgeführt.`);
        overlay.classList.remove('overlay-hidden');
        document.body.style.overflow = 'hidden'; // Scrollen des Hintergrunds deaktivieren
        console.log(`Overlay '${overlayId}' geöffnet.`);
        currentOverlay = overlay; // Das geöffnete Overlay speichern
    } else {
        console.error(`Fehler: Overlay mit ID '${overlayId}' nicht gefunden.`);
    }
}

/**
 * Schließt ein spezifisches Overlay.
 * @param {string} overlayId - Die ID des zu schließenden Overlays.
 */
export function closeSpecificOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        console.log(`DEBUG: closeSpecificOverlay für ${overlayId} wird ausgeführt.`);
        overlay.classList.add('overlay-hidden');
        document.body.style.overflow = ''; // Scrollen des Hintergrunds aktivieren
        console.log(`Overlay '${overlayId}' geschlossen.`);
        // Die Logik für currentOverlay gehört HIERHER
        if (currentOverlay && currentOverlay.id === overlayId) {
            currentOverlay = null; // Das geschlossene Overlay aus der Variable entfernen
        }
    }
}

console.log('overlay-handler ended');
