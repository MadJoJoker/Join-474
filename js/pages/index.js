// TO DO: post to database-function
// Password vergleichen
// required; sign-up erst freigeben, wenn alles ausgefüllt ist (Password kann man überspringen)
// focus functions für Password (sichtbar machen, icon-Wechsel)
// "successfully signed in"-overlay; dann click darauf und weiter zu summary.

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
    displayName: "demon"
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

// NEUE Version (mit ternary operator)
function getInitials(fullName) {
  const names = fullName.trim().split(" ");
  if (names.length == 0) return '';
  const first = names[0][0]?.toUpperCase();
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : '';
  return first + last;
}



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

// Diese Funktion muß auch angepasst werden: Zeile 2: id des buttons, der das Hinzufügen auslöst
// "createNewObject()"" bekommt drei Parameter: die beiden Konstanten da oben plus der fallback-
// string für die "nexId"Funktion (wenn es hier unter "users" nix findet, macht es selber einen "demouser-0")
// Warum kein onclick? Weil der Funktion Parameter übergeben werden. 
// onclick="createNewObject(newUser, userFields, 'demoUser')" geht nicht (geht nur mit strings)
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("userCreation").addEventListener("click", () => {
    const pushObject = createNewObject(newUser, userFields, "demoUser");
    // console.log("the final push object:", pushObject);
  });
});

// Damit ist die Sache erledigt; den Rest besorgt der weitere Code
// (auch das resetting aller inputs, die oben im Objekt aufgelistet sind)
// disclaimer: ob das mit allen buttons, checkboxes, menus etc. funktioniert, müssen wir testen.

async function createNewObject(obj, fieldMap, fallbackCategoryString) {
  fillObject(obj, fieldMap);
  const pushObjectId = getNextIdNumber(fallbackCategoryString);
  const completeObject = {
    [pushObjectId]: newUser
  };
  console.log("the complete push-object for the database:" , completeObject);
  resetInputs(fieldMap);
  // Luxus: checken, ob user schon in fetchedData ist (name oder email abfragen, in diesem Fall)
  //return completeObject; // provisorisch; damit man es in l. 134 loggen kann.
  await pushObjectToDatabase("users", completeObject);
}

function fillObject(obj, fieldMap) {
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
