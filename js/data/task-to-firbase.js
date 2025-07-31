import { firebaseData } from "../../main.js";

export let allData = {};

// ZEILE 135 ODER 136 AUSKOMMENTIEREN, UM ÜBERTRAGUNG AN FIREBASE ZU STOPPEN

/**
 * Empfängt ein dynamisch erzeugtes Objekt und bereitet es für die Firebase-Verarbeitung vor.
 * @param {Object} receivedObject - Das Objekt, das von add-task.js übergeben wurde.
 * Es ist das ehemalige 'rawNewObject'.
 */
export async function CWDATA(receivedObject, fetchData) {
  // <= CWDATA empfängt das Objekt als Parameter
  console.log(
    "task-to-firebase.js: Objekt erfolgreich empfangen!",
    receivedObject
  );
  console.log("Firebase-data empfangen: ", fetchData);
  allData = fetchData;

  const convertedObjectWithId = await processRawObject(receivedObject);

  console.log(
    "fertiges Objekt, das an Firebase geschickt wird: ",
    convertedObjectWithId
  );
  console.log(
    "firebaseData, neuer Stand; von hier Board neu renderbar ohne fetch: ",
    allData
  );
}

/**
 * main function to proceed rawObject and send it to Firebase
 * @param {object} input - raw object
 * 
 * @returns object (only for console.log while working)
 */
async function processRawObject(input) {
  let { pushObjectId, rawNewObject } = checkDataStructure(input);
  rawNewObject.assignedTo = convertContacts(rawNewObject);
  rawNewObject = arraysToObjects(rawNewObject);
  if (pushObjectId == null) pushObjectId = setNextId("task");
  const result = await sendObject(pushObjectId, rawNewObject);
  return result;
}

/**
 * check structure of incomming object
 * @param {object} input - expected type is nested or flat object, i.e. with or without key like "task-003"
 * @returns flat object or values of nested object, to process.
 */
function checkDataStructure(input) {
  if (typeof input == "object" && !Array.isArray(input)) {
    const keys = Object.keys(input);
    if (keys.length == 1 && typeof input[keys[0]] == "object") {
      return {
        pushObjectId: keys[0],
        rawNewObject: input[keys[0]],
      };
    }
  }
  return {
    pushObjectId: null,
    rawNewObject: input,
  };
}

/**
 * replaces indications of "assignedUsers" (arr) to their contact-id by checking "contacts"
 * @param {object} rawNewObject - raw object
 * @returns array
 */
function convertContacts(rawNewObject) {
  const contactKeys = rawNewObject.assignedUsers.map((user) => {
    const keys = Object.keys(allData.contacts);
    const foundKey = keys.find(
      (key) => allData.contacts[key].name === user.name
    );
    return foundKey;
  });
  return contactKeys;
}

/**
 * converts values which are arrays to objects (mandatory for Firebase)
 * @param {object} obj = raw object
 * @returns restructured object
 */
function arraysToObjects(obj) {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((item, index) => [index, item]);
    }
  }
  return obj;
}

/**
 * for new task only: create new key (pattern: "task-009")
 * @param {string} category - here: "tasks"
 * @returns key (string)
 */
function setNextId(category) {
  let lastKey = getLastKey(category);
  const [prefix, numberStr] = lastKey.split("-");
  const nextNumber = (Number(numberStr) + 1).toString().padStart(3, "0");
  return `${prefix}-${nextNumber}`;
}

/**
 * helper function for "setNextId"; check last key in "tasks". If category is empty, initialize it
 * @param {string} category - here: "tasks"
 * @returns last key (string) in "tasks"
 */
function getLastKey(category) {
  if (!allData || Object.keys(allData.tasks).length == 0) {
    console.log("you initialized a new category: ", category);
    return `${category}-000`;
  } else {
    const itemKeys = Object.keys(allData.tasks);
    return itemKeys.at(-1);
  }
}

/**
 * send object to Firebase and update local copy (for instant rendering without new fetch)
 * @param {string} pushObjectId 
 * @param {object} rawNewObject - former raw Object 
 * 
 * @returns final object; only for console.log purpose.
 */
async function sendObject(pushObjectId, rawNewObject) {
  let path = `tasks/${pushObjectId}`;
  await saveToFirebase(path, rawNewObject);
  // await putObjectToDatabase(path, rawNewObject);

  const localObject = {
    [pushObjectId]: rawNewObject,
  };
  allData = allData || {};
  Object.assign(allData.tasks, localObject);
  return rawNewObject;
}

// async function putObjectToDatabase(path, data={}) {
//   let url = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/';
//   const res = await fetch(url + path + '.json', {
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
