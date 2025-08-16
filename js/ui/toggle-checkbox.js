/**
 * Toggles the state of a checkbox and updates its SVG icon.
 * @param {HTMLElement} checkboxElem - The checkbox element or its container.
 */
/**
 * Updates the SVG icon for the checkbox.
 * @param {SVGElement} svg - The SVG element to update.
 * @param {boolean} checked - Whether the checkbox is checked.
 * @returns {void}
 */
function updateCheckboxSVG(svg, checked) {
  svg.innerHTML = checked
    ? '<rect x="1" y="1" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2" fill="white"/>' +
      '<path d="M3 9L7 13L15 3.5" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
    : '<rect x="1" y="1" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2" fill="white"/>';
  svg.classList.toggle("checked", checked);
}

export function toggleCheckbox(checkboxElem) {
  let cb =
    checkboxElem.tagName === "INPUT" && checkboxElem.type === "checkbox"
      ? checkboxElem
      : checkboxElem.querySelector('input[type="checkbox"]');
  let svg = cb
    ? cb.parentElement.querySelector(".checkbox-icon") ||
      checkboxElem.querySelector(".checkbox-icon")
    : null;
  if (!cb || !svg) return;
  cb.checked = !cb.checked;
  updateCheckboxSVG(svg, cb.checked);
}

/**
 * Initializes checkbox toggles for task details overlays.
 * @param {string} [overlaySelector="#overlay-task-detail, #overlay-task-detail-edit"] - The selector for the overlay(s) containing checkboxes.
 */
export function initTaskDetailsCheckboxToggles(
  overlaySelector = "#overlay-task-detail, #overlay-task-detail-edit"
) {
  const overlay = document.querySelector(overlaySelector);
  if (!overlay) return;
  overlay.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("click", (e) => {
      e.stopPropagation();
      cb.checked = !cb.checked;
    });
  });
}
