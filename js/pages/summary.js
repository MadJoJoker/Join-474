// To do: 
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
}

function getDatesAndFilter() {
  const taskKeys = Object.keys(taskData);
  return datesAsStrings = taskKeys
    .filter(key => taskData[key].columnID !== "done") // nur nicht fertige tasks beachten
    .map(key => taskData[key].deadline);
}

function parseDates(dateStringArray) {
  return dateStringArray.map(dateStr => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day); // weil "month" im Date-Object bei 0 beginnt (Januar = 0)
  });
}

function filterFutureDeadlines(parsedDates) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // weil die anderen dates automatisch hour, minutes etc. bekommen haben: 00:00:00...
  const futureDeadlines = parsedDates.filter(date => date >= today);
  return futureDeadlines;
}

function findUpcomingDeadline(futureDeadlines) {
  if(futureDeadlines.length == 0) {
    return "No upcoming deadline";
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
  return convertedDate = convertToDisplayString(nearest);
}

function convertToDisplayString(nearest) {
  const formatedDate = nearest.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
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
