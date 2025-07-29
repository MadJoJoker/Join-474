/**
 * Initializes mobile-specific UI logic after the DOM is fully loaded.
 * This ensures all elements are available before event listeners are attached.
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeMobileUI();
});

/**
 * Initializes mobile-specific UI features on DOM load.
 */
function initializeMobileUI() {
  setupMobileCloseButtons();
  setupMobileDropdownHandler();
}

/**
 * Sets up the close buttons for the mobile add/edit overlays.
 */
function setupMobileCloseButtons() {
  setupButtonClick('closeOverlayBtnMobile', () => closeOverlay('contactOverlay'));
  setupButtonClick('closeEditOverlayBtnMobile', () => closeOverlay('editContactOverlay'));
}

/**
 * Adds a click event listener to a button by its ID.
 * @param {string} id - The ID of the button element
 * @param {Function} handler - The function to call on click
 */
function setupButtonClick(id, handler) {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', handler);
  }
}

/**
 * Sets up dropdown menu toggle and global close on document click.
 */
function setupMobileDropdownHandler() {
  document.addEventListener('click', handleDropdownClick);
}

/**
 * Handles global click events to toggle or close mobile dropdown menus.
 * @param {MouseEvent} event
 */
function handleDropdownClick(event) {
  const dropdownBtn = getClickedDropdownButton(event);
  if (dropdownBtn) {
    const menu = getAssociatedDropdownMenu(dropdownBtn);
    closeAllOtherDropdowns(menu);
    toggleDropdownMenu(menu);
    event.stopPropagation();
    return;
  }
  closeAllDropdowns();
}

/**
 * Returns the clicked dropdown button element, if any.
 * @param {MouseEvent} event
 * @returns {Element|null}
 */
function getClickedDropdownButton(event) {
  return event.target.closest('.dropdown-mobile-btn');
}

/**
 * Returns the dropdown menu associated with a button.
 * @param {Element} dropdownBtn
 * @returns {Element|null}
 */
function getAssociatedDropdownMenu(dropdownBtn) {
  const menu = dropdownBtn?.nextElementSibling;
  return (menu && menu.classList.contains('mobile-dropdown-menu')) ? menu : null;
}

/**
 * Closes all dropdowns except the one provided.
 * @param {Element|null} excludeMenu - The menu to keep open
 */
function closeAllOtherDropdowns(excludeMenu) {
  document.querySelectorAll('.mobile-dropdown-menu.show').forEach(menu => {
    if (menu !== excludeMenu) menu.classList.remove('show');
  });
}

/**
 * Closes all dropdown menus.
 */
function closeAllDropdowns() {
  document.querySelectorAll('.mobile-dropdown-menu.show').forEach(menu => {
    menu.classList.remove('show');
  });
}

/**
 * Toggles the visibility of a dropdown menu.
 * @param {Element|null} menu
 */
function toggleDropdownMenu(menu) {
  if (menu) {
    menu.classList.toggle('show');
  }
}