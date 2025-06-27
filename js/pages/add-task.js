// addtask.js

let picker; // Deklariere picker hier, damit es global in diesem Skript zugänglich ist

let isResizing = false;
let startY, startHeight, currentTextarea;
let currentPriority = 'medium';
let selectedCategory = null; // Korrigiert von 'selectedCategoy' zu 'selectedCategory'

/**
 * Initialisiert alle Event-Listener und Komponenten für das Add Task Overlay.
 * Diese Funktion sollte aufgerufen werden, wenn das Add Task Overlay geöffnet wird.
 */
export function initAddTaskScript() {
    console.log('initAddTaskScript wird ausgeführt...');

    // 1. Flatpickr initialisieren
    const datepickerElement = document.getElementById("datepicker");
    if (datepickerElement) {
        picker = flatpickr(datepickerElement, {
            dateFormat: "d.m.Y",
            allowInput: true
        });
        console.log('Flatpickr initialisiert.');
    } else {
        console.warn('Element mit ID "datepicker" nicht gefunden. Flatpickr kann nicht initialisiert werden.');
    }

    // 2. Event-Listener für Resize-Handle (falls vorhanden)
    // Angenommen, du hast ein Element mit der Klasse 'resize-handle' in deiner TextArea
    const resizeHandles = document.querySelectorAll('.resize-handle');
    resizeHandles.forEach(handle => {
        if (!handle.hasAttribute('data-listener-added')) { // Verhindert doppelte Listener
            handle.addEventListener('mousedown', startResize);
            handle.setAttribute('data-listener-added', 'true');
        }
    });

    // 3. Standard-Priorität auf 'medium' setzen beim Öffnen des Overlays
    // Dies stellt sicher, dass der Medium-Button aktiv ist, wenn das Overlay geladen wird
    setMedium();

    console.log('addtask.js-Initialisierung abgeschlossen.');
}

// Deine vorhandenen Funktionen bleiben unverändert, nur die Initialisierungslogik wird in initAddTaskScript verschoben.

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

export function openPicker() {
    if (picker) { // Prüfe, ob picker initialisiert wurde
        picker.open();
    } else {
        console.warn('Flatpickr ist noch nicht initialisiert.');
    }
}

export function startResize(e) {
    isResizing = true;
    currentTextarea = e.target.closest('.textarea-wrapper').querySelector('textarea');
    startY = e.clientY;
    startHeight = currentTextarea.offsetHeight;

    document.onmousemove = resizeTextarea;
    document.onmouseup = stopResize;

    e.preventDefault();
}

export function resizeTextarea(e) {
    if (!isResizing) return;
    const newHeight = (startHeight + e.clientY - startY) + 'px';
    currentTextarea.style.height = newHeight;
}

export function stopResize() {
    isResizing = false;
    document.onmousemove = null;
    document.onmouseup = null;
}

export function setPriority(clickedButton, priority) {
    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }
    clickedButton.classList.add('active');
    currentPriority = priority;
}

export function setMedium() {
    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }
    const mediumBtn = document.querySelector('.priority-btn[data-priority="medium"]');
    if (mediumBtn) { // Sicherstellen, dass der Button existiert
        mediumBtn.classList.add('active');
    } else {
        console.warn('Medium priority button not found.');
    }
    currentPriority = 'medium';
}

export function toggleCategoryDropdown() {
    const wrapper = document.querySelector('.options-wrapper');
    const container = document.getElementById("category-options-container");
    if (!wrapper || !container) {
        console.error('Dropdown Elemente nicht gefunden.');
        return;
    }
    const isOpen = wrapper.classList.contains("open");

    clearCategory(); // Kategoriewahl zurücksetzen
    toggleDropdownIcon(); // Icon drehen

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
        <div class="option" id="category-options-one" onclick="setCategory(this)">Technical Task</div>
        <div class="option" id="category-options-two" onclick="setCategory(this)">User Story</div>
    `;
}

export function toggleDropdownIcon() {
    const dropdownIcon = document.getElementById("dropdown-icon");
    const dropdownIconContainer = document.querySelector('.dropdown-icon-container');
    if (dropdownIcon) dropdownIcon.classList.toggle("open");
    if (dropdownIconContainer) dropdownIconContainer.classList.toggle('active');
}

export function setCategory(option) {
    const wrapper = document.querySelector('.options-wrapper');
    const selected = document.getElementById("selected");
    const optionsContainer = document.getElementById("category-options-container");
    if (!wrapper || !selected || !optionsContainer) {
        console.error('Category Elemente nicht gefunden.');
        return;
    }

    selected.textContent = option.textContent;

    optionsContainer.classList.remove("open");
    wrapper.classList.remove("open");
    optionsContainer.innerHTML = '';

    toggleDropdownIcon();

    selectedCategory = option.id === "category-options-one" ? "Technical Task" : "User Story";
}

export function clearCategory() {
    selectedCategory = null;
    const selected = document.getElementById("selected");
    if (selected) {
        selected.textContent = "Select task category";
    }
}

export function clearAddTaskForm() { // Umbenannt, da 'clear' ein generischerer Name ist
    setMedium(); // Setzt Priorität auf Medium
    clearCategory(); // Setzt Kategorie zurück
    // Optional: Hier weitere Felder leeren, z.B. Titel, Beschreibung, Datum
    const titleInput = document.getElementById('taskTitle');
    if (titleInput) titleInput.value = '';
    const descriptionTextarea = document.getElementById('taskDescription');
    if (descriptionTextarea) descriptionTextarea.value = '';
    const datepickerElement = document.getElementById('datepicker');
    if (datepickerElement) datepickerElement.value = '';
}
