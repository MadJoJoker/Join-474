/**
 * Adds a click event listener to all checkboxes in the task detail overlays to toggle their checked state.
 */
document.addEventListener("DOMContentLoaded", () => {
  const overlays = [
    document.getElementById("overlay-task-detail"),
    document.getElementById("overlay-task-detail-edit"),
  ].filter(Boolean);

  overlays.forEach((overlay) => {
    overlay.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("click", () => {
        cb.checked = !cb.checked;
      });
    });
  });
});
