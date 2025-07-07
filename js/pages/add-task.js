// Path: ../js/pages/add-task.js

import { getFirebaseData } from '../../js/data/API.js'; // Pfad prüfen
import { closeSpecificOverlay } from '../events/overlay-handler.js'; // closeSpecificOverlay importieren

let pickerInstance; // flatpickr Instanz
let isResizing = false;
let startY, startHeight, currentTextarea;
let currentPriority = 'medium'; // Standard-Priorität
let selectedCategory = null;
let currentContacts = [];
let selectedContacts = []; // Array zum Speichern der IDs der ausgewählten Kontakte
let addedSubtasks = [];

/**
 * Initialisiert das Add Task Formular. Diese Funktion MUSS aufgerufen werden,
 * NACHDEM der HTML-Inhalt des Formulars in den DOM geladen wurde,
 * sei es als eigenständige Seite oder als dynamisches Overlay.
 */
export async function initAddTaskForm() {
    console.log("initAddTaskForm wird aufgerufen. Initialisiere Formular und Event-Listener.");

    // Initialisiere Datepicker
    const datepickerElement = document.getElementById("datepicker");
    if (datepickerElement) {
        pickerInstance = flatpickr(datepickerElement, {
            dateFormat: "d.m.Y",
            allowInput: true
        });
    } else {
        console.warn("DEBUG: Datepicker-Element nicht im DOM gefunden (kann im Overlay später geladen werden).");
    }

    await initTaskData(); // Firebase-Daten abrufen und Kontakte sortieren (umbenannt)
    attachFormEventListeners(); // Alle notwendigen Event-Listener anhängen

    // UI-Elemente rendern und Standardwerte setzen
    renderAssignedToContactsOptions(); // Die Kontakte im Dropdown rendern
    renderCategoryOptions(); // Die Kategorien im Dropdown rendern
    renderSelectedInitials(); // Sicherstellen, dass ausgewählte Kontakte beim Laden gerendert werden
    setMedium(); // Standardpriorität auf "Medium" setzen und UI anpassen
    renderSubtasks(); // Sicherstellen, dass Subtasks gerendert werden (falls welche vorab da sind)
}

/**
 * Initialisiert die Aufgabe, indem die Firebase-Daten abgerufen und die Kontakte sortiert werden.
 * Umbenannt von initTask(), um Verwechslung mit Task-Objekten zu vermeiden.
 * @async
 */
async function initTaskData() { // Umbenannt von initTask
    try {
        const data = await getFirebaseData(); // Daten von Firebase holen
        if (data && data.contacts) {
            currentContacts = Object.values(data.contacts)
                .sort((a, b) => {
                    const nameA = (a.name || "").toLowerCase();
                    const nameB = (b.name || "").toLowerCase();
                    return nameA.localeCompare(nameB, 'de', { sensitivity: 'base' });
                });
            console.log('Alle Kontakte (alphabetisch sortiert):', currentContacts);
        } else {
            console.warn("Keine Kontakte in Firebase-Daten gefunden.");
            currentContacts = [];
        }
    } catch (error) {
        console.error("Fehler beim Laden der Firebase-Daten:", error);
        currentContacts = [];
    }
}

/**
 * Hängt alle Event-Listener an die Formularfelder an.
 * Diese Funktion MUSS aufgerufen werden, NACHDEM das HTML der Formularfelder im DOM ist.
 */
