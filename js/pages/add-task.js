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



function clearCategory() {

    selectedCategory = null;

    const selected = document.getElementById("selected-category");
    selected.textContent = "Select task category";
}
window.clearCategory = clearCategory;


function clearForm() {
    setMedium();
    clearCategory();
    clearSubtask()
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


function selectCategory(value, text) {
    document.getElementById('selected-category').textContent = text;
    document.getElementById('hidden-category-input').value = value;
    document.getElementById('dropdown-category').classList.remove('invalid');
}
window.selectCategory = selectCategory;


function checkRequiredFields() {
    const hiddenInput = document.getElementById('hidden-category-input');
    const dropdownCategory = document.getElementById('dropdown-category');

    if (!hiddenInput.value) {
        dropdownCategory.classList.add('invalid');
        return false;
    } else {
        dropdownCategory.classList.remove('invalid');
    }

    return true;
}
window.checkRequiredFields = checkRequiredFields;


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


function clearSubtask() {
    const inputField = document.getElementById('input-subtask');
    inputField.value = '';
    toggleSubtaskIcons();
}
window.clearSubtask = clearSubtask;


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


function renderSubtasks() {
    const subtaskList = document.getElementById('addedSubtasksArea');
    subtaskList.innerHTML = '';

    for (let i = 0; i < addedSubtasks.length; i++) {
        subtaskList.innerHTML += `
        <div class="subtask-list">        
            <ul>
                <li class="subtask-item">
                    <div class="subtask-text">${addedSubtasks[i]}</div>
                </li>
            </ul>
            <svg class="left" width="18" height="18" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
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


function deleteSubtask(index) {
    if (index >= 0 && index < addedSubtasks.length) {
        addedSubtasks.splice(index, 1);
        renderSubtasks();
    }
}
window.deleteSubtask = deleteSubtask;


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