// contact-mobile.js

/**
 * Initialisiert mobile-spezifische Interaktionen.
 */
document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 1150) {
    console.log('[mobile] Initializing contact-mobile UI features...');
    setupDropdowns();
    setupMobileSuccessMessage();
  }
});

function setupDropdowns() {
  // Beispiel: Dropdown-Menü statt Button
  const dropdownTrigger = document.querySelector('#dropdownToggle');
  const dropdownMenu = document.querySelector('#dropdownMenu');

  if (dropdownTrigger && dropdownMenu) {
    dropdownTrigger.addEventListener('click', () => {
      dropdownMenu.classList.toggle('visible');
    });
  }
}

function setupMobileSuccessMessage() {
  const successMsg = document.getElementById('contactSuccessMsg');
  if (!successMsg) return;

  successMsg.classList.add('slide-in-bottom');

  setTimeout(() => {
    successMsg.classList.remove('slide-in-bottom');
  }, 2400);
}

document.addEventListener('DOMContentLoaded', () => {
  // Add Contact Overlay (mobile)
  const closeBtnAddMobile = document.getElementById('closeOverlayBtnMobile');
  if (closeBtnAddMobile) {
    closeBtnAddMobile.addEventListener('click', () => {
      closeOverlay('contactOverlay');
    });
  }

  // Edit Contact Overlay (mobile)
  const closeBtnEditMobile = document.getElementById('closeEditOverlayBtnMobile');
  if (closeBtnEditMobile) {
    closeBtnEditMobile.addEventListener('click', () => {
      closeOverlay('editContactOverlay');
    });
  }
});