function attachFormEventListeners() {
    console.log("attachFormEventListeners wird ausgeführt.");

    // Formular-Submit
    const form = document.getElementById('add-task-form');
    if (form) {
        form.onsubmit = (event) => {
            event.preventDefault(); // Standard-Formularübermittlung verhindern
            if (checkRequiredFields()) {
                submitForm(); // Ruft deine submitForm-Logik auf
            }
            return false; // Verhindert das Standard-HTML-Formularverhalten
        };
    }

    // Input-Felder (Null-Checks hinzugefügt)
    document.getElementById('title')?.addEventListener('input', (event) => handleInput(event.target));
    document.getElementById('task-description')?.addEventListener('input', (event) => handleInput(event.target));
    // Datepicker Input-Listener (direkt am Element, da flatpickr das Feld auch manipuliert)
    document.getElementById('datepicker')?.addEventListener('input', (event) => { formatDate(event.target); handleInput(event.target); });

    // Priority-Buttons (Null-Check unnötig bei querySelectorAll, da forEach auch bei leerer NodeList funktioniert)
    document.querySelectorAll('.priority-btn').forEach(button => {
        button.addEventListener('click', (event) => setPriority(event.currentTarget, event.currentTarget.dataset.priority));
    });

    // Kalender-Icon (Null-Check hinzugefügt)
    const calendarIcon = document.getElementById('calendar-icon');
    if (calendarIcon) {
        calendarIcon.addEventListener('click', () => pickerInstance?.open()); // Optional Chaining für pickerInstance
    }

    // Resize-Handle für Textarea (Null-Check hinzugefügt)
    const resizeHandle = document.querySelector('.resize-handle');
    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', startResize);
    }
    // Diese Listener bleiben am Dokument, da sie globale Mausbewegungen verfolgen
    document.addEventListener('mousemove', resizeTextarea);
    document.addEventListener('mouseup', stopResize);

    // Assigned To Dropdown (Null-Check hinzugefügt)
    const dropdownAssignedTo = document.getElementById('dropdown-assigned-to');
    if (dropdownAssignedTo) {
        dropdownAssignedTo.addEventListener('click', (event) => {
            event.stopPropagation(); // Verhindert Schließen des Overlays bei Klick auf den Dropdown-Header
            toggleAssignedToDropdown();
        });
    }

    // Category Dropdown (Null-Check hinzugefügt)
    const dropdownCategory = document.getElementById('dropdown-category');
    if (dropdownCategory) {
        dropdownCategory.addEventListener('click', (event) => {
            event.stopPropagation(); // Verhindert Schließen des Overlays bei Klick auf den Dropdown-Header
            toggleCategoryDropdown();
        });
    }

    // Subtask Input und Buttons (Null-Checks hinzugefügt)
    const subtaskInput = document.getElementById('subtask-input');
    if (subtaskInput) {
        subtaskInput.addEventListener('input', toggleSubtaskIcons);
        // Da die Icons dynamisch angezeigt/versteckt werden, sind hier dedizierte Listener sinnvoll
        document.querySelector('#subtask-input-controls .add-btn')?.addEventListener('click', addSubtask); // Angepasst an neue Icon-Container-ID
        document.querySelector('#subtask-input-controls .close-btn')?.addEventListener('click', clearSubtask); // Angepasst
    }

    // Add Subtask Button (wenn Icons ausgeblendet sind und nur der Button sichtbar ist)
    const addSubtaskBtn = document.getElementById('add-subtask-btn');
    if (addSubtaskBtn) {
        addSubtaskBtn.addEventListener('click', addSubtask);
    }

    // Clear Button (Null-Check hinzugefügt)
    const clearBtn = document.querySelector('.clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearForm);
    }
}

/**
 * Behandelt Input-Änderungen für Validierung und Feedback.
 * @param {HTMLInputElement} inputElement - Das Input-Element, das geändert wurde.
 */
function handleInput(inputElement) {
    console.log(`Input ${inputElement.id} geändert: ${inputElement.value}`);
    if (inputElement.classList.contains('invalid')) {
        toggleInvalidClass(inputElement, true); // Entfernt 'invalid' Klasse bei gültigem Input
    }
}

/**
 * Formatiert das Datum im Input-Feld, falls nötig.
 * Flatpickr handhabt dies bereits weitestgehend.
 * @param {HTMLInputElement} input - Das Input-Element.
 */
function formatDate(input) {
    // Zusätzliche Logik, wenn der Benutzer manuell Datum eingibt und es formatiert werden muss.
    // Flatpickr aktualisiert den Wert automatisch, aber hier könnte man z.B. eigene Validierung hinzufügen.
}

/**
 * Startet das Neuskalieren der Textarea.
 * @param {MouseEvent} e - Das Maus-Event.
 */
function startResize(e) {
    e.preventDefault(); // Verhindert Standard-Drag-Verhalten
    isResizing = true;
    currentTextarea = document.getElementById('task-description');
    if (currentTextarea) {
        startY = e.clientY;
        startHeight = currentTextarea.clientHeight;
    }
}

/**
 * Skaliert die Textarea während des Drag-Vorgangs.
 * @param {MouseEvent} e - Das Maus-Event.
 */
function resizeTextarea(e) {
    if (!isResizing || !currentTextarea) return; // Zusätzlicher Check für currentTextarea
    const newHeight = startHeight + (e.clientY - startY);
    currentTextarea.style.height = `${newHeight}px`;
}

