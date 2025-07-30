/**
 * onload-function; main function for including header and sidebar.
 */
async function includeHeaderAndSidebar() {
  await addLayoutElements('../js/templates/header.html', 'header');
  await addLayoutElements('../js/templates/sidebar.html', 'sidebar');
  displayInitialsInHeader();
  partiallyHideSidebar();
  initDropdown();
}

/**
 * fetch templates and include them in basic page layout
 * @param {string} path - path of template
 * @param {string} id - id of target-div for template
 * @returns 
 */
async function addLayoutElements(path, id) {
  return fetch(path)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    }
  )
}

/**
 * get initials from sessionStorage and add them to the header-avatar
 */
function displayInitialsInHeader() {
  const name = sessionStorage.getItem('headerInitials');
  if (name) {
    document.getElementById('initials').innerText = name;
  }
}

/**
 * attach dropdown menu to header, define click events (select menu entry / close dropdown)
 */
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

/**
 * security function: user who is not logged in can access to "privacy policy" and "legal notice".
 * from there, access to "summary", "board", "addTask" and "contacts" is blocked by hiding these icons.
 */
async function partiallyHideSidebar() {
  const name = sessionStorage.getItem('headerInitials');
  // console.log("name: ", name);
  if(!name && (
    window.location.pathname.endsWith("/privacy-policy.html")
    || window.location.pathname.endsWith("/legal-notice.html")
    )) {
    document.getElementById('login-nav').classList.remove("d-none");
    document.getElementById('app-nav').classList.add("hide");
  }
}