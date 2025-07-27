import {getTaskOverlay} from '../templates/task-details-template.js';

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
 * @param {object} task
 * @returns {{title: string, description: string, type: string, priority: string}}
 */
function getTaskDetails(task) {
    const title = task.title || 'Kein Titel';
    const description = (task.description || '').trim();
    const type = task.type || 'Unbekannt';
    const priority = task.priority || 'Unbekannt';
    return { title, description, type, priority };
}

/**
 * @param {string} type
 * @returns {string}
 */
function getCategoryClass(type) {
    if (type === 'User Story') return 'category-user-story';
    if (type === 'Technical Task') return 'category-technical-task';
    if (type === 'Meeting') return 'category-meeting';
    return 'category-default';
}

/**
 * @param {object} task
 * @returns {{done: number, total: number, percent: number, subText: string}}
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
 * @param {string[]} assignedUserIDs
 * @param {object} contacts
 * @returns {string}
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
 * @param {object} contact
 * @returns {string}
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
 * @param {string} prio
 * @returns {{icon: string, prioText: string}}
 */
function getPriorityIconAndText(prio) {
    if (prio === 'low') return { icon: `../assets/icons/property/low.svg`, prioText: 'Niedrig' };
    if (prio === 'medium') return { icon: `../assets/icons/property/medium.svg`, prioText: 'Mittel' };
    if (prio === 'urgent') return { icon: `../assets/icons/property/urgent.svg`, prioText: 'Dringend' };
    return { icon: `../assets/icons/property/default.svg`, prioText: 'Unbekannt' };
}

/**
 * @param {string} taskID
 * @param {object} taskDetails
 * @param {object} subtaskProgress
 * @param {string} avatarsHtml
 * @param {object} priorityInfo
 * @returns {string}
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
 * @param {object} boardData
 * @param {string} taskID
 * @returns {string}
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

export async function registerTaskCardDetailOverlay(boardData, getTaskOverlay) {
    const cards = document.querySelectorAll('.task-card');

    // Funktion zum Laden des Overlays, damit es nur einmal geladen wird
    let overlayHtmlLoaded = false;
    let overlayElement = null;

    async function loadOverlayHtml() {
        if (overlayHtmlLoaded) return;

        try {
            const response = await fetch('../js/templates/task-details-overlay.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const overlayContainer = document.getElementById('overlay-container');
            if (overlayContainer) {
                overlayContainer.innerHTML = html;
                overlayElement = document.getElementById('overlay-task-detail');
                overlayHtmlLoaded = true;
            } else {
                console.error('Overlay container not found!');
            }
        } catch (error) {
            console.error('Failed to load task-detail-overlay.html:', error);
        }
    }

    await loadOverlayHtml();

    cards.forEach(card => {
        /**
         * @param {MouseEvent} e
         */
        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('assigned-initials-circle') || e.target.closest('.priority-icon')) {
                return;
            }

            const taskId = card.id;
            const task = boardData.tasks[taskId];
            if (!task) {
                return;
            }

            if (!overlayElement) {
                console.error('Overlay element not initialized!');
                return;
            }

            overlayElement.classList.remove('overlay-hidden');

            const container = overlayElement.querySelector('#task-container');
            if (container) {
                const html = getTaskOverlay(task, taskId, boardData.contacts);
                container.innerHTML = html;
            }

            const closeBtn = overlayElement.querySelector('.close-modal-btn, .close-modal-btn-svg');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    overlayElement.classList.add('overlay-hidden');
                    if (container) {
                        container.innerHTML = ''; // Inhalt beim Schließen leeren
                    }
                };
            }
        });
    });
}