/**
 * Beendet das Neuskalieren der Textarea.
 */
function stopResize() {
    isResizing = false;
}

/**
 * Setzt die Priorität einer Aufgabe.
 * @param {HTMLButtonElement} clickedButton - Der geklickte Button.
 * @param {string} priority - Die gewählte Priorität ('urgent', 'medium', 'low').
 */
function setPriority(clickedButton, priority) {
    document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
    currentPriority = priority;
    console.log('Priorität gesetzt:', currentPriority);
}
// Exportiere setPriority, falls direkt im HTML aufgerufen (z.B. bei initialem Laden)
window.setPriority = setPriority;


/**
 * Setzt die Priorität auf "Medium". Wird normalerweise initial einmal aufgerufen.
 */
function setMedium() {
    const mediumButton = document.querySelector('.priority-btn[data-priority="medium"]');
    if (mediumButton) {
        setPriority(mediumButton, 'medium');
    }
}
window.setMedium = setMedium; // Auch global, falls es direkt im HTML verwendet wird oder von außen aufgerufen wird


/**
 * Zeigt/Versteckt die Icons für Subtask-Eingabe (Haken und X).
 */
function toggleSubtaskIcons() {
    const subtaskInput = document.getElementById('subtask-input');
    // Die Icons sollten in einem gemeinsamen Container liegen, z.B. '.subtask-input-controls'
    const subtaskIcons = document.getElementById('subtask-input-controls');
    const addSubtaskBtn = document.getElementById('add-subtask-btn'); // Der "Plus"-Button

    if (subtaskInput && subtaskIcons && addSubtaskBtn) {
        if (subtaskInput.value.trim() !== '') {
            subtaskIcons.style.display = 'flex'; // Zeige die Haken/X Icons
            addSubtaskBtn.style.display = 'none'; // Verstecke den Plus-Button
        } else {
            subtaskIcons.style.display = 'none'; // Verstecke die Haken/X Icons
            addSubtaskBtn.style.display = 'block'; // Zeige den Plus-Button
        }
    }
}
window.toggleSubtaskIcons = toggleSubtaskIcons; // Global, falls im HTML oninput verwendet wird


/**
 * Löscht den Inhalt des Subtask-Inputs.
 */
function clearSubtask() {
    const subtaskInput = document.getElementById('subtask-input');
    if (subtaskInput) {
        subtaskInput.value = '';
        toggleSubtaskIcons(); // Icons wieder ausblenden
    }
}
window.clearSubtask = clearSubtask; // Global, falls im HTML onclick verwendet wird


/**
 * Fügt einen Subtask zur Liste hinzu.
 */
function addSubtask() {
    const subtaskInput = document.getElementById('subtask-input');
    const subtaskText = subtaskInput?.value.trim(); // Optional Chaining

    if (subtaskText) {
        addedSubtasks.push({ text: subtaskText, completed: false });
        renderSubtasks();
        clearSubtask();
    }
}
window.addSubtask = addSubtask; // Global, falls im HTML onclick verwendet wird


/**
 * Rendert die hinzugefügten Subtasks in der Liste.
 */
function renderSubtasks() {
    const subtasksList = document.getElementById('subtasks-list');
    if (!subtasksList) return;
    subtasksList.innerHTML = '';
    addedSubtasks.forEach((subtask, index) => {
        subtasksList.innerHTML += `
            <li class="subtask-item">
                <input type="checkbox" id="subtask-${index}" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtaskCompletion(${index})">
                <label for="subtask-${index}">${subtask.text}</label>
                <div class="subtask-actions">
                    <img src="../assets/icons/btn/edit.svg" alt="Edit" class="subtask-action-icon" onclick="editSubtask(${index})">
                    <img src="../assets/icons/btn/delete.svg" alt="Delete" class="subtask-action-icon" onclick="deleteSubtask(${index})">
                </div>
            </li>
        `;
    });
}
window.renderSubtasks = renderSubtasks; // Global, falls von außerhalb direkt aufgerufen wird


/**
 * Schaltet den Abschlussstatus eines Subtasks um.
 * @param {number} index - Der Index des Subtasks.
 */
