let currentOverlay = null;

/** * Retrieves an element by its ID and ensures it exists.
 * @param {string} id - The ID of the element to retrieve.
 * @returns {HTMLElement|null} The element if found, otherwise null.
 */
function getValidatedElementById(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.error(`Element #${id} not found.`);
  }
  return element;
}

/** * Retrieves an element by its ID and ensures it exists.
 * @param {string} id - The ID of the element to retrieve.
 * @returns {HTMLElement|null} The element if found, otherwise null.
 */
function getValidatedQuerySelector(parent, selector) {
  const element = parent.querySelector(selector);
  if (!element) {
    return null;
  }
  return element;
}

/** * Sets the visibility of the overlay.
 * Adds or removes the 'overlay-hidden' class based on the visibility state.
 * @param {HTMLElement} overlay - The overlay element to modify.
 * @param {boolean} isVisible - Whether the overlay should be visible.
 */
function setOverlayVisibility(overlay, isVisible) {
  if (isVisible) {
    overlay.classList.remove("overlay-hidden");
  } else {
    overlay.classList.add("overlay-hidden");
  }
}

/** * Manages the body scroll behavior.
 * Disables or enables scrolling based on the provided flag.
 * @param {boolean} disableScroll - Whether to disable scrolling.
 */
function manageBodyScroll(disableScroll) {
  document.body.style.overflow = disableScroll ? "hidden" : "";
}

/** * Updates the current overlay reference.
 * @param {HTMLElement} overlay - The overlay element to set as current.
 */
function updateCurrentOverlay(overlay) {
  currentOverlay = overlay;
}

/** * Clears the current overlay reference if it matches the provided ID.
 * @param {string} overlayId - The ID of the overlay to clear.
 */
function clearCurrentOverlay(overlayId) {
  if (currentOverlay && currentOverlay.id === overlayId) {
    currentOverlay = null;
  }
}

/** * Closes any existing overlay if it is different from the new one.
 * @param {string} newOverlayId - The ID of the new overlay to open.
 */
function closeExistingOverlay(newOverlayId) {
  if (currentOverlay && currentOverlay.id !== newOverlayId) {
    closeSpecificOverlay(currentOverlay.id);
  }
}

/** * Attaches a click event listener to the close button of the overlay.
 * Closes the overlay when the button is clicked.
 * @param {HTMLElement} button - The close button element.
 * @param {string} overlayId - The ID of the overlay to close.
 */
function attachCloseButtonListener(button, overlayId) {
  if (button) {
    button.addEventListener("click", () => closeSpecificOverlay(overlayId));
  }
}

/** * Attaches a click event listener to the overlay background.
 * Closes the overlay when the background is clicked.
 * @param {HTMLElement} overlay - The overlay element.
 * @param {string} overlayId - The ID of the overlay to close.
 */
function attachBackgroundClickListener(overlay, overlayId) {
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeSpecificOverlay(overlayId);
    }
  });
}

/** * Attaches a click event listener to the modal content to stop propagation.
 * Prevents clicks inside the modal from closing the overlay.
 * @param {HTMLElement} modalContent - The modal content element.
 */
function attachModalContentStopper(modalContent) {
  if (modalContent) {
    modalContent.addEventListener("click", (event) => event.stopPropagation());
  }
}

/** * Initializes the overlay by setting up event listeners and visibility.
 * @param {string} overlayId - The ID of the overlay to initialize.
 */
function attachEscapeKeyListener(overlay, overlayId) {
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      overlay &&
      !overlay.classList.contains("overlay-hidden")
    ) {
      closeSpecificOverlay(overlayId);
    }
  });
}

/** * Opens a specific overlay by its ID.
 * Closes any existing overlay first, then sets the new overlay as current.
 * @param {string} overlayId - The ID of the overlay to open.
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

/** * Closes a specific overlay by its ID.
 * Sets the overlay visibility to hidden and clears the current overlay reference.
 * @param {string} overlayId - The ID of the overlay to close.
 */
export function closeSpecificOverlay(overlayId) {
  const overlay = getValidatedElementById(overlayId);
  if (!overlay) return;
  setOverlayVisibility(overlay, false);
  manageBodyScroll(false);
  clearCurrentOverlay(overlayId);
  console.log(`Overlay '${overlayId}' closed.`);
}

/** * Initializes event listeners for the overlay.
 * Attaches listeners to the close button, background click, and modal content.
 * @param {string} overlayId - The ID of the overlay to initialize.
 */
export function initOverlayListeners(overlayId) {
  const overlay = getValidatedElementById(overlayId);
  if (!overlay) return;

  let modalContent = getValidatedQuerySelector(overlay, ".modal-content");
  if (!modalContent)
    modalContent = getValidatedQuerySelector(overlay, ".modal-content-task");
  if (!modalContent)
    modalContent = getValidatedQuerySelector(
      overlay,
      ".modal-content-task-edit"
    );
  if (!modalContent)
    modalContent = getValidatedQuerySelector(overlay, "#modal-content");
  if (!modalContent)
    modalContent = getValidatedQuerySelector(overlay, "#modal-content-task");
  if (!modalContent)
    modalContent = getValidatedQuerySelector(
      overlay,
      "#modal-content-task-detail-edit"
    );
  if (!modalContent)
    modalContent = getValidatedQuerySelector(
      overlay,
      "#modal-content-task-edit"
    );
  if (!modalContent) {

    modalContent = overlay.querySelector("div");
    if (!modalContent) {
      console.warn(
        `Kein modalContent gefunden für Overlay '${overlayId}'. Event-Handler werden nicht gesetzt.`
      );
    }
  }
  const closeModalButton = getValidatedQuerySelector(
    overlay,
    ".close-modal-btn"
  );
  attachCloseButtonListener(closeModalButton, overlayId);
  attachBackgroundClickListener(overlay, overlayId);
  if (modalContent) attachModalContentStopper(modalContent);
  attachEscapeKeyListener(overlay, overlayId);
}