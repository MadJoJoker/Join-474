/**
 * onload-function; main function for including header and sidebar.
 */
async function includeHeaderAndSidebar() {
  await addLayoutElements('../js/templates/header.html', 'header');
  await addLayoutElements('../js/templates/sidebar.html', 'sidebar');
  displayInitialsInHeader();
  partiallyHideSidebar();
  initDropdown();

  updateFaviconForTheme();
  highlightCurrentPage();
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
function partiallyHideSidebar() {
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

/**
 * change colors of the nav-element which corresponds to the page where we are.
 */
function highlightCurrentPage() {
  const pageIds = ["summary", "add-task", "board-site", "contacts", "privacy-policy", "legal-notice"];
  const currentPage = pageIds.find(id => window.location.pathname.includes(id));
  if (currentPage) {
    const sidebarElement = document.getElementById(`${currentPage}Bar`);
    sidebarElement.classList.add("active-page");
  }
}

/**
 * depending on dark-/light-mode, another favicon is used.
 */
function updateFaviconForTheme() {
  const favicon = document.getElementById("favicon");
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  favicon.href = isDark
    ? '../assets/icons/logo/joinLogo.svg'
    : '../assets/icons/logo/whiteJoinLogo.svg';
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateFaviconForTheme);

/**
 * UA sniffing (https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent)
 * Firefox doesn't accept css-properties for "body"; move it to child-element "app-container"
 * Concerns customized scrollbar, esp. in mobilde version.
 */
const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

if (isFirefox) {
  // console.log("user agent: Firefox");
  document.body.classList.remove('scrollable');
  document.querySelector('.app-container')?.classList.add('scrollable');
// } else {
//   console.log("user agent: Chrome, Edge");
}
