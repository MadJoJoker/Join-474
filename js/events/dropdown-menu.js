import { getCategoryOptions, renderAssignedToContacts } from "../templates/add-task-template.js";

export let currentContacts = [];
export let selectedCategory = null;
export let selectedContacts = [];

/** * Toggles the dropdown icon for category or assigned contacts.
 * @param {string} id - The ID of the dropdown to toggle.
 */
export function toggleDropdownIcon(id) {
  const dropdownIconOne = document.getElementById("dropdown-icon-one");
  const dropdownIconContainerOne = document.getElementById("dropdown-icon-container-one");
  const dropdownIconTwo = document.getElementById("dropdown-icon-two");
  const dropdownIconContainerTwo = document.getElementById("dropdown-icon-container-two");

  if (id === "category" && dropdownIconTwo && dropdownIconContainerTwo) {
    dropdownIconTwo.classList.toggle("open");
    dropdownIconContainerTwo.classList.toggle("active");
  } else if (id === "assignedTo" && dropdownIconOne && dropdownIconContainerOne) {
    dropdownIconOne.classList.toggle("open");
    dropdownIconContainerOne.classList.toggle("active");
  }
}

/** * Toggles the category dropdown.
 * Opens or closes the dropdown and populates it with options.
 */
export function toggleCategoryDropdown() {
  const wrapper = document.getElementById("category-options-wrapper");
  const container = document.getElementById("category-options-container");
  const input = document.getElementById("dropdown-category"); 
  if (!wrapper || !container) return;

  const isOpen = wrapper.classList.contains("open");

  clearCategory();
  toggleDropdownIcon("category");

  if (!isOpen) {
    input.classList.add("border-light-blue");
    container.innerHTML = getCategoryOptions();
    requestAnimationFrame(() => { wrapper.classList.add("open"); });
  } else {
    setBorderColorGrey("dropdown-category");
    wrapper.classList.remove("open");
    setTimeout(() => { container.innerHTML = ""; }, 300);
  }
}

/** * Sets the selected category in the dropdown.
 * Updates the selected category text and hidden input value.
 */
export function setCategory(optionElement) {
  const wrapper = document.getElementById("category-options-wrapper");
  const selected = document.getElementById("selected-category");
  const optionsContainer = document.getElementById("category-options-container");
  const hiddenInput = document.getElementById("hidden-category-input");

  if (!selected || !hiddenInput || !wrapper || !optionsContainer) return;

  updateSelectedCategory(selected, hiddenInput, optionElement);
  resetCategoryError();
  closeCategoryDropdownAtSet(wrapper, optionsContainer);
  toggleDropdownIcon("category");
  setBorderColorGrey("dropdown-category");

  selectedCategory = optionElement.dataset.category;
}

/** * Sets the border color of the input to grey.
 * @param {string} id - The ID of the input element.
 */
export function setBorderColorGrey(id) {
  const input = document.getElementById(id);
  if (input) {
    input.classList.remove("border-light-blue");
  }
}

/** * Updates the selected category text and hidden input value.
 * @param {HTMLElement} selected - The element displaying the selected category.
 * @param {HTMLElement} hiddenInput - The hidden input element for the selected category.
 * @param {HTMLElement} optionElement - The option element that was selected.
 */
function updateSelectedCategory(selected, hiddenInput, optionElement) {
  selected.textContent = optionElement.textContent;
  hiddenInput.value = optionElement.textContent;
}

/** * Resets the category error state.
 * Removes invalid class from the dropdown and hides the error message.
 */
function resetCategoryError() {
  const dropdownCategory = document.getElementById("dropdown-category");
  const categoryError = document.getElementById("category-error");
  if (dropdownCategory) {
    dropdownCategory.classList.remove("invalid");
    categoryError?.classList.remove("d-flex");
  }
}

/** * Closes the category dropdown and clears options.
 * @param {HTMLElement} wrapper - The dropdown wrapper element.
 * @param {HTMLElement} optionsContainer - The container for the dropdown options.
 */
function closeCategoryDropdownAtSet(wrapper, optionsContainer) {
  wrapper.classList.remove("open");
  optionsContainer.innerHTML = "";
}

/** * Creates a Demo selected category.
 * @param {string} categoryName - The name of the category to select.
 */
export function demoSelectCategory(categoryName = "User Story") {
  const fakeOptionElement = document.createElement("div");
  fakeOptionElement.textContent = categoryName;
  fakeOptionElement.dataset.category = categoryName;

  setCategory(fakeOptionElement);
  toggleDropdownIcon("category")
}

/** * Clears the selected category.
 */
export function clearCategory() {
  selectedCategory = null;
  const selected = document.getElementById("selected-category");
  if (selected) {
    selected.textContent = "Select task category";
  }
}

/** * Toggles the assigned contacts dropdown.
 */
