export function initBackButton() {
    const btn = document.getElementById('backBtn');
    if (btn) {
        btn.addEventListener('click', () => window.history.back());
    }

    updateBackButtonPosition();
    window.addEventListener('resize', updateBackButtonPosition);
    window.addEventListener('scroll', updateBackButtonPosition); // wichtig bei Zoom & scroll
}

/**
 * Positions the back button so that it visually stays inside the 1688px container,
 * even when zooming or resizing the window.
 */
function updateBackButtonPosition() {
    const container = document.querySelector('.backBtn-max-content'); // oder ID, wenn du willst
    const backBtn = document.getElementById('backBtn');

    if (!container || !backBtn) return;

    const containerRect = container.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const containerRight = containerRect.right;
    const distanceFromRightEdge = viewportWidth - containerRight;

    const minRightPadding = 40;

    // Keep the button inside the container + 40px padding
    const computedRight = Math.max(distanceFromRightEdge + minRightPadding, minRightPadding);
    backBtn.style.right = `${computedRight}px`;
}