function toggleSubtaskCompletion(index) {
    if (addedSubtasks[index]) {
        addedSubtasks[index].completed = !addedSubtasks[index].completed;
        console.log(`Subtask ${index} completion: ${addedSubtasks[index].completed}`);
    }
}
window.toggleSubtaskCompletion = toggleSubtaskCompletion; // MUSS GLOBAL SEIN (wegen onchange im HTML)


/**
 * Bearbeitet einen Subtask.
 * @param {number} index - Der Index des Subtasks.
 */
function editSubtask(index) {
    const subtaskInput = document.getElementById('subtask-input');
    if (subtaskInput && addedSubtasks[index]) {
        subtaskInput.value = addedSubtasks[index].text;
        deleteSubtask(index, false); // Löschen, aber nicht sofort neu rendern
        toggleSubtaskIcons();
    }
}
window.editSubtask = editSubtask; // MUSS GLOBAL SEIN (wegen onclick im HTML)


/**
 * Löscht einen Subtask.
 * @param {number} index - Der Index des Subtasks.
 * @param {boolean} [doRender=true] - Ob die Subtasks neu gerendert werden sollen.
 */
function deleteSubtask(index, doRender = true) {
    addedSubtasks.splice(index, 1);
    if (doRender) {
        renderSubtasks();
    }
}
window.deleteSubtask = deleteSubtask; // MUSS GLOBAL SEIN (wegen onclick im HTML)


/**
 * Schaltet das Dropdown-Menü für Kategorien um.
 */
function toggleCategoryDropdown() {
    const optionsContainer = document.getElementById('category-options-container');
    const dropdownIcon = document.getElementById('category-dropdown-icon');
    if (optionsContainer && dropdownIcon) {
        optionsContainer.classList.toggle('open');
        dropdownIcon.classList.toggle('rotate');
    }
}
window.toggleCategoryDropdown = toggleCategoryDropdown; // Global, falls im HTML onclick verwendet wird


/**
 * Rendert die verfügbaren Kategorien.
 */
function renderCategoryOptions() {
    const categories = [
        { value: 'technical-task', text: 'Technical Task', className: 'category-technical-task' },
        { value: 'user-story', text: 'User Story', className: 'category-user-story' },
        { value: 'meeting', text: 'Meeting', className: 'category-meeting' }
    ];
    const optionsContainer = document.getElementById('category-options-container');
    if (!optionsContainer) return;

    optionsContainer.innerHTML = '';
    categories.forEach(cat => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('dropdown-option', cat.className);
        optionDiv.textContent = cat.text;
        optionDiv.setAttribute('data-value', cat.value);
        // Event Listener direkt hier anhängen, NICHT onclick im HTML-String
        optionDiv.addEventListener('click', (event) => selectCategory(cat.value, cat.text, event));
        optionsContainer.appendChild(optionDiv);
    });
}
window.renderCategoryOptions = renderCategoryOptions; // Global, falls von außen direkt aufgerufen wird


/**
 * Wählt eine Kategorie aus und aktualisiert das UI.
 * @param {string} value - Der Wert der ausgewählten Kategorie.
 * @param {string} text - Der Anzeigetext der ausgewählten Kategorie.
 * @param {Event} event - Das Klick-Event, um Bubbling zu verhindern.
 */
function selectCategory(value, text, event) {
    if (event) event.stopPropagation(); // Verhindert, dass das Dropdown sofort wieder geschlossen wird
    selectedCategory = value;
    const selectedDisplay = document.getElementById('selected-category');
    if (selectedDisplay) {
        selectedDisplay.textContent = text;
        selectedDisplay.classList.add('selected'); // Optional: Klasse für Stilgebung hinzufügen
    }
    toggleCategoryDropdown(); // Schließt das Dropdown
    toggleInvalidClass(selectedDisplay, true); // Entfernt Fehlermarkierung, falls vorhanden
}
window.selectCategory = selectCategory; // Global, falls im HTML onclick verwendet wird


/**
 * Schaltet das Dropdown-Menü für "Assigned to" um.
 */
function toggleAssignedToDropdown() {
    const optionsContainer = document.getElementById('assigned-to-options-container');
    const dropdownIcon = document.getElementById('assigned-to-dropdown-icon');
    if (optionsContainer && dropdownIcon) {
        optionsContainer.classList.toggle('open');
        dropdownIcon.classList.toggle('rotate');
    }
}
window.toggleAssignedToDropdown = toggleAssignedToDropdown; // Global, falls im HTML onclick verwendet wird


