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
    setupGlobalContactButtons();
    setupEditContactForm();
    setupEditOverlayEvents();
    setupContactListClickNavigation();
    setupMobileDropdownToggle();
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
        setupCreateContactButton();
        setupLiveValidationForNewContactForm();
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
    createBtn.removeEventListener('click', handleNewContactSubmit);
    createBtn.addEventListener('click', handleNewContactSubmit);
}

/**
 * Sets up live validation for the "Add New Contact" form inputs.
 * Validates name, email, and phone fields as the user types.
 */
function setupLiveValidationForNewContactForm() {
    setupLiveFieldValidation(
        'newContactName',
        getNewContactName,
        'nameError',
        validateName
    );
    setupLiveFieldValidation(
        'newContactEmail',
        getNewContactEmail,
        'emailError',
        validateEmail
    );
    setupLiveFieldValidation(
        'newContactPhone',
        getNewContactPhone,
        'phoneError',
        validatePhone
    );
}

/**
 * Retrieves the current value of the "New Contact Name" input.
 * @returns {string}
 */
function getNewContactName() {
    return document.getElementById('newContactName')?.value.trim() || '';
}

/**
 * Retrieves the current value of the "New Contact Email" input.
 * @returns {string}
 */
function getNewContactEmail() {
    return document.getElementById('newContactEmail')?.value.trim() || '';
}

/**
 * Retrieves the current value of the "New Contact Phone" input.
 * @returns {string}
 */
function getNewContactPhone() {
    return document.getElementById('newContactPhone')?.value.trim() || '';
}

/**
 * Validates the name field using the global validation logic.
 * @param {string} name - The name to validate.
 * @returns {string} Error message or empty string.
 */
function validateName(name) {
    return validateCustomContactForm(name, '', '').name;
}

/**
 * Validates the email field using the global validation logic.
 * @param {string} email - The email to validate.
 * @returns {string} Error message or empty string.
 */
function validateEmail(email) {
    return validateCustomContactForm('', email, '').email;
}

/**
 * Validates the phone field using the global validation logic.
 * @param {string} phone - The phone number to validate.
 * @returns {string} Error message or empty string.
 */
function validatePhone(phone) {
    return validateCustomContactForm('', '', phone).phone;
}

/**
 * Sets up real-time validation for a single input field.
 * @param {string} inputId - The ID of the input field.
 * @param {() => string} getValue - A function that returns the current input value.
 * @param {string} errorId - The ID of the element to display the error message in.
 * @param {(value: string) => string} validateFn - A function that returns an error message or empty string.
 */
function setupLiveFieldValidation(inputId, getValue, errorId, validateFn) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(errorId);
    if (!input || !errorElement) return;
    input.addEventListener('input', () => {
        const value = getValue();
        const error = validateFn(value);
        errorElement.textContent = error || '';
        toggleErrorClass(input, !!error);
    });
}

/**
 * Sets up live validation for the "Edit Contact" form inputs.
 * Applies validation to name, email, and phone fields.
 */
function setupLiveValidationForEditContactForm() {
    const fields = [
        { inputId: 'editNameInput', errorId: 'editNameError', getValue: getEditName, validate: validateName },
        { inputId: 'editEmailInput', errorId: 'editEmailError', getValue: getEditEmail, validate: validateEmail },
        { inputId: 'editPhoneInput', errorId: 'editPhoneError', getValue: getEditPhone, validate: validatePhone },
    ];
    fields.forEach(({ inputId, errorId, getValue, validate }) => {
        setupLiveFieldValidation(inputId, getValue, errorId, validate);
    });
}

/**
 * Retrieves the current value of the "Edit Contact Name" input.
 * @returns {string}
 */
function getEditName() {
    return document.getElementById('editNameInput')?.value.trim() || '';
}

/**
 * Retrieves the current value of the "Edit Contact Email" input.
 * @returns {string}
 */
function getEditEmail() {
    return document.getElementById('editEmailInput')?.value.trim() || '';
}

/**
 * Retrieves the current value of the "Edit Contact Phone" input.
 * @returns {string}
 */
