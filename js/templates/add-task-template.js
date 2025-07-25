/**
 * @returns {string} Der HTML-String für das Add Task Formular.
 */
/**
 * Generiert das HTML für das Titel-Eingabefeld.
 * @returns {string} Der HTML-String für das Titel-Eingabefeld.
 */
function renderTitleInput() {
    return `
        <div class="label-container">
            <label for="title" class="required font-size-20">Title</label>
            <input
                name="title"
                class="input-field"
                type="text"
                id="title"
                placeholder="Enter a title"
                data-event-handle="true"
            />
            <div id="title-error" class="error-message">This field is required</div>
        </div>
    `;
}

/**
 * Generiert das HTML für das Beschreibungs-Textfeld.
 * @returns {string} Der HTML-String für das Beschreibungs-Textfeld.
 */
function renderDescriptionInput() {
    return `
        <div class="label-container">
            <label for="task-description" class="font-size-20">Description</label>
            <div class="textarea-wrapper">
                <textarea
                    name="task-description"
                    id="task-description"
                    class="task-description-area"
                    placeholder="Enter a Description"
                ></textarea>
                <img
                    src="../assets/icons/btn/resize-handle.svg"
                    class="resize-handle"
                    draggable="false"
                    data-event-handle="true"
                />
            </div>
        </div>
    `;
}

/**
 * Generiert das HTML für das Fälligkeitsdatum-Eingabefeld und das Kalender-Icon.
 * @returns {string} Der HTML-String für das Fälligkeitsdatum.
 */
function renderDueDateInput() {
    return `
        <div class="label-container">
            <label for="datepicker" class="required font-size-20">Due Date</label>
            <div class="input-inline">
                <input
                    name="datepicker"
                    id="datepicker"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    class="input-field"
                    data-event-handle="true"
                />
                <span id="calendar-icon" class="calendar-icon" data-event-handle="true">
                    <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.7485 16C11.0485 16 10.4569 15.7583 9.97354 15.275C9.4902 14.7917 9.24854 14.2 9.24854 13.5C9.24854 12.8 9.4902 12.2083 9.97354 11.725C10.4569 11.2417 11.0485 11 11.7485 11C12.4485 11 13.0402 11.2417 13.5235 11.725C14.0069 12.2083 14.2485 12.8 14.2485 13.5C14.2485 14.2 14.0069 14.7917 13.5235 15.275C13.0402 15.7583 12.4485 16 11.7485 16ZM2.24854 20C1.69854 20 1.2277 19.8042 0.836035 19.4125C0.444369 19.0208 0.248535 18.55 0.248535 18V4C0.248535 3.45 0.444369 2.97917 0.836035 2.5875C1.2277 2.19583 1.69854 2 2.24854 2H3.24854V1C3.24854 0.716667 3.34437 0.479167 3.53604 0.2875C3.7277 0.0958333 3.9652 0 4.24854 0C4.53187 0 4.76937 0.0958333 4.96104 0.2875C5.1527 0.479167 5.24854 0.716667 5.24854 1V2H13.2485V1C13.2485 0.716667 13.3444 0.479167 13.536 0.2875C13.7277 0.0958333 13.9652 0 14.2485 0C14.5319 0 14.7694 0.0958333 14.961 0.2875C15.1527 0.479167 15.2485 0.716667 15.2485 1V2H16.2485C16.7985 2 17.2694 2.19583 17.661 2.5875C18.0527 2.97917 18.2485 3.45 18.2485 4V18C18.2485 18.55 18.0527 19.0208 17.661 19.4125C17.2694 19.8042 16.7985 20 16.2485 20H2.24854ZM2.24854 18H16.2485V8H2.24854V18ZM2.24854 6H16.2485V4H2.24854V6Z" fill="#2A3647"/>
                    </svg>
                </span>
            </div>
            <div id="due-date-error" class="error-message">This field is required</div>
        </div>
    `;
}

/**
 * Generiert das HTML für den linken Teil des Formulars (Titel, Beschreibung, Fälligkeitsdatum).
 * @returns {string} Der HTML-String für den linken Formularteil.
 */
function renderLeftFormFields() {
    return `
        <div class="left-form">
            ${renderTitleInput()}
            ${renderDescriptionInput()}
            ${renderDueDateInput()}
        </div>
    `;
}

/**
 * Generiert das HTML für die Prioritätsauswahl-Buttons.
 * @returns {string} Der HTML-String für die Prioritätsauswahl.
 */
