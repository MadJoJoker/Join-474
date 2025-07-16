// Path: ../js/pages/add-task.js

import { getFirebaseData } from '../../js/data/API.js';

const picker = flatpickr("#datepicker", {
    dateFormat: "d.m.Y",
    allowInput: true
});

let isResizing = false;
let startY, startHeight, currentTextarea;
let currentPriority = 'medium';
let selectedCategory = null;
let currentContacts = [];
let selectedContacts = [];
let addedSubtasks = [];
let overlayPickerInstance;
export let fetchData = null;

/**
 * Initializes the task by retrieving the Firebase data and sorting the contacts.
 *
 * @async
 * @returns {Promise<Object>} Object with the contacts sorted alphabetically.
 */
export async function initTask() {
    try {
        const data = await getFirebaseData();
        console.log('Zugriff auf Firebase-Daten in add-task.js:', data);

        currentContacts = Object.values(data.contacts)
            .sort((a, b) => {
                const nameA = (a.name || "").toLowerCase();
                const nameB = (b.name || "").toLowerCase();
                return nameA.localeCompare(nameB, 'de', { sensitivity: 'base' });
            });
                fetchData = data;
                    console.log('FETCH CHECK:',  fetchData);

        console.log('Alle Kontakte (alphabetisch sortiert):', currentContacts);
    } catch (error) {
        console.error("Fehler beim Laden der Firebase-Daten:", error);
    }
}


/**
 * Formats the input value as a date in the format "DD.MM.YYYY" without special characters.
 *
 * @param {HTMLInputElement} input - The input element to format.
 * @returns {void} The function modifies the input value directly.
 */
export function formatDate(input) {
    let value = input.value.replace(/\D/g, "");
    if (value.length > 8) value = value.slice(0, 8);

    let formatted = "";
    if (value.length > 4) {
        formatted = value.slice(0, 2) + "." + value.slice(2, 4) + "." + value.slice(4);
    } else if (value.length > 2) {
        formatted = value.slice(0, 2) + "." + value.slice(2);
    } else {
        formatted = value;
    }
    input.value = formatted;
}


/**
 * Opens the date picker for selecting a due date.
 *
 * @returns {void} The function opens the date picker.
 */
export function openPicker() {
    picker.open();
}


/**
 * Initiates textarea resizing operation when user grabs the resize handle.
 * Sets up necessary event listeners and initial resize state variables.
 *
 * @param {MouseEvent} e - Mouse event from clicking the resize handle
 * @returns {void} The function sets up the resizing state and event listeners.
 */
export function startResize(e) {
    isResizing = true;
    currentTextarea = e.target.closest('.textarea-wrapper').querySelector('textarea');
    startY = e.clientY;
    startHeight = currentTextarea.offsetHeight;

    document.addEventListener('mousemove', resizeTextarea);
    document.addEventListener('mouseup', stopResize);

    e.preventDefault();
}


/**
 * Resizes the textarea vertically based on mouse movement during a resize operation.
 *
 * @param {MouseEvent} e - The mouse event object containing clientY position
 */
export function resizeTextarea(e) {
    if (!isResizing) return;
    const newHeight = (startHeight + e.clientY - startY) + 'px';
    currentTextarea.style.height = newHeight;
}


/**
 * Stops an active textarea resize operation by cleaning up event listeners
 * and resetting the resize state flag.
 */
export function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resizeTextarea);
    document.removeEventListener('mouseup', stopResize);
}


/**
 * Sets the priority of the task based on the clicked button.
 *
 * @param {HTMLElement} clickedButton - The button that was clicked to set the priority.
 * @param {string} priority - The priority level to set (e.g., 'low', 'medium', 'high').
 * @returns {void}
 */
export function setPriority(clickedButton, priority) {
    const allButtons = document.querySelectorAll('.priority-btn');
    allButtons.forEach(button => button.classList.remove('active'));
    clickedButton.classList.add('active');
    currentPriority = priority;
}


