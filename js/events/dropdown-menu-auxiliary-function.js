import { firebaseData } from "../../main.js";
import {
  currentContacts,
  getAssignedToOptions,
  setCategory,
  toggleCategoryDropdown,
  toggleSelectContacts,
  toggleAssignedToDropdown,
  setSortedContacts,
  selectedCategory,
  selectedContacts,
  resetDropdownState,
  setBorderColorGrey,
} from "./dropdown-menu.js";

/**
 * Object containing all relevant dropdown DOM elements for category and assigned users.
 * Use functions to always get the current DOM reference.
 */
const dropdownElements = {
  category: {
    dropdown: () => document.getElementById("dropdown-category"),
    options: () => document.getElementById("category-options-container"),
    wrapper: () => document.getElementById("category-options-wrapper"),
    icon: () => document.getElementById("dropdown-icon-two"),
    iconContainer: () => document.getElementById("dropdown-icon-container-two"),
    input: () => document.getElementById("dropdown-category"),
  },
  assignedTo: {
    dropdown: () => document.getElementById("dropdown-assigned-to"),
    options: () => document.getElementById("assigned-to-options-container"),
    wrapper: () => document.getElementById("assigned-to-options-wrapper"),
    icon: () => document.getElementById("dropdown-icon-one"),
    iconContainer: () => document.getElementById("dropdown-icon-container-one"),
  }
};

/**
 * Removes a specific class from a list of elements.
 * @param {HTMLElement[]} elements - The elements to remove the class from.
 * @param {string} className - The class name to remove.
 */
function removeClasses(elements, className) {
  elements.forEach(el => el?.classList.remove(className));
}

/**
 * Initializes the dropdown menus for category and assigned contacts.
 * Sets up event listeners and populates the dropdowns with contacts.
 */
export function initDropdowns(contactsData) {
  setSortedContacts(contactsData);
  setupCategoryDropdown();
  setupAssignedUsersDropdown();
  setupDocumentClickHandler(
    dropdownElements.category.dropdown(),
    dropdownElements.category.options(),
    dropdownElements.assignedTo.dropdown(),
    dropdownElements.assignedTo.options()
  );
  resetDropdownState();
}

/**
 * Sets up the category dropdown event listeners.
 */
function setupCategoryDropdown() {
  dropdownElements.category.dropdown()?.addEventListener("click", toggleCategoryDropdown);
  dropdownElements.category.options()?.addEventListener("click", (event) => {
    if (event.target.classList.contains("option")) {
      setCategory(event.target);
    }
  });
}

/**
 * Sets up the assigned users dropdown event listeners.
 */
function setupAssignedUsersDropdown() {
  dropdownElements.assignedTo.dropdown()?.addEventListener("click", toggleAssignedToDropdown);
  dropdownElements.assignedTo.options()?.addEventListener("click", (event) => {
    const contactOption = event.target.closest(".contact-option");
    if (contactOption) {
      const { name, initials, avatarColor } = contactOption.dataset;
      toggleSelectContacts(contactOption, name, initials, avatarColor);

      const invalidArea = dropdownElements.assignedTo.dropdown();
      const assignedUsersError = document.getElementById("assigned-to-error");
      if (invalidArea.classList.contains("invalid")) {
        invalidArea.classList.remove("invalid");
        assignedUsersError?.classList.remove("d-flex");
      }
    }
  });
}

/**
 * Handles clicks outside the dropdown to close it.
 * @param {HTMLElement} dropdown - The dropdown element to check.
 * @param {HTMLElement} options - The options container element.
 * @param {Function} closeFunction - The function to call to close the dropdown.
 */
function handleOutsideClick(dropdown, options, closeFunction) {
  return (event) => {
    const clickedOutside =
      !dropdown.contains(event.target) && !options.contains(event.target);
    if (clickedOutside) {
      closeFunction();
    }
  };
}

/**
 * Sets up a document click handler to close dropdowns when clicking outside.
 * @param {HTMLElement} categoryDropdown - The category dropdown element.
 * @param {HTMLElement} categoryOptions - The category options container element.
 * @param {HTMLElement} assignedUsersDropdown - The assigned users dropdown element.
 * @param {HTMLElement} assignedUsersOptions - The assigned users options container element.
 */
function setupDocumentClickHandler(
  categoryDropdown,
  categoryOptions,
  assignedUsersDropdown,
  assignedUsersOptions
) {
  document.addEventListener("click", (event) => {
    if (categoryDropdown && categoryOptions) {
      handleOutsideClick(
        categoryDropdown,
        categoryOptions,
        closeCategoryDropdown
      )(event);
    }

    if (assignedUsersDropdown && assignedUsersOptions) {
      handleOutsideClick(
        assignedUsersDropdown,
        assignedUsersOptions,
        closeAssignedToDropdown
      )(event);
    }
  });
}

/**
 * Closes the category dropdown and resets its state.
 */
export function closeCategoryDropdown() {
  const { wrapper, options, icon, iconContainer, input } = dropdownElements.category;
  const w = wrapper();
  const c = options();
  const i = icon();
  const ic = iconContainer();
  const inp = input();
  if (!w || !c) return;
  if (w.classList.contains("open")) {
    inp.classList.remove("border-light-blue");
    w.classList.remove("open");
    i?.classList.remove("open");
    ic?.classList.remove("active");
    setTimeout(() => {
      c.innerHTML = "";
    }, 300);
  }
}

/**
 * Closes the assigned users dropdown and resets its state.
 */
