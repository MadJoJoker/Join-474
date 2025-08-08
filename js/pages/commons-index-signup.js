// COMMON FUNCTIONS INDEX AND SIGN-UP

let fetchedData = null;

/**
 * onload-function: call database fetch function, store data in global variable "fetchedData"
 */
async function initPage() {
  const data = await getFirebaseData("users");
  if (!data) {
    console.error('No data received');
    return;
  }
  fetchedData = data;
}

/**
 * helper function for "validateLogin", "validateNamePattern", "validateEmailPattern"
 *  display message, add red color
 * @param {string} alertId - id of div which gets message text
 * @param {string} inputId - id of div whose ancestor gets red border
 * @param {string} errorMessage - text describing issue
 * @returns boolean
 */
function blameInvalidInput(alertId, inputId, errorMessage) {
  const alertBox = document.getElementById(alertId);
  const input = document.getElementById(inputId);
  const container = input.closest('.input-frame');
  alertBox.classList.remove('d-none');
  alertBox.innerText = errorMessage;
  container.classList.add('active');
  if(errorMessage.endsWith("signed up")) addGreenColor(container, alertBox);
  return false;
}

/**
 * helper function for "blameInvalidInput"; mark input-frame and message with green color
 * @param {string} container - div whose border gets green color
 * @param {string} alertBox - div whose text gets green color
 */
function addGreenColor(container, alertBox) {
  container.classList.add('active', 'green-border');
  alertBox.classList.add('green');
}
/**
 * helper function for validations; check for empty input; call marker-function, if necessary.
 * @param {string} inputId - id of input-field to check
 * @param {string} alertId - it of alert-message-overlay
 * @returns boolean, used in "processEmailString"
 */
function blameEmptyInput(inputId, alertId) {
  const input = document.getElementById(inputId);
  const field = input.value;
  const valid = field != "";
  const container = input.closest('.input-frame');
  validateAndMark(container, valid, alertId);
  return valid;
}

/**
 * helper function for "blameEmptyInput"; handles red alert elements
 * @param {string} container - parent element of input with colored border
 * @param {boolean} isValid - status of input-field
 * @param {string} alertId - id of alert-message-overlay
 */
function validateAndMark(container, isValid, alertId) {
  const alertBox = document.getElementById(alertId);
  if (!isValid) {
    container.classList.add('active');
    alertBox.classList.remove('d-none');
  } else {
    container.classList.remove('active');
    alertBox.classList.add('d-none');
  }
}

/**
 * input-click function: deactivate red alerts (if activated): hide messages, reset red border.
 */
function clearRedAlerts() {
  document.querySelectorAll('.input-frame.active').forEach(frame => {
    frame.classList.remove('active');
  });
  document.querySelectorAll('.red-alert').forEach(alertBox => {
    alertBox.classList.add('d-none');
  });
}

