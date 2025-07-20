/**
 * Opens a modal overlay with a slide-in effect.
 *
 * @param {string} id - The ID of the overlay element to open.
 */
export function openOverlay(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove('hidden', 'slide-out');
  overlay.classList.add('slide-in', 'active');
}

/**
 * Closes a modal overlay with a slide-out effect.
 *
 * @param {string} id - The ID of the overlay element to close.
 * @param {boolean} [immediate=false] - If true, closes immediately without animation.
 */
export function closeOverlay(id, immediate = false) {
  const overlay = document.getElementById(id);
  if (immediate) {
    overlay.classList.add('hidden');
    overlay.classList.remove('slide-in', 'slide-out', 'active');
    return;
  }
  overlay.classList.remove('slide-in');
  overlay.classList.add('slide-out');
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('slide-out', 'active');
  }, 400);
}

/**
 * Displays a "Contact successfully created" message for a short duration.
 */
export function showContactCreatedMessage() {
  const message = document.getElementById('contactSuccessMsg');
  message.classList.remove('hidden', 'slide-in', 'slide-out');
  void message.offsetWidth;
  requestAnimationFrame(() => {
    message.classList.add('slide-in');
  });
  setTimeout(() => {
    message.classList.remove('slide-in');
    message.classList.add('slide-out');
    setTimeout(() => {
      message.classList.add('hidden');
    }, 400);
  }, 2000);
}