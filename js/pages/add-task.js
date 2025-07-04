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

import { getFirebaseData } from '../../js/data/API.js';


/**
 * Initializes the task by retrieving the Firebase data and sorting the contacts.
 *
 * @async Returns a Promise containing the Firebase data.
 * @returns {Object} Object with the contacts sorted alphabetically.
 */
async function initTask() {
    const data = await getFirebaseData();
    console.log('Zugriff auf Firebase-Daten in add-task.js:', data);

    currentContacts = Object.values(data.contacts)
        .sort((a, b) => {
            const nameA = (a.name || "").toLowerCase();
            const nameB = (b.name || "").toLowerCase();
            return nameA.localeCompare(nameB, 'de', { sensitivity: 'base' });
        });

    console.log('Alle Kontakte (alphabetisch sortiert):', currentContacts);
}


initTask();


/**
 *  Formats the input value as a date in the format "DD.MM.YYYY" without special characters.
 * 
 * @param {HTMLInputElement} input - The input element to format.
 * @returns {void} The function modifies the input value directly.
 */
function formatDate(input) {
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
window.formatDate = formatDate;


/**
 * Opens the date picker for selecting a due date.
 * 
 * @returns {void} The function opens the date picker.
 */
function openPicker() {
    picker.open();
}
window.openPicker = openPicker


/**
 * Initiates textarea resizing operation when user grabs the resize handle.
 * Sets up necessary event listeners and initial resize state variables.
 * 
 * @param {MouseEvent} e - Mouse event from clicking the resize handle
 * @returns {void} The function sets up the resizing state and event listeners.
 */
function startResize(e) {
    isResizing = true;
    currentTextarea = e.target.closest('.textarea-wrapper').querySelector('textarea');
    startY = e.clientY;
    startHeight = currentTextarea.offsetHeight;

    document.onmousemove = resizeTextarea;
    document.onmouseup = stopResize;

    e.preventDefault();
}
window.startResize = startResize;


/**
 * Resizes the textarea vertically based on mouse movement during a resize operation.
 * Relies on several global variables to track the resize state:
 * - isResizing: Boolean flag indicating if a resize is in progress
 * - startY: Initial mouse Y position when resize started
 * - startHeight: Initial height of the textarea when resize started
 * - currentTextarea: Reference to the textarea being resized
 * 
 * @param {MouseEvent} e - The mouse event object containing clientY position
 */
function resizeTextarea(e) {
    if (!isResizing) return;

    const newHeight = (startHeight + e.clientY - startY) + 'px';
    currentTextarea.style.height = newHeight;
}
window.resizeTextarea = resizeTextarea;


/**
 * Stops an active textarea resize operation by cleaning up event listeners
 * and resetting the resize state flag.
 */
function stopResize() {
    isResizing = false;
    document.onmousemove = null;
    document.onmouseup = null;
}
window.stopResize = stopResize;


/** 
 * * Sets the priority of the task based on the clicked button.
 * 
 * @param {HTMLElement} clickedButton - The button that was clicked to set the priority.
 * @param {string} priority - The priority level to set (e.g., 'low', 'medium', 'high').
 * @returns {currentPriority} The function updates the active button and sets the current priority.
 */
function setPriority(clickedButton, priority) {

    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }

    clickedButton.classList.add('active');
    currentPriority = priority;
}
window.setPriority = setPriority;


/** 
 * Sets the priority to 'medium' (standard value) and updates the active button.
 * 
 * @returns {void} The function updates the active button and sets the current priority to 'medium' (standard value).
 */
function setMedium() {

    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }

    const mediumBtn = document.querySelector('.priority-btn[data-priority="medium"]');
    mediumBtn.classList.add('active');

    currentPriority = 'medium';
}
window.setMedium = setMedium;


/** 
 * Toggles the category dropdown menu, displaying or hiding the options.
 * Clears the selected category and updates the dropdown icon if the wrapper is open.
 * This function is called when the user clicks on the category dropdown.
 * 
 * @param {string} id - The ID of the dropdown to toggle ('category' or 'assignedTo').
 * @returns {void} The function toggles the dropdown menu and updates the icon.
 */
