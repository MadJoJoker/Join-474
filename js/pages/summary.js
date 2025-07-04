// To do: deadline function
// getFirebase importieren und hier streichen; die sollte aber "path"-Parameter bekommen
// "setUserName" mit wirklichem currentUserName befüttern
// Code dokumentieren

async function includeHeaderAndSidebar() {
  await addLayoutElements('../js/templates/header.html', 'header');
  await addLayoutElements('../js/templates/sidebar.html', 'sidebar');
}

async function addLayoutElements(path, id) {
  fetch(path)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    }
  )
}

async function initSummary() {
  const data = await getFirebaseData();
  if (!data) {
    console.error('No data received');
    return;
  }
  summarizeTasks(data);
  fillSummary();
  setGreeting();
  // setUserName();

  getNextIdNumber(data);
}

async function getFirebaseData() {
  const URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';
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

const summaryData = {
  numberOfTasks: 0,
  urgent: 0,
  todo: 0,
  inProgress: 0,
  review: 0,
  done: 0
};

function summarizeTasks(data) {
  const taskKeys = Object.keys(data);
  summaryData.numberOfTasks = taskKeys.length;
  getColumnIdData(taskKeys, data);
}

function getColumnIdData(keys, data) {
  keys.forEach(key => {
    const task = data[key];
    const {columnID, priority} = task;
    if (priority == "urgent") {
      summaryData.urgent++;
    }
    if (summaryData.hasOwnProperty(columnID)) {
      summaryData[columnID]++;
    } else {      // error prevention: if unexpected columnID, collect it too
      summaryData[columnID] = 1;
    }
  });
  // console.log(summaryData);
}

function fillSummary() {
  document.getElementById('to-do').innerText = summaryData.todo;
  document.getElementById('done').innerText = summaryData.done;
  document.getElementById('urgent').innerText = summaryData.urgent;
  document.getElementById('tasks-in-board').innerText = summaryData.numberOfTasks;
  document.getElementById('tasks-in-progress').innerText = summaryData.inProgress;
  document.getElementById('await-feedback').innerText = summaryData.review;
}

function setGreeting() {
  const now = new Date(); 
  const hour = now.getHours();
  let greeting = "";
  if (hour < 12) {
    greeting = "Good morning,";
  } else if (hour < 17) {
    greeting = "Good afternoon,";
  } else {
    greeting = "Good evening,";
  }
  document.getElementById("day-time").innerText = greeting;
}

// UNDER CONSTRUCTION; default = "dear Guest" oder ""
const currentUser = "dear Guest";

function setUserName() {
  document.getElementById("hello").innerText = currentUser;
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


// Testschnipsel
  // const taskKeys = Object.keys(data);
  // taskKeys.forEach(key => {
  // const task = data[key];
  // console.log(`Task ID: ${key}`, task.columnID);
  // console.log(`Task ID: ${key}`, task.priority);
  // });


// const count = Object.keys(data).length;
// console.log("Number of tasks:", count);

// const tasksArray = Object.values(data);
// console.log("tasksArray length:", tasksArray.length);

// function numberOfTasks(data) {
// const count = Object.keys(data).length;
// console.log("Number of tasks:", count);

// const tasksArray = Object.values(data);
// console.log(tasksArray.length);
// }
