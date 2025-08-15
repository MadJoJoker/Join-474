// Contact deletion (other CRUD live in helpers)
import { deleteContact } from './contact-actions.js';
// Overlay controls
import { openOverlay, closeOverlay } from '../ui/contacts-overlays.js';
// App state for selected/active contact
import { currentlyEditingContact, setCurrentlyEditingContact, setActiveContactId } from '../data/contacts-state.js';
// Rerender contact list
import { renderContacts } from '../ui/render-contacts.js';
// Submit handlers (create & edit flows)
import { handleNewContactSubmit, handleEditContactSave } from './contacts-submit-helpers.js';
// Validation utilities (clear errors, reset live-validation flags)
import { clearEditContactErrors, resetNewLiveValidationFlag, resetEditLiveValidationFlag } from './contacts-validation.js';

/**
 * Bootstraps all event listeners used on the contacts page.
 * Wires overlay open/close, global buttons, edit form, list navigation, and mobile dropdown.
 */
export function initContactEventListeners() {
    setupNewContactOverlay();
    setupGlobalContactButtons();
    setupEditContactForm();
    setupEditOverlayEvents();
    setupContactListClickNavigation();
    setupMobileDropdownToggle();
}

/**
 * Sets up handlers around the "Add New Contact" overlay lifecycle.
 */
function setupNewContactOverlay() {
    setupOpenNewContactOverlayButton();
    setupCloseNewContactOverlayButtons();
    setupOverlayClickToClose();
    setupDemoContactAutofill();
}

/**
 * Binds the floating/primary "Add New Contact" button to open the overlay.
 * Clears inputs and resets live-validation flags before opening.
 */
function setupOpenNewContactOverlayButton() {
    document.querySelector('.add-new-contact-button').addEventListener('click', () => {
        clearNewContactFormInputs();
        resetNewLiveValidationFlag();
        openOverlay('contactOverlay');
        setupCreateContactButton();
    });
}

/**
 * Attaches click handlers to all close/cancel buttons within the "Add New Contact" overlay.
 */
function setupCloseNewContactOverlayButtons() {
    const ids = ['closeOverlayBtn', 'cancelOverlayBtn', 'closeOverlayBtnMobile'];
    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', () => closeOverlay('contactOverlay'));
    });
}

/**
 * Closes the "Add New Contact" overlay when clicking on its backdrop.
 */
function setupOverlayClickToClose() {
    document.getElementById('contactOverlay').addEventListener('click', (event) => {
        if (event.target === event.currentTarget) {
            closeOverlay('contactOverlay');
        }
    });
}

/**
 * Populates demo values into the "Add New Contact" form on first focus of any input.
 * Useful for quick testing and demos; runs only once.
 */
function setupDemoContactAutofill() {
    let demoContactFilled = false;
    function fillDemoContact() {
        if (demoContactFilled) return;
        document.getElementById('newContactName').value = 'Demo Contact';
        document.getElementById('newContactEmail').value = 'democontact@demo.con';
        document.getElementById('newContactPhone').value = '+12345-123456789';
        demoContactFilled = true;
    }
    ['newContactName', 'newContactEmail', 'newContactPhone'].forEach(id => {
        document.getElementById(id).addEventListener('focus', fillDemoContact);
    });
}

/**
 * Binds the "Create contact" button click to the submit handler.
 * Removes stale listeners first to avoid duplicates.
 */
function setupCreateContactButton() {
    const createBtn = document.getElementById('createContactBtn');
    if (!createBtn) return console.warn('createContactBtn not found');
    createBtn.removeEventListener('click', handleNewContactSubmit);
    createBtn.addEventListener('click', handleNewContactSubmit);
}

/**
 * Listens globally for clicks that map to back/delete/edit actions within contact cards.
 * Back and delete actions short-circuit to prevent further processing.
 */
function setupGlobalContactButtons() {
    document.addEventListener('click', async (event) => {
        if (handleBackButton(event)) return;
        if (await handleDeleteButton(event)) return;
        handleEditButton(event);
    });
}

/**
 * Handles the mobile "back" action in details view.
 * @param {MouseEvent} event - The click event.
 * @returns {boolean} True when handled.
 */
function handleBackButton(event) {
    const backBtn = event.target.closest('[data-action="close-mobile-contact"]');
    if (!backBtn) return false;
    document.body.classList.remove('mobile-contact-visible');
    setActiveContactId(null);
    return true;
}

/**
 * Handles deletion of a contact when clicking a delete button within a contact item.
 * @param {MouseEvent} event - The click event.
 * @returns {Promise<boolean>} True when handled.
 */