function toggleCategoryDropdown(id) {

    const wrapper = document.getElementById("category-options-wrapper");
    const container = document.getElementById("category-options-container");
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
window.toggleCategoryDropdown = toggleCategoryDropdown;


/**
 * Generates the HTML for the category options dropdown.
 * 
 * @returns {string} The HTML string containing the category options.
 */
function getCategoryOptions() {
    return `
            <div class="option" id="category-options-one" onclick="setCategory(this)">Technical Task</div>
            <div class="option" id="category-options-two" onclick="setCategory(this)">User Story</div>
            `
}
window.getCategoryOptions = getCategoryOptions;


/**
 * Toggles the dropdown icon based on the ID provided.
 * 
 * @param {string} id - The ID of the dropdown to toggle ('category' or 'assignedTo').
 * @returns {void} The function toggles the icon and the active class on the dropdown container.
 */
function toggleDropdownIcon(id) {

    const dropdownIconOne = document.getElementById("dropdown-icon-one");
    const dropdownIconContainerOne = document.getElementById("dropdown-icon-container-one");
    const dropdownIconTwo = document.getElementById("dropdown-icon-two");
    const dropdownIconContainerTwo = document.getElementById("dropdown-icon-container-two");

    if (id === "category") {
        dropdownIconTwo.classList.toggle("open");
        dropdownIconContainerTwo.classList.toggle('active');
    } else if (id === "assignedTo") {
        dropdownIconOne.classList.toggle("open");
        dropdownIconContainerOne.classList.toggle('active');
    }

}
window.toggleDropdownIcon = toggleDropdownIcon;


/**
 * Sets the selected category based on the clicked option.
 * Updates the selected category text, the hidden input value, and closes the dropdown.
 * 
 * @param {HTMLElement} option - The clicked option element containing the category text.
 * @returns {void} The function updates the selected category and closes the dropdown.
 */
function setCategory(option) {
    const wrapper = document.getElementById("category-options-wrapper");
    const selected = document.getElementById("selected-category");
    const optionsContainer = document.getElementById("category-options-container");
    const hiddenInput = document.getElementById("hidden-category-input");

    selected.textContent = option.textContent;
    hiddenInput.value = option.textContent;

    document.getElementById("dropdown-category").classList.remove("invalid");

    wrapper.classList.remove("open");
    optionsContainer.innerHTML = '';

    toggleDropdownIcon();

    selectedCategory = option.id === "category-options-one" ? "Technical Task" : "User Story";
}
window.setCategory = setCategory;


/**
 * Clears the selected category by resetting the selectedCategory variable
 * and updating the displayed text in the selected category element.
 * 
 * @returns {void} The function resets the selected category and updates the UI.
 */
function clearCategory() {

    selectedCategory = null;

    const selected = document.getElementById("selected-category");
    selected.textContent = "Select task category";
}
window.clearCategory = clearCategory;


/**
 * Clears the form by resetting the medium priority, clearing the selected category,
 * and clearing the subtask input field.
 * 
 * @returns {void} The function resets the form fields to their default state.
 */
function clearForm() {
    setMedium();
    clearCategory();
    clearSubtask()
}
window.clearForm = clearForm;


/**
 * Toggles the assigned to dropdown menu, displaying or hiding the options.
 * Updates the dropdown icon if the wrapper is open.
 * 
 * @param {string} id - The ID of the dropdown to toggle ('assignedTo').
 * @returns {void} The function toggles the dropdown menu and updates the icon.
 */
function toggleAssignedToDropdown(id) {

    const wrapper = document.getElementById("assigned-to-options-wrapper");
    const container = document.getElementById("assigned-to-options-container");
    const isOpen = wrapper.classList.contains("open-assigned-to");
    const spacer = document.querySelector('.spacer');

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
window.toggleAssignedToDropdown = toggleAssignedToDropdown;


/**
 * Generates the HTML for the assigned to options dropdown.
 * 
 * @returns {void} The function populates the assigned to options container with contact options.
 */
function getAssignedToOptions() {
    let contact = document.getElementById('assigned-to-options-container');
    contact.innerHTML = '';

    for (let i = 0; i < currentContacts.length; i++) {
        const name = currentContacts[i].name;
        const initials = currentContacts[i].initials;
        const avatarColor = currentContacts[i].avatarColor;

        const isSelected = selectedContacts.some(
            selected => selected.name === name &&
                selected.initials === initials &&
                selected.avatarColor === avatarColor
        );

        contact.innerHTML += renderAssignedToContacts(i, name, initials, avatarColor, isSelected);
    }
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
function renderAssignedToContacts(i, name, initials, avatarColor) {
    const isSelected = isContactSelected(name, initials, avatarColor);

    return `
        <div class="contact-option ${isSelected ? 'assigned' : ''}" 
             id="assigned-to-option-${i}" 
             onclick="toggleSelectContacts(this, '${name}', '${initials}', '${avatarColor}')">
            <div class="d-flex align-items gap-8">
                <div class="initials-container" style="background-color: var(${avatarColor});">${initials}</div>
                <div>${name}</div>
            </div>
            <img src="../assets/icons/btn/${isSelected ? 'checkbox-filled-white' : 'checkbox-empty-black'}.svg" 
                 alt="checkbox ${isSelected ? 'filled' : 'empty'}"
                 class="checkbox-icon ${isSelected ? 'checked' : ''}"
                 onclick="toggleCheckboxOnly(event, '${name}', '${initials}', '${avatarColor}')">
        </div>
    `;
}


/**
 * Checks if a contact is already selected based on its name, initials, and avatar color.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color of the contact's avatar.
 * @return {boolean} Returns true if the contact is selected, false otherwise.
 */
function isContactSelected(name, initials, avatarColor) {
    return selectedContacts.some(
        contact => contact.name === name &&
            contact.initials === initials &&
            contact.avatarColor === avatarColor
    );
}


/**
 * Toggles the checkbox state of a contact option when clicked.
 * Updates the contact option's appearance and the selected contacts array.
 * 
 * @param {Event} event - The click event triggered by the checkbox.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color of the contact's avatar.
 * @return {void} The function updates the checkbox icon and the selected contacts array.
 */
function toggleCheckboxOnly(event, name, initials, avatarColor) {
    event.stopPropagation();

    const contactOption = event.currentTarget.closest('.contact-option');
    const imgElement = contactOption.querySelector('img');
    const isSelected = imgElement.classList.contains('checked');

    if (isSelected) {
        imgElement.src = '../assets/icons/btn/checkbox-empty-black.svg';
        imgElement.alt = 'checkbox empty';
        imgElement.classList.remove('checked');

        contactOption.classList.remove('assigned');

        selectedContacts = selectedContacts.filter(
            c => !(c.name === name && c.initials === initials && c.avatarColor === avatarColor)
        );
    } else {
        imgElement.src = '../assets/icons/btn/checkbox-filled-white.svg';
        imgElement.alt = 'checkbox filled';
        imgElement.classList.add('checked');
        imgElement.classList.add('fitered');

        if (!isContactSelected(name, initials, avatarColor)) {
            selectedContacts.push({ name, initials, avatarColor });
        }
    }

    renderSelectedInitials();
}
window.toggleCheckboxOnly = toggleCheckboxOnly;


/**
 * Toggles the selection state of a contact option when clicked.
 * Updates the contact option's appearance and the selected contacts array.
 * 
 * @param {HTMLElement} clickedButton - The contact option that was clicked.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color of the contact's avatar.
 * @return {void} The function updates the contact option's appearance and the selected contacts array.
 */
function toggleSelectContacts(clickedButton, name, initials, avatarColor) {
    const imgElement = clickedButton.querySelector('img');
    const isSelected = clickedButton.classList.contains('assigned');
    const isBlack = imgElement.classList.contains('fitered');
    const contactKey = { name, initials, avatarColor };

    clickedButton.classList.toggle('assigned');
    if (!isSelected) {
        imgElement.classList.add('checked');
    } else {
        imgElement.classList.remove('checked');
    }
    if (isBlack) {
        imgElement.classList.remove('fitered');
    }
    if (isSelected) {
        selectedContacts = selectedContacts.filter(
            c => !(c.name === name && c.initials === initials && c.avatarColor === avatarColor)
        );
    } else if (!isContactSelected(name, initials, avatarColor)) {
        selectedContacts.push(contactKey);
    }

    renderSelectedInitials();
}
window.toggleSelectContacts = toggleSelectContacts;


/**
 * Renders the selected initials in the selected contacts container.
 * If no contacts are selected, it clears the container and removes the add-on class.
 * 
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The color of the contact's avatar.
 * @return {void} The function updates the selected contacts container with the initials of selected contacts.
 */
function renderSelectedInitials(name, initials, avatarColor) {
    const selectedContactsContainer = document.getElementById('selected-contacts-container');
    selectedContactsContainer.innerHTML = '';

    if (selectedContacts.length === 0) {
        selectedContactsContainer.innerHTML = '';
        selectedContactsContainer.classList.remove('add-on');
        return;
    } else {
        selectedContactsContainer.classList.add('add-on');
    }

    for (let i = selectedContacts.length - 1; i >= 0; i--) {
        selectedContactsContainer.innerHTML += `
        <div id="assigned-initials-container" class="initials-container" style="background-color: var(${selectedContacts[i].avatarColor});">
            ${selectedContacts[i].initials}
        </div>
    `;
    }

}
window.renderSelectedInitials = renderSelectedInitials;


/**
 * Filters the contacts in the assigned to dropdown based on the input value.
 * If the dropdown is not open, it opens it.
 * Updates the display of each contact option based on the filter.
 * 
 * @returns {void} The function filters the contacts and updates the UI accordingly.
 */
function filterContacts() {
    const input = document.getElementById('select-contacts');
    const filter = input.value.toLowerCase();
    const optionsContainer = document.getElementById('assigned-to-options-container');
    const options = optionsContainer.querySelectorAll('.contact-option');
    const dropdowncontainer = document.getElementById('dropdown-icon-container-one');
    const container = document.getElementById('assigned-to-options-wrapper');
    const spacer = document.querySelector('.spacer');

    let hasVisibleOptions = false;

    if (dropdowncontainer && container) {
        if (!dropdowncontainer.classList.contains('active') && !container.classList.contains('open-assigned-to')) {
            toggleAssignedToDropdown('assignedTo');
        }
    }

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const name = option.textContent.toLowerCase();
        const isVisible = name.includes(filter);
        option.style.display = isVisible ? '' : 'none';

        if (isVisible) hasVisibleOptions = true;
    }

    if (spacer) {
        if (!hasVisibleOptions && filter.length > 0) {
            spacer.classList.remove('bg-color-white');
            spacer.style.backgroundColor = 'var(--lightGrey)';
        } else {
            if (container.classList.contains('open-assigned-to')) {
                spacer.classList.add('bg-color-white');
            } else {
                spacer.classList.remove('bg-color-white');
            }
            spacer.style.backgroundColor = '';
        }
    }
}
window.filterContacts = filterContacts;


/**
 * Selects a category from the dropdown and updates the UI.
 * Sets the selected category text, updates the hidden input value,
 * and removes the invalid class from the dropdown.
 * 
 * @param {string} value - The value of the selected category.
 * @param {string} text - The text of the selected category.
 * @returns {void} The function updates the selected category and closes the dropdown.
 */
function selectCategory(value, text) {
    document.getElementById('selected-category').textContent = text;
    document.getElementById('hidden-category-input').value = value;
    document.getElementById('dropdown-category').classList.remove('invalid');
}
window.selectCategory = selectCategory;


/**
 * Checks if all required fields are filled out before submitting the form.
 * Validates the title, category, and date fields.
 * 
 * @returns {boolean} Returns true if all required fields are valid, false otherwise.
 */
function checkRequiredFields() {
    const isTitleValid = checkRequiredTitle();
    const isCategoryValid = checkRequiredCategory();
    const isDateValid = checkRequiredDate();

    return isTitleValid && isCategoryValid && isDateValid;
}

window.checkRequiredFields = checkRequiredFields;


/**
 * Checks if the title input is filled out.
 * 
 * @returns {boolean} Returns true if the title is valid, false otherwise.
 */
function checkRequiredTitle() {
    const input = document.getElementById('title');
    const isValid = input.value.trim() !== "";
    toggleInvalidClass(input, isValid);
    return isValid;
}

window.checkRequiredTitle = checkRequiredTitle;


/**
 * Checks if the date input is filled out.
 * 
 * @returns {boolean} Returns true if the date is valid, false otherwise.
 */
function checkRequiredDate() {
    const dateInput = document.getElementById('datepicker');
    const isValid = dateInput.value.trim() !== "";
    toggleInvalidClass(dateInput, isValid);
    return isValid;
}
window.checkRequiredDate = checkRequiredDate;


/**
 * Checks if the category input is filled out.
 * 
 * @returns {boolean} Returns true if the category is valid, false otherwise.
 */
function checkRequiredCategory() {
    const hiddenInput = document.getElementById('hidden-category-input');
    const dropdownCategory = document.getElementById('dropdown-category');
    const isValid = hiddenInput.value.trim() !== "";
    toggleInvalidClass(dropdownCategory, isValid);
    return isValid;
}
window.checkRequiredCategory = checkRequiredCategory;


/**
 * Toggles the 'invalid' class on an input
 * element based on its validity.
 * 
 * @param {HTMLInputElement} input - The input element to toggle the class on.
 * @param {boolean} isValid - Whether the input is valid or not.
 * @returns {void} The function modifies the class list of the input element.
 */
function toggleInvalidClass(input, isValid) {
    if (!input) return;

    if (!isValid) {
        input.classList.add('invalid');
    } else {
        input.classList.remove('invalid');
    }
}
window.toggleInvalidClass = toggleInvalidClass;


/**
 * Handles input validation for a given input element.
 * Checks if the input value is not empty and toggles the 'invalid' class accordingly.
 * 
 * @param {HTMLInputElement} input - The input element to validate.
 * @returns {void} The function modifies the class list of the input element.
 */
function handleInput(input) {
    const isValid = input.value.trim() !== '';
    toggleInvalidClass(input, isValid);
}
window.handleInput = handleInput;


/**
 * Toggles the visibility of subtask icons based on the input field value.
 * If the input field is empty, it shows the add button and hides the close and check buttons.
 * If the input field has a value, it hides the add button and shows the close and check buttons.
 * 
 * @param {void}
 * @returns {void} The function modifies the display style of the subtask buttons.
 */
function toggleSubtaskIcons() {
    const buttonArea = document.getElementById('subtask-buttons');
    const inputField = document.getElementById('input-subtask');

    const addBtn = buttonArea.querySelector('.add-btn');
    const closeBtn = buttonArea.querySelector('.close-btn');
    const checkBtn = buttonArea.querySelector('.check-btn');
    const middleDiv = buttonArea.querySelector('.middle');

    if (inputField.value.trim() === "") {
        addBtn.style.display = 'block';
        closeBtn.style.display = 'none';
        middleDiv.style.display = 'none';
        checkBtn.style.display = 'none';
    } else {
        addBtn.style.display = 'none';
        closeBtn.style.display = 'block';
        middleDiv.style.display = 'block';
        checkBtn.style.display = 'block';
    }
}
window.toggleSubtaskIcons = toggleSubtaskIcons;


/**
 * Clears the subtask input field and hides the subtask icons.
 * 
 * @returns {void} The function resets the subtask input field and toggles the subtask icons.
 */
function clearSubtask() {
    const inputField = document.getElementById('input-subtask');
    inputField.value = '';
    toggleSubtaskIcons();
}
window.clearSubtask = clearSubtask;


/**
 * Adds a subtask to the list of added subtasks.
 * Checks if the input field is not empty before adding the subtask.
 * 
 * @returns {void} The function adds the subtask to the list and updates the UI.
 */
function addSubtask() {
    const inputField = document.getElementById('input-subtask');
    const subtaskText = inputField.value.trim();

    if (subtaskText === "") {
        return;
    }

    addedSubtasks.push(subtaskText);
    inputField.value = '';
    toggleSubtaskIcons();

    renderSubtasks();
}
window.addSubtask = addSubtask;


/**
 * Renders the list of added subtasks in the UI.
 * 
 * @param {number} index - The index of the subtask to render, edit or delete.
 * @returns {void} The function updates the subtask list in the UI with the current subtasks.
 */
function renderSubtasks() {
    const subtaskList = document.getElementById('addedSubtasksArea');
    subtaskList.innerHTML = '';

    for (let i = 0; i < addedSubtasks.length; i++) {
        subtaskList.innerHTML += `
        <div class="subtask-list padding-left-21">        
            <ul>
                <li class="subtask-item">
                    <div class="subtask-text">${addedSubtasks[i]}</div>
                </li>
            </ul>
            <svg onclick="editSubtask(${i})" class="left" width="18" height="18" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.14453 17H3.54453L12.1695 8.375L10.7695 6.975L2.14453 15.6V17ZM16.4445 6.925L12.1945 2.725L13.5945 1.325C13.9779 0.941667 14.4487 0.75 15.007 0.75C15.5654 0.75 16.0362 0.941667 16.4195 1.325L17.8195 2.725C18.2029 3.10833 18.4029 3.57083 18.4195 4.1125C18.4362 4.65417 18.2529 5.11667 17.8695 5.5L16.4445 6.925ZM14.9945 8.4L4.39453 19H0.144531V14.75L10.7445 4.15L14.9945 8.4Z" 
                fill="currentColor"/>
            </svg>
            <div class="middle"></div>
            <svg onclick="deleteSubtask(${i})" class"right" width="16" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.14453 18C2.59453 18 2.1237 17.8042 1.73203 17.4125C1.34036 17.0208 1.14453 16.55 1.14453 16V3C0.861198 3 0.623698 2.90417 0.432031 2.7125C0.240365 2.52083 0.144531 2.28333 0.144531 2C0.144531 1.71667 0.240365 1.47917 0.432031 1.2875C0.623698 1.09583 0.861198 1 1.14453 1H5.14453C5.14453 0.716667 5.24036 0.479167 5.43203 0.2875C5.6237 0.0958333 5.8612 0 6.14453 0H10.1445C10.4279 0 10.6654 0.0958333 10.857 0.2875C11.0487 0.479167 11.1445 0.716667 11.1445 1H15.1445C15.4279 1 15.6654 1.09583 15.857 1.2875C16.0487 1.47917 16.1445 1.71667 16.1445 2C16.1445 2.28333 16.0487 2.52083 15.857 2.7125C15.6654 2.90417 15.4279 3 15.1445 3V16C15.1445 16.55 14.9487 17.0208 14.557 17.4125C14.1654 17.8042 13.6945 18 13.1445 18H3.14453ZM3.14453 3V16H13.1445V3H3.14453ZM5.14453 13C5.14453 13.2833 5.24036 13.5208 5.43203 13.7125C5.6237 13.9042 5.8612 14 6.14453 14C6.42786 14 6.66536 13.9042 6.85703 13.7125C7.0487 13.5208 7.14453 13.2833 7.14453 13V6C7.14453 5.71667 7.0487 5.47917 6.85703 5.2875C6.66536 5.09583 6.42786 5 6.14453 5C5.8612 5 5.6237 5.09583 5.43203 5.2875C5.24036 5.47917 5.14453 5.71667 5.14453 6V13ZM9.14453 13C9.14453 13.2833 9.24037 13.5208 9.43203 13.7125C9.6237 13.9042 9.8612 14 10.1445 14C10.4279 14 10.6654 13.9042 10.857 13.7125C11.0487 13.5208 11.1445 13.2833 11.1445 13V6C11.1445 5.71667 11.0487 5.47917 10.857 5.2875C10.6654 5.09583 10.4279 5 10.1445 5C9.8612 5 9.6237 5.09583 9.43203 5.2875C9.24037 5.47917 9.14453 5.71667 9.14453 6V13Z" 
                fill="currentColor"/>
            </svg>
        </div>

        `;
    }
}


/**
 * Enters edit mode for a specific subtask, replacing its display with an editable input field.
 * Handles all edit-related interactions including saving, deleting, and keyboard navigation.
 * 
 * @param {number} index - The position of the subtask in the addedSubtasks array
 * @returns {void} The function modifies the subtask container to allow editing.
 */
function editSubtask(index) {
    const container = document.querySelectorAll('.subtask-list')[index];
    const currentValue = addedSubtasks[index];
    container.classList.remove('padding-left-21');

    container.innerHTML = `
        <div class="subtask-edit-container">
            <input type="text" 
                   class="edit-input" 
                   value="${currentValue}"
                   id="edit-input-${index}">
            ${createNewIcons(index)}
        </div>
    `;

    const input = container.querySelector(`#edit-input-${index}`);
    const deleteBtn = container.querySelector('.subtask-icons-container svg.left');
    const saveBtn = container.querySelector('.subtask-icons-container svg.right');

    let isDeleting = false;

    deleteBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDeleting = true;
        immediatelyDeleteSubtask(index);
    });

    saveBtn.addEventListener('click', () => {
        saveSubtaskEdit(index, input.value);
    });

    input.addEventListener('blur', (e) => {
        setTimeout(() => {
            if (!isDeleting) {
                saveSubtaskEdit(index, input.value);
            }
            isDeleting = false;
        }, 10);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveSubtaskEdit(index, input.value);
        }
        if (e.key === 'Escape') {
            renderSubtasks();
        }
    });

    input.focus();
    input.setSelectionRange(currentValue.length, currentValue.length);
}
window.editSubtask = editSubtask;


