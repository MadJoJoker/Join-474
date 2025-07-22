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

export function enableMouseDragScroll(
    scrollContainer,
    {
        enableHorizontalScroll = true,
        enableVerticalScroll = true
    } = {}
) {
    let isMousePressed = false;
    let initialMouseX;
    let initialMouseY;
    let initialScrollLeft;
    let initialScrollTop;
    scrollContainer.style.cursor = 'grab';
    scrollContainer.addEventListener('mousedown', (mouseEvent) => {
        isMousePressed = true;
        scrollContainer.classList.add('drag-scroll-active');
        initialMouseX = mouseEvent.pageX - scrollContainer.offsetLeft;
        initialMouseY = mouseEvent.pageY - scrollContainer.offsetTop;
        initialScrollLeft = scrollContainer.scrollLeft;
        initialScrollTop = scrollContainer.scrollTop;
        mouseEvent.preventDefault();
    });
    scrollContainer.addEventListener('mouseleave', () => {
        isMousePressed = false;
        scrollContainer.classList.remove('drag-scroll-active');
    });
    scrollContainer.addEventListener('mouseup', () => {
        isMousePressed = false;
        scrollContainer.classList.remove('drag-scroll-active');
    });
    scrollContainer.addEventListener('mousemove', (mouseEvent) => {
        if (!isMousePressed) return;
        mouseEvent.preventDefault();
        const currentMouseX = mouseEvent.pageX - scrollContainer.offsetLeft;
        const currentMouseY = mouseEvent.pageY - scrollContainer.offsetTop;
        if (enableHorizontalScroll) {
            const horizontalMovement = currentMouseX - initialMouseX;
            scrollContainer.scrollLeft = initialScrollLeft - horizontalMovement;
        }
        if (enableVerticalScroll) {
            const verticalMovement = currentMouseY - initialMouseY;
            scrollContainer.scrollTop = initialScrollTop - verticalMovement;
        }
    });
}