// PASSWORD ICONS
const closedEyeSVG = `
<svg class="closed-eye" width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M15.2443 10.1084L13.7943 8.65845C13.9443 7.87511 13.7193 7.14178 13.1193 6.45845C12.5193 5.77511 11.7443 5.50845 10.7943 5.65845L9.34434 4.20845C9.62767 4.07511 9.91517 3.97511 10.2068 3.90845C10.4985 3.84178 10.811 3.80845 11.1443 3.80845C12.3943 3.80845 13.4568 4.24595 14.3318 5.12095C15.2068 5.99595 15.6443 7.05845 15.6443 8.30845C15.6443 8.64178 15.611 8.95428 15.5443 9.24595C15.4777 9.53761 15.3777 9.82511 15.2443 10.1084ZM18.4443 13.2584L16.9943 11.8584C17.6277 11.3751 18.1902 10.8459 18.6818 10.2709C19.1735 9.69595 19.5943 9.04178 19.9443 8.30845C19.111 6.62511 17.9152 5.28761 16.3568 4.29595C14.7985 3.30428 13.061 2.80845 11.1443 2.80845C10.661 2.80845 10.186 2.84178 9.71934 2.90845C9.25267 2.97511 8.79434 3.07511 8.34434 3.20845L6.79434 1.65845C7.47767 1.37511 8.17767 1.16261 8.89434 1.02095C9.611 0.879281 10.361 0.808447 11.1443 0.808447C13.5277 0.808447 15.6693 1.43761 17.5693 2.69595C19.4693 3.95428 20.8943 5.59178 21.8443 7.60845C21.8943 7.69178 21.9277 7.79595 21.9443 7.92095C21.961 8.04595 21.9693 8.17511 21.9693 8.30845C21.9693 8.44178 21.9568 8.57095 21.9318 8.69595C21.9068 8.82095 21.8777 8.92511 21.8443 9.00845C21.461 9.85845 20.9818 10.6418 20.4068 11.3584C19.8318 12.0751 19.1777 12.7084 18.4443 13.2584ZM18.2443 18.7084L14.7443 15.2584C14.161 15.4418 13.5735 15.5793 12.9818 15.6709C12.3902 15.7626 11.7777 15.8084 11.1443 15.8084C8.761 15.8084 6.61934 15.1793 4.71934 13.9209C2.81934 12.6626 1.39434 11.0251 0.444336 9.00845C0.394336 8.92511 0.361003 8.82095 0.344336 8.69595C0.327669 8.57095 0.319336 8.44178 0.319336 8.30845C0.319336 8.17511 0.327669 8.05011 0.344336 7.93345C0.361003 7.81678 0.394336 7.71678 0.444336 7.63345C0.794336 6.88345 1.211 6.19178 1.69434 5.55845C2.17767 4.92511 2.711 4.34178 3.29434 3.80845L1.21934 1.70845C1.036 1.52511 0.944336 1.29595 0.944336 1.02095C0.944336 0.745947 1.04434 0.508447 1.24434 0.308447C1.42767 0.125114 1.661 0.0334473 1.94434 0.0334473C2.22767 0.0334473 2.461 0.125114 2.64434 0.308447L19.6443 17.3084C19.8277 17.4918 19.9235 17.7209 19.9318 17.9959C19.9402 18.2709 19.8443 18.5084 19.6443 18.7084C19.461 18.8918 19.2277 18.9834 18.9443 18.9834C18.661 18.9834 18.4277 18.8918 18.2443 18.7084ZM4.69434 5.20845C4.211 5.64178 3.76934 6.11678 3.36934 6.63345C2.96934 7.15011 2.62767 7.70845 2.34434 8.30845C3.17767 9.99178 4.3735 11.3293 5.93184 12.3209C7.49017 13.3126 9.22767 13.8084 11.1443 13.8084C11.4777 13.8084 11.8027 13.7876 12.1193 13.7459C12.436 13.7043 12.761 13.6584 13.0943 13.6084L12.1943 12.6584C12.011 12.7084 11.836 12.7459 11.6693 12.7709C11.5027 12.7959 11.3277 12.8084 11.1443 12.8084C9.89434 12.8084 8.83184 12.3709 7.95684 11.4959C7.08184 10.6209 6.64434 9.55845 6.64434 8.30845C6.64434 8.12511 6.65684 7.95011 6.68184 7.78345C6.70684 7.61678 6.74434 7.44178 6.79434 7.25845L4.69434 5.20845Z" fill="var(--sidebarNoticeGrey)"/>
</svg>`;

const openEyeSVG = `
<svg class="eye-icon open-eye" width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11.1443 12.8083C12.3943 12.8083 13.4568 12.3708 14.3318 11.4958C15.2068 10.6208 15.6443 9.55835 15.6443 8.30835C15.6443 7.05835 15.2068 5.99585 14.3318 5.12085C13.4568 4.24585 12.3943 3.80835 11.1443 3.80835C9.89434 3.80835 8.83184 4.24585 7.95684 5.12085C7.08184 5.99585 6.64434 7.05835 6.64434 8.30835C6.64434 9.55835 7.08184 10.6208 7.95684 11.4958C8.83184 12.3708 9.89434 12.8083 11.1443 12.8083ZM11.1443 11.0083C10.3943 11.0083 9.75684 10.7458 9.23184 10.2208C8.70684 9.69585 8.44434 9.05835 8.44434 8.30835C8.44434 7.55835 8.70684 6.92085 9.23184 6.39585C9.75684 5.87085 10.3943 5.60835 11.1443 5.60835C11.8943 5.60835 12.5318 5.87085 13.0568 6.39585C13.5818 6.92085 13.8443 7.55835 13.8443 8.30835C13.8443 9.05835 13.5818 9.69585 13.0568 10.2208C12.5318 10.7458 11.8943 11.0083 11.1443 11.0083ZM11.1443 15.8083C8.82767 15.8083 6.711 15.1959 4.79434 13.9708C2.87767 12.7458 1.42767 11.0917 0.444336 9.00835C0.394336 8.92502 0.361003 8.82085 0.344336 8.69585C0.327669 8.57085 0.319336 8.44168 0.319336 8.30835C0.319336 8.17502 0.327669 8.04585 0.344336 7.92085C0.361003 7.79585 0.394336 7.69168 0.444336 7.60835C1.42767 5.52502 2.87767 3.87085 4.79434 2.64585C6.711 1.42085 8.82767 0.80835 11.1443 0.80835C13.461 0.80835 15.5777 1.42085 17.4943 2.64585C19.411 3.87085 20.861 5.52502 21.8443 7.60835C21.8943 7.69168 21.9277 7.79585 21.9443 7.92085C21.961 8.04585 21.9693 8.17502 21.9693 8.30835C21.9693 8.44168 21.961 8.57085 21.9443 8.69585C21.9277 8.82085 21.8943 8.92502 21.8443 9.00835C20.861 11.0917 19.411 12.7458 17.4943 13.9708C15.5777 15.1959 13.461 15.8083 11.1443 15.8083ZM11.1443 13.8083C13.0277 13.8083 14.7568 13.3125 16.3318 12.3208C17.9068 11.3292 19.111 9.99168 19.9443 8.30835C19.111 6.62502 17.9068 5.28752 16.3318 4.29585C14.7568 3.30418 13.0277 2.80835 11.1443 2.80835C9.261 2.80835 7.53184 3.30418 5.95684 4.29585C4.38184 5.28752 3.17767 6.62502 2.34434 8.30835C3.17767 9.99168 4.38184 11.3292 5.95684 12.3208C7.53184 13.3125 9.261 13.8083 11.1443 13.8083Z" fill="var(--sidebarNoticeGrey)"/>
</svg>`;

