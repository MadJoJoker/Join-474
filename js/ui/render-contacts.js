// Data fetching & state management
import { getFirebaseData } from '../data/API.js';
import { cleanContacts, groupContactsByInitials } from '../data/contacts-utils.js';
import { setCurrentlyEditingContact, setActiveContactId, getContactById, activeContactId, setAllContacts } from '../data/contacts-state.js';
// Template rendering
import { createContactDetailsHTML, buildContactSectionHTML } from '../templates/contacts-templates.js';
// UI behavior
import { openOverlay } from '../ui/contacts-overlays.js';
import { initContactEventListeners } from '../events/contacts-event-listeners.js';

/**
 * Loads contacts from Firebase, processes them, renders list and stores them globally.
 */
export async function renderContacts() {
  const fullData = await getFirebaseData();
  const rawContacts = fullData?.contacts;
  if (!rawContacts) {
    console.error('No contacts found');
    return;
  }
  const cleanedContactsArray = Object.values(cleanContacts(rawContacts));
  const groupedContacts = groupContactsByInitials(cleanedContactsArray);
  const listContainer = document.querySelector('.contacts-list');
  resetContactListUI(listContainer);
  setAllContacts(cleanedContactsArray);
  renderGroupedSections(listContainer, groupedContacts);
}

/**
 * Renders all contact groups (A–Z) into the contact list container.
 * 
 * @param {HTMLElement} container - The DOM element where contacts should be rendered.
 * @param {object} groupedContacts - An object with initials as keys and arrays of contacts as values.
 */
function renderGroupedSections(container, groupedContacts) {
  for (const initialLetter in groupedContacts) {
    const sectionHTML = buildContactSectionHTML(initialLetter, groupedContacts[initialLetter]);
    container.insertAdjacentHTML('beforeend', sectionHTML);
  }
}

/**
 * Clears the container before inserting fresh contact list.
 * @param {HTMLElement} container 
 */
function resetContactListUI(container) {
  container.innerHTML = '';
}

/**
 * Handles the user click on a contact → toggles detail view.
 * @param {object} contact - The contact object that was clicked.
 */
function onContactClick(contact) {
  const contactDetailsCard = document.querySelector('.contact-details-card');
  if (!contactDetailsCard || !contact) return;
  clearAllContactSelections();
  const clickedContactElement = document.querySelector(`.contact[data-id="${contact.id}"]`);
  if (activeContactId === contact.id) {
    hideContactDetails(contactDetailsCard, clickedContactElement);
  } else {
    showContactDetails(contactDetailsCard, contact, clickedContactElement);
  }
}

/**
 * Removes the 'active' class from all contact elements in the list.
 */
function clearAllContactSelections() {
  document.querySelectorAll('.contact').forEach(contactElement => {
    contactElement.classList.remove('active');
  });
}

/**
 * Hides the contact details card and clears active state.
 * @param {HTMLElement} detailsCard - The contact details card element.
 * @param {HTMLElement} contactElement - The contact element in the list.
 */
function hideContactDetails(detailsCard, contactElement) {
  detailsCard.classList.remove('visible');
  detailsCard.innerHTML = '';
  contactElement?.classList.remove('active');
  setActiveContactId(null);
}

/**
 * Fills and shows the contact details card with animation.
 * @param {HTMLElement} detailsCard - The contact details card element.
 * @param {object} contact - The contact to show.
 * @param {HTMLElement} contactElement - The clicked contact element in the list.
 */
function showContactDetails(detailsCard, contact, contactElement) {
  detailsCard.innerHTML = createContactDetailsHTML(contact);
  contactElement?.classList.add('active');
  setTimeout(() => detailsCard.classList.add('visible'), 10);
  setActiveContactId(contact.id);
}

/**
 * Called when a contact in the list is clicked.
 * This shows or hides the contact's detailed view.
 * Used via onclick="onContactClickById('contact-id')" in the contact template.
 *
 * @param {string} contactId - The ID of the contact that was clicked.
 */
window.onContactClickById = function (contactId) {
  const contact = getContactById(contactId);
  if (contact) onContactClick(contact);
};

/**
 * Called when the "Edit" button is clicked inside the contact details card.
 * This opens the edit overlay and fills in the form fields with current contact data.
 * Used via onclick="onEditContact('contact-id')" in the contact details template.
 *
 * @param {string} contactId - The ID of the contact to edit.
 */
window.onEditContact = function (contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;
  setCurrentlyEditingContact({ ...contact });
  document.getElementById('editNameInput').value = contact.name;
  document.getElementById('editEmailInput').value = contact.email;
  document.getElementById('editPhoneInput').value = contact.phone;
  document.getElementById('editContactAvatar').textContent = contact.initials;
  const backgroundColor = contact.avatarColor?.startsWith('--')
    ? `var(${contact.avatarColor})`
    : contact.avatarColor || 'var(--grey)';
  document.getElementById('editContactAvatar').style.backgroundColor = backgroundColor;
  openOverlay('editContactOverlay');
};

// Startup
renderContacts();
initContactEventListeners();
