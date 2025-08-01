// Data fetching & state management
import { getFirebaseData } from '../data/API.js';
import { cleanContacts, groupContactsByInitials } from '../data/contacts-utils.js';
import { setCurrentlyEditingContact, setActiveContactId, getContactById, activeContactId, setAllContacts } from '../data/contacts-state.js';

// Template rendering
import { createContactDetailsHTML, buildContactSectionHTML } from '../templates/contacts-templates.js';

// UI behavior
import { openOverlay } from '../ui/contacts-overlays.js';
import { initContactEventListeners } from '../events/contacts-event-listeners.js';

// Scroll behavior
import { enableMouseDragScroll } from '../events/drag-to-scroll.js';

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
 * Fills and shows the contact details card.
 * @param {HTMLElement} detailsCard - The contact details card element.
 * @param {object} contact - The contact to show.
 * @param {HTMLElement} contactElement - The clicked contact element in the list.
 * @param {boolean} skipAnimation - Optional. If true, no animation is used.
 */
function showContactDetails(detailsCard, contact, contactElement, skipAnimation = false) {
  detailsCard.innerHTML = createContactDetailsHTML(contact);
  contactElement?.classList.add('active');
  if (skipAnimation) {
    detailsCard.classList.add('no-animation');
    detailsCard.classList.add('visible');
  } else {
    detailsCard.classList.remove('no-animation');
    setTimeout(() => detailsCard.classList.add('visible'), 10);
  }
  setActiveContactId(contact.id);
  if (window.innerWidth <= 768) {
    document.body.classList.add('mobile-contact-visible');
  }
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
 * Opens the edit overlay for a given contact ID.
 * @param {string} contactId - The ID of the contact to edit
 */
window.onEditContact = function (contactId) {
  const contact = getContactById(contactId);
  if (!contact) return;
  setCurrentlyEditingContact({ ...contact });
  fillEditFormWithContact(contact);
  updateEditAvatar(contact);
  openOverlay('editContactOverlay');
};

/**
 * Fills the edit contact form fields with the given contact's data.
 * @param {Object} contact - The contact object
 * @param {string} contact.name
 * @param {string} contact.email
 * @param {string} contact.phone
 */
function fillEditFormWithContact(contact) {
  document.getElementById('editNameInput').value = contact.name;
  document.getElementById('editEmailInput').value = contact.email;
  document.getElementById('editPhoneInput').value = contact.phone;
}

/**
 * Updates the avatar element in the edit overlay.
 * @param {Object} contact - The contact object
 * @param {string} contact.initials
 * @param {string} [contact.avatarColor]
 */
function updateEditAvatar(contact) {
  const avatarEl = document.getElementById('editContactAvatar');
  avatarEl.textContent = contact.initials;
  const backgroundColor = contact.avatarColor?.startsWith('--')
    ? `var(${contact.avatarColor})`
    : contact.avatarColor || 'var(--grey)';
  avatarEl.style.backgroundColor = backgroundColor;
}

/**
 * Initializes drag-to-scroll functionality on specific scrollable UI panels
 * after the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  const elementsToDragScroll = document.querySelectorAll('.contacts-sidebar, .contacts-details, .scrollable-panel');
  elementsToDragScroll.forEach((element) => {
    const isContactsDetails = element.classList.contains('contacts-details');
    enableMouseDragScroll(element, {
      enableHorizontalScroll: !isContactsDetails,
      enableVerticalScroll: true
    });
  });
});

/**
 * Application startup logic:
 * - Renders the initial contact list
 * - Sets up all necessary event listeners for the contacts UI
 */
renderContacts();
initContactEventListeners();

/**
 * Closes the contact details view on mobile devices.
 * This function can be called globally via window.closeMobileContactView().
 */
window.closeMobileContactView = function () {
  document.body.classList.remove('mobile-contact-visible');
  setActiveContactId(null);
};