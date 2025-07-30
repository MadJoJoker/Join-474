import { firebaseData } from "../../main.js";

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
  if (!wrapper || !container) return;

  const isOpen = wrapper.classList.contains("open");

  clearCategory();
  toggleDropdownIcon("category");

  if (!isOpen) {
    container.innerHTML = getCategoryOptions();
    requestAnimationFrame(() => { wrapper.classList.add("open"); });
  } else {
    wrapper.classList.remove("open");
    setTimeout(() => { container.innerHTML = ""; }, 300);
  }
}

/** * Generates the HTML for the category options.
 * @returns {string} The HTML string for the category options.
 */
export function getCategoryOptions() {
  return `
        <div class="option" data-category="Technical Task">Technical Task</div>
        <div class="option" data-category="User Story">User Story</div>
        <div class="option" data-category="Meeting">Meeting</div>
    `;
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

  selectedCategory = optionElement.dataset.category;
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
  if (!wrapper || !container) return;

  const isOpen = wrapper.classList.contains("open-assigned-to");

  toggleDropdownIcon("assignedTo");

  if (!isOpen) {
    getAssignedToOptions();
    requestAnimationFrame(() => { wrapper.classList.add("open-assigned-to"); });
  } else {
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

/** * Renders a single contact option in the dropdown.
 * @param {number} i - The index of the contact.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The avatar color of the contact.
 * @returns {string} The HTML string for the contact option.
 */
export function renderAssignedToContacts(i, name, initials, avatarColor) {
  const isSelected = isContactSelected(name, initials, avatarColor);
  return `
        <div class="contact-option ${isSelected ? "assigned" : ""}" 
          data-name="${name}" data-initials="${initials}" data-avatar-color="${avatarColor}">
            <div class="contact-checkbox">
                <div class="initials-container">
                <div class="assigned-initials-circle"style="background-color: var(${avatarColor});">${initials}</div>
                <div>${name}</div>
            </div>
            <img src="../assets/icons/btn/${isSelected ? "checkbox-filled-white" : "checkbox-empty-black"}.svg" 
              alt="checkbox ${isSelected ? "filled" : "empty"}" 
              class="checkbox-icon ${isSelected ? "checked" : ""}">
        </div>
    `;
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
    (selected) =>
      selected.name === name &&
      selected.initials === initials &&
      selected.avatarColor === avatarColor
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
    (selected) =>
      selected.name === contact.name &&
      selected.initials === contact.initials &&
      selected.avatarColor === contact.avatarColor
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
    container.innerHTML += renderAssignedToContacts(
      i,
      contact.name,
      contact.initials,
      contact.avatarColor
    );
  });
}

function displaySelectedContacts() {
  const assignedToArea = document.getElementById("assigned-to-area");
  if (!assignedToArea) return;

  assignedToArea.innerHTML = '';
  // Hauptcontainer für die Kontakte
  const mainContainer = document.createElement('div');
  mainContainer.className = 'assigned-main-container';
  // Wenn mehr als 3 Kontakte, mache den Bereich scrollbar
  if (selectedContacts.length > 3) {
    // mainContainer.style.maxHeight = '50px';
    // mainContainer.style.overflowX = 'auto';
    mainContainer.style.display = 'flex';
    // mainContainer.style.gap = '4px';
  }
  selectedContacts.forEach(contact => {
    const initialsDiv = document.createElement('div');
    initialsDiv.className = 'assigned-initials-circle';
    initialsDiv.style.backgroundColor = `var(${contact.avatarColor})`;
    initialsDiv.textContent = contact.initials;
    initialsDiv.style.flex = '0 0 auto';
    mainContainer.appendChild(initialsDiv);
  });
  assignedToArea.appendChild(mainContainer);
}

export function removeContact(index) {
  // @param {number} index - Der Index des zu entfernenden Kontakts.
  selectedContacts.splice(index, 1);
  displaySelectedContacts();
}

export function clearAssignedTo() {
  const assignedToArea = document.getElementById("assigned-to-area");

  selectedContacts = [];

  if (assignedToArea) {
    assignedToArea.innerHTML = "";
  }
}

export function setSortedContacts(contactsData) {
  currentContacts = contactsData.sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB, "de", { sensitivity: "base" });
  });
}

export function resetDropdownState() {
  selectedCategory = null;
  selectedContacts = [];
}