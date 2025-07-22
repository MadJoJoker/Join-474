// let fetchedData = null;
let currentDataContainer;
let currentCategory = null; // null, if structure of currentDataContainer is flat

// sendNewObject ist zu lang > modularisieren

const objectFields = [
  [
    {id: "new-name", key: "displayName"},
    {id: "new-email", key: "email"}
  ],
  [
    {id: "newContactName", key: "name"},
    {id: "newContactEmail", key: "email"},
    {id: "newContactPhone", key: "phone"}
  ]
]

// eigentlich ist das nur die "user"-main function (ohne "demoUser", mit nur "user", könnte man users und contacts zusammenfassen)
async function objectBuilding(requestedCategory = "users") {
  setDataContainer(requestedCategory);
  let objectFields = chooseFieldsMap(requestedCategory);
  const [pushObjectId, entryData] = createNewObject(objectFields, requestedCategory, "demoUser");
  // console.log("ready for upload: ", pushObjectId, entryData);
  await sendNewObject(pushObjectId, entryData, requestedCategory);
  confirmSignup(); // da bräuchte es auch eine Weiche: users = confirmSignup, contacts = NN (animation)

  // resetInputs(fieldMap);
}

// determine structure of data-source: nested (= complete fetch) or flat (= only "users"-fetch)
function setDataContainer(requestedCategory) {
  if (!fetchedData || typeof fetchedData !== 'object') {
    console.error('no valid fetchedData; processing not possible.');
    currentDataContainer = {};
    currentCategory = null;
    return;
  }
  if (fetchedData[requestedCategory]) {
    currentDataContainer = fetchedData[requestedCategory];
    currentCategory = requestedCategory;
  } else {
    currentDataContainer = fetchedData;
    currentCategory = null;
  }
}

function chooseFieldsMap(requestedCategory) {
  if(requestedCategory == "users") 
    return objectFields[0];
  else if (requestedCategory == "contacts")
    return objectFields[1];
}

function createNewObject(fieldMap, requestedCategory, fallbackCategoryString) {
  // console.log("alle da? ", fieldMap, requestedCategory, fallbackCategoryString);
  const entryData = fillObjectFromInputfields(fieldMap);
  specificEntries(requestedCategory, entryData);
  // console.log("composed obj.: ", entryData);
  const pushObjectId = setNextId(fallbackCategoryString);
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

function specificEntries(requestedCategory, obj) {
  if(requestedCategory == "users") {
    obj.associatedContacts = "";
    return obj;
  } else if (requestedCategory == "contacts") {
    obj.initials = getInitials(obj.name);
    obj.avatarColor = colorToObject();
    obj.assignedTo = "";
    return obj;
  }
}

// speficic functions for "contacts"
function getInitials(fullName) {
  const names = (fullName || "").trim().split(" ");
  const first = names[0]?.[0]?.toUpperCase() || "";
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : "";
  return first + last;
}

// es fehlt Funktion, die eine Zufallsfarbe wählt und z.B. "var(--dark)" zurückgibt
function colorToObject() {
  return color = "--dark";
}
// End of specific functions for "contacts"

function setNextId(category) {
  let lastKey = getLastKey(category);
  // console.log("current last ID: ", lastKey);
  const [prefix, numberStr] = lastKey.split("-");
  const nextNumber = (Number(numberStr) + 1).toString().padStart(3, '0');
  return `${prefix}-${nextNumber}`;
}

function getLastKey(category) {
  if(!currentDataContainer || Object.keys(currentDataContainer).length == 0) {
    console.log("you initialized a new category: ", category);
    return `${category}-000`
  } else {
    const itemKeys = Object.keys(currentDataContainer);
    return itemKeys.at(-1); // ist dasselbe wie: itemKeys[taskKeys.length -1];
  }
}

// function resetInputs(fieldMap) {
//   fieldMap.forEach(({id}) => {
//     const element = document.getElementById(id);
//     if (element) element.value = "";
//   });
// }

// FUNKTION MODULARISIEREN!
async function sendNewObject(pushObjectId, entryData, requestedCategory) {
  const localObject = {[pushObjectId] : entryData};
  console.log("the complete object:" , localObject);
  let path, container;
  if(currentCategory) {         // true, if nested structure of fetchedData in "container"
    path = `${currentCategory}/${pushObjectId}`;
    fetchedData[currentCategory] = fetchedData[currentCategory] || {};  // for localObject, if it's the first instance to assign (s. below)
    container = fetchedData[currentCategory];
  } else {                      // apply, if flat structure of fetchedData in "container"
    path = pushObjectId;
    fetchedData = fetchedData || {}; // for localObject, it it's the first instance to assign (s. below)
    container = fetchedData
  }
  // lokales update fürs schnelle Rendern (= kein neuer fetch nötig)
  currentDataContainer = currentDataContainer || {};
  Object.assign(container, localObject);
  console.log("updated data collection for rendering: ", fetchedData);
  if(localObject[pushObjectId].displayName == "Sofia Müller") return;
  else {
    let firebasePath = `${requestedCategory}/${pushObjectId}`
  console.log("Firebase-update path: ", firebasePath, entryData);
  // await pushObjectToDatabase(firebasPath, entryData);
  }
}

// "path" muß so aussehen: "users/user-014" (Kategory/Key des neuen Eintrags)
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


// EDIT FUNCTION (CONTACTS); NICHT ECHT GETESTET
const editFields = [
  {id: "editNameInput", key: "name"},
  {id: "editEmailInput", key: "email"},
  {id: "editPhoneInput", key: "phone"}
];

async function editObjectFromInputfields(fieldMap, objectKey) {
  let entry = fetchedData[objectKey];
  console.log("original entry: ", entry);
  loopOverInputs(fieldMap, entry);
  entry.initials = getInitials(entry.name); // "contacts": Initialen könnten sich ändern
  console.log("edited object", entry); // da müsste der Rücktransfer in das lokale Datenreservoir stattfinden (s. oben)
  console.log("after editing: ", fetchedData);

  let editedContactPath = `contacts/${objectKey}`; // NICHT GETESTET
  // await pushObjectToDatabase(editedContactPath, entry);
}

// delete?