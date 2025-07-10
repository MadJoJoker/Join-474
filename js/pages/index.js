// TO DO: post to database-function
// Password vergleichen
// focus functions für Password (sichtbar machen, icon-Wechsel)

let fetchedData = null;

async function initIndex() {
  const data = await getFirebaseData("users");
  if (!data) {
    console.error('No data received');
    return;
  }
  fetchedData = data;
  console.log("recieved data: ", fetchedData);
}

// async function getFirebaseData() {
//   const URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/users.json';
//   try {
//     const RESPONSE_FIREBASE = await fetch(URL_FIREBASE_JOIN);
//     if (!RESPONSE_FIREBASE.ok) {
//       console.error('Network response was not ok:', RESPONSE_FIREBASE.statusText);
//       return null;
//     }
//     const DATA_FIREBASE_JOIN = await RESPONSE_FIREBASE.json();
//     return DATA_FIREBASE_JOIN;
//   } catch (error) {
//     console.error('There was a problem with your fetch operation:', error);
//     return null;
//   }
// }

// Verändert: path als Parameter; Zeile 2: const URL_FIREBASE_JOIN wird zusammengesetzt.
// Aufruf neu: getFirebaseData("users") wenn man nur diese will. getFirebaseData(), wenn man alles haben will.
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
  console.log("initials: ", initials);
}

function getInitials(fullName) {
  const names = fullName.trim().split(" ");
  if (names.length == 0) return '';
  const first = names[0][0]?.toUpperCase();
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : '';
  return first + last;
}

function checkRequiredFields() {
  const newName = document.getElementById("new-name").value;
  const newEmail = document.getElementById("new-email").value;
  if(newName && newEmail) {
    checkboxChecked();
    console.log("complete sign up data");
  } else return;
}

function checkboxChecked() {
  const check = document.getElementById("accept");
  check.checked == true ? startObjectBuilding() : acceptPrivacyP();
}


