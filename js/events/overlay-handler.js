let currentOverlay = null;

/**
 * @param {string} id - Die ID des zu suchenden Elements.
 * @returns {HTMLElement|null} Das gefundene Element oder null, wenn es nicht gefunden wurde.
 */
function getValidatedElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element #${id} not found.`);
    }
    return element;
}

/**
 * @param {HTMLElement} parent - Das Elternelement, in dem gesucht werden soll.
 * @param {string} selector - Der CSS-Selektor des zu suchenden Elements.
 * @returns {HTMLElement|null} Das gefundene Element oder null, wenn es nicht gefunden wurde.
 */
function getValidatedQuerySelector(parent, selector) {
    const element = parent.querySelector(selector);
    if (!element) {
        console.error(`Element with selector '${selector}' not found within parent.`);
    }
    return element;
}

/**
 * @param {HTMLElement} overlay - Das Overlay-Element.
 * @param {boolean} isVisible - Ob das Overlay sichtbar sein soll (true) oder nicht (false).
 */
function setOverlayVisibility(overlay, isVisible) {
    if (isVisible) {
        overlay.classList.remove('overlay-hidden');
    } else {
        overlay.classList.add('overlay-hidden');
    }
}

/**
 * @param {boolean} disableScroll - Ob der Body-Scroll deaktiviert (true) oder aktiviert (false) werden soll.
 */
function manageBodyScroll(disableScroll) {
    document.body.style.overflow = disableScroll ? 'hidden' : '';
}

/**
 * @param {HTMLElement} overlay - Das aktuell geöffnete Overlay-Element.
 */
function updateCurrentOverlay(overlay) {
    currentOverlay = overlay;
}

/**
 * @param {string} overlayId - Die ID des Overlays, das als aktuelles Overlay gelöscht werden soll.
 */
function clearCurrentOverlay(overlayId) {
    if (currentOverlay && currentOverlay.id === overlayId) {
        currentOverlay = null;
    }
}

/**
 * @param {string} newOverlayId - Die ID des Overlays, das geöffnet werden soll (um bestehende zu schließen).
 */
function closeExistingOverlay(newOverlayId) {
    if (currentOverlay && currentOverlay.id !== newOverlayId) {
        closeSpecificOverlay(currentOverlay.id);
    }
}

/**
 * @param {HTMLElement|null} button - Der Schließen-Button des Overlays.
 * @param {string} overlayId - Die ID des Overlays, das geschlossen werden soll.
 */
function attachCloseButtonListener(button, overlayId) {
    if (button) {
        button.addEventListener('click', () => closeSpecificOverlay(overlayId));
    }
}

/**
 * @param {HTMLElement} overlay - Das Overlay-Element.
 * @param {string} overlayId - Die ID des Overlays, das geschlossen werden soll.
 */
function attachBackgroundClickListener(overlay, overlayId) {
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeSpecificOverlay(overlayId);
        }
    });
}

/**
 * @param {HTMLElement|null} modalContent - Der Inhalt des Modals.
 */
function attachModalContentStopper(modalContent) {
    if (modalContent) {
        modalContent.addEventListener('click', (event) => event.stopPropagation());
    }
}

/**
 * @param {HTMLElement} overlay - Das Overlay-Element.
 * @param {string} overlayId - Die ID des Overlays, das geschlossen werden soll.
 */
function attachEscapeKeyListener(overlay, overlayId) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay && !overlay.classList.contains('overlay-hidden')) {
            closeSpecificOverlay(overlayId);
        }
    });
}

/**
 * @param {string} overlayId - Die ID des zu öffnenden Overlays.
 */
export function openSpecificOverlay(overlayId) {
    closeExistingOverlay(overlayId);
    const overlay = getValidatedElementById(overlayId);
    if (!overlay) return;
    setOverlayVisibility(overlay, true);
    manageBodyScroll(true);
    updateCurrentOverlay(overlay);
    console.log(`Overlay '${overlayId}' opened.`);
}

/**
 * @param {string} overlayId - Die ID des zu schließenden Overlays.
 */
export function closeSpecificOverlay(overlayId) {
    const overlay = getValidatedElementById(overlayId);
    if (!overlay) return;
    setOverlayVisibility(overlay, false);
    manageBodyScroll(false);
    clearCurrentOverlay(overlayId);
    console.log(`Overlay '${overlayId}' closed.`);
}

/**
 * @param {string} overlayId - Die ID des Overlays, für das die Listener initialisiert werden sollen.
 */
export function initOverlayListeners(overlayId) {
    const overlay = getValidatedElementById(overlayId);
    if (!overlay) return;
    const modalContent = getValidatedQuerySelector(overlay, '.modal-content');
    const closeModalButton = getValidatedQuerySelector(overlay, '.close-modal-btn');
    attachCloseButtonListener(closeModalButton, overlayId);
    attachBackgroundClickListener(overlay, overlayId);
    attachModalContentStopper(modalContent);
    attachEscapeKeyListener(overlay, overlayId);
}