export function toggleAssignedToDropdown() {
  const wrapper = document.getElementById("assigned-to-options-wrapper");
  const container = document.getElementById("assigned-to-options-container");
  const input = document.getElementById("dropdown-assigned-to");
  if (!wrapper || !container) return;

  const isOpen = wrapper.classList.contains("open-assigned-to");

  toggleDropdownIcon("assignedTo");

  if (!isOpen) {
    input.classList.add("border-light-blue");
    getAssignedToOptions();
    requestAnimationFrame(() => { wrapper.classList.add("open-assigned-to"); });
  } else {
    setBorderColorGrey("dropdown-assigned-to");
    wrapper.classList.remove("open-assigned-to");
    setTimeout(() => { container.innerHTML = ""; }, 300);
  }
}

/** * Gets the assigned contacts options.
 * Populates the dropdown with contacts and sets up event listeners.
 */
export function getAssignedToOptions() {
  const currentUser = sessionStorage.getItem('currentUser');
  let contactContainer = document.getElementById('assigned-to-options-container');
  if (!contactContainer) return;

  const sortedContacts = sortContactsWithUserFirst(currentContacts, currentUser);

  renderContactsList(sortedContacts, contactContainer, currentUser);
  displaySelectedContacts();
}

/** * Sorts contacts with the current user first.
 * @param {Array} contacts - The list of contacts to sort.
 * @param {string} currentUser - The name of the current user.
 * @returns {Array} The sorted list of contacts.
 */
function sortContactsWithUserFirst(contacts, currentUser) {
  return [...contacts].sort((a, b) => {
    const isCurrentUserA = a.name === currentUser;
    const isCurrentUserB = b.name === currentUser;
    if (isCurrentUserA) return -1;
    if (isCurrentUserB) return 1;
    return 0;
  });
}

/** * Renders the contacts list in the dropdown.
 * @param {Array} contacts - The list of contacts to render.
 * @param {HTMLElement} contactContainer - The container to render contacts into.
 * @param {string} currentUser - The name of the current user.
 */
function renderContactsList(contacts, contactContainer, currentUser) {
  contactContainer.innerHTML = '';
  contacts.forEach((contact, i) => {
    const { name, initials, avatarColor } = contact;
    const displayName = name === currentUser ? `${name} (You)` : name;
    contactContainer.innerHTML += renderAssignedToContacts(i, displayName, initials, avatarColor);
  });
}

/** * Selects a contact by name for demo purposes.
 * @param {string} nameToSelect - The name of the contact to select.
 */
export function demoSelectAssignedContact(nameToSelect = "Anna Schmidt") {
  const contactToSelect = currentContacts.find((contact) => contact.name === nameToSelect);

  if (!contactToSelect) {
    console.warn(`Kontakt ${nameToSelect} nicht gefunden.`);
    return;
  }

  selectedContacts.length = 0;
  selectedContacts.push(contactToSelect);

  getAssignedToOptions();
}

/** * Checks if a contact is selected.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The avatar color of the contact.
 * @return {boolean} True if the contact is selected, otherwise false.
 */
export function isContactSelected(name, initials, avatarColor) {
  return selectedContacts.some(
    (selected) => selected.name === name && selected.initials === initials && selected.avatarColor === avatarColor
  );
}

/** * Toggles the selection of a contact in the dropdown.
 * @param {HTMLElement} contactElement - The contact element to toggle.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The avatar color of the contact.
 */
export function toggleSelectContacts(contactElement, name, initials, avatarColor) {
  const contact = { name, initials, avatarColor };
  const index = getContactIndex(selectedContacts, contact);

  if (index === -1) {
    addContactToSelection(contactElement, contact, selectedContacts);
  } else {
    removeContactFromSelection(contactElement, index, selectedContacts);
  }

  displaySelectedContacts();
}

/** * Gets the index of a contact in the selected contacts array.
 * @param {Array} selectedContacts - The array of selected contacts.
 * @param {Object} contact - The contact to find.
 * @returns {number} The index of the contact, or -1 if not found.
 */
function getContactIndex(selectedContacts, contact) {
  return selectedContacts.findIndex(
    (selected) => selected.name === contact.name && selected.initials === contact.initials && selected.avatarColor === contact.avatarColor
  );
}

/** * Adds a contact to the selection.
 * @param {HTMLElement} contactElement - The contact element to update.
 * @param {Object} contact - The contact to add.
 * @param {Array} selectedContacts - The array of selected contacts.
 */
function addContactToSelection(contactElement, contact, selectedContacts) {
  selectedContacts.unshift(contact);
  contactElement.classList.add("assigned");
  const checkboxIcon = contactElement.querySelector(".checkbox-icon");
  checkboxIcon.src = "../assets/icons/btn/checkbox-filled-white.svg";
  checkboxIcon.classList.add("checked");
}

