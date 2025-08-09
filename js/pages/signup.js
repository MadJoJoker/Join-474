/**
 * onclick-function of "signup" button. check whether user is already registrated.
 */
function checkUser() {
  const nameToCheck = document.getElementById("new-name").value.trim();
  const emailToCheck = document.getElementById("new-email").value.trim();
  const nameExists = doesValueExist(nameToCheck, 'displayName');
  const emailExists = doesValueExist(emailToCheck, 'email');
  if (nameExists && emailExists) {
    blameInvalidInput('no-name', 'new-name', 'You already signed up');
    goToPage("../index.html");
  } else if (!nameToCheck && emailExists) {
    blameEmptyInput("new-name", "no-name");
  } else if (!nameExists && emailExists) {
    blameInvalidInput('no-email', 'new-email', 'Email of registrated user');
  } else {
    handleEmptyInputs(nameToCheck, emailToCheck);
  }
}

/**
 * helper function for "checkUser"; checks whether name or email is already in database
 * @param {string} value - value from user input
 * @param {string} infoKey - checked key of user-informations
 * @returns boolean
 */
function doesValueExist(value, infoKey) {
  return Object.keys(fetchedData).some(
    key => fetchedData[key][infoKey].toLowerCase() == value.toLowerCase()
  );
}

/**
 * helper function for "checkUser"; if both input-fields are filled, pass to validation.
 */
function handleEmptyInputs() {
  const nameValid = blameEmptyInput("new-name", "no-name");
  const emailValid = blameEmptyInput("new-email", "no-email");
  if (nameValid && emailValid) {
    validateInputs();
  }
}

/**
 * main function for signup-validation; progressive validation by calling helper functions.
 */
function validateInputs() {
  const newName = document.getElementById("new-name").value.trim();
  if(!newName) return;
  const validName = validateNamePattern(newName);
  if(!validName) return;
  const newEmail = document.getElementById("new-email").value.trim();
  if (!newEmail) return;
  const validEmail = validateEmailPattern(newEmail);
  if (!validEmail) return;
  const passwordsMatch = passwordLength();
  if (!passwordsMatch) return;
  checkRequiredFields(validEmail);
}

/**
 * helper function for "validateInputs". check for valid pattern (all unicode letter signs ok); if invalid: show red alerts
 * @param {string} name - user name from input
 * @returns boolean
 */
function validateNamePattern(name) {
  const nameRegex = /^\p{L}{2,}(?:[- ]\p{L}{2,})+$/u
  const valid = nameRegex.test(name);
  if(!valid) {
    blameInvalidInput('no-name', 'new-name', 'Enter complete first and last name');
    return false;
  }
  return true;
}

/**
 * helper function for "validateInputs"; check for valid pattern; if invalid: show red alerts
 * @param {string} email - user email
 * @returns boolean
 */
function validateEmailPattern(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const valid = emailRegex.test(email);
  if(!valid) {
    blameInvalidInput('no-email', 'new-email', 'Invalid email pattern');
    return false;
  }
  return true;
}

/**
 * helper function for "validateInputs"; check for minimal password-length of 8 signs
 * @returns boolean
 */
function passwordLength() {
  const pw = document.getElementById('password-first').value;
  if (pw.length < 8) {
    blameInvalidInput('alert', 'password-first', 'Minimal Password length: 8 signs.');
    return false;
  }
  document.getElementById('alert').innerText ="Your passwords don't match. Please try again.";
  validateRegistrationPasswords();
  return validateRegistrationPasswords();
}

/**
 * helper function for "validateInputs"/"passwordLength". check whether passwords are identical.
 * if not: show red alerts.
 * @returns boolean
 */
function validateRegistrationPasswords() {
  document.getElementById('alert').innerText ="Your passwords don't match. Please try again.";
  const pw1 = document.getElementById('password-first').value;
  const pw2 = document.getElementById('password-second').value;
  const valid = pw1 != "" && pw1 == pw2;
  const containersHtml = document.querySelectorAll('.password-frame');
  containersHtml.forEach(container => {
    validateAndMark(container, valid, 'alert');
  });
  return valid;
}

/**
 * helper function for "validateInputs". if form is filled, check "Policy"-checkbox
 * @param {*} validEmail 
 */
function checkRequiredFields(validEmail) {
  const newName = document.getElementById("new-name").value.trim();
  if(newName && validEmail) {
    checkboxChecked();
  } else return;
}

/**
 * helper function for "checkRequiredFieldss". check status of checkbox, start next step.
 */
function checkboxChecked() {
  document.getElementById("unchecked").classList.contains("d-none")
    ? objectBuilding()
    : document.getElementById('no-privPolicy').classList.remove("d-none");
}

/**
 * onclick-function of checkbox "accept policy"; toggle its icons
 */
function toggleCheckbox() {
  const unchecked = document.getElementById('unchecked');
  const checked = document.getElementById('checked');
  const warning = document.getElementById('no-privPolicy');
  unchecked.classList.toggle("d-none");
  checked.classList.toggle("d-none");
  warning.classList.add("d-none");
}

/**
 * popup-message after siccessfil sign up
 */
function confirmSignup() {
  const text = "You signed up successfully";
  const color = "rgba(0, 0, 0, 0.5)";
  const link = "../index.html"
  showPopup(text, color, link);
  goToPage(link);
}

/**
 * main function for popup handling ("signup"-page)
 * @param {string} text - message text to display
 * @param {string} color - background-color of overlay
 * @param {string} link - target of redirection
 */
function showPopup(text, color, link="") {
  document.querySelector('.index-overlay').style.backgroundColor = color;
  document.getElementById('message-box').innerHTML = text;
  const overlay = document.getElementById('idx-overlay');
  overlay.classList.remove('d-none');
  startAnimation();
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
 * remove overlay and message-box.
 */
function closeOverlay() {
  const overlay = document.getElementById('idx-overlay');
  overlay.classList.add('d-none');
  document.querySelector('.blue-box').style.opacity = 0;
}

// goToPage(link) is in: commons-index-signup.js