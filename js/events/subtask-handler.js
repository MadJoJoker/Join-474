export let addedSubtasks = [];

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

export function clearSubtask() {
    const subtaskInput = document.getElementById('subtask-input');
    if (subtaskInput) {
        subtaskInput.value = '';
    }
    toggleSubtaskInputIcons(false);
}

export function clearSubtasksList() {
    addedSubtasks = [];

    toggleSubtaskInputIcons(false);
    renderSubtasks();
}

export function renderSubtasks() {
    const subtasksList = document.getElementById('subtasks-list');
    if (!subtasksList) return;

    subtasksList.innerHTML = '';
    addedSubtasks.forEach((subtask, index) => {
        subtasksList.innerHTML += renderSubtask(subtask.text, index);
    });
}

export function renderSubtask(text, index) {
    // @param {string} text - Der Text der Unteraufgabe.
    // @param {number} index - Der Index der Unteraufgabe im Array.
    return `
        <ul class="subtask-list" data-index="${index}">
            <div class="subtask-item-content">
                <span class="subtask-text">${text}</span>
                <div id="subtask-${index}" class="subtask-actions">
                    <svg class="left" width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.14453 17H3.54453L12.1695 8.375L10.7695 6.975L2.14453 15.6V17ZM16.4445 6.925L12.1945 2.725L13.5945 1.325C13.9779 0.941667 14.4487 0.75 15.007 0.75C15.5654 0.75 16.0362 0.941667 16.4195 1.325L17.8195 2.725C18.2029 3.10833 18.4029 3.57083 18.4195 4.1125C18.4362 4.65417 18.2529 5.11667 17.8695 5.5L16.4445 6.925ZM14.9945 8.4L4.39453 19H0.144531V14.75L10.7445 4.15L14.9945 8.4Z" 
                        fill="currentColor"/>
                    </svg>

                    <span class="separator"></span>

                    <svg class="right" width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.14453 18C2.59453 18 2.1237 17.8042 1.73203 17.4125C1.34036 17.0208 1.14453 16.55 1.14453 16V3C0.861198 3 0.623698 2.90417 0.432031 2.7125C0.240365 2.52083 0.144531 2.28333 0.144531 2C0.144531 1.71667 0.240365 1.47917 0.432031 1.2875C0.623698 1.09583 0.861198 1 1.14453 1H5.14453C5.14453 0.716667 5.24036 0.479167 5.43203 0.2875C5.6237 0.0958333 5.8612 0 6.14453 0H10.1445C10.4279 0 10.6654 0.0958333 10.857 0.2875C11.0487 0.479167 11.1445 0.716667 11.1445 1H15.1445C15.4279 1 15.6654 1.09583 15.857 1.2875C16.0487 1.47917 16.1445 1.71667 16.1445 2C16.1445 2.28333 16.0487 2.52083 15.857 2.7125C15.6654 2.90417 15.4279 3 15.1445 3V16C15.1445 16.55 14.9487 17.0208 14.557 17.4125C14.1654 17.8042 13.6945 18 13.1445 18H3.14453ZM3.14453 3V16H13.1445V3H3.14453ZM5.14453 13C5.14453 13.2833 5.24036 13.5208 5.43203 13.7125C5.6237 13.9042 5.8612 14 6.14453 14C6.42786 14 6.66536 13.9042 6.85703 13.7125C7.0487 13.5208 7.14453 13.2833 7.14453 13V6C7.14453 5.71667 7.0487 5.47917 6.85703 5.2875C6.66536 5.09583 6.42786 5 6.14453 5C5.8612 5 5.6237 5.09583 5.43203 5.2875C5.24036 5.47917 5.14453 5.71667 5.14453 6V13ZM9.14453 13C9.14453 13.2833 9.24037 13.5208 9.43203 13.7125C9.6237 13.9042 9.8612 14 10.1445 14C10.4279 14 10.6654 13.9042 10.857 13.7125C11.0487 13.5208 11.1445 13.2833 11.1445 13V6C11.1445 5.71667 11.0487 5.47917 10.857 5.2875C10.6654 5.09583 10.4279 5 10.1445 5C9.8612 5 9.6237 5.09583 9.43203 5.2875C9.24037 5.47917 9.14453 5.71667 9.14453 6V13Z" 
                        fill="currentColor"/>
                    </svg>
                </div>
            </div>
        </ul>
    `;
}

