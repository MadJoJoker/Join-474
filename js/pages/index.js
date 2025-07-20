// TO DO:
// focus functions für Password (sichtbar machen, icon-Wechsel)
// chekcbox-function umschreiben auf Wechsel von svgs

let fetchedData = null;

async function initIndex() {
  const data = await getFirebaseData("users"); // ###
  if (!data) {
    console.error('No data received');
    return;
  }
  fetchedData = data;
  console.log("recieved data: ", fetchedData);
}

async function getFirebaseData(path = '') {
  const URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/' + path + '.json';
  try {
    const RESPONSE_FIREBASE = await fetch(URL_FIREBASE_JOIN);
    if (!RESPONSE_FIREBASE.ok) {
      console.error('Network response was not ok:', RESPONSE_FIREBASE.statusText);
      return null;
    }
    const DATA_FIREBASE_JOIN = await RESPONSE_FIREBASE.json();
    return DATA_FIREBASE_JOIN;
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
    return null;
  }
}

function removeOverlay() {
  const overlay = document.querySelector('.idx-overlay');
  const logo = document.querySelector('.floating-logo');
  logo.addEventListener('animationend', () => {
    overlay.classList.add('d-none');
    const logo = document.getElementById('join-logo');
    logo.classList.remove('invisible');
  });
}

function handleLogin(){
  const userEmail = document.getElementById('login-email').value.trim();
  simulateUser(userEmail);
  if (!userEmail) {
    return;
  } else {
    processEmailString(userEmail);
  }
}

function simulateUser(mail) {
  if(!mail) {
  fillLogin()
  return;
} 
  insertDemoMail();
}

function insertDemoMail() {
  fetchedData['Sofia Müller'] = {
    email: "sofiam@gmail.com",
    displayName: "Sofia Müller"
  };
  console.log("temporarly added: Sofia Müller");
}

function processEmailString(userEmail) {
  const foundMail = Object.keys(fetchedData).find(key => fetchedData[key].email.toLowerCase() == userEmail.toLowerCase());
  if(!foundMail) {
    window.location.href = '../html/sign-up.html';
  } else {
    const displayName = checkMail(foundMail);
    initialsForHeader(displayName);
    sessionStorage.setItem('currentUser', displayName);
    let email = validateLoginPassword();
    if(email) {
      window.location.href = '../html/summary.html';
    }
  }
}

function checkMail(foundKey) {
  return fetchedData[foundKey].displayName;
}

function initialsForHeader(displayName) {
  const initials = getInitials(displayName);
  sessionStorage.setItem('headerInitials', initials);
}

function getInitials(fullName) {
  const names = fullName.trim().split(" ");
  if (names.length == 0) return '';
  const first = names[0][0]?.toUpperCase();
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : '';
  return first + last;
}

function directLogin() {
  sessionStorage.setItem('headerInitials', "G");
  sessionStorage.setItem('currentUser', "");
  window.location.href = '../html/summary.html';
}

function checkUser() {
  const newEmail = document.getElementById("new-email").value.trim();
  const existingMail = Object.keys(fetchedData).some(
    key => fetchedData[key].email == newEmail);
  if(existingMail) {
    stopSignIn();
  } else {
    validateInputs();
  }
} 

function validateInputs() {
  let samePasswords = validateRegistrationPasswords();
  if(samePasswords) {
    checkRequiredFields();
  }
}

function checkRequiredFields() {
  const newName = document.getElementById("new-name").value.trim();
  const newEmail = document.getElementById("new-email").value.trim();
  if(newName && newEmail) {
    checkboxChecked();
  } else return;
}

function validateLoginPassword() {
  const pw = document.getElementById('login-password').value;
  const valid = pw != "";
  validateAndMark('.password-frame', valid);
  return valid;
}

function validateRegistrationPasswords() {
  const pw1 = document.getElementById('password-first').value;
  const pw2 = document.getElementById('password-second').value;
  const valid = pw1 != "" && pw1 === pw2;
  validateAndMark('.password-frame', valid);
  return valid;
}

function validateAndMark(selector, isValid) {
  const frames = document.querySelectorAll(selector);
  frames.forEach(frame => {
    frame.classList.toggle('active', !isValid);
  });
  const alertBox = document.getElementById('alert');
  if (!isValid) {
    alertBox.classList.remove('d-none');
  } else {
    alertBox.classList.add('d-none');
  }
}