/**
 * Renders the icons for saving and deleting a subtask.
 * 
 * @param {number} index - The index of the subtask to render.
 * @returns {void} The function returns a string containing the HTML for the icons.
 */
function createNewIcons(index) {
    return `
    <div class="subtask-icons-container">
        <svg class="left" width="16" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.14453 18C2.59453 18 2.1237 17.8042 1.73203 17.4125C1.34036 17.0208 1.14453 16.55 1.14453 16V3C0.861198 3 0.623698 2.90417 0.432031 2.7125C0.240365 2.52083 0.144531 2.28333 0.144531 2C0.144531 1.71667 0.240365 1.47917 0.432031 1.2875C0.623698 1.09583 0.861198 1 1.14453 1H5.14453C5.14453 0.716667 5.24036 0.479167 5.43203 0.2875C5.6237 0.0958333 5.8612 0 6.14453 0H10.1445C10.4279 0 10.6654 0.0958333 10.857 0.2875C11.0487 0.479167 11.1445 0.716667 11.1445 1H15.1445C15.4279 1 15.6654 1.09583 15.857 1.2875C16.0487 1.47917 16.1445 1.71667 16.1445 2C16.1445 2.28333 16.0487 2.52083 15.857 2.7125C15.6654 2.90417 15.4279 3 15.1445 3V16C15.1445 16.55 14.9487 17.0208 14.557 17.4125C14.1654 17.8042 13.6945 18 13.1445 18H3.14453ZM3.14453 3V16H13.1445V3H3.14453ZM5.14453 13C5.14453 13.2833 5.24036 13.5208 5.43203 13.7125C5.6237 13.9042 5.8612 14 6.14453 14C6.42786 14 6.66536 13.9042 6.85703 13.7125C7.0487 13.5208 7.14453 13.2833 7.14453 13V6C7.14453 5.71667 7.0487 5.47917 6.85703 5.2875C6.66536 5.09583 6.42786 5 6.14453 5C5.8612 5 5.6237 5.09583 5.43203 5.2875C5.24036 5.47917 5.14453 5.71667 5.14453 6V13ZM9.14453 13C9.14453 13.2833 9.24037 13.5208 9.43203 13.7125C9.6237 13.9042 9.8612 14 10.1445 14C10.4279 14 10.6654 13.9042 10.857 13.7125C11.0487 13.5208 11.1445 13.2833 11.1445 13V6C11.1445 5.71667 11.0487 5.47917 10.857 5.2875C10.6654 5.09583 10.4279 5 10.1445 5C9.8612 5 9.6237 5.09583 9.43203 5.2875C9.24037 5.47917 9.14453 5.71667 9.14453 6V13Z" 
            fill="var(--black)"/>
        </svg>
        <div class="middle"></div>
        <svg class="right" width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.69474 9.15L14.1697 0.675C14.3697 0.475 14.6072 0.375 14.8822 0.375C15.1572 0.375 15.3947 0.475 15.5947 0.675C15.7947 0.875 15.8947 1.1125 15.8947 1.3875C15.8947 1.6625 15.7947 1.9 15.5947 2.1L6.39474 11.3C6.19474 11.5 5.96141 11.6 5.69474 11.6C5.42807 11.6 5.19474 11.5 4.99474 11.3L0.694738 7C0.494738 6.8 0.398905 6.5625 0.407238 6.2875C0.415572 6.0125 0.519738 5.775 0.719738 5.575C0.919738 5.375 1.15724 5.275 1.43224 5.275C1.70724 5.275 1.94474 5.375 2.14474 5.575L5.69474 9.15Z" 
            fill="var(--black)"/>
        </svg>
    </div>
    `;
}
window.createNewIcons = createNewIcons;


