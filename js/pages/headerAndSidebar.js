async function includeHeaderAndSidebar() {
  await addLayoutElements('../js/templates/header.html', 'header');
  await addLayoutElements('../js/templates/sidebar.html', 'sidebar');
  displayInitialsInHeader();
  initDropdown();
}

async function addLayoutElements(path, id) {
  // const response = await fetch(path);
  // const data = await response.text();
  // document.getElementById(id).innerHTML = data;

  // "return" fehlte, darum hat es mit den Initialen im header nie geklappt.
  // Achtung: das ist nur wegen displayInitialsInHeader (l. 8); ohne die macht "return" den Code sogar kaputt.
  return fetch(path)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    }
  )
}

function displayInitialsInHeader() {
  const name = sessionStorage.getItem('headerInitials');
  if (name) {
    document.getElementById('initials').innerText = name;
  }
}

function initDropdown() {
  // document.addEventListener("DOMContentLoaded", () => {
    const initials = document.getElementById("initials");
    const dropdown = document.getElementById("dropdown");
    initials.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".profile-wrapper")) {
            dropdown.classList.remove("show");
        // }
    };  // hier stand vorher noch eine runde Klammer, die musste auch weg
});
}