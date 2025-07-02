const picker = flatpickr("#datepicker", {
    dateFormat: "d.m.Y",
    allowInput: true
});

let isResizing = false;

let startY, startHeight, currentTextarea;

let currentPriority = 'medium';

let selectedCategoy = null;

let currentContacts = [];

let selectedContacts = [];

import { getFirebaseData } from '../../js/data/API.js';


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


function openPicker() {
    picker.open();
}
window.openPicker = openPicker


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


function resizeTextarea(e) {
    if (!isResizing) return;

    const newHeight = (startHeight + e.clientY - startY) + 'px';
    currentTextarea.style.height = newHeight;
}
window.resizeTextarea = resizeTextarea;


function stopResize() {
    isResizing = false;
    document.onmousemove = null;
    document.onmouseup = null;
}
window.stopResize = stopResize;


function setPriority(clickedButton, priority) {

    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }

    clickedButton.classList.add('active');
    currentPriority = priority;
}
window.setPriority = setPriority;


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


function getCategoryOptions() {
    return `
            <div class="option" id="category-options-one" onclick="setCategory(this)">Technical Task</div>
            <div class="option" id="category-options-two" onclick="setCategory(this)">User Story</div>
            `
}
window.getCategoryOptions = getCategoryOptions;


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


function setCategory(option) {

    const wrapper = document.getElementById("category-options-wrapper");
    const selected = document.getElementById("selected-category");
    selected.textContent = option.textContent;

    const optionsContainer = document.getElementById("category-options-container");
    optionsContainer.classList.remove("open");
    wrapper.classList.remove("open");
    optionsContainer.innerHTML = '';

    toggleDropdownIcon();

    selectedCategoy = option.id === "category-options-one" ? "Technical Task" : "User Story";
}
window.setCategory = setCategory;


function clearCategory() {

    selectedCategoy = null;

    const selected = document.getElementById("selected-category");
    selected.textContent = "Select task category";
}
window.clearCategory = clearCategory;


function clearForm() {
    setMedium();
    clearCategory();
}
window.clearForm = clearForm;


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


function isContactSelected(name, initials, avatarColor) {
    return selectedContacts.some(
        contact => contact.name === name &&
            contact.initials === initials &&
            contact.avatarColor === avatarColor
    );
}


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


function toggleSelectContacts(clickedButton, name, initials, avatarColor) {
    const imgElement = clickedButton.querySelector('img');
    const isSelected = clickedButton.classList.contains('assigned');
    const isBlack = imgElement.classList.contains('fitered');

    clickedButton.classList.toggle('assigned');
    if (!isSelected) {
        imgElement.classList.add('checked');
    } else {
        imgElement.classList.remove('checked');
    }
    if (isBlack) {
        imgElement.classList.remove('fitered');
    }

    const contactKey = { name, initials, avatarColor };
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

    for (let i = 0; i < selectedContacts.length; i++) {
        selectedContactsContainer.innerHTML += `
            <div id="assigned-initials-container" class="initials-container" style="background-color: var(${selectedContacts[i].avatarColor});">${selectedContacts[i].initials}</div>
        `
    }
}
window.renderSelectedInitials = renderSelectedInitials;


function filterContacts() {
    const input = document.getElementById('select-contacts');
    const filter = input.value.toLowerCase();
    const optionsContainer = document.getElementById('assigned-to-options-container');
    const options = optionsContainer.querySelectorAll('.contact-option');
    const dropdowncontainer = document.getElementById('dropdown-icon-container-one');
    const container = document.getElementById('assigned-to-options-wrapper');

    if (dropdowncontainer && container) {
        if (!dropdowncontainer.classList.contains('active') && !container.classList.contains('open-assigned-to')) {
            toggleAssignedToDropdown('assignedTo')
        }
    }

    for (let i = 0; i < options.length; i++) {
        const option = options[i];
        const name = option.textContent.toLowerCase();
        option.style.display = name.includes(filter) ? '' : 'none';
    }
}



function setupContactFilter() {
    const input = document.getElementById('select-contacts');
    input.addEventListener('input', () => {
        setTimeout(filterContacts, 0);
    });
}

window.filterContacts = filterContacts;
window.addEventListener('DOMContentLoaded', setupContactFilter);



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