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

/**
 * (onload) main function; call data-fetcher, call all helper functions
 */
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

/**
 * helper function for "initSummary"; count number of keys in "tasks"; write number in "summaryData"-object
 */
function summarizeTasks() {
  const taskKeys = Object.keys(taskData);
  summaryData.numberOfTasks = taskKeys.length;
  getColumnIdData(taskKeys);
}

/**
 * get value of "columnID"; gather the four status-values and count their frequency.
 * write both results in "summaryData"-object.
 * @param {array} keys - array of task-keys
 */
function getColumnIdData(keys) {
  keys.forEach(key => {
    const task = taskData[key];
    const {columnID, priority} = task;
    if (priority == "urgent") {
      summaryData.urgent++;
    }
    if (summaryData.hasOwnProperty(columnID)) {
      summaryData[columnID]++;
    } else {
      summaryData[columnID] = 1;
    }
  });
}

/**
 * helper function for "initSummary", main function, call all helper functions.
 */
function deadline() {
  const dateStrings = getDatesAndFilter();
  const parsedDates = parseDates(dateStrings);
  const deadlines = filterFutureDeadlines(parsedDates);
  summaryData["deadline"] = findUpcomingDeadline(deadlines);
}

/**
 * helper function for "deadline"; filter not yet finished tasks, extract their "deadline"-value.
 * @returns array of deadline-strings
 */
function getDatesAndFilter() {
  const taskKeys = Object.keys(taskData);
  return datesAsStrings = taskKeys
    .filter(key => taskData[key].columnID !== "done")
    .map(key => taskData[key].deadline);
}

/**
 * helper function for "deadline"; convert deadeline-string to number, then to Date object.
 * @param {array} dateStringArray - array with dates as strings
 * @returns array of Date objects
 */
function parseDates(dateStringArray) {
  return dateStringArray.map(dateStr => {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day); // weil "month" im Date-Object bei 0 beginnt (Januar = 0)
  });
}

/**
 * helper function for "deadline"; create new Date object for today, filter future dates from array
 * @param {array} parsedDates - array of Date-objects
 * @returns array of Date objects (future deadlines)
 */
function filterFutureDeadlines(parsedDates) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // weil die anderen dates automatisch hour, minutes etc. bekommen haben: 00:00:00...
  const futureDeadlines = parsedDates.filter(date => date >= today);
  return futureDeadlines;
}

/**
 * helper function for "deadline"; check: if future deadlines exist, call helper function.
 * @param {array} futureDeadlines - array of Date-objects (future deadlines)
 * @returns uncomint deadline (string)
 */
function findUpcomingDeadline(futureDeadlines) {
  if(futureDeadlines.length == 0) {
    return "No upcoming deadline";
  } else {
    return getDeadline(futureDeadlines);
  }
}

/**
 * helper function for "findUpcomingDeadline"; compare deadline-dates, find lowest value
 * @param {array} futureDeadlines - 
 * @returns nearest (= upcoming) deadline, converted to string by helper function
 */
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

/**
 * helper function for "getDeadline"; convert Date object to string;
 * @param {Date} nearest - upcoming Date
 * @returns string from Date
 */
function convertToDisplayString(nearest) {
  const formatedDate = nearest.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return formatedDate;
}

/**
 * helper function for "initSummary"; fill content of summaryData in html page
 */
function fillSummary() {
  document.getElementById('to-do').innerText = summaryData.todo;
  document.getElementById('done').innerText = summaryData.done;
  document.getElementById('urgent').innerText = summaryData.urgent;
  document.getElementById('tasks-in-board').innerText = summaryData.numberOfTasks;
  document.getElementById('tasks-in-progress').innerText = summaryData.inProgress;
  document.getElementById('await-feedback').innerText = summaryData.review;
  document.getElementById('deadline').innerText = summaryData.deadline;
}

/**
 * helper function for "initSummary"; check day time by using Date.now; set greeting text in html page
 */
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

/**
 * helper function for "initSummary"; get current user name from sessionStorage, set it in html page
 */
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

/**
 * helper function for "displayUser"; remove comma after greeting formula, if user name is missing.
 */
function removeComma() {
  let commaText = document.getElementById('day-time').textContent;
  commaText = commaText.replace(',', '');
  document.getElementById('day-time').innerText = commaText;
}