const lockerSVG = `
<svg class="locker-icon" width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 21.5C1.45 21.5 0.979167 21.3042 0.5875 20.9125C0.195833 20.5208 0 20.05 0 19.5V9.5C0 8.95 0.195833 8.47917 0.5875 8.0875C0.979167 7.69583 1.45 7.5 2 7.5H3V5.5C3 4.11667 3.4875 2.9375 4.4625 1.9625C5.4375 0.9875 6.61667 0.5 8 0.5C9.38333 0.5 10.5625 0.9875 11.5375 1.9625C12.5125 2.9375 13 4.11667 13 5.5V7.5H14C14.55 7.5 15.0208 7.69583 15.4125 8.0875C15.8042 8.47917 16 8.95 16 9.5V19.5C16 20.05 15.8042 20.5208 15.4125 20.9125C15.0208 21.3042 14.55 21.5 14 21.5H2ZM2 19.5H14V9.5H2V19.5ZM8 16.5C8.55 16.5 9.02083 16.3042 9.4125 15.9125C9.80417 15.5208 10 15.05 10 14.5C10 13.95 9.80417 13.4792 9.4125 13.0875C9.02083 12.6958 8.55 12.5 8 12.5C7.45 12.5 6.97917 12.6958 6.5875 13.0875C6.19583 13.4792 6 13.95 6 14.5C6 15.05 6.19583 15.5208 6.5875 15.9125C6.97917 16.3042 7.45 16.5 8 16.5ZM5 7.5H11V5.5C11 4.66667 10.7083 3.95833 10.125 3.375C9.54167 2.79167 8.83333 2.5 8 2.5C7.16667 2.5 6.45833 2.79167 5.875 3.375C5.29167 3.95833 5 4.66667 5 5.5V7.5Z" fill="var(--sidebarNoticeGrey)"/>
</svg>`;

/**
 * oninput-function of icon in password input fields
 * while/if input field is empty: show locker-icon; no icon-switch when clicked
 * it input field contains text: show closed-eye-icon; add click-functionality "toggleInputType"
 * @param {string} inputEl - concerned field (this)
 */
function checkInput(inputEl) {
  const frame = inputEl.closest('.input-frame');
  const iconContainer = frame.querySelector('.icon-container');

  if (inputEl.value.trim() != "") {
    iconContainer.innerHTML = closedEyeSVG;
    iconContainer.onclick = () => toggleInputType(inputEl, iconContainer);
  } else {
    iconContainer.innerHTML = lockerSVG;
    iconContainer.onclick = null;
  }
}

/**
 * helper function for "checkInput"; switch password input-type and corresponding icon.
 * preserve switch-possibility for icons by adding onclick-method
 * @param {string} inputEl - concerned password input field
 * @param {string} iconContainer - concerned password icon container
 */
function toggleInputType(inputEl, iconContainer) {
  if (inputEl.type == "password") {
    inputEl.type = "text";
    iconContainer.innerHTML = openEyeSVG;
  } else {
    inputEl.type = "password";
    iconContainer.innerHTML = closedEyeSVG;
  }
  iconContainer.onclick = () => toggleInputType(inputEl, iconContainer);
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