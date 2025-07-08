// To do: deadline function
// getFirebase importieren und hier streichen; die sollte aber "path"-Parameter bekommen
// Code dokumentieren

async function XincludeHeaderAndSidebar() {
  await addLayoutElements('../js/templates/header.html', 'header');
  await addLayoutElements('../js/templates/sidebar.html', 'sidebar');
  displayInitialsInHeader();
  initDropdown();
}

async function XaddLayoutElements(path, id) {
  // const response = await fetch(path);
  // const data = await response.text();
  // document.getElementById(id).innerHTML = data;

  // "return" fehlte, darum hat es mit den Initialen im header nie geklappt.
  // Achtung: das ist nur wegen displayInitialsInHeader (l. 8); ohne die macht "return" den Code sogar kaputt.
  return fetch(path)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    }
  )
}

function XdisplayInitialsInHeader() {
  const name = sessionStorage.getItem('headerInitials');
  if (name) {
    document.getElementById('initials').innerText = name;
  }
}

function XinitDropdown() {
  // document.addEventListener("DOMContentLoaded", () => {
    const initials = document.getElementById("initials");
    const dropdown = document.getElementById("dropdown");
    initials.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".profile-wrapper")) {
            dropdown.classList.remove("show");
        // }
    };  // hier stand vorher noch eine runde Klammer, die musste auch weg
});
}

async function initSummary() {
  const data = await getFirebaseData("tasks");
  if (!data) {
    console.error('No data received');
    return;
  }
  summarizeTasks(data);
  fillSummary();
  setGreeting();
  displayUser();

  getNextIdNumber(data); // hier nur zum Rumtesten; gehört zu signUp
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

function displayUser() {
  const userName = sessionStorage.getItem('currentUser');
  let user = document.getElementById('hello');
  if (userName) {
    user.innerText = userName;
  } else {
    user.innerText = "";
  }
}

// Würde auch schon so reichen:
// function displayUser() {
//   const name = sessionStorage.getItem('currentUser');
//   if (name) {
//     document.getElementById('hello').innerText = name;
//   }
// }


// Alte Version; neue ist in index.js
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
