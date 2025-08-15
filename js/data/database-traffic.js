/**
 * login-fetch function for minimal data traffic. use querystring with "email" and look in database
 * for dataset which matches email login input.
 * @param {string} key - key in Firebase > users to check.
 * @param {string} userEmail - input string.
 * @returns user dataset or empty object.
 * important: need this rule in Firebase:
 * "users": {
 *   ".indexOn": ["email"] 
 * }
 * encodeURIComponent : ensures correct unicode-encoding of string; %22 means "; mandatory for Firebase.
 */
async function checkLogin(key, userEmail) {
  let baseUrl = `https://join-474-default-rtdb.europe-west1.firebasedatabase.app/users.json`;
  let queryString = `?orderBy=%22${key}%22&equalTo=%22${encodeURIComponent(userEmail.toLowerCase())}%22`;
  let url = baseUrl + queryString;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Network response not ok: ', response.statusText);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Problem while fetching: ', error);
    return false;
  }
}

/**
 * fetch data from Firebase, parse them to json for further use.
 * @param {string} path - endpoint in database (empty string, if entire content is fetched)
 * @returns fetched data, parsed to json
 */

async function getFirebaseData(path = '') {
  const url = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/' + path + '.json';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Network response not ok: ', response.statusText);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Problem while fetching: ', error);
    return null;
  }
}


// Function for collecting new user (and potentially new contact) data an store them to Firebase

let currentDataContainer;
let currentCategory = null;

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
 * main function for creating new object ("user" or "contact").
 * @param {string} requestedCategory - "users", "tasks" or "contacts".
 */
async function objectBuilding(requestedCategory = "users") {
  setDataContainer(requestedCategory);
  let objectFields = chooseFieldsMap(requestedCategory);
  const [pushObjectId, entryData] = createNewObject(objectFields, requestedCategory, "demoUser");
  await sendNewObject(pushObjectId, entryData, requestedCategory);
  confirmSignup();
}

/**
 * check structure of fetched data: nested (if all data are fetched) or flat (if only category is fetched).
 * put all "user" / "content"-objects in "currentContainer".
 * @param {string} requestedCategory - "users", "tasks" or "contacts".
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
 * helper function for "objectBuilding": choose FieldsMap which matches requestedCategory.
 * @param {string} requestedCategory - "users", "tasks" or "contacts".
 * @returns selected objectFields.
 */
function chooseFieldsMap(requestedCategory) {
  if(requestedCategory == "users") 
    return objectFields[0];
  else if (requestedCategory == "contacts")
    return objectFields[1];
}

/**
 * helper function for "objectBuilding", main processing function; call all helper functions.
 * @param {array} fieldMap - use for "fillObjectFromInputFields".
 * @param {string} requestedCategory - "users", "tasks" or "contacts".
 * @param {string} fallbackCategoryString - "user", "task" or "contact".
 * @returns array containing new Id and new object data.
 */
function createNewObject(fieldMap, requestedCategory, fallbackCategoryString) {
  const entryData = fillObjectFromInputfields(fieldMap);
  specificEntries(requestedCategory, entryData);
  const pushObjectId = setNextId(fallbackCategoryString);
  return [pushObjectId, entryData];
}

/**
 * helper function for "createNewObject"; initialize new object, call fill-function.
 * @param {array} fieldMap - IDs from inputs, keys used in Firebase.
 * @returns object containing key-value pairs.
 */
function fillObjectFromInputfields(fieldMap) {
  const obj = {};
  loopOverInputs(fieldMap, obj);
  return obj;
}

/**
 * helper function for "fillObjectFromInputFields"; iterate over input fields, fill object.
 * @param {array} fieldMap - IDs from inputs, keys used in Firebase.
 * @param {object} obj - initialized new object.
 * @returns object containing values from input fields.
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
 * fork function; call helper function for category-specific object entries.
 * @param {string} requestedCategory - "users", "tasks" or "contacts".
 * @param {object} obj - raw, incomplete new object.
 * @returns complete new object.
 */
function specificEntries(requestedCategory, obj) {
  if(requestedCategory == "users") {
    obj.associatedContacts = "";
    obj.email = obj.email.toLowerCase();
    return obj;
  } else if (requestedCategory == "contacts") {
    obj.initials = getInitials(obj.name);
    obj.avatarColor = getRandomColor();
    obj.assignedTo = "";
    return obj;
  }
}

/**
 * specific helper function 1 for "contacts"; extract initials from first and last name part.
 * @param {string} fullName - user name.
 * @returns initials-string.
 */
function getInitials(fullName) {
  const names = (fullName || "").trim().split(" ");
  const first = names[0]?.[0]?.toUpperCase() || "";
  const last = names.length > 1 ? names[names.length - 1][0]?.toUpperCase() : "";
  return first + last;
}

// es fehlt Funktion, die eine Zufallsfarbe wählt und z.B. "var(--dark)" zurückgibt.
function getRandomColor() {
  return color = "--dark";
}

/**
 * helper function for "createNewObject"; extract number of last key (e.g. "user-006"), compose next key.
 * @param {string} category - "users", "tasks" or "contacts".
 * @returns new key (string).
 */
function setNextId(category) {
  let lastKey = getLastKey(category);
  const [prefix, numberStr] = lastKey.split("-");
  const nextNumber = (Number(numberStr) + 1).toString().padStart(3, '0');
  return `${prefix}-${nextNumber}`;
}

/**
 * get last existing category-key or initialize category-key.
 * @param {string} category - "users", "tasks" or "contacts".
 * @returns last existing (or initialized) key (string).
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

/**
 * main function for updating local data copy and database on server
 * @param {string} pushObjectId 
 * @param {object} entryData 
 * @param {string} requestedCategory - "users", "tasks" or "contacts"
 */
async function sendNewObject(pushObjectId, entryData, requestedCategory) {
  const localObject = { [pushObjectId]: entryData };
  const path = determineStoragePath(pushObjectId, requestedCategory);
  updateLocalData(localObject);
  await saveToFirebase(path, entryData);
}

/**
 * Determine, depending on the local data#'s structure, where the new entry should go.
 * if-clause is true, if fetchedData has nested structure
 * else-clause is true, if fetchedData has flat structure.
 * @returns {string} - path.
 */
function determineStoragePath(pushObjectId, requestedCategory) {
  let path, container;
  if (currentCategory) {
    path = `${currentCategory}/${pushObjectId}`;
    fetchedData[currentCategory] = fetchedData[currentCategory] || {};
  } else {
    path = `${requestedCategory}/${pushObjectId}`;
    fetchedData = fetchedData || {};
  }
  console.log("path: ", path, "upated local data: " , fetchedData);
  return path;
}

/**
 * Update the local data object.
 */
function updateLocalData(localObject) {
  Object.assign(fetchedData, localObject);
}

/**
 * upload function for data traffic to Firebase.
 * @param {string} path - fragment of path (pattern: "tasks/task009").
 * @param {object} data - object containing all taks details.
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