/**
 * Rendert die Kontakte im "Assigned to" Dropdown.
 */
function renderAssignedToContactsOptions() {
    const optionsContainer = document.getElementById('assigned-to-options-container');
    if (!optionsContainer) return;

    optionsContainer.innerHTML = '';
    currentContacts.forEach(contact => {
        const isSelected = selectedContacts.some(sc => sc.id === contact.id);
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('dropdown-option-contact');
        // Direkte Event Listener an `optionDiv` anstatt `onclick` im HTML-String
        optionDiv.addEventListener('click', (event) => toggleSelectContact(event, contact.id, contact.name, contact.initials, contact.avatarColor));

        optionDiv.innerHTML = `
            <div class="contact-initials-circle" style="background-color: ${contact.avatarColor || '#ccc'};">${contact.initials}</div>
            <span>${contact.name}</span>
            <input type="checkbox" id="contact-${contact.id}" data-contact-id="${contact.id}" ${isSelected ? 'checked' : ''}>
        `;
        // Da die Checkbox ein Kind des Klick-Elements ist, wird der Klick auf die Checkbox den Listener des Divs triggern.
        // Das event.stopPropagation() in toggleSelectContact ist wichtig.
        optionsContainer.appendChild(optionDiv);
    });
}
window.renderAssignedToContactsOptions = renderAssignedToContactsOptions; // Global, falls von außen direkt aufgerufen wird


/**
 * Fügt einen Kontakt zur Auswahl hinzu oder entfernt ihn.
 * @param {Event} event - Das Klick-Event.
 * @param {string} contactId - Die ID des Kontakts.
 * @param {string} name - Der Name des Kontakts.
 * @param {string} initials - Die Initialen des Kontakts.
 * @param {string} avatarColor - Die Avatar-Farbe des Kontakts.
 */
function toggleSelectContact(event, contactId, name, initials, avatarColor) {
    event.stopPropagation(); // Verhindert, dass der Klick auf das Dropdown-Option oder Checkbox das Overlay schließt
    const checkbox = document.getElementById(`contact-${contactId}`);
    if (checkbox) {
        checkbox.checked = !checkbox.checked; // Checkbox-Status umschalten
    }

    const index = selectedContacts.findIndex(c => c.id === contactId);
    if (index > -1) {
        selectedContacts.splice(index, 1); // Kontakt entfernen
    } else {
        selectedContacts.push({ id: contactId, name, initials, avatarColor }); // Kontakt hinzufügen
    }
    renderSelectedInitials();
}
window.toggleSelectContact = toggleSelectContact; // Global, falls im HTML onclick verwendet wird


/**
 * Rendert die Initialen der ausgewählten Kontakte.
 */
function renderSelectedInitials() {
    const container = document.getElementById('selected-initials-container');
    if (!container) return;
    container.innerHTML = '';
    selectedContacts.forEach(contact => {
        container.innerHTML += `
            <div class="assigned-initials-circle" style="background-color: ${contact.avatarColor || '#ccc'}" title="${contact.name}">
                ${contact.initials}
            </div>
        `;
    });
}
window.renderSelectedInitials = renderSelectedInitials; // Global, falls von außen direkt aufgerufen wird


/**
 * Überprüft die erforderlichen Felder des Formulars.
 * @returns {boolean} True, wenn alle erforderlichen Felder gültig sind, sonst false.
 */
function checkRequiredFields() {
    let isValid = true;

    // Optional Chaining und Null-Checks für die Elemente
    const titleInput = document.getElementById('title'); // ID angepasst von 'task-title' zu 'title'
    if (!titleInput?.value.trim()) {
        toggleInvalidClass(titleInput, false);
        isValid = false;
    } else {
        toggleInvalidClass(titleInput, true);
    }

    const dateInput = document.getElementById('datepicker');
    if (!dateInput?.value.trim()) {
        toggleInvalidClass(dateInput, false);
        isValid = false;
    } else {
        toggleInvalidClass(dateInput, true);
    }

    const categorySelectedDisplay = document.getElementById('selected-category');
    if (!selectedCategory || categorySelectedDisplay?.textContent === 'Select task category') {
        toggleInvalidClass(categorySelectedDisplay, false);
        isValid = false;
    } else {
        toggleInvalidClass(categorySelectedDisplay, true);
    }

    const signInfo = document.querySelector('.sign-info');
    if (!isValid) {
        if (signInfo) signInfo.style.display = 'block';
    } else {
        if (signInfo) signInfo.style.display = 'none';
    }

    return isValid;
}
window.checkRequiredFields = checkRequiredFields; // Global, falls im HTML onclick (z.B. bei submit) verwendet wird


