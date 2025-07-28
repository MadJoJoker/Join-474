import { getTaskOverlay } from '../templates/task-details-template.js';
import { openSpecificOverlay, closeSpecificOverlay, initOverlayListeners } from '../events/overlay-handler.js';
import { getPopulatedTaskEditFormHtml } from '../templates/task-detail-edit-template.js';

/**
 * Validiert die Eingabedaten für die Task-Karte.
 * @param {object} boardData - Die gesamten Board-Daten.
 * @param {string} taskID - Die ID der Task.
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
 * Extrahiert grundlegende Task-Details.
 * @param {object} task - Das Task-Objekt.
 * @returns {{title: string, description: string, type: string, priority: string}} Die extrahierten Details.
 */
function getTaskDetails(task) {
    const title = task.title || 'Kein Titel';
    const description = (task.description || '').trim();
    const type = task.type || 'Unbekannt';
    const priority = task.priority || 'Unbekannt';
    return { title, description, type, priority };
}

/**
 * Ermittelt die CSS-Klasse für die Task-Kategorie.
 * @param {string} type - Der Typ der Task (z.B. 'User Story').
 * @returns {string} Die entsprechende CSS-Klasse.
 */
function getCategoryClass(type) {
    if (type === 'User Story') return 'category-user-story';
    if (type === 'Technical Task') return 'category-technical-task';
    if (type === 'Meeting') return 'category-meeting';
    return 'category-default';
}

/**
 * Berechnet den Fortschritt der Subtasks.
 * @param {object} task - Das Task-Objekt.
 * @returns {{done: number, total: number, percent: number, subText: string}} Der Fortschritt der Subtasks.
 */
function calculateSubtaskProgress(task) {
    const subtasksArray = Array.isArray(task.subtasks) ? task.subtasks : [];
    const done = subtasksArray.filter(sub => sub.completed).length;
    const total = subtasksArray.length;
    const percent = total > 0 ? (done / total) * 100 : 0;
    const subText = total > 0 ? `${done}/${total} Subtasks` : 'Keine Unteraufgaben';
    return { done, total, percent, subText };
}

/**
 * Generiert den HTML-String für die Avatare der zugewiesenen Benutzer.
 * @param {string[]} assignedUserIDs - IDs der zugewiesenen Benutzer.
 * @param {object} contacts - Das Kontakte-Objekt.
 * @returns {string} Der HTML-String der Avatare.
 */
function generateAssignedAvatarsHtml(assignedUserIDs, contacts) {
    let avatarsHtml = '';
    const users = Array.isArray(assignedUserIDs) ? assignedUserIDs : [];
    const displayCount = 3;
    for (let i = 0; i < Math.min(users.length, displayCount); i++) {
        const id = users[i];
        const contact = contacts[id];
        avatarsHtml += renderContactAvatar(contact);
    }
    if (users.length > displayCount) {
        avatarsHtml += `<div class="assigned-initials-circle more-users-circle">+${users.length - displayCount}</div>`;
    }
    return avatarsHtml;
}

/**
 * Rendert einen einzelnen Kontakt-Avatar.
 * @param {object} contact - Das Kontakt-Objekt.
 * @returns {string} Der HTML-String des Avatars.
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
 * Ermittelt das Icon und den Text für die Priorität.
 * @param {string} prio - Die Priorität ('low', 'medium', 'urgent').
 * @returns {{icon: string, prioText: string}} Icon-Pfad und Prioritäts-Text.
 */
function getPriorityIconAndText(prio) {
    if (prio === 'low') return { icon: `../assets/icons/property/low.svg`, prioText: 'Niedrig' };
    if (prio === 'medium') return { icon: `../assets/icons/property/medium.svg`, prioText: 'Mittel' };
    if (prio === 'urgent') return { icon: `../assets/icons/property/urgent.svg`, prioText: 'Dringend' };
    return { icon: `../assets/icons/property/default.svg`, prioText: 'Unbekannt' };
}

/**
 * Baut den vollständigen HTML-Inhalt einer Task-Karte.
 * @param {string} taskID - Die ID der Task.
 * @param {object} taskDetails - Die Task-Details.
 * @param {object} subtaskProgress - Der Subtask-Fortschritt.
 * @param {string} avatarsHtml - Die Avatare der zugewiesenen Benutzer.
 * @param {object} priorityInfo - Prioritätsinformationen.
 * @returns {string} Der HTML-String der Task-Karte.
 */
