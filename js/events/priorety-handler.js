export let currentPriority = 'medium';

export function setPriority(clickedButton, priority) {
    // @param {HTMLElement} clickedButton - Der Button, der zur Festlegung der Priorität geklickt wurde.
    // @param {string} priority - Die festzulegende Prioritätsstufe (z.B. 'low', 'medium', 'high').
    const allButtons = document.querySelectorAll('.priority-btn');
    allButtons.forEach(button => button.classList.remove('active'));
    clickedButton.classList.add('active');
    currentPriority = priority;
}

export function setMedium() {
    const allButtons = document.querySelectorAll('.priority-btn');
    allButtons.forEach(button => button.classList.remove('active'));
    const mediumBtn = document.querySelector('.priority-btn[data-priority="medium"]');
    if (mediumBtn) {
        mediumBtn.classList.add('active');
    }
    currentPriority = 'medium';
}

export function initPriorityButtons() {
    document.querySelectorAll('.priority-btn').forEach(button => {
        button.addEventListener('click', (event) => setPriority(event.currentTarget, event.currentTarget.dataset.priority));
    });
    setMedium();
}
