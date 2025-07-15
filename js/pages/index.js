// TO DO:
// Password vergleichen
// focus functions für Password (sichtbar machen, icon-Wechsel)

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

// noch zu modularisieren
function handleLogin(){
  console.log("existent data: ", fetchedData);
  const userEmail = document.getElementById('login-email').value;
  const itemKeys = Object.keys(fetchedData);
  const foundKey = itemKeys.find(key => fetchedData[key].email == userEmail);
  if(!foundKey) {
    insertDemoMail();
    return;
  }
  const displayName = checkMail(foundKey);
  console.log("displayName: ", displayName);

  initialsForHeader(displayName);
  sessionStorage.setItem('currentUser', displayName);

  window.location.href = '../html/summary.html';
}

function checkMail(foundKey) {
  if (foundKey) {
    displayName = fetchedData[foundKey].displayName;
    return displayName = fetchedData[foundKey].displayName;
  } else {
    return displayName = insertDemoMail(); 
  }
}

function insertDemoMail() {
  document.getElementById('login-email').value = "demon@work.ch";
  fetchedData['demo-demon'] = {
    email: "demon@work.ch",
    displayName: "mailer demon"
  };
  console.log("Dummy user created: mailer demon");
}

function directLogin() {
  sessionStorage.setItem('headerInitials', "G");
  sessionStorage.setItem('currentUser', "");
  window.location.href = './html/summary.html';
}

function initialsForHeader(displayName) {
  const initials = getInitials(displayName);
  sessionStorage.setItem('headerInitials', initials);
  // console.log("initials: ", initials);
}

function getInitials(fullName) {
  const names = fullName.trim().split(" ");
  if (names.length == 0) return '';
  const first = names[0][0]?.toUpperCase();
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : '';
  return first + last;
}

// sign in
function checkRequiredFields() {
  const newName = document.getElementById("new-name").value;
  const newEmail = document.getElementById("new-email").value;
  if(newName && newEmail) {
    checkboxChecked();
    // console.log("complete sign up data");
  } else return;
}

function checkboxChecked() {
  const check = document.getElementById("accept");
  check.checked == true ? objectBuilding() : acceptPrivacyP();
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
  await pushObjectToDatabase(path, entryData);

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