const picker = flatpickr("#datepicker", {
    dateFormat: "d.m.Y",
    allowInput: true
});

let isResizing = false;

let startY, startHeight, currentTextarea;

let currentPriority = 'medium';

let selectedCategoy = null;


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


function openPicker() {
    picker.open();
}


function startResize(e) {
    isResizing = true;
    currentTextarea = e.target.closest('.textarea-wrapper').querySelector('textarea');
    startY = e.clientY;
    startHeight = currentTextarea.offsetHeight;

    document.onmousemove = resizeTextarea;
    document.onmouseup = stopResize;

    e.preventDefault();
}


function resizeTextarea(e) {
    if (!isResizing) return;

    const newHeight = (startHeight + e.clientY - startY) + 'px';
    currentTextarea.style.height = newHeight;
}


function stopResize() {
    isResizing = false;
    document.onmousemove = null;
    document.onmouseup = null;
}


function setPriority(clickedButton, priority) {

    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }

    clickedButton.classList.add('active');
    currentPriority = priority;
}

function setMedium() {

    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }

    const mediumBtn = document.querySelector('.priority-btn[data-priority="medium"]');
    mediumBtn.classList.add('active');

    currentPriority = 'medium';
}


function toggleCategoryDropdown(id) {

    const wrapper = document.querySelector('.options-wrapper-category');
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


function getCategoryOptions() {
    return `
            <div class="option" id="category-options-one" onclick="setCategory(this)">Technical Task</div>
            <div class="option" id="category-options-two" onclick="setCategory(this)">User Story</div>
            `
}


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


function setCategory(option) {

    const wrapper = document.querySelector('.options-wrapper-category');
    const selected = document.getElementById("selected-category");
    selected.textContent = option.textContent;

    const optionsContainer = document.getElementById("category-options-container");
    optionsContainer.classList.remove("open");
    wrapper.classList.remove("open");
    optionsContainer.innerHTML = '';

    toggleDropdownIcon();

    selectedCategoy = option.id === "category-options-one" ? "Technical Task" : "User Story";
}


function clearCategory() {

    selectedCategoy = null;

    const selected = document.getElementById("selected-category");
    selected.textContent = "Select task category";
}


function clearForm() {
    setMedium();
    clearCategory();
}


function toggleAssignedToDropdown(id) {

    const wrapper = document.querySelector('.options-wrapper-contacts');
    const container = document.getElementById("assigned-to-options-container");
    const isOpen = wrapper.classList.contains("open");

    toggleDropdownIcon(id);

    if (!isOpen) {
        container.innerHTML = getAssignedToOptions();
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


function getAssignedToOptions() {
    return `
            <div class="option" id="category-options-one" onclick="setCategory(this)">Technical Task</div>
            <div class="option" id="category-options-two" onclick="setCategory(this)">User Story</div>
            `
}


document.addEventListener('click', function(event) {
  
  const contactsDropdown = document.querySelector('#dropdown-assigned-to').closest('.select-wrapper');
  const contactsOptions = document.querySelector('.options-wrapper-contacts');
  const categoryDropdown = document.querySelector('#dropdown-category').closest('.select-wrapper');
  const categoryOptions = document.querySelector('.options-wrapper-category');

  const clickedOutsideContacts = !contactsDropdown.contains(event.target) && !contactsOptions.contains(event.target);
  const clickedOutsideCategory = !categoryDropdown.contains(event.target) && !categoryOptions.contains(event.target);

  if (clickedOutsideContacts) {
    contactsOptions.classList.remove('open');
    document.getElementById('dropdown-icon-one').classList.remove('open');
  }

  if (clickedOutsideCategory) {
    categoryOptions.classList.remove('open');
    document.getElementById('dropdown-icon-two').classList.remove('open');
  }
});