export function closeAssignedToDropdown() {
  const { wrapper, options, icon, iconContainer } = dropdownElements.assignedTo;
  const w = wrapper();
  const c = options();
  const i = icon();
  const ic = iconContainer();
  if (!w || !c) return;
  if (w.classList.contains("open-assigned-to")) {
    setBorderColorGrey("dropdown-assigned-to");
    w.classList.remove("open-assigned-to");
    i?.classList.remove("open");
    ic?.classList.remove("active");
    setTimeout(() => {
      c.innerHTML = "";
    }, 300);
  }
}

/**
 * List of IDs for fields that can be invalid in the form.
 */
const INVALID_FIELDS_IDS = [
  "title",
  "datepicker",
  "dropdown-category",
  "dropdown-assigned-to",
];

/**
 * List of IDs for error fields in the form.
 */
const ERROR_FIELDS_IDS = [
  "title-error",
  "due-date-error",
  "assigned-to-error",
  "category-error",
];

export function clearInvalidFields() {
  const invalidFields = INVALID_FIELDS_IDS.map((id) => document.getElementById(id));
  const errorFields = ERROR_FIELDS_IDS.map((id) => document.getElementById(id));
  removeClasses(invalidFields, "invalid");
  removeClasses(errorFields, "d-flex");
}

/**
 * Sets the category based on the task object for the card/edit overlay.
 * @param {string} categoryName - The name of the category to set.
 */
export function setCategoryFromTaskForCard(categoryName) {
  if (!categoryName) {
    console.warn("[Dropdown-Card] Keine Kategorie übergeben!");
    return;
  }
  const fakeOptionElement = document.createElement("div");
  fakeOptionElement.textContent = categoryName;
  fakeOptionElement.dataset.category = categoryName;
  setCategory(fakeOptionElement);
  rotateCategoryDropdownIcon()
}

/**
 * Rotates the category dropdown icon when the dropdown is opened or closed.
 */
function rotateCategoryDropdownIcon() {
  const dropdownIconTwo = document.getElementById("dropdown-icon-two");

  if (dropdownIconTwo) {
    dropdownIconTwo.classList.toggle("open");
  }
}

/**
 * Sets the assigned contacts based on the task object for the card/edit overlay.
 * @param {Array} assignedUsers - The array of assigned contacts.
 */
export function setAssignedContactsFromTaskForCard(assignedUsers) {
  if (!Array.isArray(assignedUsers)) {
    console.warn("[Dropdown-Card] assignedUsers is no Array!", assignedUsers);
    return;
  }

  selectedContacts.length = 0;

  assignedUsers.forEach((sel) => {
    if (typeof sel === "string") {
      processStringContact(sel);
    } else {
      processObjectContact(sel);
    }
  });

  getAssignedToOptions();
}

/**
 * Finds a contact by its ID from the current contacts or Firebase data.
 * @param {string} idVal - The ID of the contact to find.
 */
function findContactById(idVal) {
  return currentContacts.find(
    (c) =>
      c.id === idVal ||
      c.contactId === idVal ||
      c.contactID === idVal ||
      c.uid === idVal ||
      c.firebaseId === idVal
  );
}

/**
 * Gets a contact from Firebase data by its ID.
 * @param {string} idVal - The ID of the contact to retrieve.
 */
function getFirebaseContact(idVal) {
  if (
    typeof firebaseData === "object" &&
    firebaseData.contacts &&
    firebaseData.contacts[idVal]
  ) {
    return { ...firebaseData.contacts[idVal], id: idVal };
  }
  return null;
}

/**
 * Finds a contact by its name from the current contacts or Firebase data.
 * @param {string} name - The name of the contact to find.
 */
function findContactByName(name) {
  const found = currentContacts.find((c) => c.name === name);
  if (!found && typeof firebaseData === "object" && firebaseData.contacts) {
    const foundEntry = Object.entries(firebaseData.contacts).find(
      ([key, c]) => c.name === name
    );
    if (foundEntry) {
      return { ...foundEntry[1], id: foundEntry[0] };
    }
  }
  return found || null;
}

/**
 * Processes a string contact by finding it in the current contacts or Firebase data.
 * @param {string} sel - The ID of the contact to process.
 */
function processStringContact(sel) {
  const idVal = sel;
  let found = findContactById(idVal) || getFirebaseContact(idVal);

  if (found) {
    selectedContacts.push(found);
  } else {
    console.warn("[Dropdown-Card] Kontakt nicht gefunden (ID):", sel);
  }
}

/**
 * Extracts the contact ID from a contact object.
 * @param {Object} contact - The contact object to extract the ID from.
 * @returns {string|null} The extracted contact ID or null if not found.
 */
function extractContactId(contact) {
  return contact.id || contact.contactId || contact.contactID || contact.uid || contact.firebaseId;
}

function findContactByObject(contact) {
  const idVal = extractContactId(contact);
  if (idVal) {
    return findContactById(idVal) || getFirebaseContact(idVal);
  } else if (contact.name) {
    return findContactByName(contact.name);
  }
  return null;
}

/**
 * Processes an object contact by checking its ID or name and finding it in the current contacts or Firebase data.
 * @param {Object} sel - The contact object to process.
 */
function processObjectContact(sel) {
  const found = findContactByObject(sel);
  if (found) {
    selectedContacts.push(found);
  } else {
    selectedContacts.push(sel);
    if (extractContactId(sel)) {
      console.warn("[Dropdown-Card] Contact not found (object with ID, using sel):", sel);
    } else if (sel.name) {
      console.warn("[Dropdown-Card] Contact not found (object with name, using sel):", sel);
    } else {
      console.warn("[Dropdown-Card] Unknown contact format:", sel);
    }
  }
}