/** * Removes a contact from the selection.
 * @param {HTMLElement} contactElement - The contact element to update.
 * @param {number} index - The index of the contact to remove.
 * @param {Array} selectedContacts - The array of selected contacts.
 */
function removeContactFromSelection(contactElement, index, selectedContacts) {
  selectedContacts.splice(index, 1);
  contactElement.classList.remove("assigned");
  const checkboxIcon = contactElement.querySelector(".checkbox-icon");
  checkboxIcon.src = "../assets/icons/btn/checkbox-empty-black.svg";
  checkboxIcon.classList.remove("checked");
}

/** * Filters contacts based on a search query.
 * @param {string} query - The search query.
 */
export function filterContacts(query) {
  const container = document.getElementById("assigned-to-options-container");
  container.innerHTML = "";

  const filtered = currentContacts.filter((contact) => contact.name.toLowerCase().includes(query));

  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-results">No contacts found.</div>';
    return;
  }

  renderFilteredContacts(container, filtered);
}

/** * Renders the filtered contacts in the dropdown.
 * @param {HTMLElement} container - The container to render the contacts into.
 * @param {Array} filteredContacts - The array of filtered contacts.
 */
function renderFilteredContacts(container, filteredContacts) {
  filteredContacts.forEach((contact, i) => {
    container.innerHTML += renderAssignedToContacts(i, contact.name, contact.initials, contact.avatarColor);
  });
}

/** * Displays the selected contacts in the assigned to area.
 * Creates circles for each selected contact and appends them to the assigned area.
 */
function displaySelectedContacts() {
  const assignedToArea = document.getElementById("assigned-to-area");
  const assignedToAreaFull = document.getElementById("assigned-to-area-full");
  if (!assignedToArea) return;

  clearAndRender(assignedToArea, selectedContacts.slice(0, 3), true);
  if (assignedToAreaFull) {
    clearAndRender(assignedToAreaFull, selectedContacts, false);
  }
}

/** * Clears and renders the contact circles in the assigned to area.
 * @param {HTMLElement} container - The container to render the contacts into.
 * @param {Array} contacts - The array of contacts to render.
 * @param {boolean} withExtra - Whether to show the extra count circle.
 */
function clearAndRender(container, contacts, withExtra) {
  container.innerHTML = '';
  const mainContainer = document.createElement('div');
  mainContainer.className = 'assigned-main-container';

  contacts.forEach(contact => renderContactCircle(contact, mainContainer));

  if (withExtra) {
    const extraCount = selectedContacts.length - contacts.length;
    if (extraCount > 0) renderExtraCircle(extraCount, mainContainer);
  }

  container.appendChild(mainContainer);
}

/** * Renders a contact circle in the assigned to area.
 * @param {Object} contact - The contact object to render.
 * @param {HTMLElement} container - The container to render the contact into.
 */
function renderContactCircle(contact, container) {
  const initialsDiv = document.createElement('div');
  initialsDiv.className = 'assigned-initials-circle';
  initialsDiv.style.backgroundColor = `var(${contact.avatarColor})`;
  initialsDiv.textContent = contact.initials;
  initialsDiv.style.flex = '0 0 auto';
  container.appendChild(initialsDiv);
}

/** * Renders an extra count circle in the assigned to area.
 * @param {number} extraCount - The number of extra contacts.
 * @param {HTMLElement} container - The container to render the extra circle into.
 */
function renderExtraCircle(extraCount, container) {
  const extraDiv = document.createElement('div');
  extraDiv.className = 'assigned-initials-circle';
  extraDiv.style.backgroundColor = 'var(--sidebarGrey)';
  extraDiv.textContent = `… +${extraCount}`;
  extraDiv.style.fontSize = '0.8rem';
  extraDiv.style.flex = '0 0 auto';
  container.appendChild(extraDiv);
}

/** * Removes a contact from the selected contacts.
 * @param {number} index - The index of the contact to remove.
 */
export function removeContact(index) {
  selectedContacts.splice(index, 1);
  displaySelectedContacts();
}

/** * Clears the assigned contacts area.
 * Resets the selected contacts and clears the assigned area.
 */
export function clearAssignedTo() {
  const assignedToArea = document.getElementById("assigned-to-area");

  selectedContacts = [];

  if (assignedToArea) {
    assignedToArea.innerHTML = "";
  }
}

/** * Sets the sorted contacts for the dropdown.
 * @param {Array} contactsData - The array of contacts to sort and set.
 */
export function setSortedContacts(contactsData) {
  currentContacts = contactsData.sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB, "de", { sensitivity: "base" });
  });
}

/** * Resets the dropdown state.
 * Clears the selected category and contacts.
 */
export function resetDropdownState() {
  selectedCategory = null;
  selectedContacts = [];
}