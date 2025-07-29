import { firebaseData } from "../../main.js";

export let allData = {};

// ZEILE 91 ODER 92 AUSKOMMENTIEREN, UM ÜBERTRAGUNG AN FIREBASE ZU STOPPEN

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

  //return new Promise(resolve => setTimeout(resolve, 500)); // brauchst Du das noch?
}

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

// let {pushObjectId, rawNewObject} = checkDataStructure(input);
// console.log("ecco: ", pushObjectId, rawNewObject);

async function processRawObject(input) {
  let { pushObjectId, rawNewObject } = checkDataStructure(input);
  rawNewObject.assignedTo = convertContacts(rawNewObject);
  rawNewObject = arraysToObjects(rawNewObject);
  if (pushObjectId == null) pushObjectId = setNextId("task");
  const result = await sendObject(pushObjectId, rawNewObject);
  return result;
}

// key "contact-1" etc.:; muß in "contacts" gesucht und ergänzt werden.
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

function arraysToObjects(obj) {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map((item, index) => [index, item]);
    }
  }
  return obj;
}

function setNextId(category) {
  let lastKey = getLastKey(category);
  const [prefix, numberStr] = lastKey.split("-");
  const nextNumber = (Number(numberStr) + 1).toString().padStart(3, "0");
  // console.log("Hier gibt es eine ID: ", `${prefix}-${nextNumber}`);
  return `${prefix}-${nextNumber}`;
}

function getLastKey(category) {
  if (!allData || Object.keys(allData.tasks).length == 0) {
    console.log("you initialized a new category: ", category);
    return `${category}-000`;
  } else {
    const itemKeys = Object.keys(allData.tasks);
    return itemKeys.at(-1);
  }
}

async function sendObject(pushObjectId, rawNewObject) {
  let path = `tasks/${pushObjectId}`;
  // console.log("new path: ", path, rawNewObject);
  // await saveFirebaseData(path, rawNewObject);
  // await putObjectToDatabase(path, rawNewObject);

  // lokales Daten update fürs schnelle Rendern (=> kein neuer fetch nötig)
  const localObject = {
    [pushObjectId]: rawNewObject,
  };
  allData = allData || {}; // kann man streichen, ist nur zur Sicherheit
  Object.assign(allData.tasks, localObject);
  // console.log("lokales Obj.: ", localObject);
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

async function saveFirebaseData(path, data) {
  const url = `https://join-474-default-rtdb.europe-west1.firebasedatabase.app/${path}.json`;

  console.log("🌍 Speichere Daten an:", url);
  console.log("📤 Dateninhalt:", data);

  try {
    const response = await fetch(url, {
      method: data === null ? "DELETE" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: data === null ? undefined : JSON.stringify(data),
    });

    const resText = await response.text();
    console.log("✅ Firebase-Antwort:", response.status, resText);

    if (!response.ok) {
      throw new Error("Firebase update failed: " + response.statusText);
    }
  } catch (error) {
    console.error("❌ Fehler beim Speichern in Firebase:", error);
  }
}
