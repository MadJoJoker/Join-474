/**
 * Toggles the state of a checkbox and updates its SVG icon.
 * @param {HTMLElement} checkboxElem - The checkbox element or its container.
 */
export function toggleCheckbox(checkboxElem) {
  let cb, svg;
  if (checkboxElem.tagName === "INPUT" && checkboxElem.type === "checkbox") {
    cb = checkboxElem;
    svg = cb.parentElement.querySelector(".checkbox-icon");
  } else {
    cb = checkboxElem.querySelector('input[type="checkbox"]');
    svg = checkboxElem.querySelector(".checkbox-icon");
  }
  if (!cb || !svg) return;
  cb.checked = !cb.checked;
  if (cb.checked) {
    svg.innerHTML =
      '<rect x="1" y="1" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2" fill="white"/>' +
      '<path d="M3 9L7 13L15 3.5" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    svg.classList.add("checked");
  } else {
    svg.innerHTML =
      '<rect x="1" y="1" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2" fill="white"/>';
    svg.classList.remove("checked");
  }
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
