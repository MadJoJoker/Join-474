// Toggle function for checkboxes in task-details-overlay
// Usage: Add 'onclick="toggleCheckbox(this)"' to your checkbox input or label

export function toggleCheckbox(checkboxElem) {
  if (checkboxElem.tagName === 'INPUT' && checkboxElem.type === 'checkbox') {
    checkboxElem.checked = !checkboxElem.checked;
  } else if (checkboxElem.querySelector('input[type="checkbox"]')) {
    const cb = checkboxElem.querySelector('input[type="checkbox"]');
    cb.checked = !cb.checked;
  }
}

// Optional: Attach event listeners automatically for all checkboxes in the overlay
export function initTaskDetailsCheckboxToggles(overlaySelector = '#overlay-task-detail, #overlay-task-detail-edit') {
  const overlay = document.querySelector(overlaySelector);
  if (!overlay) return;
  overlay.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('click', e => {
      e.stopPropagation();
      cb.checked = !cb.checked;
    });
  });
}
