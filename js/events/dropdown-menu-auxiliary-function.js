import { firebaseData } from "../../main.js";
import { initTask } from "../pages/add-task.js";
import { 
    getAssignedToOptions,
    setCategory,
    toggleCategoryDropdown,
    toggleSelectContacts,
    toggleAssignedToDropdown,
    setSortedContacts,
    selectedCategory,
    selectedContacts,
    resetDropdownState
 } from "./dropdown-menu.js";

export function initDropdowns(contactsData) {
  setSortedContacts(contactsData);

  const categoryDropdown = document.getElementById("dropdown-category");
  const categoryOptions = document.getElementById("category-options-container");
  const assignedToDropdown = document.getElementById("dropdown-assigned-to");
  const assignedToOptions = document.getElementById("assigned-to-options-container");

  // Event-Listener für Kategorie-Dropdown
  document.getElementById("dropdown-category")?.addEventListener("click", toggleCategoryDropdown);
  document.getElementById("category-options-container")?.addEventListener("click", (event) => {
      if (event.target.classList.contains("option")) {
        setCategory(event.target);
      }
    });

  // Event-Listener für Assigned To Dropdown
  document
    .getElementById("dropdown-assigned-to")
    ?.addEventListener("click", toggleAssignedToDropdown);
  document.getElementById("assigned-to-options-container")?.addEventListener("click", (event) => {
      const contactOption = event.target.closest(".contact-option");
      if (contactOption) {
        const name = contactOption.dataset.name;
        const initials = contactOption.dataset.initials;
        const avatarColor = contactOption.dataset.avatarColor;
        toggleSelectContacts(contactOption, name, initials, avatarColor);
        const invalidArea = document.getElementById("dropdown-assigned-to");
        const assignedToError = document.getElementById("assigned-to-error");
        if (invalidArea.classList.contains("invalid")) {
          invalidArea.classList.remove("invalid");
          assignedToError?.classList.remove("d-flex");
        }
      }
    });

  // Event-Listener für Klicks außerhalb der Dropdowns
  document.addEventListener("click", (event) => {
    // Überprüfen ob außerhalb des Kategorie-Dropdowns geklickt wurde
    if (categoryDropdown && categoryOptions) {
      const clickedOutsideCategory =
        !categoryDropdown.contains(event.target) &&
        !categoryOptions.contains(event.target);

      if (clickedOutsideCategory) {
        closeCategoryDropdown();
      }
    }

    // Überprüfen ob außerhalb des Assigned-To-Dropdowns geklickt wurde
    if (assignedToDropdown && assignedToOptions) {
      const clickedOutsideAssignedTo =
        !assignedToDropdown.contains(event.target) &&
        !assignedToOptions.contains(event.target);

      if (clickedOutsideAssignedTo) {
        closeAssignedToDropdown();
      }
    }
  });

  resetDropdownState();
}



export function closeCategoryDropdown() {
  const wrapper = document.getElementById("category-options-wrapper");
  const container = document.getElementById("category-options-container");
  const dropdownIconTwo = document.getElementById("dropdown-icon-two");
  const dropdownIconContainerTwo = document.getElementById(
    "dropdown-icon-container-two"
  );

  if (!wrapper || !container) return;

  if (wrapper.classList.contains("open")) {
    wrapper.classList.remove("open");
    dropdownIconTwo?.classList.remove("open");
    dropdownIconContainerTwo?.classList.remove("active");

    setTimeout(() => {
      container.innerHTML = "";
    }, 300);
  }
}

export function closeAssignedToDropdown() {
  const wrapper = document.getElementById("assigned-to-options-wrapper");
  const container = document.getElementById("assigned-to-options-container");
  // const spacer = document.querySelector('.spacer');
  const dropdownIconOne = document.getElementById("dropdown-icon-one");
  const dropdownIconContainerOne = document.getElementById(
    "dropdown-icon-container-one"
  );

  if (!wrapper || !container) return;

  if (wrapper.classList.contains("open-assigned-to")) {
    wrapper.classList.remove("open-assigned-to");
    dropdownIconOne?.classList.remove("open");
    dropdownIconContainerOne?.classList.remove("active");

    setTimeout(() => {
      container.innerHTML = "";
    }, 300);
  }
}

