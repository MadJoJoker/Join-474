// Checkbox toggle via event listener for task-details-overlay
// Füge dieses Script als Modul in dein Overlay ein

document.addEventListener('DOMContentLoaded', () => {
  const overlays = [
    document.getElementById('overlay-task-detail'),
    document.getElementById('overlay-task-detail-edit')
  ].filter(Boolean);

  overlays.forEach(overlay => {
    overlay.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('click', e => {
        cb.checked = !cb.checked;
      });
    });
  });
});
