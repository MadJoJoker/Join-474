/**
 * 4 popup-message calls for "signup"
 */
function acceptPrivacyP() {
  const text = "Please accept the Privacy Policy";
  const color = "transparent";
  animateMessageBox(text, color);
}

function confirmSignup() {
  const text = "You signed up successfully";
  const color = "rgba(0, 0, 0, 0.5)";
  const link = "../index.html"
  animateMessageBox(text, color, link);
  goToPage(link);
}

function stopSignIn() {
  const text = "You already signed up";
  const color = "transparent";
  const link = "../index.html"
  animateMessageBox(text, color, link);
  goToPage(link);
}

function emailAlreadyStored() {
  const text = "Email of registrated user";
  const color = "transparent";
  animateMessageBox(text, color);
}

/**
 * main function for popup handling ("signup"-page)
 * @param {string} text - message text to display
 * @param {string} color - background-color of overlay
 * @param {string} link - target of redirection
 */
function animateMessageBox(text, color, link="") {
  addOverlayColor(color);
  prepareAnimation(text);
  startAnimation();
}

/**
 * initialize animation: add background-color to overlay
 * @param {string} color - background-color of overlay
 */
function addOverlayColor(color) {
  document.querySelector('.index-overlay').style.backgroundColor = color;
}

/**
 * fill message-box, remove overlay, ready for animation
 * @param {string} text - message text to display
 */
function prepareAnimation(text) {
  document.getElementById('message-box').innerHTML = text;
  const overlay = document.getElementById('idx-overlay');
  overlay.classList.remove('d-none');
}

/**
 * execute animation after short delai
 */
function startAnimation() {
  setTimeout(() => {
    const box = document.getElementById('message-box');
    box.classList.add('animate');
  }, 200);
}

/**
 * redirect user to target page; delay because of message reading time
 * @param {string} link - target of redirection
 */
function goToPage(link) {
  setTimeout(() => {
    window.location.href = link;
  }, 2000);
}

/**
 * remove overlay and message-box.
 */
function closeOverlay() {
  const overlay = document.getElementById('idx-overlay');
  overlay.classList.add('d-none');
  document.querySelector('.blue-box').style.opacity = 0;
}