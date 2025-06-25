const picker = flatpickr("#datepicker", {
    dateFormat: "d.m.Y",
    allowInput: true
});

let isResizing = false;

let startY, startHeight, currentTextarea;

let currentPriority = 'medium';


function formatDate(input) {
    let value = input.value.replace(/\D/g, "");

    if (value.length > 8) value = value.slice(0, 8);

    let formatted = "";
    if (value.length > 4) {
        formatted = value.slice(0, 2) + "." + value.slice(2, 4) + "." + value.slice(4);
    } else if (value.length > 2) {
        formatted = value.slice(0, 2) + "." + value.slice(2);
    } else {
        formatted = value;
    }

    input.value = formatted;
}


function openPicker() {
    picker.open();
}


function startResize(e) {
    isResizing = true;
    currentTextarea = e.target.closest('.textarea-wrapper').querySelector('textarea');
    startY = e.clientY;
    startHeight = currentTextarea.offsetHeight;

    document.onmousemove = resizeTextarea;
    document.onmouseup = stopResize;

    e.preventDefault();
}


function resizeTextarea(e) {
    if (!isResizing) return;

    const newHeight = (startHeight + e.clientY - startY) + 'px';
    currentTextarea.style.height = newHeight;
}


function stopResize() {
    isResizing = false;
    document.onmousemove = null;
    document.onmouseup = null;
}


function setPriority(clickedButton, priority) {

    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }

    clickedButton.classList.add('active');
    currentPriority = priority;
}

function setMedium() {

    const allButtons = document.querySelectorAll('.priority-btn');
    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].classList.remove('active');
    }

    const mediumBtn = document.querySelector('.priority-btn[data-priority="medium"]');
    mediumBtn.classList.add('active');

    currentPriority = 'medium';
}