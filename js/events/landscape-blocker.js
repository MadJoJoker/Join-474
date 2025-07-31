(async function () {
  let overlayLoaded = false;

  async function loadOverlayHTML() {
    const response = await fetch("../js/templates/landscape-warning.html");
    if (!response.ok) {
      console.error("Failed to load landscape-warning.html:", response.status);
      return;
    }
    const html = await response.text();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper.firstElementChild);
    overlayLoaded = true;
  }

  async function showOverlayIfLandscape() {
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    let overlay = document.getElementById("landscape-overlay");

    if (isLandscape) {
      if (!overlayLoaded) {
        await loadOverlayHTML();
        overlay = document.getElementById("landscape-overlay");
      }
      overlay?.classList.add("show");
    } else {
      overlay?.classList.remove("show");
    }
  }

  window.addEventListener("resize", showOverlayIfLandscape);
  showOverlayIfLandscape();
})();