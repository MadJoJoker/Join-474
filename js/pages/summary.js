async function addLayoutElements(path, id) {
  fetch(path)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    }
  )
}

function includeHeaderAndSidebar() {
  addLayoutElements('../js/templates/header.html', 'header');
  addLayoutElements('../js/templates/sidebar.html', 'sidebar');
}

// function setSmryIcon(triggeredElement, filename) {
//   const img = triggeredElement.querySelector("img");
//   img.src = '../assets/icons/sidebar/' + filename;
// }

async function getFirebaseData() {
  const URL_FIREBASE_JOIN = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/.json';
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

getFirebaseData();