// under construction
function toggleInputType() {
  var x = document.getElementById("login-password");
  if (x.type == "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

// **********************************************************

// Idee: eine generische Funktion, bei der wir uns auf das Erstellen des neuen Objekts konzentrieren.
// Das Objekt wird befüllt: "id" stammt aus dem html (input-field, das ausgelesen wird),
// "key" ist der key im Objekt der Datenbank (z.B. "taskname")

// Bitte beachten: um eine ID wie etwa "task-2" erstellen zu können, muss weiter oben
// "fetchedData = data;" stehen (hier: l.12). data ist der Inhalt von "users" oder "tasks" oder "contacts"
// Die beiden Namen (newUser, userFields) müsst ihr an euere Bedürfnisse anpassen: newTask, taskFields (z.B.)

let newUser = {
  associatedContacts: "" // wenn dieses leere Ding nicht wäre, würde "let newUser = {}" reichen
};

const userFields = [
  {id: "new-name", key: "displayName"},
  {id: "new-email", key: "email"}
];

// Diese Funktion muß angepasst werden: die beiden Variablen von gerade eben plus der fallback-
// string für die "nexId"Funktion (wenn es hier unter "users" nix findet, macht es selber einen "demouser-0")
async function startObjectBuilding() {
  const pushObject = createNewObject(newUser, userFields, "demoUser");
  console.log("ready for upload: ", pushObject);

  confirmSignup();
  // await pushObjectToDatabase("users", pushObject); // scharf stellen, wenn Du hochladen willst.
};

// Damit ist die Sache für die INPUTS erledigt; den Rest besorgt der weitere Code
// (auch das resetting aller inputs, die oben im Objekt aufgelistet sind). ABER:
// für "contacts" und vor allem "add Task" müssen weitere Einträge an das Obj. übergeben werden (nicht aus inputs)
// für "contacts" ist der Weg skizziert (l. 197 ff.), für "add Task" wird es schwieriger, auch das resetten.

function createNewObject(obj, fieldMap, fallbackCategoryString) {
  fillObjectFromInputfields(obj, fieldMap);
  const pushObjectId = getNextIdNumber(fallbackCategoryString);
  const completeObject = {
    [pushObjectId]: newUser
  };
  console.log("the push-object from input-fields:" , completeObject);
   
  specificEntriesInUsers(obj); // DIESER TEIL WIRD BEI JEDEM ANDERS SEIN; s. unten l. 197 ff.
  // console.log("the push-object with specific details:" , completeObject);

  resetInputs(fieldMap);
  return completeObject;
}

function fillObjectFromInputfields(obj, fieldMap) {
  fieldMap.forEach(({id, key}) => {
    const element = document.getElementById(id);
    obj[key] = element?.value ?? ""; // optional chaining: gibt es einen input oder nicht? (wenn required, dann unnötig)
  });
  console.log("your beautiful new object - only the key is missing:", newUser)
}

// die console.logs kommen weg; ist nur um zu sehen, was sich tut.
function getNextIdNumber(categoryItemName) {
  const itemKeys = Object.keys(fetchedData); // "fetchedData" = Variable mit dem download Inhalt
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
  return newId;
}

function resetInputs(fieldMap) {
  fieldMap.forEach(({id}) => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
}

// Funktionen für "specificEntriesInUsers"; pusht hier testweise die Zusätze von "contacts" in den "user"
function specificEntriesInUsers(obj) {
  initialsToObject(obj);
  colorToObject(obj);
  // compareAndStorePassword(obj);  // mache ich vielleicht noch für "sign up"
}

// Contacts (Versuch, ob die ganze Funktion um solche Spezialitäten erweitert werden kann):
function initialsToObject(obj) {
  const fullName = obj['displayName'];  // ersetze diesen string durch jenen des Namen-key in der Firebase von "contact"
  const initials = getInitials(fullName);
  obj['initials'] = initials; // ersetze diesen string durch jenen des Namen-key in der Firebase von "contact"
}
// es fehlt noch eine Funktion, die eine Zufallsfarbe wählt und z.B. "vvar(--dark)" zurückgibt
 function colorToObject(obj) {
  const color = "var(--dark)"; // da müsse natürlich stehen: "const color = deineRandomColor(FarbenArray)", die eine Farbe returnt
  console.log(color);
  obj['color'] = color; // ersetze diesen string durch jenen des Namen-key in der Firebase von "contact"
 }

async function pushObjectToDatabase(path, data={}) {
  let URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/';
  await fetch(URL_FIREBASE_JOIN + path + '.json', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}
// ENDE DER OBJECT-CREATING AND OPLOAD-FUNCTION

// *****************************************
// Zum Testen (anstelle einer click-function):
// setTimeout(() => {
//   confirmAddedTask();
// }, 500);


// // Anwendung der Animation:
// function acceptPrivacyP() {
//   const text = "Please accept the Privacy Police";
//   const color = "transparent";
//   animateMessageBox(text, color);
// }

// function confirmSignup() {
//   const text = "You signed up successfully";
//   const color = "rgba(0,0,0,0.5)";
//   const link = "./summary.html"
//   animateMessageBox(text, color, link);

//   goToPage(link);
// }

// function confirmAddedTask() {
//   const text = `Task added to board
//     <svg width="30" height="26" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <path class="sidebar-icon" d="M22.9544 2.75564L22.9545 23.21C22.9538 23.8125 22.7142 24.3903 22.2881 24.8163C21.862 25.2424 21.2843 25.4821 20.6817 25.4827L16.1363 25.4827C15.5338 25.4821 14.956 25.2424 14.53 24.8163C14.1039 24.3903 13.8642 23.8125 13.8636 23.21L13.8636 2.75564C13.8642 2.15306 14.1039 1.57534 14.53 1.14926C14.956 0.723172 15.5338 0.483533 16.1363 0.48293L20.6817 0.48293C21.2843 0.483533 21.862 0.723172 22.2881 1.14926C22.7142 1.57534 22.9538 2.15306 22.9544 2.75564ZM16.1363 23.21L20.6817 23.21L20.6817 2.75564L16.1363 2.75564L16.1363 23.21ZM16.1363 2.75564L16.1363 23.21C16.1357 23.8125 15.8961 24.3902 15.47 24.8163C15.0439 25.2424 14.4662 25.482 13.8636 25.4826L9.31823 25.4826C8.71566 25.482 8.13794 25.2424 7.71185 24.8163C7.28577 24.3902 7.04613 23.8125 7.04553 23.2099L7.04553 2.75561C7.04613 2.15304 7.28577 1.57532 7.71185 1.14923C8.13793 0.723148 8.71566 0.483513 9.31823 0.48291L13.8636 0.48291C14.4662 0.483512 15.0439 0.723148 15.47 1.14923C15.8961 1.57532 16.1357 2.15306 16.1363 2.75564ZM9.31823 23.2099L13.8636 23.21L13.8636 2.75564L9.31823 2.75561L9.31823 23.2099ZM9.31823 2.75561L9.31823 23.2099C9.31763 23.8125 9.07799 24.3902 8.65191 24.8163C8.22582 25.2424 7.6481 25.482 7.04553 25.4826L2.50012 25.4826C1.89755 25.482 1.31983 25.2424 0.893741 24.8163C0.467657 24.3902 0.228019 23.8125 0.227417 23.2099L0.227416 2.75561C0.228018 2.15304 0.467656 1.57532 0.89374 1.14923C1.31982 0.723148 1.89755 0.483513 2.50012 0.48291L7.04553 0.48291C7.6481 0.483513 8.22582 0.723148 8.6519 1.14923C9.07799 1.57532 9.31763 2.15304 9.31823 2.75561ZM2.50012 23.2099L7.04553 23.2099L7.04553 2.75561L2.50012 2.75561L2.50012 23.2099Z" fill="currentColor"/>
//       <path class="sidebar-icon" d="M29.7726 2.75589L29.7726 23.2102C29.772 23.8128 29.5323 24.3905 29.1062 24.8166C28.6802 25.2427 28.1024 25.4823 27.4999 25.4829L22.9545 25.4829C22.3519 25.4823 21.7742 25.2427 21.3481 24.8166C20.922 24.3905 20.6824 23.8125 20.6817 23.21L20.6817 2.75564C20.6823 2.15306 20.922 1.57559 21.3481 1.14951C21.7742 0.723424 22.3519 0.483787 22.9544 0.483184L27.4999 0.483184C28.1024 0.483786 28.6801 0.723424 29.1062 1.14951C29.5323 1.57559 29.772 2.15331 29.7726 2.75589ZM22.9545 23.21L27.4999 23.2102L27.4999 2.75589L22.9544 2.75564L22.9545 23.21Z" fill="var(--white)"/>
//     </svg>`;
//   const color = "transparent";
//   const link = "./board-site.html"
//   animateMessageBox(text, color, link);

//   goToPage(link);
// }


// function animateMessageBox(text, color, link="") {
//   addOverlayColor(color);
//   console.log("started");
//   prepareAnimation(text);
//   startAnimation();
// }

// function addOverlayColor(color) {
//   document.querySelector('.index-overlay').style.backgroundColor = color;
// }

// function prepareAnimation(text) {
//   document.getElementById('message-box').innerHTML = text;
//   const overlay = document.getElementById('idx-overlay');
//   overlay.classList.remove('d-none');
// }

// function startAnimation() {
//   setTimeout(() => {
//     const box = document.getElementById('message-box');
//     box.classList.add('animate');
//   }, 200);
// }

// function goToPage(link) {
//   setTimeout(() => {
//     window.location.href = link;
//   }, 2000);
// }

// function closeOverlay() {
//   const overlay = document.getElementById('idx-overlay');
//   overlay.classList.add('d-none');
//   document.querySelector('.message-box').style.opacity = 0;
// }
