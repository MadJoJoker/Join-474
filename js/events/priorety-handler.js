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

/** * Sets the button icons for mobile view based on the priority.
 * If the screen width is less than or equal to 370px, it replaces the button content with icons.
 * If the screen width is greater than 370px, it restores the original button content.
 */
export function setButtonIconsMobile() {
    const allButtons = document.querySelectorAll('.priority-btn');
    const isMobile = window.innerWidth <= 370;

    allButtons.forEach(button => {
        const priority = button.dataset.priority;

        if (!button.dataset.originalContent) {
            button.dataset.originalContent = button.innerHTML;
        }

        if (isMobile && button.dataset.hasIcon !== "true") {
            setButtonIcon(button, priority);
        } else if (!isMobile && button.dataset.hasIcon === "true") {
            restoreButtonContent(button);
        }
    });
}

/** * Sets the icon for the button based on the priority.
 * Updates the button's inner HTML and sets a data attribute to indicate it has an icon.
 */
function setButtonIcon(button, priority) {
    if (priority === 'urgent') {
        button.innerHTML = '<img src="../assets/icons/property/urgent.svg" alt="Urgent Icon" />';
    } else if (priority === 'medium') {
        button.innerHTML = '<img src="../assets/icons/property/medium.svg" alt="Medium Icon" />';
    } else if (priority === 'low') {
        button.innerHTML = '<img src="../assets/icons/property/low.svg" alt="Low Icon" />';
    }
    button.dataset.hasIcon = "true";
}

/** * Restores the original content of the button.
 * Removes the icon and resets the button's inner HTML to its original content.
 */
function restoreButtonContent(button) {
    button.innerHTML = button.dataset.originalContent;
    button.dataset.hasIcon = "false";
}