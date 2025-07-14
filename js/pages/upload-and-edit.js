let fetchedData = null;

async function initIndex() {
  const data = await getFirebaseData("contacts");
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

// **********************************************************
// db: zweistellige Nummern in "user-01", "task-03"
// Was ist bei "contacts" in etwa "fetchedData"?
// Umgang mit der id, die übergeben werden muß (an edit, delete, save). In Dominiks Obj. ist sie eingebaut
// lokale Daten (in fetchedData sind aktualisiert. Man könnte rendern, wenn Abgleich fertig)
// ++POST/PUT-Funktion sollte später die Methode (POST, PUT) als Param. erhalten (edit-function)
// DELETE-function schreiben

const objectFields = [
  {id: "newContactName", key: "name"},
  {id: "newContactEmail", key: "email"}, // Id im html ergänzt
  {id: "newContactPhone", key: "phone"} // Id im html ergänzt
];

async function startObjectBuilding() {
  const pushObject = createNewObject(objectFields, "contacts");
  console.log("ready for upload: ", pushObject);

  // confirmSignup(); HEISST BEI CONTACTS ANDERS.

  // resetInputs(fieldMap); // wohl unnötig
  // await pushObjectToDatabase("contacts", pushObject); // scharf stellen, wenn Du hochladen willst.
};

function createNewObject(fieldMap, fallbackCategoryString) {
  const userData = fillObjectFromInputfields(fieldMap);
  specificEntries(userData);
  const pushObjectId = getNextIdNumber(fallbackCategoryString);
  console.log("new ID", pushObjectId);
  const completeObject = {
    [pushObjectId]: userData
  };
  console.log("the push-object from input-fields:" , completeObject);
  Object.assign(fetchedData, completeObject); // lokales update fürs Rendern
  // console.log(fetchedData);
  return completeObject; 
}

function fillObjectFromInputfields(fieldMap) {
  const obj = {};
  loopOverInputs(fieldMap, obj);
  console.log("new object - only the key is missing:", obj);
  return obj;
}

// wird auch bei edit-function verwendet
function loopOverInputs(fieldMap, obj) {
  fieldMap.forEach(({ id, key }) => {
    const element = document.getElementById(id);
    const value = element?.value?.trim() ?? "";
    obj[key] = value || "";
  });
  return obj;
}

// die ist etwas zu lang
function getNextIdNumber(categoryItemName) {
  const itemKeys = Object.keys(fetchedData);
    // fallback, nicht getestet: falls z.B. "users" noch keinen "user" enthält.
    if(itemKeys.length == 0) {
      console.log("you initialized a new category: ", categoryItemName);
      return categoryItemName + "-0"
    }
  let lastKey = itemKeys.at(-1); // ist dasselbe wie: itemKeys[taskKeys.length -1];
  console.log("current last ID: ", lastKey);
  const parts = lastKey.split("-");
  let [prefix, numberStr] = parts
  let next = Number(numberStr) + 1;
  let nextNumber = next.toString().padStart(2, '0');
  const newId = `${prefix}-${nextNumber}`;
  // console.log("next ID: ", newId);
  return newId;
}

// braucht es wohl nicht, das macht "submit" (bzw. der Seitenwechsel)
function resetInputs(fieldMap) {
  fieldMap.forEach(({id}) => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
}

// SPEZIFISCHER TEIL "CONTACTS"
function specificEntries(obj) {
  // console.log("draft of obj: ", obj);
  obj.initials = getInitials(obj.displayName || obj.name); // 0: users, 1: contacts
  obj.avatarColor = colorToObject();
  obj.assignedTo = "";
  return obj;
}

function getInitials(fullName) {
  const names = (fullName || "").trim().split(" ");
  const first = names[0]?.[0]?.toUpperCase() || "";
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : "";
  return first + last;
}

// es fehlt noch eine Funktion, die eine Zufallsfarbe wählt und z.B. "var(--dark)" zurückgibt
 function colorToObject() {
  // da müsse  stehen: "return color = deineRandomColor(FarbenArray)",
  return color = "var(--dark)";;
 }
// ENDE SPEZIFISCHER TEIL

async function pushObjectToDatabase(path, data={}) {
  let URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/';
  await fetch(URL_FIREBASE_JOIN + path + '.json', {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
  const result = await res.json();
  console.log("POST result:", result);
  return result; 
}

// EDIT FUNCTION (CONTACTS)

const editFields = [
  {id: "editNameInput", key: "name"},
  {id: "editEmailInput", key: "email"},
  {id: "editPhoneInput", key: "phone"}
];

// Die passt, auch mit loopOver
async function editObjectFromInputfields(fieldMap, objectKey) {
  let entry = fetchedData[objectKey];
  console.log("original entry: ", entry);

  // fieldMap.forEach(({id, key}) => {
  //   const element = document.getElementById(id);
  //   const value = element.value.trim();
  //   entry[key] = value || "";
  // });
  loopOverInputs(fieldMap, entry);

  entry.initials = getInitials(entry.name); // speziell bei "contacts": Initialen könnten sich ändern
  console.log("edited object", entry); // auf dieser Basis könnte man den veränderten Kontakt (oder alles) neu rendern.
  console.log("after editing: ", fetchedData);

  // da fehlt noch etwas, das den Put-Pfad baut ("Kategorie/objectKey")
  // await putObjectToDatabase("contacts/contact-2", entry);
}

// Läßt sich POST und PUT-Funktion kombinieren?
async function putObjectToDatabase(path, data={}) {
  let URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/';
  await fetch(URL_FIREBASE_JOIN + path + '.json', {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
  const result = await res.json();
  console.log("PUT result:", result);
  return result;
}

// DELETE-Function fehlt auch noch.