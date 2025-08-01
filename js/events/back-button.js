/**
 * Dynamically positions the back button so that it stays visually inside
 * the centered container (max-width: 1688px), even when the page is zoomed
 * or the viewport is resized.
 */
function updateBackButtonPosition() {
    const container = document.querySelector('.backBtn-max-content');
    const backBtn = document.getElementById('backBtn');
    if (!container || !backBtn) return;
    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const distanceFromRightEdge = viewportWidth - containerRect.right;
    const minRightPadding = 40;
    const computedRight = Math.max(distanceFromRightEdge + minRightPadding, minRightPadding);
    backBtn.style.right = `${computedRight}px`;
}

/**
 * Positions the back button so that it visually stays inside the 1688px container,
 * even when zooming or resizing the window.
 */
function updateBackButtonPosition() {
    const container = document.querySelector('.backBtn-max-content');
    const backBtn = document.getElementById('backBtn');
    if (!container || !backBtn) return;
    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const containerRight = containerRect.right;
    const distanceFromRightEdge = viewportWidth - containerRight;
    const minRightPadding = 40;
    const computedRight = Math.max(distanceFromRightEdge + minRightPadding, minRightPadding);
    backBtn.style.right = `${computedRight}px`;
}