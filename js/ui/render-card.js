/**
 * Validiert die Eingabedaten für eine Task-Karte.
 * @param {object} boardData - Das gesamte Board-Datenobjekt, das Tasks und Kontakte enthält.
 * @param {string} taskID - Die ID der zu validierenden Task.
 * @returns {boolean} True, wenn die Daten gültig sind, sonst false.
 */
function validateTaskCardInput(boardData, taskID) {
    if (!boardData || !taskID || !boardData.tasks || !boardData.contacts) {
        return false;
    }
    const task = boardData.tasks[taskID];
    if (!task) {
        return false;
    }
    return true;
}

/**
 * Extrahiert und formatiert die grundlegenden Details einer Task.
 * @param {object} task - Das Task-Objekt, aus dem die Details extrahiert werden sollen.
 * @returns {{title: string, description: string, type: string, priority: string}} Ein Objekt mit Titel, Beschreibung, Typ und Priorität der Task.
 */
function getTaskDetails(task) {
    const title = task.title || 'Kein Titel';
    const description = (task.description || '').trim();
    const type = task.type || 'Unbekannt';
    const priority = task.priority || 'Unbekannt';
    return { title, description, type, priority };
}

/**
 * Gibt die CSS-Klasse für eine bestimmte Task-Kategorie zurück.
 * @param {string} type - Der Typ der Task (z.B. 'User Story', 'Technical Task', 'Meeting').
 * @returns {string} Die entsprechende CSS-Klasse für die Kategorie.
 */
function getCategoryClass(type) {
    if (type === 'User Story') return 'category-user-story';
    if (type === 'Technical Task') return 'category-technical-task';
    if (type === 'Meeting') return 'category-meeting';
    return 'category-default';
}

/**
 * Berechnet den Fortschritt der Unteraufgaben einer Task.
 * @param {object} task - Das Task-Objekt, das Unteraufgaben-Informationen enthält.
 * @returns {{done: number, total: number, percent: number, subText: string}} Ein Objekt mit abgeschlossenen, gesamten, prozentualen Unteraufgaben und einem Text-String.
 */
function calculateSubtaskProgress(task) {
    const done = parseInt(task.subtasksCompleted || task.subtaskCompleted || 0, 10);
    const totalSubtasksArray = task.totalSubtask || task.totalSubtasks;
    const total = Array.isArray(totalSubtasksArray) ? totalSubtasksArray.length : parseInt(totalSubtasksArray || 0, 10);
    const percent = total > 0 ? (done / total) * 100 : 0;
    const subText = total > 0 ? `${done}/${total} Subtasks` : 'Keine Unteraufgaben';
    return { done, total, percent, subText };
}

/**
 * Generiert den HTML-String für die Avatare der zugewiesenen Benutzer.
 * @param {string[]} assignedUserIDs - Ein Array von IDs der zugewiesenen Benutzer.
 * @param {object} contacts - Ein Objekt mit Kontaktinformationen, indiziert nach Kontakt-ID.
 * @returns {string} Der HTML-String mit den Avataren.
 */
function generateAssignedAvatarsHtml(assignedUserIDs, contacts) {
    let avatarsHtml = '';
    const users = Array.isArray(assignedUserIDs) ? assignedUserIDs : [];
    for (let i = 0; i < users.length; i++) {
        const id = users[i];
        const contact = contacts[id];
        avatarsHtml += renderContactAvatar(contact);
    }
    return avatarsHtml;
}

/**
 * Rendert den HTML-String für den Avatar eines einzelnen Kontakts.
 * @param {object} contact - Das Kontakt-Objekt mit Initialen, Namen und Avatar-Farbe.
 * @returns {string} Der HTML-String des Kontakt-Avatars.
 */
