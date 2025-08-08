/**
 * 2nd onload-function: handles start animation, remove overlay when finished
 */
function removeOverlay() {
  const overlay = document.querySelector('.idx-overlay');
  const logo = document.querySelector('.floating-logo');
  overlay.classList.remove('d-none');
  logo.classList.add('animate');
  setTimeout(() => {
    overlay.classList.add('d-none');
  }, 1000);
}

/**
 * onlick-function of "Login"-button. check input fields for content
 * for demo-mode: call demo-functin "simulateUser"
 */
function handleLogin(){
  clearRedAlerts();
  const userEmail = document.getElementById('login-email').value.trim();
  const userPw = document.getElementById('login-password').value.trim();
  simulateUser(userEmail, userPw);
  if (!userEmail) return blameEmptyInput('login-email', 'alert-login');
  if (!userPw) return blameEmptyInput('login-password', 'alert');
  validateLogin(userEmail, userPw);
}

/**
 * helper function for "handleLogin"; validation of login inputs (filled / empty)
 * @param {string} userEmail
 * @param {string} userPw 
 */
function validateLogin(userEmail, userPw) {
  let validEmail = validateEmail(userEmail);
  let validPw = validatePassword(userPw);
  if(!validEmail && !validPw) {
    blameInvalidInput('alert-login', 'login-email', 'Unkown user. Please sign up');
    goToPage('html/sign-up.html');
    // window.location.href = 'html/sign-up.html';
  } else if(validEmail && validPw) {
    window.location.href = 'html/summary.html';
  } else {
    loginAlert();
  }
}

/**
 * helper function for "validateLogin"; process e-mail string by comparing it to "users"-data in "fetchedData".
 * @param {string} userEmail 
 * @returns boolean
 */
function validateEmail(userEmail) {
    const foundMail = Object.keys(fetchedData).find(
      key => fetchedData[key].email.toLowerCase() == userEmail.toLowerCase()
    );
    if(!foundMail) return false;
    const displayName = fetchedData[foundMail].displayName;
    initialsForHeader(displayName);
    sessionStorage.setItem('currentUser', displayName);
    return true;
}

/**
 * helper function for "validateEmail"; set initials for "header" to sessionStorage.
 * @param {string} displayName - user name corresponding to email-adress
 */
function initialsForHeader(displayName) {
  const initials = getInitials(displayName);
  sessionStorage.setItem('headerInitials', initials);
}

/**
 * helper function for "initialsForHeader"; get initals from first and last part of user name.
 * @param {string} fullName -user name
 * @returns initials (string).
 */
function getInitials(fullName) {
  const names = fullName.trim().split(" ");
  if (names.length == 0) return '';
  const first = names[0][0]?.toUpperCase();
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : '';
  return first + last;
}

/**
* helper function for "validateLogin"; process password string by comparing it to "users"-data in "fetchedData".
 * @param {string} userPw 
 * @returns boolean
 */
function validatePassword(userPw) {
  const foundPassword = Object.keys(fetchedData).find(key => fetchedData[key].password == userPw);
  return !foundPassword ? false : true;
}

/**
 * helper function for "validateLogin"; show alert message and add red input borders
 */
function loginAlert() {
  document.getElementById('login-email').closest('.input-frame').classList.add('active');
  document.getElementById('login-password').closest('.input-frame').classList.add('active');
  document.getElementById('alert').classList.remove('d-none');
}