/**
 * Fügt oder entfernt die 'invalid'-Klasse basierend auf der Gültigkeit.
 * @param {HTMLElement} element - Das HTML-Element, das überprüft wird.
 * @param {boolean} isValid - Ob das Element gültig ist.
 */
function toggleInvalidClass(element, isValid) {
    if (element) {
        if (isValid) {
            element.classList.remove('invalid');
        } else {
            element.classList.add('invalid');
        }
    }
}
window.toggleInvalidClass = toggleInvalidClass; // Global, falls im HTML onclick verwendet wird


/**
 * Leert das Formular.
 */
function clearForm() {
    document.getElementById('add-task-form')?.reset(); // Optional Chaining für das Formular
    currentPriority = 'medium'; // Priorität auf Standard zurücksetzen
    setMedium(); // UI für Medium-Priorität aktualisieren
    selectedCategory = null;
    const selectedCategoryDisplay = document.getElementById('selected-category');
    if (selectedCategoryDisplay) {
        selectedCategoryDisplay.textContent = 'Select task category';
        selectedCategoryDisplay.classList.remove('selected');
        toggleInvalidClass(selectedCategoryDisplay, true); // Fehlermarkierung entfernen
    }
    selectedContacts = []; // Ausgewählte Kontakte leeren
    renderAssignedToContactsOptions(); // Kontakte im Dropdown neu rendern (Checkboxen zurücksetzen)
    renderSelectedInitials(); // Initialen leeren
    addedSubtasks = []; // Subtasks leeren
    renderSubtasks(); // Subtask-Liste leeren
    const signInfo = document.querySelector('.sign-info');
    if (signInfo) signInfo.style.display = 'none'; // Fehlermeldung ausblenden

    document.querySelectorAll('.input-field, .task-description-area').forEach(input => {
        toggleInvalidClass(input, true); // Entfernt Invalid-Klassen
    });
}
window.clearForm = clearForm; // Global, falls im HTML onclick verwendet wird


/**
 * Sendet das Formular ab (simuliert).
 */
async function submitForm() {
    console.log('Formular abgesendet!');
    // Hier würde die Logik zum Speichern der Daten in Firebase oder der Datenbank stehen.
    const taskData = {
        title: document.getElementById('title')?.value.trim(), // Optional Chaining
        description: document.getElementById('task-description')?.value.trim(), // Optional Chaining
        dueDate: document.getElementById('datepicker')?.value.trim(), // Optional Chaining
        priority: currentPriority,
        assignedUsers: selectedContacts.map(c => c.id), // Nur IDs speichern
        category: selectedCategory,
        subtasks: addedSubtasks,
        subtasksCompleted: addedSubtasks.filter(s => s.completed).length,
        totalSubtask: addedSubtasks.length,
        createdAt: new Date().toISOString(), // Aktuelles Datum und Uhrzeit
        columnID: 'todo' // Standardspalte, kann später dynamisch übergeben werden
    };
    console.log('Task-Daten:', taskData);

    // Beispiel: Speichern in Firebase (Platzhalter)
    // await saveTaskToFirebase(taskData); // Du müsstest diese Funktion implementieren
    clearForm(); // Formular leeren

    // Schließe das Overlay NUR, wenn das Formular als Overlay genutzt wird.
    // Dies erfordert einen Mechanismus, um zu erkennen, ob es ein Overlay ist.
    // Eine einfache Lösung ist, closeSpecificOverlay immer aufzurufen,
    // da es intern prüft, ob das Overlay existiert/sichtbar ist.
    closeSpecificOverlay('overlay');

    // Optional: Board neu laden, um die neue Aufgabe anzuzeigen
    // if (typeof initializeBoard === 'function') { // Nur wenn initializeBoard global ist
    //     initializeBoard();
    // }
    // Oder, wenn du renderTasksByColumn importierst:
    // const firebaseBoardData = await loadFirebaseData();
    // if (firebaseBoardData) {
    //     renderTasksByColumn(firebaseBoardData);
    // }
}
window.submitForm = submitForm; // Global, falls im HTML onsubmit oder onclick verwendet wird
