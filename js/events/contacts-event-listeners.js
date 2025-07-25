// Contact logic (CRUD operations & helper)
import { createContact, deleteContact, updateContact, getInitials } from './contact-actions.js';
// UI overlays & messages
import { openOverlay, closeOverlay, showContactCreatedMessage } from '../ui/contacts-overlays.js';
// Shared application state (current/active contact)
import { currentlyEditingContact, setCurrentlyEditingContact, setActiveContactId, getContactById } from '../data/contacts-state.js';
// Contact list and detail rendering
import { renderContacts } from '../ui/render-contacts.js';
import { createContactDetailsHTML } from '../templates/contacts-templates.js';

/**
 * Initializes all event listeners for the contact management page.
 */
export function initContactEventListeners() {
    setupNewContactOverlay();
    setupContactDeletion();
    setupEditContactForm();
    setupEditOverlayEvents();
}

/**
 * Sets up all logic for opening and closing the new contact overlay.
 */
function setupNewContactOverlay() {
    setupOpenNewContactOverlayButton();
    setupCloseNewContactOverlayButtons();
    setupOverlayClickToClose();
    setupDemoContactAutofill();
}

/**
 * Adds click listener to the "Add Contact" button.
 */
function setupOpenNewContactOverlayButton() {
    document.querySelector('.add-new-contact-button').addEventListener('click', () => {
        clearNewContactFormInputs();
        openOverlay('contactOverlay');
        setupCreateContactButton(); // << wichtig!
    });
}

/**
 * Adds listeners for both close and cancel buttons on the new contact overlay.
 */
function setupCloseNewContactOverlayButtons() {
    const ids = ['closeOverlayBtn', 'cancelOverlayBtn', 'closeOverlayBtnMobile'];
    ids.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => closeOverlay('contactOverlay'));
        }
    });
}

/**
 * Closes the overlay if the background area (outside modal) is clicked.
 */
function setupOverlayClickToClose() {
    document.getElementById('contactOverlay').addEventListener('click', (event) => {
        if (event.target === event.currentTarget) {
            closeOverlay('contactOverlay');
        }
    });
}

/**
 * Autofills demo contact data on first input focus.
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
 * Sets up the click handler for the "Create contact" button.
 */
function setupCreateContactButton() {
    const createBtn = document.getElementById('createContactBtn');
    if (!createBtn) return console.warn('createContactBtn not found');
    createBtn.removeEventListener('click', handleNewContactSubmit); // prevent duplicates
    createBtn.addEventListener('click', handleNewContactSubmit);
}

/**
 * Reads and trims input values from the new contact form fields.
 * @returns {{ name: string, email: string, phone: string }}
 */
function getNewContactInputValues() {
    return {
        name: document.getElementById('newContactName').value.trim(),
        email: document.getElementById('newContactEmail').value.trim(),
        phone: document.getElementById('newContactPhone').value.trim()
    };
}

/**
 * Sets up global click listener to handle deletion via .delete-button.
 */
function setupContactDeletion() {
    document.addEventListener('click', async (event) => {
        const deleteBtn = event.target.closest('.delete-button');
        if (!deleteBtn) return;
        const id = deleteBtn.dataset.id;
        if (!id) return;
        await deleteContact(id);
        document.querySelector('.contact-details-card').innerHTML = '';
        setActiveContactId(null);
        renderContacts();
    });
}

/**
 * Adds event listeners to the save and delete buttons in the edit overlay.
 */
function setupEditContactForm() {
    const saveButton = document.getElementById('saveEditBtn');
    const deleteButton = document.getElementById('deleteContactBtn');
    if (saveButton) saveButton.addEventListener('click', handleEditContactSave);
    if (deleteButton) deleteButton.addEventListener('click', handleEditContactDelete);
}

/**
 * Reads and trims input values from the edit contact form fields.
 * @returns {{ name: string, email: string, phone: string }}
 */
function getEditContactInputValues() {
    return {
        name: document.getElementById('editNameInput').value.trim(),
        email: document.getElementById('editEmailInput').value.trim(),
        phone: document.getElementById('editPhoneInput').value.trim()
    };
}

/**
 * Combines edited input with the existing contact data.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @returns {Object} Updated contact object
 */
function buildUpdatedContact(name, email, phone) {
    return {
        ...currentlyEditingContact,
        name,
        email,
        phone,
        initials: getInitials(name)
    };
}

/**
 * Updates the contact detail card if it's currently open and visible.
 */
function updateDetailsCardIfVisible(contact) {
    const card = document.querySelector('.contact-details-card');
    if (card?.classList.contains('visible')) {
        card.innerHTML = createContactDetailsHTML(contact);
    }
}

/**
 * Deletes the currently edited contact.
 */
async function handleEditContactDelete() {
    if (!currentlyEditingContact) return;
    await deleteContact(currentlyEditingContact.id);
    document.querySelector('.contact-details-card').innerHTML = '';
    setActiveContactId(null);
    setCurrentlyEditingContact(null);
    closeOverlay('editContactOverlay', true);
    renderContacts();
}