function renderPrioritySection() {
    return `
        <div class="label-container">
            <fieldset aria-labelledby="priority-legend" style="border: none">
                <legend id="priority-legend" class="font-size-20">Priority</legend>
                <div class="priority-button-container" role="group">
                    <button
                        type="button"
                        class="priority-btn urgent-btn"
                        data-priority="urgent"
                        data-event-handle="true"
                    >
                        Urgent
                        <img
                            src="../assets/icons/property/urgent.svg"
                            alt="Urgent Icon"
                        />
                    </button>
                    <button
                        type="button"
                        class="priority-btn medium-btn active"
                        data-priority="medium"
                        data-event-handle="true"
                    >
                        Medium
                        <img
                            src="../assets/icons/property/medium.svg"
                            alt="Medium Icon"
                        />
                    </button>
                    <button
                        type="button"
                        class="priority-btn low-btn"
                        data-priority="low"
                        data-event-handle="true"
                    >
                        Low
                        <img
                            src="../assets/icons/property/low.svg"
                            alt="Low Icon"
                        />
                    </button>
                </div>
            </fieldset>
        </div>
    `;
}

/**
 * Generiert das HTML für den "Assigned to"-Dropdown-Bereich.
 * @returns {string} Der HTML-String für den "Assigned to"-Bereich.
 */
function renderAssignedToSection() {
    return `
        <div class="label-container">
            <label for="select-contacts" class="required font-size-20">Assigned to</label>
            <div
                class="select-wrapper input-field"
                id="dropdown-assigned-to"
                data-event-handle="true"
            >
                
                <input name="select-contacts" type="text" id="select-contacts" class="contact-input"
                      placeholder="Select contacts to assign" />

                <div
                    class="dropdown-icon-container"
                    id="dropdown-icon-container-one"
                >
                    <img
                        src="../assets/icons/btn/arrow_drop_down.svg"
                        alt="Dropdown Arrow"
                        class="dropdown-icon"
                        id="dropdown-icon-one"
                    />
                </div>
            </div>
            <div class="options-wrapper" id="assigned-to-options-wrapper">
                <div
                    class="assigned-to-options-container"
                    id="assigned-to-options-container"
                ></div>
            </div>
            <div
                    id="assigned-to-area"
                    class="initials-container"
                    style=" border:none"
            ></div>
            <div id="assigned-to-error" class="error-message">This field is required</div>
        </div>
    `;
}

/**
 * Generiert das HTML für den Kategorie-Dropdown-Bereich.
 * @returns {string} Der HTML-String für den Kategorie-Bereich.
 */
function renderCategorySection() {
    return `
        <div class="label-container">
            <div for="dropdown-category" class="required font-size-20">Category</div>
            <input type="hidden" id="hidden-category-input" />

            <div
                class="select-wrapper input-field"
                id="dropdown-category"
                name="category"
                data-event-handle="true"
            >
                <div class="selected-option" id="selected-category">
                    Select task category
                </div>
                <div
                    class="dropdown-icon-container"
                    id="dropdown-icon-container-two"
                >
                    <img
                        src="../assets/icons/btn/arrow_drop_down.svg"
                        alt="Dropdown Arrow"
                        class="dropdown-icon"
                        id="dropdown-icon-two"
                    />
                </div>
            </div>
            <div class="options-wrapper" id="category-options-wrapper">
                <div
                    class="category-options-container"
                    id="category-options-container"
                ></div>
            </div>
            <div id="category-error" class="error-message">This field is required</div>
        </div>
    `;
}

/**
 * Generiert das HTML für den Subtasks-Eingabebereich und die Liste.
 * @returns {string} Der HTML-String für den Subtasks-Bereich.
 */
