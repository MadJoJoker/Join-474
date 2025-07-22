/**
 *
 * @param {string} window.location.pathname - The current page path used
 * to determine whether certain header UI elements should be hidden.
 */
document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;
  const isHelp = path.includes("help.html");
  const isLegal = path.includes("legal-notice.html");
  const isPrivacy = path.includes("privacy-policy.html");
  if (isHelp || isLegal || isPrivacy) {
    document.body.classList.add("hide-help-icon");
  }
  if (isLegal || isPrivacy) {
    document.body.classList.add("hide-initials");
  }
});