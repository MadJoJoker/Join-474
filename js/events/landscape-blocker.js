/**
 * @file landscape-blocker.js
 * This script checks if the user is using a small screen (1024px or less)
 * in landscape orientation. If so, it shows a blocking overlay.
 * The overlay HTML must already be in the HTML file.
 */

/**
 * @returns {void}
 * Checks screen orientation and toggles the overlay visibility
 */
async function checkLandscapeOverlay() {
  const isLandscape = window.matchMedia("(orientation: landscape) and (max-width: 1024px)").matches;
  const overlay = document.getElementById("landscape-overlay");
  if (!overlay) return;
  if (isLandscape) {
    overlay.classList.add("show");
    document.body.classList.add("landscape-blocked");
  } else {
    overlay.classList.remove("show");
    document.body.classList.remove("landscape-blocked");
  }
}

// Run once when the page loads
window.addEventListener("load", checkLandscapeOverlay);

// Run when the screen is resized
window.addEventListener("resize", checkLandscapeOverlay);

// Run when device is rotated
window.addEventListener("orientationchange", checkLandscapeOverlay);