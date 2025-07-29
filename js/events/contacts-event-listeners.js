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

// -----------------------------
// New Contact Overlay Setup
// -----------------------------

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
    });
}

/**
 * Adds click listeners for all close/cancel buttons in the overlay.
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
 * Closes the overlay when the background is clicked.
 * @param {MouseEvent} event
 */
function setupOverlayClickToClose() {
    document.getElementById('contactOverlay').addEventListener('click', (event) => {
        if (event.target === event.currentTarget) {
            closeOverlay('contactOverlay');
        }
    });
}

/**
 * Fills the form with demo contact data on first input focus.
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
 * Sets up the click handler for creating a new contact.
 */
function setupCreateContactButton() {
    const createBtn = document.getElementById('createContactBtn');
    if (!createBtn) return console.warn('createContactBtn not found');
    createBtn.removeEventListener('click', handleNewContactSubmit);
    createBtn.addEventListener('click', handleNewContactSubmit);
}

/**
 * Reads values from new contact form inputs.
 * @returns {{ name: string, email: string, phone: string }}
 */
function getNewContactInputValues() {
    return {
        name: document.getElementById('newContactName').value.trim(),
        email: document.getElementById('newContactEmail').value.trim(),
        phone: document.getElementById('newContactPhone').value.trim()
    };
}

// -----------------------------
// Global Button Events (Delete, Edit, Back)
// -----------------------------

/**
 * Sets up event delegation for delete/edit/back buttons globally.
 */
function setupGlobalContactButtons() {
    document.addEventListener('click', handleGlobalContactClick);
}

/**
 * Handles global click events related to contact controls.
 * @param {MouseEvent} event
 */
async function handleGlobalContactClick(event) {
    const deleteBtn = event.target.closest('.delete-button');
    const editBtn = event.target.closest('.edit-button');
    const backBtn = event.target.closest('[data-action="close-mobile-contact"]');

    if (backBtn) {
        handleBackButtonClick();
        return;
    }
    if (deleteBtn) {
        await handleDeleteContactClick(deleteBtn);
        return;
    }
    if (editBtn) {
        handleEditContactClick(editBtn);
    }
}

/**
 * Handles mobile back button logic.
 */
function handleBackButtonClick() {
    document.body.classList.remove('mobile-contact-visible');
    setActiveContactId(null);
}

/**
 * Deletes a contact and updates the UI.
 * @param {HTMLElement} deleteBtn
 */
async function handleDeleteContactClick(deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (!id) return;
    await deleteContact(id);
    clearContactDetails();
    setActiveContactId(null);
    await renderContacts();
    document.body.classList.remove('mobile-contact-visible');
}

/**
 * Triggers contact editing.
 * @param {HTMLElement} editBtn
 */
function handleEditContactClick(editBtn) {
    const id = editBtn.dataset.id;
    if (!id) return;
    onEditContact(id);
}

/**
 * Clears the contact details area.
 */
function clearContactDetails() {
    const card = document.querySelector('.contact-details-card');
    if (card) card.innerHTML = '';
}

// -----------------------------
// Edit Contact Logic
// -----------------------------

/**
 * Sets up save and delete buttons in the edit form.
 */
function setupEditContactForm() {
    const saveButton = document.getElementById('saveEditBtn');
    const deleteButton = document.getElementById('deleteContactBtn');
    if (saveButton) saveButton.addEventListener('click', handleEditContactSave);
    if (deleteButton) deleteButton.addEventListener('click', handleEditContactDelete);
}

/**
 * Gets the input values from the edit contact form.
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
 * Combines form input with the existing contact to form an updated contact.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @returns {Object}
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
 * Updates the contact detail card if visible.
 * @param {Object} contact
 */
function updateDetailsCardIfVisible(contact) {
    const card = document.querySelector('.contact-details-card');
    if (card?.classList.contains('visible')) {
        card.innerHTML = createContactDetailsHTML(contact);
    }
}

/**
 * Deletes the contact currently being edited.
 */
async function handleEditContactDelete() {
    if (!currentlyEditingContact) return;
    await deleteContact(currentlyEditingContact.id);
    clearContactDetails();
    setActiveContactId(null);
    setCurrentlyEditingContact(null);
    closeOverlay('editContactOverlay', true);
    await renderContacts();
    document.body.classList.remove('mobile-contact-visible');
}

