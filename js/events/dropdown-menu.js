
import { firebaseData } from '../../main.js';
let currentContacts = [];
export let selectedCategory = null;
export let selectedContacts = [];

export function toggleDropdownIcon(id) {
    // @param {string} id - Die ID des umzuschaltenden Dropdowns ('category' oder 'assignedTo').
    const dropdownIconOne = document.getElementById("dropdown-icon-one"); // Für Assigned To
    const dropdownIconContainerOne = document.getElementById("dropdown-icon-container-one");
    const dropdownIconTwo = document.getElementById("dropdown-icon-two"); // Für Category
    const dropdownIconContainerTwo = document.getElementById("dropdown-icon-container-two");

    if (id === "category" && dropdownIconTwo && dropdownIconContainerTwo) {
        dropdownIconTwo.classList.toggle("open");
        dropdownIconContainerTwo.classList.toggle('active');
    } else if (id === "assignedTo" && dropdownIconOne && dropdownIconContainerOne) {
        dropdownIconOne.classList.toggle("open");
        dropdownIconContainerOne.classList.toggle('active');
    }
}

export function toggleCategoryDropdown() {
    const wrapper = document.getElementById("category-options-wrapper");
    const container = document.getElementById("category-options-container");
    if (!wrapper || !container) return;

    const isOpen = wrapper.classList.contains("open");

    clearCategory(); // Nutzt die exportierte clearCategory
    toggleDropdownIcon('category');

    if (!isOpen) {
        container.innerHTML = getCategoryOptions();
        requestAnimationFrame(() => {
            wrapper.classList.add("open");
        });
    } else {
        wrapper.classList.remove("open");
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }
}

export function getCategoryOptions() {
    return `
        <div class="option" data-category="Technical Task">Technical Task</div>
        <div class="option" data-category="User Story">User Story</div>
        <div class="option" data-category="Meeting">Meeting</div>
    `;
}

export function setCategory(optionElement) {
    // @param {HTMLElement} optionElement - Das geklickte Options-Element, das den Kategorietext enthält.
    const wrapper = document.getElementById("category-options-wrapper");
    const selected = document.getElementById("selected-category");
    const optionsContainer = document.getElementById("category-options-container");
    const hiddenInput = document.getElementById("hidden-category-input");

    if (!selected || !hiddenInput || !wrapper || !optionsContainer) return;

    selected.textContent = optionElement.textContent;
    hiddenInput.value = optionElement.textContent;

    const dropdownCategory = document.getElementById("dropdown-category");
    const categoryError = document.getElementById("category-error");
    if (dropdownCategory) {
        dropdownCategory.classList.remove("invalid");
        categoryError?.classList.remove("d-flex");
    }

    wrapper.classList.remove("open");
    optionsContainer.innerHTML = '';

    toggleDropdownIcon('category');
    selectedCategory = optionElement.dataset.category;
}
 export function demoSelectCategory(categoryName = "User Story") {
  const fakeOptionElement = document.createElement("div");
  fakeOptionElement.textContent = categoryName;
  fakeOptionElement.dataset.category = categoryName;

  setCategory(fakeOptionElement);
}

export function clearCategory() {
    selectedCategory = null;
    const selected = document.getElementById("selected-category");
    if (selected) {
        selected.textContent = "Select task category";
    }
}

export function toggleAssignedToDropdown() {
    const wrapper = document.getElementById("assigned-to-options-wrapper");
    const container = document.getElementById("assigned-to-options-container");

    if (!wrapper || !container) return;

    const isOpen = wrapper.classList.contains("open-assigned-to");

    toggleDropdownIcon('assignedTo');

    if (!isOpen) {
        getAssignedToOptions();
        requestAnimationFrame(() => {
            wrapper.classList.add("open-assigned-to");
        });
    } else {
        wrapper.classList.remove("open-assigned-to");
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }
}

export function getAssignedToOptions() {
    const currentUser = sessionStorage.getItem('currentUser');
    console.log(currentUser);
    let contactContainer = document.getElementById('assigned-to-options-container');
    if (!contactContainer) return;
    contactContainer.innerHTML = '';


    const sortedContacts = [...currentContacts].sort((a, b) => {
        const isCurrentUserA = a.name === currentUser;
        const isCurrentUserB = b.name === currentUser;
        if (isCurrentUserA) return -1;
        if (isCurrentUserB) return 1;
        return 0;
    });

    sortedContacts.forEach((contact, i) => {
        const { name, initials, avatarColor } = contact;
        const displayName = name === currentUser ? `${name} (You)` : name;
        contactContainer.innerHTML += renderAssignedToContacts(i, displayName, initials, avatarColor);
    });

    displaySelectedContacts();
}