function getEditPhone() {
    return document.getElementById('editPhoneInput')?.value.trim() || '';
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
 * Sets up global click listener for contact actions (edit, delete, back).
 */
function setupGlobalContactButtons() {
    document.addEventListener('click', async (event) => {
        if (handleBackButton(event)) return;
        if (await handleDeleteButton(event)) return;
        handleEditButton(event);
    });
}

/**
 * Handles the back button on mobile view.
 * @param {MouseEvent} event
 * @returns {boolean} True if handled.
 */
function handleBackButton(event) {
    const backBtn = event.target.closest('[data-action="close-mobile-contact"]');
    if (!backBtn) return false;
    document.body.classList.remove('mobile-contact-visible');
    setActiveContactId(null);
    return true;
}

/**
 * Handles the delete contact button.
 * @param {MouseEvent} event
 * @returns {Promise<boolean>} True if delete action was triggered.
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
 * Handles the edit contact button.
 * @param {MouseEvent} event
 */
function handleEditButton(event) {
    const editBtn = event.target.closest('.edit-button');
    if (!editBtn) return;
    const id = editBtn.dataset.id;
    if (!id) return;
    onEditContact(id);
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
    await renderContacts();
    document.body.classList.remove('mobile-contact-visible');
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
    setupLiveValidationForEditContactForm();
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
    const nameInput = document.getElementById('newContactName');
    const emailInput = document.getElementById('newContactEmail');
    const phoneInput = document.getElementById('newContactPhone');
    document.getElementById('nameError').textContent = errors.name;
    document.getElementById('emailError').textContent = errors.email;
    document.getElementById('phoneError').textContent = errors.phone;
    toggleErrorClass(nameInput, !!errors.name);
    toggleErrorClass(emailInput, !!errors.email);
    toggleErrorClass(phoneInput, !!errors.phone);
}

/**
 * Clears all validation error messages in the edit contact form.
 * This ensures that old errors are not displayed when reopening the overlay.
 */
function clearEditContactErrors() {
    const map = [
        ['editNameInput', 'editNameError'],
        ['editEmailInput', 'editEmailError'],
        ['editPhoneInput', 'editPhoneError'],
    ];
    map.forEach(([inputId, errorId]) => {
        const el = document.getElementById(errorId);
        if (el) el.textContent = '';
        const input = document.getElementById(inputId);
        if (input) input.classList.remove('input-error');
    });
}

/**
 * Displays validation error messages in the edit contact form.
 * @param {Object} errors - Error messages for each field
 */
function showEditContactErrors(errors) {
    const nameInput = document.getElementById('editNameInput');
    const emailInput = document.getElementById('editEmailInput');
    const phoneInput = document.getElementById('editPhoneInput');
    document.getElementById('editNameError').textContent = errors.name;
    document.getElementById('editEmailError').textContent = errors.email;
    document.getElementById('editPhoneError').textContent = errors.phone;
    toggleErrorClass(nameInput, !!errors.name);
    toggleErrorClass(emailInput, !!errors.email);
    toggleErrorClass(phoneInput, !!errors.phone);
}

/**
 * Custom validation for editing a contact.
 */
function validateEditContact(name, email, phone) {
    return validateCustomContactForm(name, email, phone);
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
        errors.phone = 'Please enter a valid phone number (digits only, min. 6).';
    }
    return errors;
}

function toggleErrorClass(inputEl, hasError) {
    if (!inputEl) return;
    inputEl.classList.toggle('input-error', !!hasError);
}

/**
 * Handles creating a new contact from input fields.
 * Validates input, displays errors, creates contact if valid.
 */
async function handleNewContactSubmit() {
    const { name, email, phone } = getNewContactInputValues();
    const errors = validateCustomContactForm(name, email, phone);
    showNewContactErrors(errors);
    if (hasErrors(errors)) return;
    const newContact = await createContact({ name, email, phone });
    closeOverlay('contactOverlay', true);
    await renderContacts();
    showContactCreatedMessage();
    const contact = getContactById(newContact.id);
    if (contact) {
        const contactDetailsCard = document.querySelector('.contact-details-card');
        if (contactDetailsCard) {
            contactDetailsCard.innerHTML = createContactDetailsHTML(contact);
            contactDetailsCard.classList.add('no-animation', 'visible');
        }
        setActiveContactId(contact.id);
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-contact-visible');
        }
    }
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

/**
 * Sets up click navigation for the contact list.
 * 
 * - Detects clicks on contact list items.
 * - Ignores clicks on edit/delete buttons inside a contact item.
 * - Triggers the contact detail view for the clicked contact.
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
 * Sets up toggle behavior for the mobile dropdown menu.
 * 
 * - Toggles the visibility of the mobile dropdown when the toggle button is clicked.
 * - Hides the dropdown menu when clicking outside of it.
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