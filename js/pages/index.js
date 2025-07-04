// To do: Initialen in den header pushen
// ....
// getFirebaseData importieren (aber bitte mit path-fragment)

async function initIndex() {
  const data = await getFirebaseData();
  if (!data) {
    console.error('No data received');
    return;
  }

  getNextIdNumber(data);
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

// ACHTUNG: funktioniert so nur, wenn bei der db-Abfrage direkt "users" oder "tasks" gefetched wird, also:
// const URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';
// wenn die ganze db geholt wird, muß der "tasks"- oder "user"-Teil herausgelöst werden.
// Das muß dann als "data" übergeben werden.
// Bei "contacts" würde es erst funktionieren, wenn die keys dort "contact-1" lauten

function getNextIdNumber(data) {
  const itemKeys = Object.keys(data);
  let lastKey = itemKeys.at(-1); // ist dasselbe wie: itemKeys[taskKeys.length -1];
  console.log("current last ID: ", lastKey);

  // in future, "lastKey" will have the form of "dummy" (i.e. with "-")
  let dummy = "task-6";
  const parts = dummy.split("-");

  // const parts = lastKey.split("-");
  console.log("splitted: ", parts);
  let [prefix, numberStr] = parts // destructuring: gibt den array-items von "parts" Variablennamen
  console.log("prefix: ", prefix, "; old number: ", numberStr);
  let nextNumber = Number(numberStr) + 1;
  const newId = `${prefix}-${nextNumber}`;
  console.log("next ID: ", newId);
}