export function renderAssignedToContacts(i, name, initials, avatarColor) {
    // @param {number} i - Der Index des Kontakts in der Liste.
    // @param {string} name - Der Name des Kontakts.
    // @param {string} initials - Die Initialen des Kontakts.
    // @param {string} avatarColor - Die Farbe des Avatars des Kontakts.
    // @return {string} Der HTML-String für die Kontaktoption.
    const isSelected = isContactSelected(name, initials, avatarColor);
    return `
        <div class="contact-option ${isSelected ? 'assigned' : ''}" data-name="${name}" data-initials="${initials}" data-avatar-color="${avatarColor}">
            <div class="contact-checkbox">
                <div class="initials-container">
                <div class="assigned-initials-circle"style="background-color: var(${avatarColor});">${initials}</div>
                <div>${name}</div>
            </div>
            <img src="../assets/icons/btn/${isSelected ? 'checkbox-filled-white' : 'checkbox-empty-black'}.svg" alt="checkbox ${isSelected ? 'filled' : 'empty'}" class="checkbox-icon ${isSelected ? 'checked' : ''}">
        </div>
    `;
}

export function demoSelectAssignedContact(nameToSelect = "Anna Schmidt") {
  const contactToSelect = currentContacts.find(contact => contact.name === nameToSelect);

  if (!contactToSelect) {
    console.warn(`Kontakt ${nameToSelect} nicht gefunden.`);
    return;
  }

  selectedContacts.length = 0;
  selectedContacts.push(contactToSelect);

  getAssignedToOptions();
}


export function isContactSelected(name, initials, avatarColor) {
    // @param {string} name - Der Name des Kontakts.
    // @param {string} initials - Die Initialen des Kontakts.
    // @param {string} avatarColor - Die Farbe des Avatars des Kontakts.
    // @returns {boolean} True, wenn der Kontakt ausgewählt ist, ansonsten false.
    return selectedContacts.some(
        selected => selected.name === name && selected.initials === initials && selected.avatarColor === avatarColor
    );
}

export function toggleSelectContacts(contactElement, name, initials, avatarColor) {
    // @param {HTMLElement} contactElement - Das geklickte Kontaktoptions-Element.
    // @param {string} name - Der Name des Kontakts.
    // @param {string} initials - Die Initialen des Kontakts.
    // @param {string} avatarColor - Die Farbe des Avatars des Kontakts.
    const contact = { name, initials, avatarColor };
    const index = selectedContacts.findIndex(
        selected => selected.name === name && selected.initials === initials && selected.avatarColor === avatarColor
    );

    if (index === -1) {
        selectedContacts.unshift(contact);
        contactElement.classList.add('assigned');
        contactElement.querySelector('.checkbox-icon').src = "../assets/icons/btn/checkbox-filled-white.svg";
        contactElement.querySelector('.checkbox-icon').classList.add('checked');
    } else {
        selectedContacts.splice(index, 1);
        contactElement.classList.remove('assigned');
        contactElement.querySelector('.checkbox-icon').src = "../assets/icons/btn/checkbox-empty-black.svg";
        contactElement.querySelector('.checkbox-icon').classList.remove('checked');
    }
    displaySelectedContacts();
}

export function filterContacts(query) {
    const container = document.getElementById('assigned-to-options-container');
    container.innerHTML = '';

    const filtered = currentContacts.filter(contact =>
        contact.name.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-results">No contacts found.</div>';
        return;
    }

    filtered.forEach((contact, i) => {
        const contactHTML = renderAssignedToContacts(i, contact.name, contact.initials, contact.avatarColor);
        container.innerHTML += contactHTML;
    });
}

function displaySelectedContacts() {
    const assignedToArea = document.getElementById('assigned-to-area');
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
    const assignedToArea = document.getElementById('assigned-to-area');

    selectedContacts = [];

    if (assignedToArea) {
        assignedToArea.innerHTML = '';
    }
}

