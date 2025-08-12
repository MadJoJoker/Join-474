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
    const isMobile = window.innerWidth <= 460;

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
        button.innerHTML = `<svg width="21" height="16" viewBox="0 0 21 16" fill="none" title="Urgent Priority Icon" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_353647_4534)">
                                <path d="M19.6528 15.2547C19.4182 15.2551 19.1896 15.1803 19.0007 15.0412L10.7487 8.958L2.49663 15.0412C2.38078 15.1267 2.24919 15.1887 2.10939 15.2234C1.96959 15.2582 1.82431 15.2651 1.68184 15.2437C1.53937 15.2223 1.40251 15.1732 1.27906 15.099C1.15562 15.0247 1.04801 14.927 0.96238 14.8112C0.876751 14.6954 0.814779 14.5639 0.780002 14.4243C0.745226 14.2846 0.738325 14.1394 0.759696 13.997C0.802855 13.7095 0.958545 13.4509 1.19252 13.2781L10.0966 6.70761C10.2853 6.56802 10.5139 6.49268 10.7487 6.49268C10.9835 6.49268 11.212 6.56802 11.4007 6.70761L20.3048 13.2781C20.4908 13.415 20.6286 13.6071 20.6988 13.827C20.7689 14.0469 20.7678 14.2833 20.6955 14.5025C20.6232 14.7216 20.4834 14.9124 20.2962 15.0475C20.1089 15.1826 19.8837 15.2551 19.6528 15.2547Z" 
                                fill="currentColor"/>
                                <path d="M19.6528 9.50568C19.4182 9.50609 19.1896 9.43124 19.0007 9.29214L10.7487 3.20898L2.49663 9.29214C2.26266 9.46495 1.96957 9.5378 1.68184 9.49468C1.39412 9.45155 1.13532 9.29597 0.962385 9.06218C0.789449 8.82838 0.716541 8.53551 0.7597 8.24799C0.802859 7.96048 0.95855 7.70187 1.19252 7.52906L10.0966 0.958588C10.2853 0.818997 10.5139 0.743652 10.7487 0.743652C10.9835 0.743652 11.212 0.818997 11.4007 0.958588L20.3048 7.52906C20.4908 7.66598 20.6286 7.85809 20.6988 8.07797C20.769 8.29785 20.7678 8.53426 20.6955 8.75344C20.6232 8.97262 20.4834 9.16338 20.2962 9.29847C20.1089 9.43356 19.8837 9.50608 19.6528 9.50568Z" 
                                fill="currentColor"/></g><defs><clipPath id="clip0_353647_4534"><rect width="20" height="14.5098" fill="white" transform="translate(0.748535 0.745117)"/></clipPath></defs>
                            </svg> `;
    } else if (priority === 'medium') {
        button.innerHTML = `<svg width="18" height="8" viewBox="0 0 18 8" fill="none" title="Medium Priority Icon" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16.5685 7.16658L1.43151 7.16658C1.18446 7.16658 0.947523 7.06773 0.772832 6.89177C0.598141 6.71581 0.5 6.47716 0.5 6.22831C0.5 5.97947 0.598141 5.74081 0.772832 5.56485C0.947523 5.38889 1.18446 5.29004 1.43151 5.29004L16.5685 5.29004C16.8155 5.29004 17.0525 5.38889 17.2272 5.56485C17.4019 5.74081 17.5 5.97947 17.5 6.22831C17.5 6.47716 17.4019 6.71581 17.2272 6.89177C17.0525 7.06773 16.8155 7.16658 16.5685 7.16658Z" 
                                fill="currentColor"/>
                                <path d="M16.5685 2.7098L1.43151 2.7098C1.18446 2.7098 0.947523 2.61094 0.772832 2.43498C0.598141 2.25902 0.5 2.02037 0.5 1.77152C0.5 1.52268 0.598141 1.28403 0.772832 1.10807C0.947523 0.932105 1.18446 0.833252 1.43151 0.833252L16.5685 0.833252C16.8155 0.833252 17.0525 0.932105 17.2272 1.10807C17.4019 1.28403 17.5 1.52268 17.5 1.77152C17.5 2.02037 17.4019 2.25902 17.2272 2.43498C17.0525 2.61094 16.8155 2.7098 16.5685 2.7098Z" 
                                fill="currentColor"/>
                            </svg>`;
    } else if (priority === 'low') {
        button.innerHTML = `<svg width="21" height="16" viewBox="0 0 21 16" fill="none" title="Low Priority Icon" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.2485 9.50589C10.0139 9.5063 9.7854 9.43145 9.59655 9.29238L0.693448 2.72264C0.57761 2.63708 0.47977 2.52957 0.405515 2.40623C0.33126 2.28289 0.282043 2.14614 0.260675 2.00379C0.217521 1.71631 0.290421 1.42347 0.463337 1.1897C0.636253 0.955928 0.895022 0.800371 1.18272 0.757248C1.47041 0.714126 1.76347 0.786972 1.99741 0.95976L10.2485 7.04224L18.4997 0.95976C18.6155 0.874204 18.7471 0.812285 18.8869 0.777538C19.0266 0.742791 19.1719 0.735896 19.3144 0.757248C19.4568 0.7786 19.5937 0.82778 19.7171 0.901981C19.8405 0.976181 19.9481 1.07395 20.0337 1.1897C20.1194 1.30545 20.1813 1.43692 20.2161 1.57661C20.2509 1.71629 20.2578 1.86145 20.2364 2.00379C20.215 2.14614 20.1658 2.28289 20.0916 2.40623C20.0173 2.52957 19.9195 2.63708 19.8036 2.72264L10.9005 9.29238C10.7117 9.43145 10.4831 9.5063 10.2485 9.50589Z" 
                                fill="currentColor"/>
                                <path d="M10.2485 15.2544C10.0139 15.2548 9.7854 15.18 9.59655 15.0409L0.693448 8.47117C0.459502 8.29839 0.30383 8.03981 0.260675 7.75233C0.217521 7.46485 0.290421 7.17201 0.463337 6.93824C0.636253 6.70446 0.895021 6.54891 1.18272 6.50578C1.47041 6.46266 1.76347 6.53551 1.99741 6.7083L10.2485 12.7908L18.4997 6.7083C18.7336 6.53551 19.0267 6.46266 19.3144 6.50578C19.602 6.54891 19.8608 6.70446 20.0337 6.93824C20.2066 7.17201 20.2795 7.46485 20.2364 7.75233C20.1932 8.03981 20.0376 8.29839 19.8036 8.47117L10.9005 15.0409C10.7117 15.18 10.4831 15.2548 10.2485 15.2544Z" 
                                fill="currentColor"/>
                            </svg>`;
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