/** 
 * Immediately deletes a subtask from the list of added subtasks.
 * 
 * @param {number} index - The index of the subtask to delete.
 * @returns {void} The function removes the subtask from the list and updates the UI.
 */
function immediatelyDeleteSubtask(index) {
    if (index >= 0 && index < addedSubtasks.length) {
        addedSubtasks.splice(index, 1);
        renderSubtasks();
    }
}
window.immediatelyDeleteSubtask = immediatelyDeleteSubtask;


/**
 * Saves the edited subtask text and updates the list of added subtasks.
 * 
 * @param {number} index - The index of the subtask to save.
 * @param {string} newText - The new text for the subtask.
 * @returns {void} The function updates the subtask in the list and re-renders the subtasks.
 */
function saveSubtaskEdit(index, newText) {
    const trimmedText = newText.trim();
    if (trimmedText === '') {
        console.log("Empty input - skipping save");
        return;
    }
    addedSubtasks[index] = trimmedText;
    renderSubtasks();
}
window.saveSubtaskEdit = saveSubtaskEdit;


/**
 * Deletes a subtask from the list of added subtasks.
 * 
 * @param {number} index - The index of the subtask to delete.
 * @returns {void} The function removes the subtask from the list and updates the UI.
 */
function deleteSubtask(index) {

    if (index < 0 || index >= addedSubtasks.length) return;

    const editContainer = document.querySelector('.subtask-edit-container');
    if (editContainer) {

        const originalContainer = document.querySelector('.subtask-list');
        if (originalContainer) {
            editContainer.replaceWith(originalContainer);
        }
    }

    addedSubtasks.splice(index, 1);

    renderSubtasks();
}
window.deleteSubtask = deleteSubtask;