function buildTaskCardHtmlContent(taskID, taskDetails, subtaskProgress, avatarsHtml, priorityInfo) {
    const { title, description, type } = taskDetails;
    const { total, percent, subText } = subtaskProgress;
    const { icon, prioText } = priorityInfo;
    const categoryClass = getCategoryClass(type);

    return `
        <div class="task-card" id="${taskID}" draggable="true" ondragstart="drag(event)">
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
 * Erstellt den HTML-String für eine einzelne Task-Karte auf dem Board.
 * @param {object} boardData - Das gesamte Board-Datenobjekt (Tasks, Kontakte etc.).
 * @param {string} taskID - Die ID der Task, die gerendert werden soll.
 * @returns {string} Der HTML-String der Task-Karte.
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

// --- Overlay-Management und Event-Listener für Overlays ---

// Globale Referenzen für die Overlay-Elemente
let detailOverlayElement = null;
let editOverlayElement = null;

/**
 * Lädt das HTML für das Task-Detail-Overlay einmalig in den DOM.
 */
async function loadDetailOverlayHtmlOnce() {
    if (detailOverlayElement) return;

    try {
        const response = await fetch('../js/templates/task-details-overlay.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const overlayContainer = document.getElementById('overlay-container');
        if (overlayContainer) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            detailOverlayElement = tempDiv.firstElementChild;
            overlayContainer.appendChild(detailOverlayElement);
            initOverlayListeners('overlay-task-detail');
        } else {
            console.error('Overlay container not found!');
        }
    } catch (error) {
        console.error('Failed to load task-detail-overlay.html:', error);
    }
}

/**
 * Lädt das HTML für das Task-Bearbeitungs-Overlay einmalig in den DOM.
 */
async function loadEditOverlayHtmlOnce() {
    if (editOverlayElement) return;

    try {
        const response = await fetch('../js/templates/task-detail-edit-overlay.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const overlayContainer = document.getElementById('overlay-container');
        if (overlayContainer) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            editOverlayElement = tempDiv.firstElementChild;
            overlayContainer.appendChild(editOverlayElement);
            initOverlayListeners('overlay-task-detail-edit');
        } else {
            console.error('Overlay container not found!');
        }
    } catch (error) {
        console.error('Failed to load task-details-edit-overlay.html:', error);
    }
}

/**
 * Registriert Event-Listener für alle Task-Karten, um Overlays zu öffnen
 * und die Bearbeitungsfunktion zu ermöglichen.
 * @param {object} boardData - Das gesamte Board-Datenobjekt (Tasks, Kontakte etc.).
 * @param {Function} updateBoardFunction - Callback-Funktion zum Aktualisieren des Boards nach dem Speichern (optional).
 */
export async function registerTaskCardDetailOverlay(boardData, updateBoardFunction) {
    // Lade beide Overlays einmalig beim Start der Anwendung
    await loadDetailOverlayHtmlOnce();
    await loadEditOverlayHtmlOnce();

    const cards = document.querySelectorAll('.task-card');

    cards.forEach(card => {
        // Sicherstellen, dass nur ein Event-Listener pro Karte angehängt wird
        // Entfernen des alten Listeners, falls die Funktion mehrfach aufgerufen wird
        const oldClickListener = card.getAttribute('data-has-click-listener');
        if (oldClickListener) {
            // Hier sollte eine Referenz auf die spezifische Funktion gespeichert werden,
            // um sie korrekt zu entfernen. Für dieses Beispiel nehmen wir an, dass
            // wir den Listener "überschreiben" (nicht ideal für komplexe Szenarien).
            // Besser: Event Delegation oder eine benannte Callback-Funktion.
            card.removeEventListener('click', card._currentClickListener);
        }

        const newClickListener = async function (e) {
            // Verhindere, dass Klicks auf Avatare oder Prioritätsicons das Detail-Overlay öffnen
            if (e.target.classList.contains('assigned-initials-circle') || e.target.closest('.priority-icon')) {
                return;
            }

            const taskId = card.id;
            const task = boardData.tasks[taskId];
            if (!task) {
                console.error(`Task with ID ${taskId} not found. Cannot open detail overlay.`);
                return;
            }

            if (!detailOverlayElement) {
                console.error('Detail overlay element not initialized. Cannot open detail overlay.');
                return;
            }

            // Öffne das Task-Detail-Anzeige-Overlay
            openSpecificOverlay('overlay-task-detail');

            // Befülle das Task-Detail-Anzeige-Overlay mit den Task-Daten
            const container = detailOverlayElement.querySelector('#task-container');
            if (container) {
                const html = getTaskOverlay(task, taskId, boardData.contacts);
                container.innerHTML = html;
            }

            // Event-Listener für den "Close"-Button im Detail-Overlay
            const closeBtn = detailOverlayElement.querySelector('.close-modal-btn, .close-modal-btn-svg');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    closeSpecificOverlay('overlay-task-detail');
                    if (container) {
                        container.innerHTML = ''; // Inhalt beim Schließen leeren
                    }
                };
            }

            // Füge den Event-Listener für den "Edit"-Button im DETAIL-Overlay hinzu
            const editButton = detailOverlayElement.querySelector('.edit-task-btn');
            if (editButton) {
                // Sicherstellen, dass der Edit-Button die Task-ID kennt (z.B. über data-attribute)
                editButton.dataset.taskId = taskId;

                // Alten Listener entfernen, falls der Button dynamisch neu hinzugefügt/ersetzt wird
                editButton.onclick = null; // Entfernt eventuelle Inline-Handler

                editButton.addEventListener('click', async (event) => {
                    event.stopPropagation(); // Verhindert, dass der Klick auf den Edit-Button das Detail-Overlay schließt
                    const taskToEditId = event.currentTarget.dataset.taskId;
                    const taskToEdit = boardData.tasks[taskToEditId];

                    if (!taskToEdit) {
                        console.error(`Task with ID ${taskToEditId} not found for editing.`);
                        return;
                    }

                    closeSpecificOverlay('overlay-task-detail'); // Schließe das Detail-Overlay
                    openSpecificOverlay('overlay-task-detail-edit'); // Öffne das Bearbeitungs-Overlay

                    if (!editOverlayElement) {
                        console.error('Edit overlay element not initialized. Cannot open edit overlay.');
                        return;
                    }

                    const taskEditContainer = editOverlayElement.querySelector('#task-edit-container');
                    if (taskEditContainer) {
                        // Hier wird die getPopulatedTaskEditFormHtml Funktion aufgerufen und befüllt das Formular
                        const populatedFormHtml = getPopulatedTaskEditFormHtml(taskToEdit, boardData.contacts);
                        taskEditContainer.innerHTML = populatedFormHtml;

                        // --- WICHTIG: Event-Listener für das Bearbeitungsformular NEU REGISTRIEREN ---
                        // Da der innerHTML des taskEditContainer geändert wurde, müssen ALLE Event-Listener
                        // für die interaktiven Elemente im Formular (Buttons, Dropdowns, Subtasks, Datepicker)
                        // hier NEU registriert werden.

                        // Event-Listener für den Abbrechen-Button im Edit-Formular
                        const cancelEditBtn = taskEditContainer.querySelector('.cancel-btn');
                        if (cancelEditBtn) {
                            cancelEditBtn.onclick = () => {
                                closeSpecificOverlay('overlay-task-detail-edit');
                                openSpecificOverlay('overlay-task-detail'); // Optional: Zurück zum Detail-Overlay
                            };
                        }

                        // Event-Listener für das Formular-Submit
                        const taskEditForm = taskEditContainer.querySelector('#add-task-form');
                        if (taskEditForm) {
                            taskEditForm.addEventListener('submit', async (formEvent) => {
                                formEvent.preventDefault();
                                console.log('Edit-Formular abgesendet!');

                                // TODO: Hier die Logik zum Sammeln der Daten aus dem Formular
                                // und zum Speichern der Änderungen aufrufen.
                                // Beispiel:
                                // const formData = new FormData(taskEditForm);
                                // const updatedTask = collectFormData(formData);
                                // await saveUpdatedTask(taskToEditId, updatedTask);

                                closeSpecificOverlay('overlay-task-detail-edit');
                                if (updateBoardFunction) {
                                    await updateBoardFunction(); // Board neu laden/rendern, um Änderungen anzuzeigen
                                }
                            });
                        }

                        // TODO: HIER MÜSSEN DIE INITIALISIERUNGSFUNKTIONEN FÜR DIE KOMPLEXEREN FELDER AUFGERUFEN WERDEN:
                        // PASSE DIESE FUNKTIONSNAMEN UND PARAMETER AN DEINE IMPLEMENTIERUNG AN!
                        // Beispiele:
                        // initPriorityButtonsLogic(taskEditContainer);
                        // initAssignedToDropdownLogic(taskEditContainer, boardData.contacts);
                        // initSubtaskManagementLogic(taskEditContainer);
                        // initDatePicker(taskEditContainer);
                    } else {
                        console.error('Task edit container (#task-edit-container) not found in edit overlay.');
                    }
                });
            } else {
                console.warn('Edit button (.edit-task-btn) not found in detail overlay. Ensure it has this class and data-taskId.');
            }
        };
        card.addEventListener('click', newClickListener);
        card.setAttribute('data-has-click-listener', 'true');
        card._currentClickListener = newClickListener; // Speichern der Referenz für zukünftiges Entfernen
    });
}