function renderSubtasksSection() {
    return `
        <div class="label-container">
            <label for="subtask-input" class="font-size-20">Subtasks</label>
            <div class="select-wrapper">
                <input
                    type="text"
                    id="subtask-input"
                    class="input-field-subtask"
                    placeholder="Add new subtask"
                    data-event-handle="true"
                />
                <div id="subtask-icons" class="input-button" style="opacity: 0;">
                    <button type="button" class="subtask-action-btn" id="subtask-clear-btn" data-event-handle="true">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.14434 8.40005L2.24434 13.3C2.061 13.4834 1.82767 13.575 1.54434 13.575C1.261 13.575 1.02767 13.4834 0.844336 13.3C0.661003 13.1167 0.569336 12.8834 0.569336 12.6C0.569336 12.3167 0.661003 12.0834 0.844336 11.9L5.74434 7.00005L0.844336 2.10005C0.661003 1.91672 0.569336 1.68338 0.569336 1.40005C0.569336 1.11672 0.661003 0.883382 0.844336 0.700049C1.02767 0.516715 1.261 0.425049 1.54434 0.425049C1.82767 0.425049 2.061 0.516715 2.24434 0.700049L7.14434 5.60005L12.0443 0.700049C12.2277 0.516715 12.461 0.425049 12.7443 0.425049C13.0277 0.425049 13.261 0.516715 13.4443 0.700049C13.6277 0.883382 13.7193 1.11672 13.7193 1.40005C13.7193 1.68338 13.6277 1.91672 13.4443 2.10005L8.54434 7.00005L13.4443 11.9C13.6277 12.0834 13.7193 12.3167 13.7193 12.6C13.7193 12.8834 13.6277 13.1167 13.4443 13.3C13.261 13.4834 13.0277 13.575 12.7443 13.575C12.461 13.575 12.2277 13.4834 12.0443 13.3L7.14434 8.40005Z" 
                            fill="#2A3647"/>
                        </svg>
                    </button>
                    <div class="subtask-separator"></div>
                    <button type="button" class="subtask-action-btn" id="subtask-add-task-btn" data-event-handle="true">
                        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.69474 9.15L14.1697 0.675C14.3697 0.475 14.6072 0.375 14.8822 0.375C15.1572 0.375 15.3947 0.475 15.5947 0.675C15.7947 0.875 15.8947 1.1125 15.8947 1.3875C15.8947 1.6625 15.7947 1.9 15.5947 2.1L6.39474 11.3C6.19474 11.5 5.96141 11.6 5.69474 11.6C5.42807 11.6 5.19474 11.5 4.99474 11.3L0.694738 7C0.494738 6.8 0.398905 6.5625 0.407238 6.2875C0.415572 6.0125 0.519738 5.775 0.719738 5.575C0.919738 5.375 1.15724 5.275 1.43224 5.275C1.70724 5.275 1.94474 5.375 2.14474 5.575L5.69474 9.15Z" 
                            fill="#2A3647"/>
                        </svg>
                    </button>
                </div>
                <button
                    type="button"
                    class="input-button"
                    id="add-subtask-btn"
                    style="display: block"
                    data-event-handle="true"
                >
                    <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.14453 8H1.14453C0.861198 8 0.623698 7.90417 0.432031 7.7125C0.240365 7.52083 0.144531 7.28333 0.144531 7C0.144531 6.71667 0.240365 6.47917 0.432031 6.2875C0.623698 6.09583 0.861198 6 1.14453 6H6.14453V1C6.14453 0.716667 6.24036 0.479167 6.43203 0.2875C6.6237 0.0958333 6.8612 0 7.14453 0C7.42786 0 7.66536 0.0958333 7.85703 0.2875C8.0487 0.479167 8.14453 0.716667 8.14453 1V6H13.1445C13.4279 6 13.6654 6.09583 13.857 6.2875C14.0487 6.47917 14.1445 6.71667 14.1445 7C14.1445 7.28333 14.0487 7.52083 13.857 7.7125C13.6654 7.90417 13.4279 8 13.1445 8H8.14453V13C8.14453 13.2833 8.0487 13.5208 7.85703 13.7125C7.66536 13.9042 7.42786 14 7.14453 14C6.8612 14 6.6237 13.9042 6.43203 13.7125C6.24036 13.5208 6.14453 13.2833 6.14453 13V8Z" 
                        fill="#2A3647"/>
                    </svg>
                </button>
            </div>
            <ul id="subtasks-list" class="subtasks-list"></ul>
        </div>
    `;
}

/**
 * Generiert das HTML für den rechten Teil des Formulars (Priorität, Zugewiesen, Kategorie, Unteraufgaben).
 * @returns {string} Der HTML-String für den rechten Formularteil.
 */
function renderRightFormFields() {
    return `
        <div class="right-form">
            ${renderPrioritySection()}
            ${renderAssignedToSection()}
            ${renderCategorySection()}
            ${renderSubtasksSection()}
        </div>
    `;
}

/**
 * Generiert das HTML für die Formular-Buttons (Clear, Create Task).
 * @returns {string} Der HTML-String für die Formular-Buttons.
 */
function renderFormButtons() {
    return `
        <div class="form-buttons-part">
            <div class="sign-info">This field is required</div>
            <div class="buttons-area">
                <button type="reset" class="clear-btn" data-event-handle="true">
                    Clear
                        <svg class="x-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 24 24"
                            fill="none">
                            <path
                            d="M12.14 13.4l-4.9 4.9a.95.95 0 0 1-1.4-1.4l4.9-4.9-4.9-4.9a.95.95 0 0 1 1.4-1.4l4.9 4.9 4.9-4.9a.95.95 0 1 1 1.4 1.4l-4.9 4.9 4.9 4.9a.95.95 0 0 1-1.4 1.4l-4.9-4.9z"
                            fill="currentColor" />
                        </svg>
                </button>
                <button type="submit" class="create-btn" data-event-handle="true">
                    Create Task
                    <img
                        src="../assets/icons/btn/check-mark.svg"
                        alt="Check-mark Icon"
                    />
                </button>
            </div>
        </div>
    `;
}

/**
 * Generiert das vollständige HTML für das "Add Task"-Formular.
 * @returns {string} Der komplette HTML-String für das Add Task Formular.
 */
export function getAddTaskFormHTML() {
    return `
        <main id="add-task-main" class="content">
        <div class="size-wrapper">
            <h1>Add Task</h1>
            <form id="add-task-form" class="form">
                <div class="form-fill-part">
                    ${renderLeftFormFields()}
                    <div class="border"></div>
                    ${renderRightFormFields()}
                </div>
                ${renderFormButtons()}
            </form>
            </div>
        </main>
    `;
}