/**
 * Collects form data from the input fields and returns it as an object.
 * The function retrieves values from the title, description, due date, priority,
 * assigned contacts, category, and subtasks fields.
 * 
 * @returns {Object} An object containing the collected form data.
 */
function collectFormData() {
    return {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('task-description').value.trim(),
        dueDate: document.getElementById('datepicker').value.trim(),
        priority: currentPriority,
        assignedTo: JSON.stringify(selectedContacts),
        category: selectedCategory,
        subtasks: JSON.stringify(addedSubtasks)
    };
}


/**
 * Submits the form data after validating required fields.
 * If any required fields are missing, it prevents submission.
 * Logs the collected form data to the console.
 * 
 * This function does not actually submit the data to a server,
 * 
 * @returns {void} The function collects form data and logs it, but does not submit it to a server.
 */
function submitForm() {
    if (!checkRequiredFields()) {
        return;
    }

    const taskData = collectFormData();

    console.log('Form data collected:', taskData);
    // saveToDatabase(taskData); // Funktion muss noch erstellt werden
}
window.submitForm = submitForm;


/**
 * Handles the click event on the document to close dropdowns when clicking outside.
 * It checks if the click is outside the assigned to and category dropdowns,
 * and closes them if so.
 * 
 * @param {Event} event - The click event triggered by the user.
 * @returns {void} The function closes the dropdowns if the click is outside of them.
 */
