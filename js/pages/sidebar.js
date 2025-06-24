function setSidebarIcon(triggeredElement, filename) {
  const img = triggeredElement.querySelector("img");
  img.src = '../assets/icons/sidebar/' + filename;
}