// -----------------------------
// Edit Overlay (Close Events)
// -----------------------------

/**
 * Initializes close overlay events for the edit form.
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
 * Closes overlay if background (not content) is clicked.
 * @param {MouseEvent} event
 */
function handleOverlayClickOutside(event) {
    if (event.target === event.currentTarget) {
        clearEditContactErrors();
        closeOverlay('editContactOverlay');
    }
}

/**
 * Closes the edit overlay when close button is clicked.
 */
function handleOverlayCloseClick() {
    clearEditContactErrors();
    closeOverlay('editContactOverlay');
}

// -----------------------------
// Validation
// -----------------------------

/**
 * Displays validation error messages in new contact form.
 * @param {Object} errors
 */
function showNewContactErrors(errors) {
    document.getElementById('nameError').textContent = errors.name;
    document.getElementById('emailError').textContent = errors.email;
    document.getElementById('phoneError').textContent = errors.phone;
}

/**
 * Clears all validation errors in the edit form.
 */
function clearEditContactErrors() {
    ['editNameError', 'editEmailError', 'editPhoneError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
    });
}

/**
 * Displays validation error messages in the edit form.
 * @param {Object} errors
 */
function showEditContactErrors(errors) {
    document.getElementById('editNameError').textContent = errors.name;
    document.getElementById('editEmailError').textContent = errors.email;
    document.getElementById('editPhoneError').textContent = errors.phone;
}

/**
 * Validates the edit form.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @returns {Object}
 */
function validateEditContact(name, email, phone) {
    return validateCustomContactForm(name, email, phone);
}

/**
 * Custom form validation shared across new/edit forms.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @returns {Object} error object
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
 * Checks if any validation errors exist.
 * @param {Object} errors
 * @returns {boolean}
 */
function hasErrors(errors) {
    return errors.name || errors.email || errors.phone;
}

// -----------------------------
// New Contact Submission
// -----------------------------

/**
 * Handles the creation of a new contact from form input.
 */
async function handleNewContactSubmit() {
    const input = getAndValidateNewContact();
    if (!input) return;
    const newContact = await createAndStoreContact(input);
    updateUIAfterContactCreated(newContact);
}

/**
 * Validates and returns new contact input.
 * @returns {Object|null}
 */
function getAndValidateNewContact() {
    const { name, email, phone } = getNewContactInputValues();
    const errors = validateCustomContactForm(name, email, phone);
    showNewContactErrors(errors);
    if (hasErrors(errors)) return null;
    return { name, email, phone };
}

/**
 * Saves the new contact and updates UI.
 * @param {Object} contactData
 * @returns {Object}
 */
async function createAndStoreContact(contactData) {
    const contact = await createContact(contactData);
    closeOverlay('contactOverlay', true);
    await renderContacts();
    showContactCreatedMessage();
    return contact;
}

/**
 * Updates the UI to show the newly created contact.
 * @param {Object} contact
 */
function updateUIAfterContactCreated(contact) {
    const existing = getContactById(contact.id);
    if (!existing) return;
    const card = document.querySelector('.contact-details-card');
    if (card) {
        card.innerHTML = createContactDetailsHTML(existing);
        card.classList.add('no-animation', 'visible');
    }
    setActiveContactId(contact.id);
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-contact-visible');
    }
}

// -----------------------------
// Contact List Click (Navigation)
// -----------------------------

/**
 * Handles click on contact list item to load detail view.
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

// -----------------------------
// Mobile Dropdown Menu Toggle
// -----------------------------

/**
 * Toggles mobile dropdown menu.
 */
function setupMobileDropdownToggle() {
    document.addEventListener('click', (event) => {
        const toggleBtn = event.target.closest('.dropdown-mobile-btn');
        const dropdown = document.querySelector('.mobile-dropdown-menu');
        if (toggleBtn && dropdown) {
            dropdown.classList.toggle('mobile-dropdown-menu-hidden');
        } else {
            if (!event.target.closest('.mobile-dropdown-menu')) {
                dropdown?.classList.add('mobile-dropdown-menu-hidden');
            }
        }
    });
}