export function deleteSubtask(index) {
    // @param {number} index - Der Index der zu löschenden Unteraufgabe.
    addedSubtasks.splice(index, 1);
    renderSubtasks();
}

export function toggleSubtaskEdit(editIcon) {
    // @param {HTMLElement} editIcon - Das geklickte Bearbeitungssymbol.
    const listItem = editIcon.closest('.subtask-list');
    if (!listItem) return;

    const index = parseInt(listItem.dataset.index);
    const subtaskTextSpan = listItem.querySelector('.subtask-text');
    const subtaskActions = listItem.querySelector('.subtask-actions');

    if (listItem.querySelector('.edit-input')) {
        return;
    }

    const currentText = subtaskTextSpan.textContent;
    subtaskTextSpan.style.display = 'none';
    subtaskActions.style.display = 'none';

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.name = `Subtask ${index}`;
    editInput.className = 'edit-input';
    editInput.value = currentText;
    editInput.dataset.index = index;
    editInput.addEventListener('keydown', (event) => handleSubtaskInput(event, index));

    listItem.querySelector('.subtask-item-content').prepend(editInput);
    editInput.focus();

    const editIconsContainer = document.createElement('div');
    editIconsContainer.className = 'subtask-edit-icons';
    editIconsContainer.innerHTML = `
        <svg class="left-icon-subtask" width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg" 
        data-action="save-edit">
            <path d="M5.69474 9.15L14.1697 0.675C14.3697 0.475 14.6072 0.375 14.8822 0.375C15.1572 0.375 15.3947 0.475 15.5947 0.675C15.7947 0.875 15.8947 1.1125 15.8947 1.3875C15.8947 1.6625 15.7947 1.9 15.5947 2.1L6.39474 11.3C6.19474 11.5 5.96141 11.6 5.69474 11.6C5.42807 11.6 5.19474 11.5 4.99474 11.3L0.694738 7C0.494738 6.8 0.398905 6.5625 0.407238 6.2875C0.415572 6.0125 0.519738 5.775 0.719738 5.575C0.919738 5.375 1.15724 5.275 1.43224 5.275C1.70724 5.275 1.94474 5.375 2.14474 5.575L5.69474 9.15Z" 
            fill="var(--black)"/>
        </svg>
        <div class="middle"></div>
        <svg class="right-icon-subtask" width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg" 
        data-action="cancel-edit">
                <path d="M3.14453 18C2.59453 18 2.1237 17.8042 1.73203 17.4125C1.34036 17.0208 1.14453 16.55 1.14453 16V3C0.861198 3 0.623698 2.90417 0.432031 2.7125C0.240365 2.52083 0.144531 2.28333 0.144531 2C0.144531 1.71667 0.240365 1.47917 0.432031 1.2875C0.623698 1.09583 0.861198 1 1.14453 1H5.14453C5.14453 0.716667 5.24036 0.479167 5.43203 0.2875C5.6237 0.0958333 5.8612 0 6.14453 0H10.1445C10.4279 0 10.6654 0.0958333 10.857 0.2875C11.0487 0.479167 11.1445 0.716667 11.1445 1H15.1445C15.4279 1 15.6654 1.09583 15.857 1.2875C16.0487 1.47917 16.1445 1.71667 16.1445 2C16.1445 2.28333 16.0487 2.52083 15.857 2.7125C15.6654 2.90417 15.4279 3 15.1445 3V16C15.1445 16.55 14.9487 17.0208 14.557 17.4125C14.1654 17.8042 13.6945 18 13.1445 18H3.14453ZM3.14453 3V16H13.1445V3H3.14453ZM5.14453 13C5.14453 13.2833 5.24036 13.5208 5.43203 13.7125C5.6237 13.9042 5.8612 14 6.14453 14C6.42786 14 6.66536 13.9042 6.85703 13.7125C7.0487 13.5208 7.14453 13.2833 7.14453 13V6C7.14453 5.71667 7.0487 5.47917 6.85703 5.2875C6.66536 5.09583 6.42786 5 6.14453 5C5.8612 5 5.6237 5.09583 5.43203 5.2875C5.24036 5.47917 5.14453 5.71667 5.14453 6V13ZM9.14453 13C9.14453 13.2833 9.24037 13.5208 9.43203 13.7125C9.6237 13.9042 9.8612 14 10.1445 14C10.4279 14 10.6654 13.9042 10.857 13.7125C11.0487 13.5208 11.1445 13.2833 11.1445 13V6C11.1445 5.71667 11.0487 5.47917 10.857 5.2875C10.6654 5.09583 10.4279 5 10.1445 5C9.8612 5 9.6237 5.09583 9.43203 5.2875C9.24037 5.47917 9.14453 5.71667 9.14453 6V13Z" 
                fill="var(--black)"/>
        </svg>
    `;
    listItem.querySelector('.subtask-item-content').appendChild(editIconsContainer);

    editIconsContainer.querySelector('[data-action="cancel-edit"]').addEventListener('click', () => {
        subtaskTextSpan.style.display = 'inline';
        subtaskActions.style.display = 'flex';
        editInput.remove();
        editIconsContainer.remove();
    });

    editIconsContainer.querySelector('[data-action="save-edit"]').addEventListener('click', () => {
        saveSubtask(index, editInput.value);
        subtaskTextSpan.style.display = 'inline';
        subtaskActions.style.display = 'flex';
        editInput.remove();
        editIconsContainer.remove();
    });

    const saveButton = editIconsContainer.querySelector('[data-action="save-edit"]');
    const cancelButton = editIconsContainer.querySelector('[data-action="cancel-edit"]');
    console.log(saveButton, cancelButton); // Überprüfe, ob die Elemente gefunden werden
}