/**
 * Sets the priority to 'medium' (standard value) and updates the active button.
 *
 * @returns {void} The function updates the active button and sets the current priority to 'medium' (standard value).
 */
export function setMedium() {
    const allButtons = document.querySelectorAll('.priority-btn');
    allButtons.forEach(button => button.classList.remove('active'));
    const mediumBtn = document.querySelector('.priority-btn[data-priority="medium"]');
    if (mediumBtn) {
        mediumBtn.classList.add('active');
    }
    currentPriority = 'medium';
}


/**
 * Toggles the category dropdown menu, displaying or hiding the options.
 * Clears the selected category and updates the dropdown icon if the wrapper is open.
 *
 * @param {string} id - The ID of the dropdown to toggle ('category' or 'assignedTo').
 * @returns {void} The function toggles the dropdown menu and updates the icon.
 */
export function toggleCategoryDropdown(id) {
    const wrapper = document.getElementById("category-options-wrapper");
    const container = document.getElementById("category-options-container");
    if (!wrapper || !container) return;

    const isOpen = wrapper.classList.contains("open");

    clearCategory();
    toggleDropdownIcon(id);

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


/**
 * Generates the HTML for the category options dropdown.
 *
 * @returns {string} The HTML string containing the category options.
 */
export function getCategoryOptions() {
    return `
        <div class="option" data-category="Technical Task">Technical Task</div>
        <div class="option" data-category="User Story">User Story</div>
        <div class="option" data-category="Meeting">Meeting</div>
    `;
}


/**
 * Toggles the dropdown icon based on the ID provided.
 *
 * @param {string} id - The ID of the dropdown to toggle ('category' or 'assignedTo').
 * @returns {void} The function toggles the icon and the active class on the dropdown container.
 */
export function toggleDropdownIcon(id) {
    const dropdownIconOne = document.getElementById("dropdown-icon-one");
    const dropdownIconContainerOne = document.getElementById("dropdown-icon-container-one");
    const dropdownIconTwo = document.getElementById("dropdown-icon-two");
    const dropdownIconContainerTwo = document.getElementById("dropdown-icon-container-two");

    if (id === "category" && dropdownIconTwo && dropdownIconContainerTwo) {
        dropdownIconTwo.classList.toggle("open");
        dropdownIconContainerTwo.classList.toggle('active');
    } else if (id === "assignedTo" && dropdownIconOne && dropdownIconContainerOne) {
        dropdownIconOne.classList.toggle("open");
        dropdownIconContainerOne.classList.toggle('active');
    }
}


/**
 * Sets the selected category based on the clicked option.
 * Updates the selected category text, the hidden input value, and closes the dropdown.
 *
 * @param {HTMLElement} optionElement - The clicked option element containing the category text.
 * @returns {void} The function updates the selected category and closes the dropdown.
 */
export function setCategory(optionElement) {
    const wrapper = document.getElementById("category-options-wrapper");
    const selected = document.getElementById("selected-category");
    const optionsContainer = document.getElementById("category-options-container");
    const hiddenInput = document.getElementById("hidden-category-input");

    if (!selected || !hiddenInput || !wrapper || !optionsContainer) return;

    selected.textContent = optionElement.textContent;
    hiddenInput.value = optionElement.textContent;

    const dropdownCategory = document.getElementById("dropdown-category");
    if (dropdownCategory) {
        dropdownCategory.classList.remove("invalid");
    }

    wrapper.classList.remove("open");
    optionsContainer.innerHTML = '';

    toggleDropdownIcon('category'); // Ensure correct ID
    selectedCategory = optionElement.dataset.category;
}


/**
 * Clears the selected category by resetting the selectedCategory variable
 * and updating the displayed text in the selected category element.
 *
 * @returns {void} The function resets the selected category and updates the UI.
 */
export function clearCategory() {
    selectedCategory = null;
    const selected = document.getElementById("selected-category");
    if (selected) {
        selected.textContent = "Select task category";
    }
}


/**
 * Clears the form by resetting the medium priority, clearing the selected category,
 * and clearing the subtask input field.
 *
 * @returns {void} The function resets the form fields to their default state.
 */
export function clearForm() {
    const form = document.getElementById('add-task-form');
    if (form) {
        form.reset();
    }
    setMedium();
    clearCategory();
    clearSubtask();
    selectedContacts = [];
    addedSubtasks = [];
    displaySelectedContacts(); // Update UI for cleared contacts
    renderSubtasks(); // Clear subtask list
}


/**
 * Toggles the assigned to dropdown menu, displaying or hiding the options.
 * Updates the dropdown icon if the wrapper is open.
 *
 * @param {string} id - The ID of the dropdown to toggle ('assignedTo').
 * @returns {void} The function toggles the dropdown menu and updates the icon.
 */
export function toggleAssignedToDropdown(id) {
    const wrapper = document.getElementById("assigned-to-options-wrapper");
    const container = document.getElementById("assigned-to-options-container");
    const spacer = document.querySelector('.spacer');
    if (!wrapper || !container || !spacer) return;

    const isOpen = wrapper.classList.contains("open-assigned-to");

    toggleDropdownIcon(id);

    if (!isOpen) {
        getAssignedToOptions();
        requestAnimationFrame(() => {
            wrapper.classList.add("open-assigned-to");
            spacer.classList.add('bg-color-white');
        });
    } else {
        wrapper.classList.remove("open-assigned-to");
        spacer.classList.remove('bg-color-white');
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }
}


/**
 * Generates the HTML for the assigned to options dropdown.
 *
 * @returns {void} The function populates the assigned to options container with contact options.
 */
export function getAssignedToOptions() {
    let contactContainer = document.getElementById('assigned-to-options-container');
    if (!contactContainer) return;
    contactContainer.innerHTML = '';

    currentContacts.forEach((contact, i) => {
        const { name, initials, avatarColor } = contact;
        contactContainer.innerHTML += renderAssignedToContacts(i, name, initials, avatarColor);
    });

    displaySelectedContacts(); // Ensure selected contacts are displayed after options are rendered
}


/**
 * Renders a contact option for the assigned to dropdown.
 *
 * @param {number} i - The index of the contact in the list.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color of the contact's avatar.
 * @return {string} The HTML string for the contact option.
 */
export function renderAssignedToContacts(i, name, initials, avatarColor) {
    const isSelected = isContactSelected(name, initials, avatarColor);
    return `
        <div class="contact-option ${isSelected ? 'assigned' : ''}" data-name="${name}" data-initials="${initials}" data-avatar-color="${avatarColor}">
            <div class="d-flex align-items gap-8">
                <div class="initials-container">
                <div class="assigned-initials-circle"style="background-color: var(${avatarColor});">${initials}</div>
                <div>${name}</div>
            </div>
            <img src="../assets/icons/btn/${isSelected ? 'checkbox-filled-white' : 'checkbox-empty-black'}.svg" alt="checkbox ${isSelected ? 'filled' : 'empty'}" class="checkbox-icon ${isSelected ? 'checked' : ''}">
        </div>
    `;
}


/**
 * Checks if a contact is already selected based on its name, initials, and avatar color.
 *
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color of the contact's avatar.
 * @returns {boolean} True if the contact is selected, false otherwise.
 */
export function isContactSelected(name, initials, avatarColor) {
    return selectedContacts.some(
        selected => selected.name === name && selected.initials === initials && selected.avatarColor === avatarColor
    );
}


/**
 * Toggles the selection state of a contact and updates the UI.
 *
 * @param {HTMLElement} contactElement - The clicked contact option element.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color of the contact's avatar.
 */
export function toggleSelectContacts(contactElement, name, initials, avatarColor) {
    const contact = { name, initials, avatarColor };
    const index = selectedContacts.findIndex(
        selected => selected.name === name && selected.initials === initials && selected.avatarColor === avatarColor
    );

    if (index === -1) {
        selectedContacts.push(contact);
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


/**
 * Displays the initials of selected contacts in the 'assigned-to-area'.
 */
export function displaySelectedContacts() {
    const assignedToArea = document.getElementById('assigned-to-area');
    if (!assignedToArea) return;

    assignedToArea.innerHTML = '';
    selectedContacts.forEach(contact => {
        const initialsDiv = document.createElement('div');
        initialsDiv.className = 'assigned-initials-circle';
        initialsDiv.style.backgroundColor = `var(${contact.avatarColor})`;
        initialsDiv.textContent = contact.initials;
        assignedToArea.appendChild(initialsDiv);
    });
}


/**
 * Removes a contact from the selected contacts list by its index.
 * @param {number} index - The index of the contact to remove.
 */
export function removeContact(index) {
    selectedContacts.splice(index, 1);
    displaySelectedContacts();
}


/**
 * Adds a new subtask to the list if the input field is not empty.
 *
 * @returns {void} The function adds a new subtask and updates the UI.
 */
export function addSubtask() {
    const subtaskInput = document.getElementById('subtask-input');
    if (!subtaskInput) return;

    const subtaskText = subtaskInput.value.trim();
    if (subtaskText) {
        addedSubtasks.push({ text: subtaskText, completed: false });
        subtaskInput.value = '';
        renderSubtasks();
        toggleSubtaskInputIcons(false);
    }
}


/**
 * Clears the subtask input field.
 *
 * @returns {void} The function clears the subtask input field.
 */
export function clearSubtask() {
    const subtaskInput = document.getElementById('subtask-input');
    if (subtaskInput) {
        subtaskInput.value = '';
    }
    toggleSubtaskInputIcons(false);
}


/**
 * Renders the list of added subtasks in the UI.
 *
 * @returns {void} The function updates the display of subtasks.
 */
export function renderSubtasks() {
    const subtasksList = document.getElementById('subtasks-list');
    if (!subtasksList) return;

    subtasksList.innerHTML = '';
    addedSubtasks.forEach((subtask, index) => {
        subtasksList.innerHTML += renderSubtask(subtask.text, index);
    });
}


/**
 * Generates the HTML for a single subtask item.
 *
 * @param {string} text - The text of the subtask.
 * @param {number} index - The index of the subtask in the array.
 * @returns {string} The HTML string for the subtask item.
 */
export function renderSubtask(text, index) {
  return `
        <ul class="subtask-list" data-index="${index}">
            <div class="subtask-item-content">
                <span class="subtask-text">${text}</span>
                <div id="subtask-${index}" class="subtask-actions">
                    <svg class="left" width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.14453 17H3.54453L12.1695 8.375L10.7695 6.975L2.14453 15.6V17ZM16.4445 6.925L12.1945 2.725L13.5945 1.325C13.9779 0.941667 14.4487 0.75 15.007 0.75C15.5654 0.75 16.0362 0.941667 16.4195 1.325L17.8195 2.725C18.2029 3.10833 18.4029 3.57083 18.4195 4.1125C18.4362 4.65417 18.2529 5.11667 17.8695 5.5L16.4445 6.925ZM14.9945 8.4L4.39453 19H0.144531V14.75L10.7445 4.15L14.9945 8.4Z" fill="#2A3647"/>
                    </svg>

                    <span class="separator"></span>

                    <svg class="right" width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.14453 18C2.59453 18 2.1237 17.8042 1.73203 17.4125C1.34036 17.0208 1.14453 16.55 1.14453 16V3C0.861198 3 0.623698 2.90417 0.432031 2.7125C0.240365 2.52083 0.144531 2.28333 0.144531 2C0.144531 1.71667 0.240365 1.47917 0.432031 1.2875C0.623698 1.09583 0.861198 1 1.14453 1H5.14453C5.14453 0.716667 5.24036 0.479167 5.43203 0.2875C5.6237 0.0958333 5.8612 0 6.14453 0H10.1445C10.4279 0 10.6654 0.0958333 10.857 0.2875C11.0487 0.479167 11.1445 0.716667 11.1445 1H15.1445C15.4279 1 15.6654 1.09583 15.857 1.2875C16.0487 1.47917 16.1445 1.71667 16.1445 2C16.1445 2.28333 16.0487 2.52083 15.857 2.7125C15.6654 2.90417 15.4279 3 15.1445 3V16C15.1445 16.55 14.9487 17.0208 14.557 17.4125C14.1654 17.8042 13.6945 18 13.1445 18H3.14453ZM3.14453 3V16H13.1445V3H3.14453ZM5.14453 13C5.14453 13.2833 5.24036 13.5208 5.43203 13.7125C5.6237 13.9042 5.8612 14 6.14453 14C6.42786 14 6.66536 13.9042 6.85703 13.7125C7.0487 13.5208 7.14453 13.2833 7.14453 13V6C7.14453 5.71667 7.0487 5.47917 6.85703 5.2875C6.66536 5.09583 6.42786 5 6.14453 5C5.8612 5 5.6237 5.09583 5.43203 5.2875C5.24036 5.47917 5.14453 5.71667 5.14453 6V13ZM9.14453 13C9.14453 13.2833 9.24037 13.5208 9.43203 13.7125C9.6237 13.9042 9.8612 14 10.1445 14C10.4279 14 10.6654 13.9042 10.857 13.7125C11.0487 13.5208 11.1445 13.2833 11.1445 13V6C11.1445 5.71667 11.0487 5.47917 10.857 5.2875C10.6654 5.09583 10.4279 5 10.1445 5C9.8612 5 9.6237 5.09583 9.43203 5.2875C9.24037 5.47917 9.14453 5.71667 9.14453 6V13Z" fill="#2A3647"/>
                    </svg>
                </div>
            </div>
        </ul>
    `;
}
/**
 * Deletes a subtask from the list.
 *
 * @param {number} index - The index of the subtask to delete.
 * @returns {void} The function removes the subtask and updates the UI.
 */
export function deleteSubtask(index) {
    addedSubtasks.splice(index, 1);
    renderSubtasks();
}


/**
 * Toggles the input field for editing a subtask.
 *
 * @param {HTMLElement} editIcon - The edit icon element that was clicked.
 * @returns {void} The function toggles the edit mode for a subtask.
 */
export function toggleSubtaskEdit(editIcon) {
    const listItem = editIcon.closest('.subtask-list');
    if (!listItem) return;

    const index = parseInt(listItem.dataset.index);
    const subtaskTextSpan = listItem.querySelector('.subtask-text');
    const subtaskActions = listItem.querySelector('.subtask-actions');

    if (listItem.querySelector('.edit-input')) {
        // Already in edit mode, do nothing or save
        return;
    }

    const currentText = subtaskTextSpan.textContent;
    subtaskTextSpan.style.display = 'none';
    subtaskActions.style.display = 'none'; // Hide action icons during edit

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentText;
    editInput.dataset.index = index; // Store index on input
    editInput.addEventListener('keydown', (event) => handleSubtaskInput(event, index));

    listItem.querySelector('.subtask-item-content').prepend(editInput);
    editInput.focus();

    // Show save/cancel icons for editing
    const editIconsContainer = document.createElement('div');
    editIconsContainer.className = 'subtask-edit-icons';
    editIconsContainer.innerHTML = `
        <img src="../assets/icons/btn/close.svg" alt="Cancel" class="subtask-icon" data-action="cancel-edit">
        <div class="subtask-separator"></div>
        <img src="../assets/icons/btn/check-black.svg" alt="Save" class="subtask-icon" data-action="save-edit">
    `;
    listItem.querySelector('.subtask-item-content').appendChild(editIconsContainer);

    editIconsContainer.querySelector('[data-action="cancel-edit"]').addEventListener('click', () => {
        subtaskTextSpan.style.display = 'inline';
        subtaskActions.style.display = 'flex'; // Show action icons
        editInput.remove();
        editIconsContainer.remove();
    });

    editIconsContainer.querySelector('[data-action="save-edit"]').addEventListener('click', () => {
        saveSubtask(index, editInput.value);
        subtaskTextSpan.style.display = 'inline';
        subtaskActions.style.display = 'flex'; // Show action icons
        editInput.remove();
        editIconsContainer.remove();
    });
}


/**
 * Handles keydown events on the subtask edit input field.
 *
 * @param {KeyboardEvent} event - The keyboard event object.
 * @param {number} index - The index of the subtask being edited.
 */
export function handleSubtaskInput(event, index) {
    if (event.key === 'Enter') {
        saveSubtask(index, event.target.value);
    } else if (event.key === 'Escape') {
        renderSubtasks(); // Cancel edit and re-render original
    }
}


/**
 * Saves the edited subtask text.
 *
 * @param {number} index - The index of the subtask to save.
 * @param {string} newText - The new text for the subtask.
 * @returns {void} The function updates the subtask and re-renders the list.
 */
export function saveSubtask(index, newText) {
    if (newText.trim() !== '') {
        addedSubtasks[index].text = newText.trim();
        renderSubtasks();
    } else {
        deleteSubtask(index); // Delete if new text is empty
    }
}


/**
 * Toggles the visibility of subtask input icons (add/clear vs. check/close).
 *
 * @param {boolean} showClearAdd - True to show clear and add icons, false to show default add button.
 */
export function toggleSubtaskInputIcons(showClearAdd) {
    const addSubtaskBtn = document.getElementById('add-subtask-btn');
    const subtaskIcons = document.getElementById('subtask-icons');
    const subtaskInputField = document.getElementById('subtask-input');

  if (!addSubtaskBtn || !subtaskIcons || !subtaskInputField) {
        console.warn('Eines der Subtask-Kontrollen oder das Input-Feld konnte nicht gefunden werden!');
        return;
    }

    if (showClearAdd) {
        // Zustand: Zeige Clear/Add-Icons, verstecke den Hinzufügen-Button
        addSubtaskBtn.style.opacity = '0';
        addSubtaskBtn.style.pointerEvents = 'none'; // Macht den Button unklickbar

        subtaskIcons.style.opacity = '1';
        subtaskIcons.style.pointerEvents = 'auto'; // Macht die Icons klickbar

        // NEU: Setze den Fokus auf das Subtask-Input-Feld
        subtaskInputField.focus();

        console.log('Test SubTASK');


        } else {
            // Zustand: Zeige den Hinzufügen-Button, verstecke die Icons
        addSubtaskBtn.style.opacity = '1';
        addSubtaskBtn.style.pointerEvents = 'auto';

        subtaskIcons.style.opacity = '0';
        subtaskIcons.style.pointerEvents = 'none';

        // Optional: Den Fokus vom Input-Feld entfernen, wenn die Icons ausgeblendet werden
        // subtaskInputField.blur();
    }
}

/**
 * Validates required fields in the form.
 *
 * @returns {boolean} True if all required fields are filled, false otherwise.
 */
function checkRequiredFields() {
    let isValid = true;
    const titleInput = document.getElementById('title');
    const datepickerInput = document.getElementById('datepicker');
    const categoryDropdown = document.getElementById('dropdown-category');
    const assignedToDropdown = document.getElementById('dropdown-assigned-to');

    if (!titleInput || !datepickerInput || !categoryDropdown || !assignedToDropdown) return false;

    if (!titleInput.value.trim()) {
        titleInput.classList.add('invalid');
        isValid = false;
    } else {
        titleInput.classList.remove('invalid');
    }

    if (!datepickerInput.value.trim()) {
        datepickerInput.classList.add('invalid');
        isValid = false;
    } else {
        datepickerInput.classList.remove('invalid');
    }

    if (!selectedCategory) {
        categoryDropdown.classList.add('invalid');
        isValid = false;
    } else {
        categoryDropdown.classList.remove('invalid');
    }

    if (selectedContacts.length === 0) {
        assignedToDropdown.classList.add('invalid');
        isValid = false;
    } else {
        assignedToDropdown.classList.remove('invalid');
    }

    // Additional check for category dropdown's visual state
    const selectedCategorySpan = document.getElementById('selected-category');
    if (selectedCategorySpan && selectedCategorySpan.textContent === 'Select task category') {
        categoryDropdown.classList.add('invalid');
        isValid = false;
    }

    return isValid;
}


/**
 * Handles the input event for required fields, removing 'invalid' class on input.
 * @param {HTMLInputElement} inputElement - The input element.
 */
export function handleInput(inputElement) {
    if (inputElement.value.trim()) {
        inputElement.classList.remove('invalid');
    }
}


/**
 * Creates a new task object from the form data.
 * @returns {Object} The task object.
 */
function createTaskObject() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('task-description').value;
    const dueDate = document.getElementById('datepicker').value;

    return {
        title,
        description,
        dueDate,
        category: selectedCategory,
        priority: currentPriority,
        assignedTo: selectedContacts.map(contact => ({
            name: contact.name,
            initials: contact.initials,
            avatarColor: contact.avatarColor
        })),
        subtasks: addedSubtasks.map(subtask => ({
            text: subtask.text,
            completed: subtask.completed
        })),
        createdAt: new Date().toISOString(), // Or a more specific format
        columnID: 'todo' // Default column
    };
}


/**
 * Handles the form submission to create a task.
 * @param {Event} event - The submit event.
 */
export async function handleCreateTask(event) {
    event.preventDefault(); // Prevent default form submission

    if (checkRequiredFields()) {
        const newTask = createTaskObject();
        console.log("New Task Data:", newTask);

        // Here you would typically save the task to Firebase or your backend.
        // For now, we just log it.
        alert('Task created successfully! (Check console for data)');

        clearForm(); // Clear the form after successful submission
        // Optionally close the overlay if it's being used as an overlay
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.classList.add('overlay-hidden');
            overlay.classList.remove('overlay-visible');
            initAddTaskForm();
        }
    } else {
        console.log("Form validation failed.");
    }
}


/**
 * Initializes all event listeners and component setups for the Add Task form.
 */
export async function initAddTaskForm() {
    await initTask(); // Fetch contacts first

    // Initialize Flatpickr if not already initialized or if a new instance is needed for the overlay
flatpickr("#datepicker", {
  dateFormat: "d.m.Y",
  allowInput: true
});

flatpickr("#calendar-icon", {
});


    setMedium(); // Set default priority

    // Event Listeners for form fields and buttons
    const addTaskForm = document.getElementById('add-task-form');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', handleCreateTask);
        addTaskForm.addEventListener('reset', clearForm); // Handle clear button
    }

    // Input fields for validation
    document.getElementById('title')?.addEventListener('input', (event) => handleInput(event.target));
    document.getElementById('datepicker')?.addEventListener('input', (event) => formatDate(event.target));
    document.getElementById('datepicker')?.addEventListener('focus', openPicker);
    document.getElementById('calendar-icon')?.addEventListener('click', openPicker);


    // Textarea resize handle
    document.querySelector('.resize-handle')?.addEventListener('mousedown', startResize);

    // Priority buttons
    document.querySelectorAll('.priority-btn').forEach(button => {
        button.addEventListener('click', (event) => setPriority(event.currentTarget, event.currentTarget.dataset.priority));
    });

    // Dropdown for Category
    document.getElementById('dropdown-category')?.addEventListener('click', () => toggleCategoryDropdown('category'));
    // Delegate category option clicks (since options are dynamically added)
    document.getElementById('category-options-container')?.addEventListener('click', (event) => {
        if (event.target.classList.contains('option')) {
            setCategory(event.target);
        }
    });

    // Dropdown for Assigned To
    document.getElementById('dropdown-assigned-to')?.addEventListener('click', () => toggleAssignedToDropdown('assignedTo'));
    // Delegate assigned contact clicks
    document.getElementById('assigned-to-options-container')?.addEventListener('click', (event) => {
        const contactOption = event.target.closest('.contact-option');
        if (contactOption) {
            const name = contactOption.dataset.name;
            const initials = contactOption.dataset.initials;
            const avatarColor = contactOption.dataset.avatarColor;
            toggleSelectContacts(contactOption, name, initials, avatarColor);
        }
    });

    // Subtask input and buttons
    const subtaskInput = document.getElementById('subtask-input');
    const addSubtaskBtn = document.getElementById('add-subtask-btn');
    const clearSubtaskIcon = document.querySelector('.subtask-icons img[alt="Close"]');
    const addSubtaskIcon = document.querySelector('.subtask-icons img[alt="Add"]');

    if (subtaskInput) {
        subtaskInput.addEventListener('input', (event) => toggleSubtaskInputIcons(event.target.value.length > 0));
        subtaskInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission
                addSubtask();
            }
        });
    }
