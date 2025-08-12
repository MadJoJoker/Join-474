// CRUD & helpers for contacts
import { createContact, updateContact, getInitials } from './contact-actions.js';
// Overlay controls & messages
import { closeOverlay, showContactCreatedMessage } from '../ui/contacts-overlays.js';
// Shared state for contacts
import { setActiveContactId, getContactById, currentlyEditingContact, setCurrentlyEditingContact } from '../data/contacts-state.js';
// Rendering & templates
import { renderContacts } from '../ui/render-contacts.js';
import { createContactDetailsHTML } from '../templates/contacts-templates.js';
// Validation orchestrators (enable-live-on-first-failure)
import { validateNewContactOrEnableLive, validateEditedContactOrEnableLive } from './contacts-validation.js';

/**
 * Reads and trims input values from the "New Contact" form.
 * @returns {{ name: string, email: string, phone: string }}
 */
export function getNewContactInputValues() {
  return {
    name:  document.getElementById('newContactName').value.trim(),
    email: document.getElementById('newContactEmail').value.trim(),
    phone: document.getElementById('newContactPhone').value.trim()
  };
}

/**
 * Reads and trims input values from the "Edit Contact" form.
 * @returns {{ name: string, email: string, phone: string }}
 */
export function getEditContactInputValues() {
  return {
    name:  document.getElementById('editNameInput').value.trim(),
    email: document.getElementById('editEmailInput').value.trim(),
    phone: document.getElementById('editPhoneInput').value.trim()
  };
}

/**
 * Updates the details card with a given contact and ensures it's visible.
 * @param {Object} contact - The contact to render.
 * @returns {void}
 */
export function updateDetailsCardFor(contact) {
  const card = document.querySelector('.contact-details-card');
  if (!card) return;
  card.innerHTML = createContactDetailsHTML(contact);
  card.classList.add('no-animation', 'visible');
}

/**
 * Marks the given contact as active and switches to details on small screens.
 * @param {Object} contact - The contact to focus.
 * @returns {void}
 */
export function focusContactInUI(contact) {
  setActiveContactId(contact.id);
  if (window.innerWidth <= 768) {
    document.body.classList.add('mobile-contact-visible');
  }
}

/**
 * Looks up a contact by ID or returns the provided fallback object.
 * @param {string} id - Contact ID.
 * @param {Object} fallback - Fallback contact object.
 * @returns {Object}
 */
export function findContactByIdOrFallback(id, fallback) {
  return getContactById(id) || fallback;
}

/**
 * Creates a new contact, closes the "Add" overlay, re-renders the list, and shows a toast.
 * @param {{ name: string, email: string, phone: string }} payload - Contact data to create.
 * @returns {Promise<Object>} The created contact.
 */
export async function createAndRenderNewContact(payload) {
  const newContact = await createContact(payload);
  closeOverlay('contactOverlay', true);
  await renderContacts();
  showContactCreatedMessage();
  return newContact;
}

/**
 * Builds an updated contact object from edit form values and current editing state.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @returns {Object}
 */
export function buildUpdatedContactFromInputs(name, email, phone) {
  return {
    ...currentlyEditingContact,
    name, email, phone,
    initials: getInitials(name)
  };
}

/**
 * Persists an edited contact via the API.
 * @param {Object} updatedContact
 * @returns {Promise<void>}
 */
export async function persistEditedContact(updatedContact) {
  await updateContact(updatedContact);
}

/**
 * Closes the edit overlay and re-renders the contacts list.
 * @returns {Promise<void>}
 */
export async function closeEditOverlayAndRerender() {
  closeOverlay('editContactOverlay', true);
  await renderContacts();
}

/**
 * Retrieves the latest contact by ID from state or returns the provided fallback.
 * @param {string} id
 * @param {Object} fallback
 * @returns {Object}
 */
export function getLatestContactByIdOrFallback(id, fallback) {
  return getContactById(id) || fallback;
}

/**
 * Finalizes UI after a successful edit: updates details card (if visible) and clears editing state.
 * @param {Object} latestContact
 * @returns {void}
 */
export function finalizeEditUI(latestContact) {
  const card = document.querySelector('.contact-details-card');
  if (card?.classList.contains('visible')) {
    card.innerHTML = createContactDetailsHTML(latestContact);
  }
  setCurrentlyEditingContact(null);
}

/**
 * Handles submission of the "New Contact" form:
 * validates, creates contact, updates UI, and focuses the new contact.
 * @returns {Promise<void>}
 */
export async function handleNewContactSubmit() {
  const payload = getNewContactInputValues();
  const isValid = validateNewContactOrEnableLive(payload);
  if (!isValid) return;
  const newContact = await createAndRenderNewContact(payload);
  const contact = findContactByIdOrFallback(newContact.id, newContact);
  if (contact) {
    updateDetailsCardFor(contact);
    focusContactInUI(contact);
  }
}

/**
 * Handles saving the "Edit Contact" form:
 * validates, persists, re-renders, and finalizes the UI.
 * @returns {Promise<void>}
 */
export async function handleEditContactSave() {
  const { name, email, phone } = getEditContactInputValues();
  const isValid = validateEditedContactOrEnableLive({ name, email, phone });
  if (!isValid || !currentlyEditingContact) return;
  const updatedContact = buildUpdatedContactFromInputs(name, email, phone);
  await persistEditedContact(updatedContact);
  await closeEditOverlayAndRerender();
  const latestContact = getLatestContactByIdOrFallback(updatedContact.id, updatedContact);
  finalizeEditUI(latestContact);
}