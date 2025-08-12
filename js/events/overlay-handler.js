/**
 * Loads overlay HTML from a template file, inserts it into the overlay container, and initializes listeners.
 * @param {string} templatePath - Path to the HTML template file.
 * @param {string} overlayId - The ID to assign to the loaded overlay element.
 * @param {function} [afterLoad] - Optional callback after loading and inserting the overlay.
 * @returns {Promise<HTMLElement|null>} - The loaded overlay element or null.
 */
export async function loadOverlayHtmlOnce(templatePath, overlayId, afterLoad) {
  const overlayContainer = document.getElementById("overlay-container");
  if (!overlayContainer) return null;
  let existing = document.getElementById(overlayId);
  if (existing) return existing;
  try {
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const overlayElement = tempDiv.firstElementChild;
    if (overlayElement) {
      overlayElement.id = overlayId;
      overlayContainer.appendChild(overlayElement);
      initOverlayListeners(overlayId);
      if (afterLoad) afterLoad(overlayElement);
      return overlayElement;
    }
  } catch (error) {
    console.error("Failed to load overlay HTML:", error);
  }
  return null;
}
let currentOverlay = null;

/** * Retrieves an element by its ID and ensures it exists.
 * @param {string} id - The ID of the element to retrieve.
 * @returns {HTMLElement|null} The element if found, otherwise null.
 */
function getValidatedElementById(id) {
  const element = document.getElementById(id);
  if (!element) {
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
  // Dynamically load the appropriate CSS for the overlay
  if (overlayId === "overlay-task-detail-edit") {
    ensureOverlayCSS("../styles/overlay-task-detail-edit.css");
  } else if (overlayId === "overlay-task-detail") {
    ensureOverlayCSS("../styles/overlay-task-details.css");
  }
  setOverlayVisibility(overlay, true);
  manageBodyScroll(true);
  updateCurrentOverlay(overlay);
}

// Ensures that the overlay CSS is included in the <head>.
// @param {string} href - The path to the CSS file (relative to the main HTML document)
function ensureOverlayCSS(href) {
  if (
    ![...document.head.querySelectorAll('link[rel="stylesheet"]')].some((l) =>
      l.href.includes(href)
    )
  ) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
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

  if (overlayId === "overlay-task-detail-edit") {
    removeOverlayCSS("../styles/overlay-task-detail-edit.css");
  } else if (overlayId === "overlay-task-detail") {
    removeOverlayCSS("../styles/overlay-task-details.css");
  }
}

function removeOverlayCSS(href) {
  const links = [...document.head.querySelectorAll('link[rel="stylesheet"]')];
  for (const link of links) {
    if (
      link.href.endsWith(href) ||
      link.href.includes(href) ||
      link.href.split("/").pop() === href.split("/").pop()
    ) {
      link.parentNode.removeChild(link);
    }
  }
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
  }
  const closeModalButton = getValidatedQuerySelector(
    overlay,
    ".close-modal-btn"
  );
  attachCloseButtonListener(closeModalButton, overlayId);
  attachBackgroundClickListener(overlay, overlayId);
  if (modalContent) attachModalContentStopper(modalContent);
  attachEscapeKeyListener(overlay, overlayId);

  // Subtask-Checkboxen: Direktes Update und DEBUG-Logs
  if (overlayId === "overlay-task-detail") {
    try {
      // Importiere CWDATA und allData dynamisch, falls nicht global
      import("../data/task-to-firbase.js").then(({ CWDATA, allData }) => {
        const checkboxes = overlay.querySelectorAll(".subtask-checkbox");
        console.debug(
          "[DEBUG] Subtask-Checkboxen gefunden:",
          checkboxes.length
        );
        checkboxes.forEach((checkbox) => {
          checkbox.addEventListener("change", function () {
            const taskId = this.dataset.taskId;
            const subtaskIndex = Number(this.dataset.subtaskIndex);
            console.debug(
              `[DEBUG] Checkbox geändert: taskId=${taskId}, subtaskIndex=${subtaskIndex}, checked=${this.checked}`
            );
            const task = allData.tasks[taskId];
            if (task) {
              task.checkedSubtasks[subtaskIndex] = this.checked;
              console.debug(
                "[DEBUG] Task-Objekt vor Update:",
                JSON.parse(JSON.stringify(task))
              );
              CWDATA({ [taskId]: task }, allData);
              console.debug("[DEBUG] CWDATA aufgerufen mit:", {
                [taskId]: task,
              });
            } else {
              console.warn(`[DEBUG] Task mit ID ${taskId} nicht gefunden!`);
            }
          });
        });
      });
    } catch (err) {
      console.error(
        "[DEBUG] Fehler beim Hinzufügen der Subtask-Checkbox-Listener:",
        err
      );
    }
  }
}

/** * Loads and initializes the add-task overlay.
 */
export function redirectOnSmallScreen() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    window.location.href = "add-task.html";
  }
}