addSubtaskBtn?.addEventListener('click', () => {
    toggleSubtaskInputIcons(true);
});

// Diese Listener sind für die Buttons/Icons, die nach der Eingabe erscheinen
clearSubtaskIcon?.addEventListener('click', clearSubtask);
addSubtaskIcon?.addEventListener('click', addSubtask); // Dies ist das Häkchen-Icon

    // Delegate subtask list actions (edit/delete)
    document.getElementById('subtasks-list')?.addEventListener('click', (event) => {
        const target = event.target;
        const listItem = target.closest('.subtask-list');
        if (!listItem) return;

        const index = parseInt(listItem.dataset.index);

        if (target.classList.contains('delete-icon')) {
            deleteSubtask(index);
        } else if (target.classList.contains('edit-icon')) {
            toggleSubtaskEdit(target);
        }
    });

    // Close overlay button (if applicable for overlay use)
    const closeModalBtn = document.querySelector('.close-modal-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const overlay = document.getElementById('overlay');
            if (overlay) {
                overlay.classList.add('overlay-hidden');
                overlay.classList.remove('overlay-visible');
            }
            clearForm(); // Clear form when closing
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (event) {
        const contactsDropdown = document.querySelector('#dropdown-assigned-to');
        const contactsOptions = document.getElementById('assigned-to-options-wrapper');
        const categoryDropdown = document.querySelector('#dropdown-category');
        const categoryOptions = document.getElementById('category-options-wrapper');
        const dropdownIconContainerOne = document.getElementById("dropdown-icon-container-one");
        const dropdownIconContainerTwo = document.getElementById("dropdown-icon-container-two");
        const spacer = document.querySelector('.spacer');

        const clickedOutsideContacts = contactsDropdown && contactsOptions && !contactsDropdown.contains(event.target) && !contactsOptions.contains(event.target);
        const clickedOutsideCategory = categoryDropdown && categoryOptions && !categoryDropdown.contains(event.target) && !categoryOptions.contains(event.target);

        if (clickedOutsideContacts) {
            contactsOptions.classList.remove('open-assigned-to');
            document.getElementById('dropdown-icon-one')?.classList.remove('open');
            spacer?.classList.remove('bg-color-white');
            dropdownIconContainerOne?.classList.remove('active');
        }

        if (clickedOutsideCategory) {
            categoryOptions.classList.remove('open');
            document.getElementById('dropdown-icon-two')?.classList.remove('open');
            dropdownIconContainerTwo?.classList.remove('active');
        }
    });
}
