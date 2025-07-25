/**
 * Enables mouse drag-to-scroll on a given scrollable container.
 * Allows users to scroll horizontally and/or vertically by clicking and dragging with the mouse.
 *
 * @param {HTMLElement} scrollContainer - The element with scrollable overflow
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.enableHorizontalScroll=true] - Whether to allow horizontal scrolling via drag
 * @param {boolean} [options.enableVerticalScroll=true] - Whether to allow vertical scrolling via drag
 */

console.log('drag-to-scroll loaded');

export function enableMouseDragScroll(scrollContainer, options = {}) {
    const dragState = createScrollState(scrollContainer, options);
    bindMouseDragEvents(scrollContainer, dragState);
}

/**
 * Creates an object that stores the current drag state.
 */
function createScrollState(container, { enableHorizontalScroll = true, enableVerticalScroll = true }) {
    return {
        container,
        enableHorizontalScroll,
        enableVerticalScroll,
        isMousePressed: false,
        initialMouseX: 0,
        initialMouseY: 0,
        initialScrollLeft: 0,
        initialScrollTop: 0
    };
}

/**
 * Attaches mouse event listeners to enable dragging.
 */
function bindMouseDragEvents(scrollContainer, dragState) {
    scrollContainer.style.cursor = 'default';
    scrollContainer.addEventListener('mousedown', (mouseEvent) => startMouseDrag(mouseEvent, dragState));
    scrollContainer.addEventListener('mouseup', () => stopMouseDrag(dragState));
    scrollContainer.addEventListener('mouseleave', () => stopMouseDrag(dragState));
    scrollContainer.addEventListener('mousemove', (mouseEvent) => handleMouseMove(mouseEvent, dragState));
}

/**
 * Called when mouse is pressed. Saves initial positions.
 */
function startMouseDrag(mouseEvent, dragState) {
    dragState.isMousePressed = true;
    dragState.initialMouseX = mouseEvent.pageX;
    dragState.initialMouseY = mouseEvent.pageY;
    dragState.initialScrollLeft = dragState.container.scrollLeft;
    dragState.initialScrollTop = dragState.container.scrollTop;
    dragState.container.classList.add('drag-scroll-active');
    mouseEvent.preventDefault();
}

/**
 * Called when mouse is released or leaves the container.
 */
function stopMouseDrag(dragState) {
    dragState.isMousePressed = false;
    dragState.container.classList.remove('drag-scroll-active');
}

/**
 * Updates scroll position based on mouse movement.
 */
function handleMouseMove(mouseEvent, dragState) {
    if (!dragState.isMousePressed) return;
    const deltaX = mouseEvent.pageX - dragState.initialMouseX;
    const deltaY = mouseEvent.pageY - dragState.initialMouseY;
    if (dragState.enableHorizontalScroll) {
        dragState.container.scrollLeft = dragState.initialScrollLeft - deltaX;
    }
    if (dragState.enableVerticalScroll) {
        dragState.container.scrollTop = dragState.initialScrollTop - deltaY;
    }
    mouseEvent.preventDefault();
}