export function handleSubtaskInput(event, index) {
    // @param {KeyboardEvent} event - Das Tastaturereignis-Objekt.
    // @param {number} index - Der Index der bearbeiteten Unteraufgabe.
    if (event.key === 'Enter') {
        saveSubtask(index, event.target.value);
    } else if (event.key === 'Escape') {
        renderSubtasks();
    }
}

export function saveSubtask(index, newText) {
    // @param {number} index - Der Index der zu speichernden Unteraufgabe.
    // @param {string} newText - Der neue Text für die Unteraufgabe.
    if (newText.trim() !== '') {
        addedSubtasks[index].text = newText.trim();
        renderSubtasks();
    } else {
        deleteSubtask(index);
    }
}

export function toggleSubtaskInputIcons(showClearAdd) {
    // @param {boolean} showClearAdd - True, um Löschen- und Hinzufügen-Symbole anzuzeigen, false, um den Standard-Hinzufügen-Button anzuzeigen.
    const addSubtaskBtn = document.getElementById('add-subtask-btn');
    const subtaskIcons = document.getElementById('subtask-icons');
    const subtaskInputField = document.getElementById('subtask-input');

    if (!addSubtaskBtn || !subtaskIcons || !subtaskInputField) {
        console.warn('Eines der Subtask-Kontrollen oder das Input-Feld konnte nicht gefunden werden!');
        return;
    }

    if (showClearAdd) {
        addSubtaskBtn.style.opacity = '0';
        addSubtaskBtn.style.pointerEvents = 'none';

        subtaskIcons.style.opacity = '1';
        subtaskIcons.style.pointerEvents = 'auto';

        subtaskInputField.focus();
    } else {
        addSubtaskBtn.style.opacity = '1';
        addSubtaskBtn.style.pointerEvents = 'auto';

        subtaskIcons.style.opacity = '0';
        subtaskIcons.style.pointerEvents = 'none';
    }
}