document.addEventListener('click', e => {
  if (e.target.closest('.input-frame')) {
    document.querySelectorAll('.input-frame.active').forEach(frame => {
      frame.classList.remove('active');
    });
    document.getElementById('alert').classList.add('d-none');
  }
});


// diese F neu schreiben, da keine checkbox mehr existiert
function checkboxChecked() {
  const check = document.getElementById("accept");
  check.checked == true ? objectBuilding() : acceptPrivacyP();
}

// 2 autofill demo functions
let autofill = true;

function fillLogin() {
  if(autofill) {
    document.getElementById('login-email').value = "sofiam@gmail.com";
    document.getElementById('login-password').value = "mypassword123";
    autofill = false;
  }
}

function fillSignup() {
  if(autofill) {
    document.getElementById('new-name').value = "Sofia Müller";
    document.getElementById('new-email').value = "sofiam@gmail.com";
    document.getElementById('password-first').value = "mypassword123";
    document.getElementById('password-second').value = "mypassword123";
    autofill = false;
  }
}


// under construction
// function toggleInputType() {
//   var x = document.getElementById("login-password");
//   if (x.type == "password") {
//     x.type = "text";
//   } else {
//     x.type = "password";
//   }
// }

// **********************************************************
// UPLOAD FUNCTION 
// nice to have: wenn email schon in den Daten: message + abbrechen (kein push). Dafür zurück zum Login

const objectFields = [
  {id: "new-name", key: "displayName"},
  {id: "new-email", key: "email"}
];

async function objectBuilding() {
  const [pushObjectId, entryData] = createNewObject(objectFields, "demoUser");
  // console.log("ready for upload: ", pushObjectId, entryData);
  await sendNewObject(pushObjectId, entryData, "users");
  confirmSignup();
  // resetInputs(fieldMap);
}

function createNewObject(fieldMap, fallbackCategoryString) {
  const entryData = fillObjectFromInputfields(fieldMap);
  specificEntries(entryData);
  // console.log("composed obj.: ", entryData);
  const pushObjectId = getNextIdNumber(fallbackCategoryString);
  console.log("new ID", pushObjectId);
  return [pushObjectId, entryData];
}

function fillObjectFromInputfields(fieldMap) {
  const obj = {};
  loopOverInputs(fieldMap, obj);
  return obj;
}

// die wird auch bei edit-function verwendet
function loopOverInputs(fieldMap, obj) {
  fieldMap.forEach(({ id, key }) => {
    const element = document.getElementById(id);
    const value = element?.value?.trim() ?? "";
    obj[key] = value || "";
  });
  return obj;
}

function getNextIdNumber(category) {
  let lastKey = getLastKey(category);
  // console.log("current last ID: ", lastKey);
  const [prefix, numberStr] = lastKey.split("-");
  const nextNumber = (Number(numberStr) + 1).toString().padStart(3, '0');
  return `${prefix}-${nextNumber}`;
}

function getLastKey(category) {
  if(!fetchedData || Object.keys(fetchedData).length == 0) {
    console.log("you initialized a new category: ", category);
    return `${category}-000`
  } else {
    const itemKeys = Object.keys(fetchedData);
    return itemKeys.at(-1); // ist dasselbe wie: itemKeys[taskKeys.length -1];
  }
}

// braucht es wohl nicht, das macht "submit"
function resetInputs(fieldMap) {
  fieldMap.forEach(({id}) => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
}

// SPEZIFISCHER TEIL "USERS"
function specificEntries(obj) {
  obj.associatedContacts = "";
  // compareAndStorePassword(obj);  // mache ich vielleicht noch für "sign up"
  return obj;
}

async function sendNewObject(pushObjectId, entryData, category) {
  let path = `${category}/${pushObjectId}`;
  // console.log("new path: ", path, entryData);
  // await pushObjectToDatabase(path, entryData);

  // lokales update fürs schnelle Rendern (= kein neuer fetch nötig)
  const localObject = {
    [pushObjectId] : entryData
  };
  console.log("the complete object:" , localObject);
  fetchedData = fetchedData || {};
  Object.assign(fetchedData, localObject);
  console.log("updatete data collection: ", fetchedData);
}

// Hinweis: "path" muß so aussehen: "users/user-014" (Kategory/Key des neuen Eintrags)
async function pushObjectToDatabase(path, data={}) {
  let URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/';
  const res = await fetch(URL_FIREBASE_JOIN + path + '.json', {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
  const result = await res.json();
  console.log("PUT result:", result);
  return result; 
}