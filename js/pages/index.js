// To do: sign up (neue user erschaffen)
// getFirebaseData importieren (aber bitte mit path-fragment)

let userData = null;

async function initIndex() {
  const data = await getFirebaseData();
  if (!data) {
    console.error('No data received');
    return;
  }
  userData = data;
  // console.log("recieved data: ", userData);
  getNextIdNumber(data, "demoUser"); // nur zum Rumtesten hier; gehört zu sign up
}

async function getFirebaseData() {
  const URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/users.json';
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

// noch zu modularisieren
function handleLogin(){
  console.log("existent data: ", userData);
  const userEmail = document.getElementById('login-email').value;
  const itemKeys = Object.keys(userData);
  const foundKey = itemKeys.find(key => userData[key].email == userEmail);
  if(!foundKey) {
    insertDemoMail();
    return;
  }
  const displayName = checkMail(foundKey);
  console.log("displayName: ", displayName);

  initialsForHeader(displayName);
  sessionStorage.setItem('currentUser', displayName);

  window.location.href = './html/summary.html';
}

function checkMail(foundKey) {
  if (foundKey) {
    displayName = userData[foundKey].displayName;
    return displayName = userData[foundKey].displayName;
  } else {
    return displayName = insertDemoMail(); 
  }
}

function insertDemoMail() {
  document.getElementById('login-email').value = "demon@work.ch";
  userData['demo-demon'] = {
    email: "demon@work.ch",
    displayName: "mailer demon"
  };
  console.log("Dummy user created: mailer demon");
}

function directLogin() {
  sessionStorage.setItem('headerInitials', "G");
  sessionStorage.setItem('currentUser', "guest"); // eher: leerer string
  window.location.href = './html/summary.html';
}

function initialsForHeader(displayName) {
  const initials = getInitials(displayName);
  sessionStorage.setItem('headerInitials', initials);
  console.log("initials: ", initials);
}

function getInitials(fullName) {
  const names = fullName.trim().split(" ");
  if (names.length === 0) return '';

  const firstInitial = names[0][0]?.toUpperCase() || '';
  const lastInitial = names[names.length - 1][0]?.toUpperCase() || '';
  console.log(firstInitial + lastInitial);
  return firstInitial + lastInitial;
}


// demo1@example.de

// Funktionsaufruf, z.B.: getNextIdNumber(data, "user")
function getNextIdNumber(data, categoryItemName) {
  const itemKeys = Object.keys(data);
      // fallback, nicht getestet: falls z.B. "users" noch keinen "user" enthält.
      if(itemKeys.length == 0) {
        console.log("you initialized a new category: ", categoryItemName);
        return categoryItemName + "-0"
      }
  let lastKey = itemKeys.at(-1); // ist dasselbe wie: itemKeys[taskKeys.length -1];
  console.log("current last ID: ", lastKey);

  const parts = lastKey.split("-");
  console.log("splitted: ", parts);
  let [prefix, numberStr] = parts // destructuring: gibt den array-items von "parts" Variablennamen
  console.log("prefix: ", prefix, "; old number: ", numberStr);
  let nextNumber = Number(numberStr) + 1;
  const newId = `${prefix}-${nextNumber}`;
  console.log("next ID: ", newId);
}