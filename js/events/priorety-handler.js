export let currentPriority = 'medium';

/** * Sets the priority of the task based on the clicked button.
 * Updates the active state of the buttons and sets the current priority.
 * @param {HTMLElement} clickedButton - The button that was clicked.
 * @param {string} priority - The priority level to set (e.g. 'low', 'medium', 'high').
 */
export function setPriority(clickedButton, priority) {
    const allButtons = document.querySelectorAll('.priority-btn');
    allButtons.forEach(button => button.classList.remove('active'));
    clickedButton.classList.add('active');
    currentPriority = priority;
}

/** * Sets the priority to 'low' and updates the button state.
 */
export function setMedium() {
    const allButtons = document.querySelectorAll('.priority-btn');
    allButtons.forEach(button => button.classList.remove('active'));
    const mediumBtn = document.querySelector('.priority-btn[data-priority="medium"]');
    if (mediumBtn) {
        mediumBtn.classList.add('active');
    }
    currentPriority = 'medium';
}

/** * Initializes the priority buttons with click event listeners.
 * Sets the initial state of the buttons.
 */
export function initPriorityButtons() {
    document.querySelectorAll('.priority-btn').forEach(button => {
        button.addEventListener('click', (event) => setPriority(event.currentTarget, event.currentTarget.dataset.priority));
    });
    setMedium();
}

export function setButtonIconsMobile() {
    const allButtons = document.querySelectorAll('.priority-btn');
    const isMobile = window.innerWidth <= 370;

    allButtons.forEach(button => {
        const priority = button.dataset.priority;

        // Speichere originalen Inhalt nur einmal
        if (!button.dataset.originalContent) {
            button.dataset.originalContent = button.innerHTML;
        }

        // Icon-Modus aktiv
        if (isMobile && button.dataset.hasIcon !== "true") {
            if (priority === 'urgent') {
                button.innerHTML = '<img src="../assets/icons/property/urgent.svg" alt="Urgent Icon" />';
            } else if (priority === 'medium') {
                button.innerHTML = '<img src="../assets/icons/property/medium.svg" alt="Medium Icon" />';
            } else if (priority === 'low') {
                button.innerHTML = '<img src="../assets/icons/property/low.svg" alt="Low Icon" />';
            }
            button.dataset.hasIcon = "true";

        // Original-Modus aktiv
        } else if (!isMobile && button.dataset.hasIcon === "true") {
            button.innerHTML = button.dataset.originalContent;
            button.dataset.hasIcon = "false";
        }
    });
}
