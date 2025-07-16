// To do: 
// getFirebase importieren und hier streichen; die sollte aber "path"-Parameter bekommen
// Code dokumentieren

let taskData;
let summaryData = {
  numberOfTasks: 0,
  todo: 0,
  urgent: 0,
  deadline: "No upcoming deadline",
  inProgress: 0,
  review: 0,
  done: 0
};

async function initSummary() {
  const data = await getFirebaseData("tasks");
  if (!data) {
    console.error('No data received');
    return;
  }
  taskData = data;
  summarizeTasks();
  deadline();
  fillSummary();
  setGreeting();
  displayUser();
}

// function partiallyHideSidebar() {
//   const name = sessionStorage.getItem('headerInitials');
//   console.log("name: ", name);
//   if(!name) {
//     document.getElementById('login-nav').classList.remove("d-none");
//     document.getElementById('app-nav').classList.add("hide");
//   }
// }

async function getFirebaseData(path = '') {
  const URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/' + path + '.json';
  try {
    const RESPONSE_FIREBASE = await fetch(URL_FIREBASE_JOIN);
    if (!RESPONSE_FIREBASE.ok) {
      console.error('Network response was not ok:', RESPONSE_FIREBASE.statusText);
      return null;
    }
    const DATA_FIREBASE_JOIN = await RESPONSE_FIREBASE.json();
    console.log(DATA_FIREBASE_JOIN);
    return DATA_FIREBASE_JOIN;
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
    return null;
  }
}

function summarizeTasks() {
  const taskKeys = Object.keys(taskData);
  summaryData.numberOfTasks = taskKeys.length;
  getColumnIdData(taskKeys);
}

function getColumnIdData(keys) {
  keys.forEach(key => {
    const task = taskData[key];
    const {columnID, priority} = task;
    if (priority == "urgent") {
      summaryData.urgent++;
    }
    if (summaryData.hasOwnProperty(columnID)) {
      summaryData[columnID]++;
    } else {      // error abfangen: falls etwas Ungewöhnliches gefunden wird, sammelt er das auch mal
      summaryData[columnID] = 1;
    }
  });
}

// START of deadline code
function deadline() {
  const dateStrings = getDatesAndFilter();
  const parsedDates = parseDates(dateStrings);
  const deadlines = filterFutureDeadlines(parsedDates);
  summaryData["deadline"] = findUpcomingDeadline(deadlines);
  console.log(summaryData["deadline"]);
}

function getDatesAndFilter() {
  const taskKeys = Object.keys(taskData);
  return datesAsStrings = taskKeys
    .filter(key => taskData[key].columnID !== "done") // nur nicht fertige tasks beachten
    .map(key => taskData[key].deadline);
}

function parseDates(dateStringArray) {
  console.log("dates as strings: ", dateStringArray);
  return dateStringArray.map(dateStr => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day); // weil "month" im Date-Object bei 0 beginnt (Januar = 0)
  });
}

function filterFutureDeadlines(parsedDates) {
  console.log("strings parsed to Date-objects: ", parsedDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // weil die anderen dates automatisch hour, minutes etc. bekommen haben: 00:00:00...
  const futureDeadlines = parsedDates.filter(date => date >= today);
  console.log("all deadlines: ", futureDeadlines);
  return futureDeadlines;
}

function findUpcomingDeadline(futureDeadlines) {
 if(futureDeadlines.length == 0) {
    return "No upcoming deadline"
  } else {
    return getDeadline(futureDeadlines);
  }
}

function getDeadline(futureDeadlines) {
  let nearest = futureDeadlines[0];
  for (let i = 1; i < futureDeadlines.length; i++) {
    const current = futureDeadlines[i];
    if (current < nearest) {
      nearest = current;
    }
  }
  console.log("upcoming: ", nearest);
  return convertedDate = convertToDisplayString(nearest);
}

function convertToDisplayString(nearest) {
  const formatedDate = nearest.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  console.log("converted date: ", formatedDate);
  return formatedDate;
}
// END of deadline code

function fillSummary() {
  document.getElementById('to-do').innerText = summaryData.todo;
  document.getElementById('done').innerText = summaryData.done;
  document.getElementById('urgent').innerText = summaryData.urgent;
  document.getElementById('tasks-in-board').innerText = summaryData.numberOfTasks;
  document.getElementById('tasks-in-progress').innerText = summaryData.inProgress;
  document.getElementById('await-feedback').innerText = summaryData.review;
  document.getElementById('deadline').innerText = summaryData.deadline;
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
    removeComma();
  }
}

function removeComma() {
  let commaText = document.getElementById('day-time').textContent;
  commaText = commaText.replace(',', '');
  document.getElementById('day-time').innerText = commaText;
}

// Würde auch schon so reichen:
// function displayUser() {
//   const name = sessionStorage.getItem('currentUser');
//   if (name) {
//     document.getElementById('hello').innerText = name;
//   }
// }
