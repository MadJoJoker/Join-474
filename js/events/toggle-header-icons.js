// hide-help-icon.js

document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;

  const isHelp = path.includes("help.html");
  const isLegal = path.includes("legal-notice.html");
  const isPrivacy = path.includes("privacy-policy.html");

  // Help-Icon ausblenden auf 3 Seiten
  if (isHelp || isLegal || isPrivacy) {
    document.body.classList.add("hide-help-icon");
  }

  // Initialen ausblenden auf Legal & Privacy
  if (isLegal || isPrivacy) {
    document.body.classList.add("hide-initials");
  }
});