document.addEventListener('click', function (event) {

    const contactsDropdown = document.querySelector('#dropdown-assigned-to').closest('.select-wrapper');
    const contactsOptions = document.getElementById('assigned-to-options-wrapper');
    const categoryDropdown = document.querySelector('#dropdown-category').closest('.select-wrapper');
    const categoryOptions = document.getElementById('category-options-wrapper');
    const dropdownIconContainerOne = document.getElementById("dropdown-icon-container-one");
    const dropdownIconContainerTwo = document.getElementById("dropdown-icon-container-two");
    const spacer = document.querySelector('.spacer');

    const clickedOutsideContacts = !contactsDropdown.contains(event.target) && !contactsOptions.contains(event.target);
    const clickedOutsideCategory = !categoryDropdown.contains(event.target) && !categoryOptions.contains(event.target);

    if (clickedOutsideContacts) {
        contactsOptions.classList.remove('open-assigned-to');
        document.getElementById('dropdown-icon-one').classList.remove('open');
        spacer.classList.remove('bg-color-white');
        dropdownIconContainerOne.classList.remove('active');
    }

    if (clickedOutsideCategory) {
        categoryOptions.classList.remove('open');
        document.getElementById('dropdown-icon-two').classList.remove('open');
        dropdownIconContainerTwo.classList.remove('active');
    }
});