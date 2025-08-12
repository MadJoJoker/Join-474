import { isContactSelected } from "../events/dropdown-menu.js";

/** Initializes the drag-and-drop functionality for task cards.
 * Adds event listeners for drag start, drag end, drag over, drag leave, and drop events.
 */
export function initDragAndDrop(container = document) {
  const taskCards = container.querySelectorAll(".task-card");
  taskCards.forEach((card) => {
    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragend", handleDragEnd);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("dragleave", handleDragLeave);
    card.addEventListener("drop", handleDrop);
  });
}

/** Handles the drag start event.
 * Sets the current dragged element and adds a class for styling.
 * @param {DragEvent} event
 */
export function initDatePicker(container = document) {
  const dateInput = container.querySelector("#datepicker");
  if (!dateInput) return;
  // Beispiel: Einfaches Datepicker-Polyfill, kann durch ein echtes Datepicker-Plugin ersetzt werden
  dateInput.addEventListener("focus", () => {
    dateInput.type = "date";
  });
  dateInput.addEventListener("blur", () => {
    dateInput.type = "text";
  });
}

/** Handles the drag start event.
 * Sets the current dragged element and adds a class for styling.
 * @param {DragEvent} event
 */
export function renderTitleInput(task) {
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
                value="${task?.title ? task.title.replace(/"/g, "&quot;") : ""}"
            />
            <div id="title-error" class="error-message">This field is required</div>
        </div>
    `;
}

/** Handles the drag end event.
 * @param {DragEvent} event
 */
export function renderDescriptionInput(task) {
  return `
        <div class="label-container">
            <label for="task-description" class="font-size-20">Description</label>
            <div class="textarea-wrapper">
                <textarea
                    name="task-description"
                    id="task-description"
                    class="task-description-area"
                    placeholder="Enter a Description"
                >${task?.description ? task.description : ""}</textarea>
                <img
                    src="../assets/icons/btn/resize-handle.svg"
                    alt="Resize Handle"
                    class="resize-handle"
                    draggable="false"
                    data-event-handle="true"
                />
            </div>
        </div>
    `;
}

/** Handles the drag over event.
 * @param {DragEvent} event
 */
export function renderDueDateInput(task) {
  let dateValue = "";
  if (task?.dueDate) {
    dateValue = task.dueDate;
  } else if (task?.deadline) {
    let d = new Date(task.deadline);
    if (!isNaN(d)) {
      let day = String(d.getDate()).padStart(2, "0");
      let month = String(d.getMonth() + 1).padStart(2, "0");
      let year = d.getFullYear();
      dateValue = `${day}.${month}.${year}`;
    } else {
      dateValue = task.deadline;
    }
  }
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
                    value="${dateValue}"
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

/** Handles the drag over event.
 * @param {DragEvent} event
 */
export function renderLeftFormFields(task) {
  return `
        <div class="left-form" id="left-form-add-task">
            ${renderTitleInput(task)}
            ${renderDescriptionInput(task)}
            ${renderDueDateInput(task)}
        </div>
    `;
}

/** Handles the drag leave event.
 * @param {DragEvent} event
 */
export function renderPrioritySection(task) {
  return `
        <div class="label-container">
            <fieldset aria-labelledby="priority-legend" style="border: none">
                <legend id="priority-legend" class="font-size-20">Priority</legend>
                <div class="priority-button-container" role="group">
                    <button type="button" class="priority-btn urgent-btn${
                      task?.priority === "urgent" ? " active" : ""
                    }" data-priority="urgent" data-event-handle="true">Urgent 
                        <svg width="21" height="16" viewBox="0 0 21 16" fill="none" title="Urgent Priority Icon" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_353647_4534)">
                            <path d="M19.6528 15.2547C19.4182 15.2551 19.1896 15.1803 19.0007 15.0412L10.7487 8.958L2.49663 15.0412C2.38078 15.1267 2.24919 15.1887 2.10939 15.2234C1.96959 15.2582 1.82431 15.2651 1.68184 15.2437C1.53937 15.2223 1.40251 15.1732 1.27906 15.099C1.15562 15.0247 1.04801 14.927 0.96238 14.8112C0.876751 14.6954 0.814779 14.5639 0.780002 14.4243C0.745226 14.2846 0.738325 14.1394 0.759696 13.997C0.802855 13.7095 0.958545 13.4509 1.19252 13.2781L10.0966 6.70761C10.2853 6.56802 10.5139 6.49268 10.7487 6.49268C10.9835 6.49268 11.212 6.56802 11.4007 6.70761L20.3048 13.2781C20.4908 13.415 20.6286 13.6071 20.6988 13.827C20.7689 14.0469 20.7678 14.2833 20.6955 14.5025C20.6232 14.7216 20.4834 14.9124 20.2962 15.0475C20.1089 15.1826 19.8837 15.2551 19.6528 15.2547Z" 
                            fill="currentColor"/>
                            <path d="M19.6528 9.50568C19.4182 9.50609 19.1896 9.43124 19.0007 9.29214L10.7487 3.20898L2.49663 9.29214C2.26266 9.46495 1.96957 9.5378 1.68184 9.49468C1.39412 9.45155 1.13532 9.29597 0.962385 9.06218C0.789449 8.82838 0.716541 8.53551 0.7597 8.24799C0.802859 7.96048 0.95855 7.70187 1.19252 7.52906L10.0966 0.958588C10.2853 0.818997 10.5139 0.743652 10.7487 0.743652C10.9835 0.743652 11.212 0.818997 11.4007 0.958588L20.3048 7.52906C20.4908 7.66598 20.6286 7.85809 20.6988 8.07797C20.769 8.29785 20.7678 8.53426 20.6955 8.75344C20.6232 8.97262 20.4834 9.16338 20.2962 9.29847C20.1089 9.43356 19.8837 9.50608 19.6528 9.50568Z" 
                            fill="currentColor"/></g><defs><clipPath id="clip0_353647_4534"><rect width="20" height="14.5098" fill="white" transform="translate(0.748535 0.745117)"/></clipPath></defs>
                        </svg>
                    </button>
                    <button type="button" class="priority-btn medium-btn${
                      task?.priority === "medium" ? " active" : ""
                    }" data-priority="medium" data-event-handle="true">Medium 
                        <svg width="18" height="8" viewBox="0 0 18 8" fill="none" title="Medium Priority Icon" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.5685 7.16658L1.43151 7.16658C1.18446 7.16658 0.947523 7.06773 0.772832 6.89177C0.598141 6.71581 0.5 6.47716 0.5 6.22831C0.5 5.97947 0.598141 5.74081 0.772832 5.56485C0.947523 5.38889 1.18446 5.29004 1.43151 5.29004L16.5685 5.29004C16.8155 5.29004 17.0525 5.38889 17.2272 5.56485C17.4019 5.74081 17.5 5.97947 17.5 6.22831C17.5 6.47716 17.4019 6.71581 17.2272 6.89177C17.0525 7.06773 16.8155 7.16658 16.5685 7.16658Z" 
                            fill="currentColor"/>
                            <path d="M16.5685 2.7098L1.43151 2.7098C1.18446 2.7098 0.947523 2.61094 0.772832 2.43498C0.598141 2.25902 0.5 2.02037 0.5 1.77152C0.5 1.52268 0.598141 1.28403 0.772832 1.10807C0.947523 0.932105 1.18446 0.833252 1.43151 0.833252L16.5685 0.833252C16.8155 0.833252 17.0525 0.932105 17.2272 1.10807C17.4019 1.28403 17.5 1.52268 17.5 1.77152C17.5 2.02037 17.4019 2.25902 17.2272 2.43498C17.0525 2.61094 16.8155 2.7098 16.5685 2.7098Z" 
                            fill="currentColor"/>
                        </svg>
                    </button>
                    <button type="button" class="priority-btn low-btn${
                      task?.priority === "low" ? " active" : ""
                    }" data-priority="low" data-event-handle="true">Low 
                        <svg width="21" height="16" viewBox="0 0 21 16" fill="none" title="Low Priority Icon" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.2485 9.50589C10.0139 9.5063 9.7854 9.43145 9.59655 9.29238L0.693448 2.72264C0.57761 2.63708 0.47977 2.52957 0.405515 2.40623C0.33126 2.28289 0.282043 2.14614 0.260675 2.00379C0.217521 1.71631 0.290421 1.42347 0.463337 1.1897C0.636253 0.955928 0.895022 0.800371 1.18272 0.757248C1.47041 0.714126 1.76347 0.786972 1.99741 0.95976L10.2485 7.04224L18.4997 0.95976C18.6155 0.874204 18.7471 0.812285 18.8869 0.777538C19.0266 0.742791 19.1719 0.735896 19.3144 0.757248C19.4568 0.7786 19.5937 0.82778 19.7171 0.901981C19.8405 0.976181 19.9481 1.07395 20.0337 1.1897C20.1194 1.30545 20.1813 1.43692 20.2161 1.57661C20.2509 1.71629 20.2578 1.86145 20.2364 2.00379C20.215 2.14614 20.1658 2.28289 20.0916 2.40623C20.0173 2.52957 19.9195 2.63708 19.8036 2.72264L10.9005 9.29238C10.7117 9.43145 10.4831 9.5063 10.2485 9.50589Z" 
                            fill="currentColor"/>
                            <path d="M10.2485 15.2544C10.0139 15.2548 9.7854 15.18 9.59655 15.0409L0.693448 8.47117C0.459502 8.29839 0.30383 8.03981 0.260675 7.75233C0.217521 7.46485 0.290421 7.17201 0.463337 6.93824C0.636253 6.70446 0.895021 6.54891 1.18272 6.50578C1.47041 6.46266 1.76347 6.53551 1.99741 6.7083L10.2485 12.7908L18.4997 6.7083C18.7336 6.53551 19.0267 6.46266 19.3144 6.50578C19.602 6.54891 19.8608 6.70446 20.0337 6.93824C20.2066 7.17201 20.2795 7.46485 20.2364 7.75233C20.1932 8.03981 20.0376 8.29839 19.8036 8.47117L10.9005 15.0409C10.7117 15.18 10.4831 15.2548 10.2485 15.2544Z" 
                            fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </fieldset>
        </div>
    `;
}

/** Handles the drag leave event.
 * @param {DragEvent} event
 */
export function renderAssignedToSection(task) {
  return `
        <div class="label-container">
            <label for="select-contacts" class="required font-size-20">Assigned to</label>
            <div class="select-wrapper input-field" id="dropdown-assigned-to" data-event-handle="true">
                <input name="select-contacts" type="text" id="select-contacts" class="contact-input" placeholder="Select contacts to assign"
                value="${
                  Array.isArray(task?.assignedTo)
                    ? task.assignedTo.join(", ")
                    : ""
                }" />
                <div class="dropdown-icon-container" id="dropdown-icon-container-one">
                    <img src="../assets/icons/btn/arrow_drop_down.svg" alt="Dropdown Arrow" class="dropdown-icon" id="dropdown-icon-one" />
                </div>
            </div>
            <div class="options-wrapper" id="assigned-to-options-wrapper">
                <div class="assigned-to-options-container" id="assigned-to-options-container"></div>
            </div>
            <div id="assigned-to-area" class="initials-container" style=" border:none"></div>
            <div id="assigned-to-error" class="error-message">This field is required</div>
        </div>
    `;
}

/** Handles the drop event.
 * @param {DragEvent} event
 */
export function renderCategorySection(task) {
  return `
        <div class="label-container">
            <div for="dropdown-category" class="required font-size-20">Category</div>
            <input type="hidden" id="hidden-category-input"
                value="${task?.category || ""}" />
            <div class="select-wrapper input-field" id="dropdown-category" name="category" data-event-handle="true">
                <div class="selected-option"
                    id="selected-category">${
                      task?.category ? task.category : "Select task category"
                    }</div>
                <div class="dropdown-icon-container" id="dropdown-icon-container-two">
                    <img src="../assets/icons/btn/arrow_drop_down.svg" alt="Dropdown Arrow" class="dropdown-icon" id="dropdown-icon-two"/>
                </div>
            </div>
            <div class="options-wrapper" id="category-options-wrapper">
                <div class="category-options-container" id="category-options-container"></div>
            </div>
            <div id="category-error" class="error-message">This field is required</div>
        </div>
    `;
}

/** Handles the drop event.
 * @param {DragEvent} event
 */
export function renderSubtasksSection(task) {
  // Zeige immer die totalSubtasks an
  let subtasksArr = Array.isArray(task?.totalSubtasks)
    ? [...task.totalSubtasks]
    : [];
  return `
        <div class="label-container">
            <label for="subtask-input" class="font-size-20">Subtasks</label>
            <div class="select-wrapper">
                <input type="text" id="subtask-input" class="input-field-subtask" placeholder="Add new subtask" data-event-handle="true"/>
                <div id="subtask-icons" class="input-button" style="opacity: 0;">
                    <button type="button" class="subtask-action-btn" id="subtask-clear-btn" aria-label="Clear Subtask" data-event-handle="true">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.14434 8.40005L2.24434 13.3C2.061 13.4834 1.82767 13.575 1.54434 13.575C1.261 13.575 1.02767 13.4834 0.844336 13.3C0.661003 13.1167 0.569336 12.8834 0.569336 12.6C0.569336 12.3167 0.661003 12.0834 0.844336 11.9L5.74434 7.00005L0.844336 2.10005C0.661003 1.91672 0.569336 1.68338 0.569336 1.40005C0.569336 1.11672 0.661003 0.883382 0.844336 0.700049C1.02767 0.516715 1.261 0.425049 1.54434 0.425049C1.82767 0.425049 2.061 0.516715 2.24434 0.700049L7.14434 5.60005L12.0443 0.700049C12.2277 0.516715 12.461 0.425049 12.7443 0.425049C13.0277 0.425049 13.261 0.516715 13.4443 0.700049C13.6277 0.883382 13.7193 1.11672 13.7193 1.40005C13.7193 1.68338 13.6277 1.91672 13.4443 2.10005L8.54434 7.00005L13.4443 11.9C13.6277 12.0834 13.7193 12.3167 13.7193 12.6C13.7193 12.8834 13.6277 13.1167 13.4443 13.3C13.261 13.4834 13.0277 13.575 12.7443 13.575C12.461 13.575 12.2277 13.4834 12.0443 13.3L7.14434 8.40005Z"
                            fill="#2A3647"/>
                        </svg>
                    </button>
                    <div class="subtask-separator"></div>
                    <button type="button" class="subtask-action-btn" id="subtask-add-task-btn" aria-label="Add Subtask" data-event-handle="true">
                        <svg width="14" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.69474 9.15L14.1697 0.675C14.3697 0.475 14.6072 0.375 14.8822 0.375C15.1572 0.375 15.3947 0.475 15.5947 0.675C15.7947 0.875 15.8947 1.1125 15.8947 1.3875C15.8947 1.6625 15.7947 1.9 15.5947 2.1L6.39474 11.3C6.19474 11.5 5.96141 11.6 5.69474 11.6C5.42807 11.6 5.19474 11.5 4.99474 11.3L0.694738 7C0.494738 6.8 0.398905 6.5625 0.407238 6.2875C0.415572 6.0125 0.519738 5.775 0.719738 5.575C0.919738 5.375 1.15724 5.275 1.43224 5.275C1.70724 5.275 1.94474 5.375 2.14474 5.575L5.69474 9.15Z"
                            fill="#2A3647"/>
                        </svg>
                    </button>
                </div>
                <button type="button" class="input-button" id="add-subtask-btn" aria-label="Plus Icon" style="display: block" data-event-handle="true">
                    <svg width="14" height="14" id="plus-icon" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.14453 8H1.14453C0.861198 8 0.623698 7.90417 0.432031 7.7125C0.240365 7.52083 0.144531 7.28333 0.144531 7C0.144531 6.71667 0.240365 6.47917 0.432031 6.2875C0.623698 6.09583 0.861198 6 1.14453 6H6.14453V1C6.14453 0.716667 6.24036 0.479167 6.43203 0.2875C6.6237 0.0958333 6.8612 0 7.14453 0C7.42786 0 7.66536 0.0958333 7.85703 0.2875C8.0487 0.479167 8.14453 0.716667 8.14453 1V6H13.1445C13.4279 6 13.6654 6.09583 13.857 6.2875C14.0487 6.47917 14.1445 6.71667 14.1445 7C14.1445 7.28333 14.0487 7.52083 13.857 7.7125C13.6654 7.90417 13.4279 8 13.1445 8H8.14453V13C8.14453 13.2833 8.0487 13.5208 7.85703 13.7125C7.66536 13.9042 7.42786 14 7.14453 14C6.8612 14 6.6237 13.9042 6.43203 13.7125C6.24036 13.5208 6.14453 13.2833 6.14453 13V8Z"
                        fill="#2A3647"/>
                    </svg>
                </button>
            </div>
            <ul id="subtasks-list" class="subtasks-list">
                ${subtasksArr.map((st) => `<li>${st}</li>`).join("")}
            </ul>
        </div>
    `;
}

/** Handles the drop event.
 * @param {DragEvent} event
 */
export function renderRightFormFields(task) {
  return `
        <div class="right-form" id="right-form-add-task">
            ${renderPrioritySection(task)}
            ${renderAssignedToSection(task)}
            ${renderCategorySection(task)}
            ${renderSubtasksSection(task)}
        </div>
    `;
}

/** Handles the drop event.
 * @param {DragEvent} event
 */
export function renderFormButtons() {
  return `
        <div class="form-buttons-part" id="form-buttons-part-add-task">
            <div id="sign-info-desktop" class="sign-info">This field is required</div>
            <div class="buttons-area">
                <button type="button" class="create-btn" id="add-task-autofill-btn" data-event-handle="true">
                    Autofill
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="var(--white)" stroke="var(--white)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M3 18h7v1H2V2h17v7h-1V3H3zm15.917 0h-4.834l-1.756 4h-1.093l4.808-10.951h.916L21.766 22h-1.093zm-.439-1L16.5 12.494 14.522 17z"></path>
                        <path fill="none" d="M0 0h24v24H0z"></path></g>
                    </svg>
                </button>
                ${
                  !arguments[0]
                    ? `
                <button type="reset" class="clear-btn" data-event-handle="true">
                    Clear
                        <svg class="x-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 24 24"
                            fill="none">
                            <path
                            d="M12.14 13.4l-4.9 4.9a.95.95 0 0 1-1.4-1.4l4.9-4.9-4.9-4.9a.95.95 0 0 1 1.4-1.4l4.9 4.9 4.9-4.9a.95.95 0 1 1 1.4 1.4l-4.9 4.9 4.9 4.9a.95.95 0 0 1-1.4 1.4l-4.9-4.9z"
                            fill="currentColor" />
                        </svg>
                </button>
                `
                    : ""
                }
                <button type="submit" id="submit-button" class="create-btn" data-event-handle="true">
                    ${arguments[0] ? "OK" : "Create Task"}
                    <img
                        src="../assets/icons/btn/check-mark.svg"
                        alt="Check-mark Icon"
                    />
                </button>
            </div>
        </div>
    `;
}

/** Initializes the task detail edit template.
 * @param {Object} task - The task object to edit.
 */
export function getAddTaskFormHTML(task = null) {
  return `
        <div id="responsive-div-one" class="responsive-div"></div>
        <main id="add-task-main" class="content">
        <div class="size-wrapper">
            ${!task ? `<h1>Add Task</h1>` : ""}
            <form id="add-task-form" class="form">
                <div class="form-fill-part" id="form-fill-part">
                    ${renderLeftFormFields(task)}
                    <div class="border" id="border-add-task"></div>
                    ${renderRightFormFields(task)}
                </div>
                ${renderFormButtons(task)}
            </form>
            </div>
        </main>
        <div id="responsive-div-two" class="responsive-div"></div>
    `;
}

/** * Generates the HTML for the category options.
 * @returns {string} The HTML string for the category options.
 */
export function getCategoryOptions() {
  return `
        <div class="option" data-category="Technical Task">Technical Task</div>
        <div class="option" data-category="User Story">User Story</div>
        <div class="option" data-category="Meeting">Meeting</div>
    `;
}

/** * Renders a single contact option in the dropdown.
 * @param {number} i - The index of the contact.
 * @param {string} name - The name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The avatar color of the contact.
 * @returns {string} The HTML string for the contact option.
 */
export function renderAssignedToContacts(i, name, initials, avatarColor) {
  const isSelected = isContactSelected(name, initials, avatarColor);
  return `
        <div class="contact-option ${isSelected ? "assigned" : ""}"
          data-name="${name}" data-initials="${initials}" data-avatar-color="${avatarColor}">
            <div class="contact-checkbox">
                <div class="initials-container">
                <div class="assigned-initials-circle"style="background-color: var(${avatarColor});">${initials}</div>
                <div>${name}</div>
            </div>
            <img src="../assets/icons/btn/${
              isSelected ? "checkbox-filled-white" : "checkbox-empty-black"
            }.svg"
              alt="checkbox ${isSelected ? "filled" : "empty"}"
              class="checkbox-icon ${isSelected ? "checked" : ""}">
        </div>
    `;
}