export function initDropdowns(contactsData) {
    // @param {Array<Object>} contactsData - Die Kontaktdaten aus Firebase.
    currentContacts = contactsData.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB, 'de', { sensitivity: 'base' });
    });

    // DOM-Elemente für die Dropdowns
    const categoryDropdown = document.getElementById('dropdown-category');
    const categoryOptions = document.getElementById('category-options-container');
    const assignedToDropdown = document.getElementById('dropdown-assigned-to');
    const assignedToOptions = document.getElementById('assigned-to-options-container');

    // Event-Listener für Kategorie-Dropdown
    document.getElementById('dropdown-category')?.addEventListener('click', toggleCategoryDropdown);
    document.getElementById('category-options-container')?.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            setCategory(event.target);
        }
    });

    // Event-Listener für Assigned To Dropdown
    document.getElementById('dropdown-assigned-to')?.addEventListener('click', toggleAssignedToDropdown);
    document.getElementById('assigned-to-options-container')?.addEventListener('click', (event) => {
        const contactOption = event.target.closest('.contact-option');
        if (contactOption) {
            const name = contactOption.dataset.name;
            const initials = contactOption.dataset.initials;
            const avatarColor = contactOption.dataset.avatarColor;
            toggleSelectContacts(contactOption, name, initials, avatarColor);
            const invalidArea = document.getElementById('dropdown-assigned-to');
            const assignedToError = document.getElementById("assigned-to-error");
            if (invalidArea.classList.contains('invalid')) {
                invalidArea.classList.remove('invalid');
                assignedToError?.classList.remove("d-flex");
            }
        }
    });

    // Event-Listener für Klicks außerhalb der Dropdowns
    document.addEventListener('click', (event) => {
        // Überprüfen ob außerhalb des Kategorie-Dropdowns geklickt wurde
        if (categoryDropdown && categoryOptions) {
            const clickedOutsideCategory = !categoryDropdown.contains(event.target) &&
                !categoryOptions.contains(event.target);

            if (clickedOutsideCategory) {
                closeCategoryDropdown();
            }
        }

        // Überprüfen ob außerhalb des Assigned-To-Dropdowns geklickt wurde
        if (assignedToDropdown && assignedToOptions) {
            const clickedOutsideAssignedTo = !assignedToDropdown.contains(event.target) &&
                !assignedToOptions.contains(event.target);

            if (clickedOutsideAssignedTo) {
                closeAssignedToDropdown();
            }
        }
    });

    // Initialen Zustand zurücksetzen
    selectedCategory = null;
    selectedContacts = [];
}

export function closeCategoryDropdown() {
    const wrapper = document.getElementById("category-options-wrapper");
    const container = document.getElementById("category-options-container");
    const dropdownIconTwo = document.getElementById("dropdown-icon-two");
    const dropdownIconContainerTwo = document.getElementById("dropdown-icon-container-two");

    if (!wrapper || !container) return;

    if (wrapper.classList.contains("open")) {
        wrapper.classList.remove("open");
        dropdownIconTwo?.classList.remove("open");
        dropdownIconContainerTwo?.classList.remove('active');

        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }
}

