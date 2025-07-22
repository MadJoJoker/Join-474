
// NUR ZUR SIMULIERUNG; DAS MUSS WEG
async function getFirebaseData(path = '') {
  const URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/' + path + '.json';
  try {
    const RESPONSE_FIREBASE = await fetch(URL_FIREBASE_JOIN);
    if (!RESPONSE_FIREBASE.ok) {
      console.error('Network response was not ok:', RESPONSE_FIREBASE.statusText);
      return null;
    }
    const DATA_FIREBASE_JOIN = await RESPONSE_FIREBASE.json();
    // console.log("data: ", DATA_FIREBASE_JOIN);
    return DATA_FIREBASE_JOIN;
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
    return null;
  }
}

// NUR ZUR SIMULIERUNG; DAS MUSS WEG
async function initCW() {
  const data = await getFirebaseData(""); // ACHTUNG, da ist auch ein Fehler!
  if (!data) {
    console.error('No data received');
    return;
  }
  fetchData = data;
  console.log("recieved data: ", fetchData);
 
  // ObjectToDatabase(); // das ist sie, die Funktion!
}
// NUR ZUR SIMULIERUNG; DAS MUSS WEG
let fetchData = null;
initCW();


// AB HIER IST ES ECHT:
// note: Format von deadline ist noch inkonsistent zur Database
// die subtasks scheinen nicht in den subtasks zu landen(?)

/**
 * Empfängt ein dynamisch erzeugtes Objekt und bereitet es für die Firebase-Verarbeitung vor.
 * @param {Object} receivedObject - Das Objekt, das von add-task.js übergeben wurde.
 * Es ist das ehemalige 'rawNewObject'.
 */
export async function CWDATA(receivedObject, fetchData) { // <= CWDATA empfängt das Objekt als Parameter
    console.log("task-to-firebase.js: Objekt erfolgreich empfangen!", receivedObject);
    console.log("hier sind die Daten: ", fetchData); // leider sind sie nicht da.
    const convertedObject = await ObjectToDatabase(receivedObject);
    // console.log("so, fertig! ", convertedObject);
    return new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Empfängt ein dynamisch erzeugtes Objekt und bereitet es für die Firebase-Verarbeitung vor.
 * @param {Object} receivedObject - Das Objekt, das von add-task.js übergeben wurde.
 * Es ist das ehemalige 'rawNewObject'.
 */
//export async function CWDATA(receivedObject) { // <= CWDATA empfängt das Objekt als Parameter
    // HIER IST DEIN CONSOLE.LOG ZUR PRÜFUNG DER ÜBERGABE!
    // console.log("task-to-firebase.js: Objekt erfolgreich empfangen!", receivedObject);

    // Jetzt kannst du mit 'receivedObject' hier in task-to-firebase.js weiterarbeiten.
    // Beispiel: Speichern in Firebase Firestore

    //CWDATA können wir ja später noch umbennen, da hast Du freie Hand,
    //lass es mich nur wissen , da ich es in meiner handleCreateTask() ändern muss sonst geht es nicht.

    // Diese Promise-Simulation ist nur nötig, wenn du noch keine echte asynchrone Logik hast
    
    // return new Promise(resolve => setTimeout(resolve, 500));
// }

async function ObjectToDatabase(rawNewObject) {
  // console.log("los!", rawNewObject);
  rawNewObject.assignedTo = convertContacts(rawNewObject); // keys aus "contacts" suchen
  rawNewObject = convertArraysToObjects(rawNewObject); // alle arrays mit Objekten zu Objekten machen
  console.log("Object: ", rawNewObject);
  let pushObjectId = setNextId("task");
  // sendObject(pushObjectId, rawNewObject);
}

// key: "contact-1"; er muß in "contacts" gesucht und ergänzt werden. Resultat bleibt ein array, aber nun mit Objekten
function convertContacts(rawNewObject) {
  const contactKeys = rawNewObject.assignedTo.map(user => {
    const keys = Object.keys(fetchData.contacts);
    const foundKey = keys.find(key => fetchData.contacts[key].name === user.name);
    return foundKey;
  });
  return contactKeys;
}

function convertArraysToObjects(obj) {
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = arrayToFirebaseObject(obj[key]);
    }
  }
  return obj;
}

function arrayToFirebaseObject(array) {
  return Object.fromEntries(
    array.map((item, index) => [index, item])
  );
}

function setNextId(category) {
  let lastKey = getLastKey(category);
  const [prefix, numberStr] = lastKey.split("-");
  const nextNumber = (Number(numberStr) + 1).toString().padStart(3, '0');
  return `${prefix}-${nextNumber}`;
}

function getLastKey(category) {
  if(!fetchData || Object.keys(fetchData.tasks).length == 0) {
    console.log("you initialized a new category: ", category);
    return `${category}-000`
  } else {
    const itemKeys = Object.keys(fetchData.tasks);
    return itemKeys.at(-1); // ist dasselbe wie: itemKeys[taskKeys.length -1];
  }
}

async function sendObject(pushObjectId, rawNewObject) {
  let path = `tasks/${pushObjectId}`;
  console.log("new path: ", path, rawNewObject);
  // await putObjectToDatabase(path, entryData);

  // lokales update fürs schnelle Rendern (= kein neuer fetch nötig)
  // const localObject = {
  //   [pushObjectId] : rawNewObject
  // };
  // console.log("the complete object:" , localObject);
  // fetchData = fetchData || {};
  // Object.assign(fetchData.tasks, localObject);
  // console.log("updatete data collection: ", fetchData);
}

// "path": "tasks/task-014" (Kategory/Key des neuen Eintrags)
async function putObjectToDatabase(path, data={}) {
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