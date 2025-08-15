// Overlay HTML loader functions

/**
 * Loads the detail overlay HTML once and returns the element.
 * @param {HTMLElement|null} detailOverlayElement - The current detail overlay element (if already loaded).
 * @param {function} loadOverlayHtmlOnce - Function to load overlay HTML.
 * @returns {Promise<HTMLElement>} The loaded detail overlay element.
 */
export async function loadDetailOverlayHtmlOnce(
  detailOverlayElement,
  loadOverlayHtmlOnce
) {
  if (detailOverlayElement) return detailOverlayElement;
  return await loadOverlayHtmlOnce(
    "../js/templates/task-details-overlay.html",
    "overlay-task-detail"
  );
}

/**
 * Loads the edit overlay HTML once and returns the element.
 * @param {HTMLElement|null} editOverlayElement - The current edit overlay element (if already loaded).
 * @param {function} loadOverlayHtmlOnce - Function to load overlay HTML.
 * @returns {Promise<HTMLElement>} The loaded edit overlay element.
 */
export async function loadEditOverlayHtmlOnce(
  editOverlayElement,
  loadOverlayHtmlOnce
) {
  if (editOverlayElement) return editOverlayElement;
  return await loadOverlayHtmlOnce(
    "../js/templates/task-detail-edit-overlay.html",
    "overlay-task-detail-edit"
  );
}
