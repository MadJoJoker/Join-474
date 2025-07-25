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

    scrollContainer.style.cursor = 'default';

    scrollContainer.addEventListener('mousedown', (mouseEvent) => {
        isMousePressed = true;
        scrollContainer.classList.add('drag-scroll-active');
        initialMouseX = mouseEvent.pageX;
        initialMouseY = mouseEvent.pageY;
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

        const deltaX = mouseEvent.pageX - initialMouseX;
        const deltaY = mouseEvent.pageY - initialMouseY;

        if (enableHorizontalScroll) {
            const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            const targetScrollLeft = initialScrollLeft - deltaX;
            scrollContainer.scrollLeft = Math.max(0, Math.min(maxScrollLeft, targetScrollLeft));
        }

        if (enableVerticalScroll) {
            const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
            const targetScrollTop = initialScrollTop - deltaY;
            scrollContainer.scrollTop = Math.max(0, Math.min(maxScrollTop, targetScrollTop));
        }
    });
}