function renderContactAvatar(contact) {
    if (!contact) {
        return `<div class="assigned-initials-circle" style="background-color: var(--grey);" title="Unbekannt">?</div>`;
    }
    const initials = (contact.initials || '').trim();
    const name = (contact.name || '').trim();
    const colorRaw = contact.avatarColor || 'default';
    const colorStyle = colorRaw.startsWith('--') ? `var(${colorRaw})` : colorRaw;
    return `<div class="assigned-initials-circle" style="background-color: ${colorStyle};" title="${name}">${initials}</div>`;
}

/**
 * Gibt das Icon und den Text für eine bestimmte Priorität zurück.
 * @param {string} prio - Die Priorität der Task ('low', 'medium', 'urgent').
 * @returns {{icon: string, prioText: string}} Ein Objekt mit dem Pfad zum Icon und dem Prioritätstext.
 */
function getPriorityIconAndText(prio) {
    if (prio === 'low') return { icon: `../assets/icons/property/low.svg`, prioText: 'Niedrig' };
    if (prio === 'medium') return { icon: `../assets/icons/property/medium.svg`, prioText: 'Mittel' };
    if (prio === 'urgent') return { icon: `../assets/icons/property/urgent.svg`, prioText: 'Dringend' };
    console.warn('Unbekannte Priorität gefunden:', prio);
    return { icon: `../assets/icons/property/default.svg`, prioText: 'Unbekannt' };
}

/**
 * Baut den vollständigen HTML-Inhalt einer Task-Karte.
 * @param {string} taskID - Die ID der Task.
 * @param {object} taskDetails - Ein Objekt mit den Details der Task (Titel, Beschreibung, Typ, Priorität).
 * @param {object} subtaskProgress - Ein Objekt mit dem Fortschritt der Unteraufgaben.
 * @param {string} avatarsHtml - Der HTML-String der zugewiesenen Avatare.
 * @param {object} priorityInfo - Ein Objekt mit Icon-Pfad und Text für die Priorität.
 * @returns {string} Der vollständige HTML-String der Task-Karte.
 */
function buildTaskCardHtmlContent(taskID, taskDetails, subtaskProgress, avatarsHtml, priorityInfo) {
    const { title, description, type } = taskDetails;
    const { total, percent, subText } = subtaskProgress;
    const { icon, prioText } = priorityInfo;
    const categoryClass = getCategoryClass(type);

    return `
        <div class="task-card" id="${taskID}">
            <div class="task-category ${categoryClass}">${type}</div>
            <div class="task-content">
                <h3 class="task-title">${title}</h3>
                <p class="task-description">${description}</p>
                ${total > 0 ? `
                    <div class="progress-container">
                        <div class="progress-bar-track">
                            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                        </div>
                        <span class="subtasks-text">${subText}</span>
                    </div>` : ''}
            </div>
            <div class="task-footer">
                <div class="assigned-users">${avatarsHtml}</div>
                <div class="priority-icon">
                    <img src="${icon}" alt="${prioText}" title="${prioText}">
                </div>
            </div>
        </div>
    `;
}

/**
 * Erstellt den HTML-Inhalt für eine einfache Task-Karte.
 * Diese Funktion ist der Haupt-Export für das Modul.
 * @param {object} boardData - Das gesamte Board-Datenobjekt, das Tasks und Kontakte enthält.
 * @param {string} taskID - Die ID der Task, für die die Karte erstellt werden soll.
 * @returns {string} Der HTML-String der erstellten Task-Karte, oder ein leerer String, wenn die Validierung fehlschlägt.
 */
export function createSimpleTaskCard(boardData, taskID) {
    if (!validateTaskCardInput(boardData, taskID)) return '';
    const task = boardData.tasks[taskID];
    const contacts = boardData.contacts;
    const taskDetails = getTaskDetails(task);
    const subtaskProgress = calculateSubtaskProgress(task);
    const avatarsHtml = generateAssignedAvatarsHtml(task.assignedUsers, contacts);
    const priorityInfo = getPriorityIconAndText(task.priority);
    return buildTaskCardHtmlContent(taskID, taskDetails, subtaskProgress, avatarsHtml, priorityInfo);
}
