async function includeHeaderAndSidebar() {
  await addLayoutElements('../js/templates/header.html', 'header');
  await addLayoutElements('../js/templates/sidebar.html', 'sidebar');
  displayInitialsInHeader();
  partiallyHideSidebar();
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
  const initials = document.getElementById("initials");
  const dropdown = document.getElementById("dropdown");
  initials.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });
  document.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-wrapper")) {
    dropdown.classList.remove("show");
  };
});
}

async function partiallyHideSidebar() {
  const name = sessionStorage.getItem('headerInitials');
  console.log("name: ", name);
  if(!name && (
    window.location.pathname.endsWith("/privacy-policy.html")
    || window.location.pathname.endsWith("/legal-notice.html")
    )) {
    document.getElementById('login-nav').classList.remove("d-none");
    document.getElementById('app-nav').classList.add("hide");
  }
}