import { firebaseData } from "../../main.js";
import { currentContacts, getAssignedToOptions, setCategory, toggleCategoryDropdown, toggleSelectContacts, toggleAssignedToDropdown, setSortedContacts, selectedCategory, selectedContacts, resetDropdownState, setBorderColorGrey, } from "./dropdown-menu.js";

/** Initializes the dropdown menus for category and assigned contacts.
 * Sets up event listeners and populates the dropdowns with contacts.
 */
export function initDropdowns(contactsData) {
  setSortedContacts(contactsData);

  const categoryDropdown = document.getElementById("dropdown-category");
  const categoryOptions = document.getElementById("category-options-container");
  const assignedUsersDropdown = document.getElementById("dropdown-assigned-to");
  const assignedUsersOptions = document.getElementById("assigned-to-options-container");

  setupCategoryDropdown();
  setupAssignedUsersDropdown();
  setupDocumentClickHandler(categoryDropdown, categoryOptions, assignedUsersDropdown, assignedUsersOptions);
  resetDropdownState();
}

/** Clears the selected assigned contacts in the dropdown.
 */
function setupCategoryDropdown() {
  document.getElementById("dropdown-category")?.addEventListener("click", toggleCategoryDropdown);
  document.getElementById("category-options-container")?.addEventListener("click", (event) => {
    if (event.target.classList.contains("option")) {
      setCategory(event.target);
    }
  });
}

/** Clears the selected assigned contacts in the dropdown.
 */
function setupAssignedUsersDropdown() {
  document.getElementById("dropdown-assigned-to")?.addEventListener("click", toggleAssignedToDropdown);
  document.getElementById("assigned-to-options-container")?.addEventListener("click", (event) => {
    const contactOption = event.target.closest(".contact-option");
    if (contactOption) {
      const { name, initials, avatarColor } = contactOption.dataset;
      toggleSelectContacts(contactOption, name, initials, avatarColor);

      const invalidArea = document.getElementById("dropdown-assigned-to");
      const assignedUsersError = document.getElementById("assigned-to-error");
      if (invalidArea.classList.contains("invalid")) {
        invalidArea.classList.remove("invalid");
        assignedUsersError?.classList.remove("d-flex");
      }
    }
  });
}

/** Handles clicks outside the dropdown to close it.
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

/** Sets up a document click handler to close dropdowns when clicking outside.
 * @param {HTMLElement} categoryDropdown - The category dropdown element.
 * @param {HTMLElement} categoryOptions - The category options container element.
 * @param {HTMLElement} assignedUsersDropdown - The assigned users dropdown element.
 * @param {HTMLElement} assignedUsersOptions - The assigned users options container element.
 */
function setupDocumentClickHandler(categoryDropdown, categoryOptions, assignedUsersDropdown, assignedUsersOptions) {
  document.addEventListener("click", (event) => {
    if (categoryDropdown && categoryOptions) {
      handleOutsideClick(categoryDropdown, categoryOptions, closeCategoryDropdown)(event);
    }

    if (assignedUsersDropdown && assignedUsersOptions) {
      handleOutsideClick(assignedUsersDropdown, assignedUsersOptions, closeAssignedToDropdown)(event);
    }
  });
}

/** Closes the category dropdown and resets its state.
 */
export function closeCategoryDropdown() {
  const wrapper = document.getElementById("category-options-wrapper");
  const container = document.getElementById("category-options-container");
  const dropdownIconTwo = document.getElementById("dropdown-icon-two");
  const dropdownIconContainerTwo = document.getElementById("dropdown-icon-container-two");
  const input = document.getElementById("dropdown-category");

  if (!wrapper || !container) return;

  if (wrapper.classList.contains("open")) {
    input.classList.remove("border-light-blue");
    wrapper.classList.remove("open");
    dropdownIconTwo?.classList.remove("open");
    dropdownIconContainerTwo?.classList.remove("active");

    setTimeout(() => {
      container.innerHTML = "";
    }, 300);
  }
}

/** Closes the assigned users dropdown and resets its state.
 */
export function closeAssignedToDropdown() {
  const wrapper = document.getElementById("assigned-to-options-wrapper");
  const container = document.getElementById("assigned-to-options-container");
  const dropdownIconOne = document.getElementById("dropdown-icon-one");
  const dropdownIconContainerOne = document.getElementById("dropdown-icon-container-one");

  if (!wrapper || !container) return;

  if (wrapper.classList.contains("open-assigned-to")) {
    setBorderColorGrey("dropdown-assigned-to");
    wrapper.classList.remove("open-assigned-to");
    dropdownIconOne?.classList.remove("open");
    dropdownIconContainerOne?.classList.remove("active");

    setTimeout(() => {
      container.innerHTML = "";
    }, 300);
  }
}

/** Clears the selected assigned contacts in the dropdown.
 */
const INVALID_FIELDS_IDS = [
  "title",
  "datepicker",
  "dropdown-category",
  "dropdown-assigned-to",
];

/** Clears the invalid fields by removing the "invalid" class and hiding error messages.
 */
const ERROR_FIELDS_IDS = [
  "title-error",
  "due-date-error",
  "assigned-to-error",
  "category-error",
];

export function clearInvalidFields() {
  const invalidFields = INVALID_FIELDS_IDS.map((id) =>
    document.getElementById(id)
  );
  const errorFields = ERROR_FIELDS_IDS.map((id) => document.getElementById(id));

  invalidFields.forEach((field) => {
    if (field) {
      field.classList.remove("invalid");
    }
  });

  errorFields.forEach((error) => {
    if (error) {
      error.classList.remove("d-flex");
    }
  });
}

/** Sets the category based on the task object for the card/edit overlay.
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

/** Rotates the category dropdown icon when the dropdown is opened or closed.
 */
function rotateCategoryDropdownIcon() {
  const dropdownIconTwo = document.getElementById("dropdown-icon-two");

  if (dropdownIconTwo) {
    dropdownIconTwo.classList.toggle("open");
  }
}

/** Sets the assigned contacts based on the task object for the card/edit overlay.
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

/** Finds a contact by its ID from the current contacts or Firebase data.
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

/** Gets a contact from Firebase data by its ID.
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

/** Finds a contact by its name from the current contacts or Firebase data.
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

/** Processes a string contact by finding it in the current contacts or Firebase data.
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

/** Processes an object contact by checking its ID or name and finding it in the current contacts or Firebase data.
 * @param {Object} sel - The contact object to process.
 */
function processObjectContact(sel) {
  const idVal =
    sel.id || sel.contactId || sel.contactID || sel.uid || sel.firebaseId;

  if (idVal) {
    let found = findContactById(idVal) || getFirebaseContact(idVal);
    if (found) {
      selectedContacts.push(found);
    } else {
      selectedContacts.push(sel);
      console.warn(
        "[Dropdown-Card] Kontakt nicht gefunden (Objekt mit ID, nehme sel):",
        sel
      );
    }
  } else if (sel.name) {
    const found = findContactByName(sel.name);
    if (found) {
      selectedContacts.push(found);
    } else {
      selectedContacts.push(sel);
      console.warn(
        "[Dropdown-Card] Kontakt nicht gefunden (Objekt mit Name, nehme sel):",
        sel
      );
    }
  } else {
    console.warn("[Dropdown-Card] Unbekanntes Kontaktformat:", sel);
  }
}