export function closeAssignedToDropdown() {
    const wrapper = document.getElementById("assigned-to-options-wrapper");
    const container = document.getElementById("assigned-to-options-container");
    // const spacer = document.querySelector('.spacer');
    const dropdownIconOne = document.getElementById("dropdown-icon-one");
    const dropdownIconContainerOne = document.getElementById("dropdown-icon-container-one");

    if (!wrapper || !container) return;

    if (wrapper.classList.contains("open-assigned-to")) {
        wrapper.classList.remove("open-assigned-to");
        dropdownIconOne?.classList.remove("open");
        dropdownIconContainerOne?.classList.remove('active');

        setTimeout(() => {
            container.innerHTML = '';
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

    invalidFields.forEach(field => {
        if (field) {
            field.classList.remove("invalid");
        }
    });

    errorFields.forEach(error => {
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
  console.debug('[Dropdown-Card] setCategoryFromTaskForCard:', categoryName);
  if (!categoryName) {
    console.warn('[Dropdown-Card] Keine Kategorie übergeben!');
    return;
  }
  const fakeOptionElement = document.createElement("div");
  fakeOptionElement.textContent = categoryName;
  fakeOptionElement.dataset.category = categoryName;
  setCategory(fakeOptionElement);
  console.debug('[Dropdown-Card] Kategorie gesetzt:', categoryName);
}

/**
 * Setzt die ausgewählten Kontakte aus dem Task-Objekt (für Card/Edit-Overlay)
 * @param {Array} assignedTo - Array von Namen oder Kontaktobjekten aus dem Task
 */
export function setAssignedContactsFromTaskForCard(assignedTo) {
  console.debug('[Dropdown-Card] setAssignedContactsFromTaskForCard:', assignedTo);
  // Debug: Zeige alle Kontakte und deren IDs/Feldnamen
  console.debug('[Dropdown-Card] currentContacts:', currentContacts.map(c => ({
    name: c.name,
    id: c.id,
    contactId: c.contactId,
    contactID: c.contactID,
    uid: c.uid,
    firebaseId: c.firebaseId
  })));
  if (!Array.isArray(assignedTo)) {
    console.warn('[Dropdown-Card] assignedTo ist kein Array!', assignedTo);
    return;
  }
  selectedContacts.length = 0;
  assignedTo.forEach(sel => {
    // Wenn sel eine Kontakt-ID ist, suche das Kontaktobjekt
    let found = null;
    let idVal = null;
    if (typeof sel === 'string') {
      idVal = sel;
      found = currentContacts.find(c =>
        c.id === idVal ||
        c.contactId === idVal ||
        c.contactID === idVal ||
        c.uid === idVal ||
        c.firebaseId === idVal
      );
      if (!found && typeof firebaseData === 'object' && firebaseData.contacts && firebaseData.contacts[idVal]) {
        found = { ...firebaseData.contacts[idVal], id: idVal };
        console.debug('[Dropdown-Card] Kontakt direkt aus firebaseData geladen:', found);
      }
      if (found) {
        selectedContacts.push(found);
        console.debug('[Dropdown-Card] Kontakt gefunden (ID):', found);
      } else {
        console.warn('[Dropdown-Card] Kontakt nicht gefunden (ID):', sel);
      }
    } else if (sel && (sel.id || sel.contactId || sel.contactID || sel.uid || sel.firebaseId)) {
      idVal = sel.id || sel.contactId || sel.contactID || sel.uid || sel.firebaseId;
      found = currentContacts.find(c =>
        c.id === idVal ||
        c.contactId === idVal ||
        c.contactID === idVal ||
        c.uid === idVal ||
        c.firebaseId === idVal
      );
      if (!found && typeof firebaseData === 'object' && firebaseData.contacts && firebaseData.contacts[idVal]) {
        found = { ...firebaseData.contacts[idVal], id: idVal };
        console.debug('[Dropdown-Card] Kontakt direkt aus firebaseData geladen:', found);
      }
      if (found) {
        selectedContacts.push(found);
        console.debug('[Dropdown-Card] Kontakt gefunden (Objekt mit ID):', found);
      } else {
        selectedContacts.push(sel);
        console.warn('[Dropdown-Card] Kontakt nicht gefunden (Objekt mit ID, nehme sel):', sel);
      }
    } else if (sel && sel.name) {
      found = currentContacts.find(c => c.name === sel.name);
      if (!found && typeof firebaseData === 'object' && firebaseData.contacts) {
        // Suche nach Name in firebaseData.contacts
        const allContactsArr = Object.entries(firebaseData.contacts);
        const foundEntry = allContactsArr.find(([key, c]) => c.name === sel.name);
        if (foundEntry) {
          found = { ...foundEntry[1], id: foundEntry[0] };
          console.debug('[Dropdown-Card] Kontakt direkt aus firebaseData (Name) geladen:', found);
        }
      }
      if (found) {
        selectedContacts.push(found);
        console.debug('[Dropdown-Card] Kontakt gefunden (Objekt mit Name):', found);
      } else {
        selectedContacts.push(sel);
        console.warn('[Dropdown-Card] Kontakt nicht gefunden (Objekt mit Name, nehme sel):', sel);
      }
    } else {
      console.warn('[Dropdown-Card] Unbekanntes Kontaktformat:', sel);
    }
  });
  getAssignedToOptions();
  console.debug('[Dropdown-Card] selectedContacts nach Setzen:', selectedContacts);
}
