// DEMO MODE FUNCTIONS
/**
 * demo function for "handleLogin". If inputs are empty, call autofill and add demo-user's data to "fetchedData".
 * @param {string} mail - string from email input
 * @param {string} userPW - string from password input
 */
function simulateUser(mail, userPw) {
  if(!mail && !userPw) {
    fillLogin();
    return;
  } 
}

let autofill = true;

/**
 * demo onclick-function of "email"-input field in "login". add mock data and ensure icon-change for autofilled password-input.
 * is desactivated after first use; allows user to write own inputs 
 */
function fillLogin() {
  if(!autofill) return;
  document.getElementById('login-email').value = "sofiam@gmail.com";
  const passwordInput = document.getElementById('login-password');
  passwordInput.value = "mypassword123";
  SofiaDetector(passwordInput);
  autofill = false;
}

/**
 * demo onclick-function of "name"-input field in "signup". add mock data and ensure icon-change for autofilled password-input.
 * is desactivated after first use; allows user to write own inputs 
 */
function fillSignup() {
  if(!autofill) return;
  document.getElementById('new-name').value = "Sofia Müller";
  document.getElementById('new-email').value = "sofiam@gmail.com";
  const passwords = [
    document.getElementById('password-first'),
    document.getElementById('password-second')
  ];
  passwords.forEach(pw => {
    pw.value = "mypassword123";
    SofiaDetector(pw);
  });
  autofill = false;
}

/**
 * detect autofilled password input, activate checkInput function (normally an oninput-function)
 * @param {string} passwordInput - value inserted by autofill function in password-input(s)
 */
function SofiaDetector(passwordInput) {
  checkInput(passwordInput, `
  <svg class="closed-eye" width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.2443 10.1084L13.7943 8.65845C13.9443 7.87511 13.7193 7.14178 13.1193 6.45845C12.5193 5.77511 11.7443 5.50845 10.7943 5.65845L9.34434 4.20845C9.62767 4.07511 9.91517 3.97511 10.2068 3.90845C10.4985 3.84178 10.811 3.80845 11.1443 3.80845C12.3943 3.80845 13.4568 4.24595 14.3318 5.12095C15.2068 5.99595 15.6443 7.05845 15.6443 8.30845C15.6443 8.64178 15.611 8.95428 15.5443 9.24595C15.4777 9.53761 15.3777 9.82511 15.2443 10.1084ZM18.4443 13.2584L16.9943 11.8584C17.6277 11.3751 18.1902 10.8459 18.6818 10.2709C19.1735 9.69595 19.5943 9.04178 19.9443 8.30845C19.111 6.62511 17.9152 5.28761 16.3568 4.29595C14.7985 3.30428 13.061 2.80845 11.1443 2.80845C10.661 2.80845 10.186 2.84178 9.71934 2.90845C9.25267 2.97511 8.79434 3.07511 8.34434 3.20845L6.79434 1.65845C7.47767 1.37511 8.17767 1.16261 8.89434 1.02095C9.611 0.879281 10.361 0.808447 11.1443 0.808447C13.5277 0.808447 15.6693 1.43761 17.5693 2.69595C19.4693 3.95428 20.8943 5.59178 21.8443 7.60845C21.8943 7.69178 21.9277 7.79595 21.9443 7.92095C21.961 8.04595 21.9693 8.17511 21.9693 8.30845C21.9693 8.44178 21.9568 8.57095 21.9318 8.69595C21.9068 8.82095 21.8777 8.92511 21.8443 9.00845C21.461 9.85845 20.9818 10.6418 20.4068 11.3584C19.8318 12.0751 19.1777 12.7084 18.4443 13.2584ZM18.2443 18.7084L14.7443 15.2584C14.161 15.4418 13.5735 15.5793 12.9818 15.6709C12.3902 15.7626 11.7777 15.8084 11.1443 15.8084C8.761 15.8084 6.61934 15.1793 4.71934 13.9209C2.81934 12.6626 1.39434 11.0251 0.444336 9.00845C0.394336 8.92511 0.361003 8.82095 0.344336 8.69595C0.327669 8.57095 0.319336 8.44178 0.319336 8.30845C0.319336 8.17511 0.327669 8.05011 0.344336 7.93345C0.361003 7.81678 0.394336 7.71678 0.444336 7.63345C0.794336 6.88345 1.211 6.19178 1.69434 5.55845C2.17767 4.92511 2.711 4.34178 3.29434 3.80845L1.21934 1.70845C1.036 1.52511 0.944336 1.29595 0.944336 1.02095C0.944336 0.745947 1.04434 0.508447 1.24434 0.308447C1.42767 0.125114 1.661 0.0334473 1.94434 0.0334473C2.22767 0.0334473 2.461 0.125114 2.64434 0.308447L19.6443 17.3084C19.8277 17.4918 19.9235 17.7209 19.9318 17.9959C19.9402 18.2709 19.8443 18.5084 19.6443 18.7084C19.461 18.8918 19.2277 18.9834 18.9443 18.9834C18.661 18.9834 18.4277 18.8918 18.2443 18.7084ZM4.69434 5.20845C4.211 5.64178 3.76934 6.11678 3.36934 6.63345C2.96934 7.15011 2.62767 7.70845 2.34434 8.30845C3.17767 9.99178 4.3735 11.3293 5.93184 12.3209C7.49017 13.3126 9.22767 13.8084 11.1443 13.8084C11.4777 13.8084 11.8027 13.7876 12.1193 13.7459C12.436 13.7043 12.761 13.6584 13.0943 13.6084L12.1943 12.6584C12.011 12.7084 11.836 12.7459 11.6693 12.7709C11.5027 12.7959 11.3277 12.8084 11.1443 12.8084C9.89434 12.8084 8.83184 12.3709 7.95684 11.4959C7.08184 10.6209 6.64434 9.55845 6.64434 8.30845C6.64434 8.12511 6.65684 7.95011 6.68184 7.78345C6.70684 7.61678 6.74434 7.44178 6.79434 7.25845L4.69434 5.20845Z"fill="var(--sidebarNoticeGrey)"/>
  </svg>`); 
}

/**
 * onclick demo function for "Guest Log in"; skip login and signup
 */
function directLogin() {
  sessionStorage.setItem('headerInitials', "G");
  sessionStorage.setItem('currentUser', "");
  window.location.href = 'html/summary.html';
}