/**
 * Initializes the close logic for the edit overlay (click outside or close button).
 */
function setupEditOverlayEvents() {
    const overlay = document.getElementById('editContactOverlay');
    const closeButton = document.getElementById('closeEditOverlayBtn');
    const mobileCloseButton = document.getElementById('closeEditOverlayBtnMobile');
    overlay.addEventListener('click', handleOverlayClickOutside);
    if (closeButton) closeButton.addEventListener('click', handleOverlayCloseClick);
    if (mobileCloseButton) mobileCloseButton.addEventListener('click', handleOverlayCloseClick);
}

/**
 * Closes the overlay if the background is clicked.
 */
function handleOverlayClickOutside(event) {
    if (event.target === event.currentTarget) {
        clearEditContactErrors();
        closeOverlay('editContactOverlay');
    }
}

/**
 * Closes the overlay when the close button is clicked.
 */
function handleOverlayCloseClick() {
    clearEditContactErrors();
    closeOverlay('editContactOverlay');
}

// VALIDATION

/**
 * Displays validation error messages in the corresponding UI elements.
 * @param {Object} errors - An object with possible error messages
 */
function showNewContactErrors(errors) {
    document.getElementById('nameError').textContent = errors.name;
    document.getElementById('emailError').textContent = errors.email;
    document.getElementById('phoneError').textContent = errors.phone;
}

/**
 * Clears all validation error messages in the edit contact form.
 * This ensures that old errors are not displayed when reopening the overlay.
 */
function clearEditContactErrors() {
    ['editNameError', 'editEmailError', 'editPhoneError'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = '';
    });
}

/**
 * Displays validation error messages in the edit contact form.
 * @param {Object} errors - Error messages for each field
 */
function showEditContactErrors(errors) {
    document.getElementById('editNameError').textContent = errors.name;
    document.getElementById('editEmailError').textContent = errors.email;
    document.getElementById('editPhoneError').textContent = errors.phone;
}

/**
 * Custom validation for editing a contact.
 */
function validateEditContact(name, email, phone) {
    return validateCustomContactForm(name, email, phone); // reuse same rules
}

/**
 * Custom form validation logic.
 */
function validateCustomContactForm(name, email, phone) {
    const errors = { name: '', email: '', phone: '' };
    if (!name || !/^[A-Za-zÄÖÜäöüß\-]{2,}\s+[A-Za-zÄÖÜäöüß\-]{2,}$/.test(name)) {
        errors.name = 'Please enter first and last name separated by a space, no numbers.';
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        errors.email = 'Please enter a valid email address.';
    }
    if (!phone || !/^\+?[0-9\s\/\-]{6,}$/.test(phone)) {
        errors.phone = 'Please enter a valid phone number (digits only, no letters).';
    }
    return errors;
}

/**
 * Handles creating a new contact from input fields.
 * Validates input, displays errors, creates contact if valid.
 */
async function handleNewContactSubmit() {
    // 1. Input-Werte aus den Feldern holen
    const { name, email, phone } = getNewContactInputValues();

    // 2. Eingaben validieren
    const errors = validateCustomContactForm(name, email, phone);

    // 3. Validierungsfehler im UI anzeigen
    showNewContactErrors(errors);

    // 4. Abbrechen, wenn Fehler vorhanden sind
    if (hasErrors(errors)) return;

    // 5. Neuen Kontakt speichern und UI aktualisieren
    await createContact({ name, email, phone });
    closeOverlay('contactOverlay', true);
    renderContacts();
    showContactCreatedMessage();
}

/**
 * Handles saving an edited contact.
 * Validates input, updates contact, refreshes UI.
 */
async function handleEditContactSave() {
    const { name, email, phone } = getEditContactInputValues();
    const errors = validateEditContact(name, email, phone);
    showEditContactErrors(errors);
    if (hasErrors(errors) || !currentlyEditingContact) return;
    const updatedContact = buildUpdatedContact(name, email, phone);
    await updateContact(updatedContact);
    closeOverlay('editContactOverlay', true);
    await renderContacts();
    const latestContact = getContactById(updatedContact.id) || updatedContact;
    updateDetailsCardIfVisible(latestContact);
    setCurrentlyEditingContact(null);
}

/**
 * Checks if any error messages are present.
 * @param {Object} errors - An object with error messages
 * @returns {boolean} - True if there are any errors, otherwise false
 */
function hasErrors(errors) {
    return errors.name || errors.email || errors.phone;
}

/**
 * Clears all input fields in the new contact form.
 */
function clearNewContactFormInputs() {
    ['newContactName', 'newContactEmail', 'newContactPhone'].forEach(inputId => {
        document.getElementById(inputId).value = '';
        const errorDiv = document.getElementById(inputId.replace('newContact', '').toLowerCase() + 'Error');
        if (errorDiv) errorDiv.textContent = '';
    });
}