export function clearInvalidFields() {
  const invalidFields = [
    document.getElementById("title"),
    document.getElementById("datepicker"),
    document.getElementById("dropdown-category"),
    document.getElementById("dropdown-assigned-to"),
  ];
  const errorFields = [
    document.getElementById("title-error"),
    document.getElementById("due-date-error"),
    document.getElementById("assigned-to-error"),
    document.getElementById("category-error"),
  ];

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

/**
 * Setzt die Kategorie im Dropdown aus dem Task-Objekt (für Card/Edit-Overlay)
 * @param {string} categoryName - Die Kategorie aus dem Task-Objekt
 */
export function setCategoryFromTaskForCard(categoryName) {
  console.debug("[Dropdown-Card] setCategoryFromTaskForCard:", categoryName);
  if (!categoryName) {
    console.warn("[Dropdown-Card] Keine Kategorie übergeben!");
    return;
  }
  const fakeOptionElement = document.createElement("div");
  fakeOptionElement.textContent = categoryName;
  fakeOptionElement.dataset.category = categoryName;
  setCategory(fakeOptionElement);
  console.debug("[Dropdown-Card] Kategorie gesetzt:", categoryName);
}

/**
 * Setzt die ausgewählten Kontakte aus dem Task-Objekt (für Card/Edit-Overlay)
 * @param {Array} assignedTo - Array von Namen oder Kontaktobjekten aus dem Task
 */
export function setAssignedContactsFromTaskForCard(assignedTo) {
  if (!Array.isArray(assignedTo)) {
    console.warn("[Dropdown-Card] assignedTo is no Array!", assignedTo);
    return;
  }
  selectedContacts.length = 0;
  assignedTo.forEach((sel) => {
    // Wenn sel eine Kontakt-ID ist, suche das Kontaktobjekt
    let found = null;
    let idVal = null;
    if (typeof sel === "string") {
      idVal = sel;
      found = currentContacts.find(
        (c) =>
          c.id === idVal ||
          c.contactId === idVal ||
          c.contactID === idVal ||
          c.uid === idVal ||
          c.firebaseId === idVal
      );
      if (
        !found &&
        typeof firebaseData === "object" &&
        firebaseData.contacts &&
        firebaseData.contacts[idVal]
      ) {
        found = { ...firebaseData.contacts[idVal], id: idVal };
        console.debug(
          "[Dropdown-Card] Kontakt direkt aus firebaseData geladen:",
          found
        );
      }
      if (found) {
        selectedContacts.push(found);
        console.debug("[Dropdown-Card] Kontakt gefunden (ID):", found);
      } else {
        console.warn("[Dropdown-Card] Kontakt nicht gefunden (ID):", sel);
      }
    } else if (
      sel &&
      (sel.id || sel.contactId || sel.contactID || sel.uid || sel.firebaseId)
    ) {
      idVal =
        sel.id || sel.contactId || sel.contactID || sel.uid || sel.firebaseId;
      found = currentContacts.find(
        (c) =>
          c.id === idVal ||
          c.contactId === idVal ||
          c.contactID === idVal ||
          c.uid === idVal ||
          c.firebaseId === idVal
      );
      if (
        !found &&
        typeof firebaseData === "object" &&
        firebaseData.contacts &&
        firebaseData.contacts[idVal]
      ) {
        found = { ...firebaseData.contacts[idVal], id: idVal };
        console.debug(
          "[Dropdown-Card] Kontakt direkt aus firebaseData geladen:",
          found
        );
      }
      if (found) {
        selectedContacts.push(found);
        console.debug(
          "[Dropdown-Card] Kontakt gefunden (Objekt mit ID):",
          found
        );
      } else {
        selectedContacts.push(sel);
        console.warn(
          "[Dropdown-Card] Kontakt nicht gefunden (Objekt mit ID, nehme sel):",
          sel
        );
      }
    } else if (sel && sel.name) {
      found = currentContacts.find((c) => c.name === sel.name);
      if (!found && typeof firebaseData === "object" && firebaseData.contacts) {
        // Suche nach Name in firebaseData.contacts
        const allContactsArr = Object.entries(firebaseData.contacts);
        const foundEntry = allContactsArr.find(
          ([key, c]) => c.name === sel.name
        );
        if (foundEntry) {
          found = { ...foundEntry[1], id: foundEntry[0] };
          console.debug(
            "[Dropdown-Card] Kontakt direkt aus firebaseData (Name) geladen:",
            found
          );
        }
      }
      if (found) {
        selectedContacts.push(found);
        console.debug(
          "[Dropdown-Card] Kontakt gefunden (Objekt mit Name):",
          found
        );
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
  });
  getAssignedToOptions();
  console.debug(
    "[Dropdown-Card] selectedContacts nach Setzen:",
    selectedContacts
  );
}