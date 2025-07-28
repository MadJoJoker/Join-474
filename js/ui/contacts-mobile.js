document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 1150) {
    console.log('[mobile] Initializing contact-mobile UI features...');
  }

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

  // Mobile Dropdown Buttons
  document.addEventListener('click', (event) => {
    // Öffnet Dropdown wenn Button geklickt wird
    if (event.target.closest('.dropdown-mobile-btn')) {
      const clickedButton = event.target.closest('.dropdown-mobile-btn');
      const menu = clickedButton.nextElementSibling;
      // Alle anderen Dropdowns schließen
      document.querySelectorAll('.mobile-dropdown-menu.show').forEach((otherMenu) => {
        if (otherMenu !== menu) otherMenu.classList.remove('show');
      });
      if (menu && menu.classList.contains('mobile-dropdown-menu')) {
        menu.classList.toggle('show');
      }
      event.stopPropagation();
      return;
    }

    // Klick außerhalb → Alle schließen
    document.querySelectorAll('.mobile-dropdown-menu.show').forEach((menu) => {
      menu.classList.remove('show');
    });
  });
});