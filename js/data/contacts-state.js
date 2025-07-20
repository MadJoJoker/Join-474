// The contact currently being edited in the edit overlay
export let currentlyEditingContact = null;

// The ID of the contact currently shown in the detail view
export let activeContactId = null;

// In-memory storage for all contacts (populated at runtime)
const allContacts = {};

/**
 * Sets the contact that is currently being edited.
 * 
 * @param {object | null} contact - The contact object or null to reset.
 */
export function setCurrentlyEditingContact(contact) {
  currentlyEditingContact = contact;
}

/**
 * Sets the ID of the currently active contact (for the detail view).
 * 
 * @param {string | null} id - Contact ID or null to clear selection.
 */
export function setActiveContactId(id) {
  activeContactId = id;
}

/**
 * Replaces all stored contacts with a new list of contacts.
 * 
 * @param {object[]} contactsArray - Array of contact objects to store.
 */
export function setAllContacts(contactsArray) {
  Object.keys(allContacts).forEach(key => delete allContacts[key]);
  for (const contact of contactsArray) {
    allContacts[contact.id] = contact;
  }
}

/**
 * Retrieves a contact by its ID from in-memory storage.
 * 
 * @param {string} id - The ID of the contact to retrieve.
 * @returns {object | undefined} The contact object, or undefined if not found.
 */
export function getContactById(id) {
  return allContacts[id];
}