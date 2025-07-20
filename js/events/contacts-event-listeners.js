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
    setupNewContactForm();
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
    });
}

/**
 * Adds listeners for both close and cancel buttons on the new contact overlay.
 */
function setupCloseNewContactOverlayButtons() {
    document.getElementById('closeOverlayBtn').addEventListener('click', () => {
        closeOverlay('contactOverlay');
    });
    document.getElementById('cancelOverlayBtn').addEventListener('click', () => {
        closeOverlay('contactOverlay');
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
 * Clears all input fields in the new contact form.
 */
function clearNewContactFormInputs() {
    ['newContactName', 'newContactEmail', 'newContactPhone'].forEach(inputId => {
        document.getElementById(inputId).value = '';
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
 * Adds submit listener for the new contact form.
 */
function setupNewContactForm() {
    const form = document.getElementById('newContactForm');
    form.addEventListener('submit', handleNewContactSubmit);
}

/**
 * Handles the submit event of the new contact form.
 * @param {SubmitEvent} event - The form submission event
 */
async function handleNewContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    const newContact = collectNewContactData();
    await createContact(newContact);
    closeOverlay('contactOverlay', true);
    renderContacts();
    showContactCreatedMessage();
}

/**
 * Gathers trimmed values from the new contact input fields.
 * @returns {{ name: string, email: string, phone: string }}
 */
function collectNewContactData() {
    return {
        name: document.getElementById('newContactName').value.trim(),
        email: document.getElementById('newContactEmail').value.trim(),
        phone: document.getElementById('newContactPhone').value.trim(),
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
    if (saveButton) {
        saveButton.addEventListener('click', handleEditContactSave);
    }
    if (deleteButton) {
        deleteButton.addEventListener('click', handleEditContactDelete);
    }
}

/**
 * Handles saving changes to an existing contact.
 */
async function handleEditContactSave() {
    const form = document.getElementById('editContactForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    if (!currentlyEditingContact) return;
    const updatedContact = collectUpdatedContactData();
    await updateContact(updatedContact);
    closeOverlay('editContactOverlay', true);
    await renderContacts();
    const latestContact = getContactById(updatedContact.id) || updatedContact;
    updateDetailsCardIfVisible(latestContact);
    setCurrentlyEditingContact(null);
}

/**
 * Extracts updated values from edit input fields.
 * @returns {object} The updated contact object
 */
function collectUpdatedContactData() {
    const name = document.getElementById('editNameInput').value.trim();
    const email = document.getElementById('editEmailInput').value.trim();
    const phone = document.getElementById('editPhoneInput').value.trim();
    return {
        ...currentlyEditingContact,
        name,
        email,
        phone,
        initials: getInitials(name),
    };
}

/**
 * Updates the contact detail card if it's currently open and visible.
 * @param {object} contact - The updated contact object
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
    overlay.addEventListener('click', handleOverlayClickOutside);
    closeButton.addEventListener('click', handleOverlayCloseClick);
}

/**
 * Closes the overlay if the background is clicked.
 * @param {MouseEvent} event - The overlay click event
 */
function handleOverlayClickOutside(event) {
    if (event.target === event.currentTarget) {
        closeOverlay('editContactOverlay');
    }
}

/**
 * Closes the overlay when the close button is clicked.
 */
function handleOverlayCloseClick() {
    closeOverlay('editContactOverlay');
}