/**
 * Adds click behavior to the back button and ensures it stays
 * visually within the main container even when resizing or zooming.
 */
export function initBackButton() {
    const btn = document.getElementById('backBtn');

    if (btn) {
        btn.addEventListener('click', () => window.history.back());
    }

    // Wait until .backBtn-max-content is in the DOM
    waitForContainerAndPosition();

    // Reposition on resize and scroll
    window.addEventListener('resize', updateBackButtonPosition);
    window.addEventListener('scroll', updateBackButtonPosition);
}

function waitForContainerAndPosition() {
    const maxTries = 20;
    let attempts = 0;

    const interval = setInterval(() => {
        const container = document.querySelector('.backBtn-max-content');
        const btn = document.getElementById('backBtn');

        if (container && btn) {
            updateBackButtonPosition();
            clearInterval(interval);
        }

        attempts++;
        if (attempts >= maxTries) {
            clearInterval(interval); // stop after 20 tries (2 seconds)
            console.warn("Back button container not found in time.");
        }
    }, 100); // check every 100ms
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
    const minRightPadding = 0;
    const computedRight = Math.max(distanceFromRightEdge + minRightPadding, minRightPadding);
    backBtn.style.right = `${computedRight}px`;
}