async function handleDeleteButton(event) {
    const deleteBtn = event.target.closest('.delete-button');
    if (!deleteBtn) return false;
    const id = deleteBtn.dataset.id;
    if (!id) return true;
    await deleteContact(id);
    document.querySelector('.contact-details-card').innerHTML = '';
    setActiveContactId(null);
    await renderContacts();
    document.body.classList.remove('mobile-contact-visible');
    return true;
}

/**
 * Opens the edit overlay for the clicked contact.
 * Expects a global or imported `onEditContact(id)` to exist.
 * @param {MouseEvent} event - The click event.
 */
function handleEditButton(event) {
    const editBtn = event.target.closest('.edit-button');
    if (!editBtn) return;
    const id = editBtn.dataset.id;
    if (!id) return;
    onEditContact(id);
}

/**
 * Wires up the Save & Delete actions within the edit overlay.
 * Save uses imported submit helper; Delete is handled below in this file.
 */
function setupEditContactForm() {
    const saveButton = document.getElementById('saveEditBtn');
    const deleteButton = document.getElementById('deleteContactBtn');
    if (saveButton) saveButton.addEventListener('click', handleEditContactSave);
    if (deleteButton) deleteButton.addEventListener('click', handleEditContactDelete);
}

/**
 * Deletes the currently edited contact (relies on global edit state).
 * Closes overlay, rerenders list, and resets mobile view.
 * Safe-guards if state is not present.
 * @returns {Promise<void>}
 */
async function handleEditContactDelete() {
    if (!currentlyEditingContact) return;
    const id = currentlyEditingContact.id;
    if (!id) return;
    await deleteContact(id);
    document.querySelector('.contact-details-card').innerHTML = '';
    setActiveContactId(null);
    setCurrentlyEditingContact(null);
    closeOverlay('editContactOverlay', true);
    await renderContacts();
    document.body.classList.remove('mobile-contact-visible');
}

/**
 * Sets up edit overlay close behavior (backdrop click and explicit close buttons).
 * Also resets the edit live-validation flag on open.
 */
function setupEditOverlayEvents() {
    const overlay = document.getElementById('editContactOverlay');
    const closeButton = document.getElementById('closeEditOverlayBtn');
    const mobileCloseButton = document.getElementById('closeEditOverlayBtnMobile');
    resetEditLiveValidationFlag();
    overlay.addEventListener('click', handleOverlayClickOutside);
    if (closeButton) closeButton.addEventListener('click', handleOverlayCloseClick);
    if (mobileCloseButton) mobileCloseButton.addEventListener('click', handleOverlayCloseClick);
}

/**
 * Closes the edit overlay when clicking the backdrop.
 * @param {MouseEvent} event - The click event.
 */
function handleOverlayClickOutside(event) {
    if (event.target === event.currentTarget) {
        clearEditContactErrors();
        closeOverlay('editContactOverlay');
    }
}

/**
 * Closes the edit overlay when clicking the close button.
 */
function handleOverlayCloseClick() {
    clearEditContactErrors();
    closeOverlay('editContactOverlay');
}

/**
 * Enables clicking on a contact row to open its details,
 * while ignoring clicks on nested edit/delete buttons within the row.
 */
function setupContactListClickNavigation() {
    document.addEventListener('click', (event) => {
        const contactEl = event.target.closest('.contact');
        if (!contactEl) return;
        const isEditOrDelete = event.target.closest('.edit-button, .delete-button');
        if (isEditOrDelete) return;
        const contactId = contactEl.dataset.id;
        if (!contactId) return;
        onContactClickById(contactId);
    });
}

/**
 * Toggles the floating mobile dropdown menu and closes it when clicking outside.
 */
function setupMobileDropdownToggle() {
    document.addEventListener('click', (element) => {
        const toggleBtn = element.target.closest('.dropdown-mobile-btn');
        const dropdown = document.querySelector('.mobile-dropdown-menu');
        if (toggleBtn && dropdown) {
            dropdown.classList.toggle('mobile-dropdown-menu-hidden');
        } else {
            const clickedInsideDropdown = element.target.closest('.mobile-dropdown-menu');
            if (!clickedInsideDropdown) {
                dropdown?.classList.add('mobile-dropdown-menu-hidden');
            }
        }
    });
}

/**
 * Clears the "Add New Contact" form inputs and related error UI.
 */
function clearNewContactFormInputs() {
    ['newContactName', 'newContactEmail', 'newContactPhone'].forEach(inputId => {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.value = '';
        input.classList.remove('input-error');
        const errorDiv = document.getElementById(
            inputId.replace('newContact', '').toLowerCase() + 'Error'
        );
        if (errorDiv) errorDiv.textContent = '';
    });
}