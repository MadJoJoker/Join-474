// sendNewObject ist zu lang > modularisieren

let currentDataContainer;
let currentCategory = null; // remains null, if structure of currentDataContainer is flat

const objectFields = [
  [
    {id: "new-name", key: "displayName"},
    {id: "new-email", key: "email"},
    {id: "password-first" , key: "password"}
  ],
  [
    {id: "newContactName", key: "name"},
    {id: "newContactEmail", key: "email"},
    {id: "newContactPhone", key: "phone"}
  ]
]

/**
 * main function for creating new object ("user" or "contact")
 * @param {string} requestedCategory - "users", "tasks" or "contacts"
 */
async function objectBuilding(requestedCategory = "users") {
  setDataContainer(requestedCategory);
  let objectFields = chooseFieldsMap(requestedCategory);
  const [pushObjectId, entryData] = createNewObject(objectFields, requestedCategory, "demoUser");
  // console.log("ready for upload: ", pushObjectId, entryData);
  await sendNewObject(pushObjectId, entryData, requestedCategory);
  confirmSignup(); // for "users" only
}

/**
 * check structure of fetched data: nested (if all data are fetched) or flat (if only category is fetched)
 * put all "user" / "content"-objects in "currentContainer".
 * @param {string} requestedCategory - "users", "tasks" or "contacts"
 */
function setDataContainer(requestedCategory) {
  if (!fetchedData || typeof fetchedData != 'object') {
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

/**
 * helper function for "objectBuilding": choose FieldsMap which matches requestedCategory
 * @param {string} requestedCategory - "users", "tasks" or "contacts"
 * @returns selected objectFields.
 */
function chooseFieldsMap(requestedCategory) {
  if(requestedCategory == "users") 
    return objectFields[0];
  else if (requestedCategory == "contacts")
    return objectFields[1];
}

/**
 * helper function for "objectBuilding", main processing function; call all helper functions
 * @param {array} fieldMap - use for "fillObjectFromInputFields"
 * @param {string} requestedCategory - "users", "tasks" or "contacts"
 * @param {string} fallbackCategoryString - "user", "task" or "contact"
 * @returns 
 */
function createNewObject(fieldMap, requestedCategory, fallbackCategoryString) {
  const entryData = fillObjectFromInputfields(fieldMap);
  specificEntries(requestedCategory, entryData);
  const pushObjectId = setNextId(fallbackCategoryString);
  console.log("new ID", pushObjectId);
  return [pushObjectId, entryData];
}

/**
 * helper function for "createNewObject"; initialize new object, call fill-function.
 * @param {array} fieldMap - IDs from inputs, keys used in Firebase
 * @returns object containing key-value pairs
 */
function fillObjectFromInputfields(fieldMap) {
  const obj = {};
  loopOverInputs(fieldMap, obj);
  return obj;
}

/**
 * helper function for "fillObjectFromInputFields"; iterate over input fields, fill object.
 * @param {array} fieldMap - IDs from inputs, keys used in Firebase
 * @param {object} obj - initialized new object
 * @returns object containing values from input fields
 */
function loopOverInputs(fieldMap, obj) {
  fieldMap.forEach(({ id, key }) => {
    const element = document.getElementById(id);
    const value = element?.value?.trim() ?? "";
    obj[key] = value || "";
  });
  return obj;
}

/**
 * fork function; call helper function for category-specific object entries
 * @param {string} requestedCategory - "users", "tasks" or "contacts"
 * @param {object} obj - raw, incomplete new object
 * @returns complete new object
 */
function specificEntries(requestedCategory, obj) {
  if(requestedCategory == "users") {
    obj.associatedContacts = "";
    return obj;
  } else if (requestedCategory == "contacts") {
    obj.initials = getInitials(obj.name);
    obj.avatarColor = getRandomColor();
    obj.assignedTo = "";
    return obj;
  }
}

/**
 * specific helper function 1 for "contacts"; extract initials from first and last name part
 * @param {string} fullName - user name
 * @returns initials-string
 */
function getInitials(fullName) {
  const names = (fullName || "").trim().split(" ");
  const first = names[0]?.[0]?.toUpperCase() || "";
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : "";
  return first + last;
}

// es fehlt Funktion, die eine Zufallsfarbe wählt und z.B. "var(--dark)" zurückgibt
function getRandomColor() {
  return color = "--dark";
}


/**
 * helper function for "createNewObject"; extract number from last key ("user-006", "contacts-006"),
 * compose next key
 * @param {string} category - "users", "tasks" or "contacts"
 * @returns new key (string)
 */
function setNextId(category) {
  let lastKey = getLastKey(category);
  const [prefix, numberStr] = lastKey.split("-");
  const nextNumber = (Number(numberStr) + 1).toString().padStart(3, '0');
  return `${prefix}-${nextNumber}`;
}

/**
 * get last existing category-key or initialize category-key
 * @param {string} category - "users", "tasks" or "contacts"
 * @returns last existing (or initialized) key (string)
 */
function getLastKey(category) {
  if(!currentDataContainer || Object.keys(currentDataContainer).length == 0) {
    console.log("you initialized a new category: ", category);
    return `${category}-000`
  } else {
    const itemKeys = Object.keys(currentDataContainer);
    return itemKeys.at(-1)
  }
}

// FUNKTION MODULARISIEREN und kommentieren
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
  // await saveToFirebase(firebasPath, entryData);
  }
}

/**
 * upload function for data traffic to Firebase
 * @param {string} path - fragment of path (pattern: "tasks/task009")
 * @param {object} data - object containing all taks details
 */
async function saveToFirebase(path, data) {
  const url = `https://join-474-default-rtdb.europe-west1.firebasedatabase.app/${path}.json`;
  try {
    const response = await fetch(url, {
      method: data === null ? "DELETE" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: data === null ? undefined : JSON.stringify(data),
    });
    const resText = await response.text();
    console.log("Firebase response:", response.status, resText);
    if (!response.ok) {
      throw new Error("Firebase update failed: " + response.statusText);
    }
  } catch (error) {
    console.error("Fetching data failed:", error);
  }
}

// "path" muß so aussehen: "users/user-014" (Kategory/Key des neuen Eintrags)
// async function pushObjectToDatabase(path, data={}) {
//   let URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/';
//   const res = await fetch(URL_FIREBASE_JOIN + path + '.json', {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(data)
//   });
//   if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
//   const result = await res.json();
//   console.log("PUT result:", result);
//   return result; 
// }

// RAW EDIT FUNCTION (CONTACTS);
const editFields = [
  {id: "editNameInput", key: "name"},
  {id: "editEmailInput", key: "email"},
  {id: "editPhoneInput", key: "phone"}
];

async function editObjectFromInputfields(fieldMap, objectKey) {
  let entry = fetchedData[objectKey]; // Fallunterscheidung, wie oben
  console.log("original entry: ", entry);
  loopOverInputs(fieldMap, entry);
  entry.initials = getInitials(entry.name); // "contacts": Initialen könnten sich ändern
  console.log("edited object", entry); // da müsste der Rücktransfer in das lokale Datenreservoir stattfinden (s. oben)
  console.log("after editing: ", fetchedData);

  let editedContactPath = `contacts/${objectKey}`; // NICHT GETESTET
  // await saveToFirebase(editedContactPath, entry);
}