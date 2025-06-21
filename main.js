import { getFirebaseData } from './js/data/API.js';

async function init() {
  console.log('Fetching data from Firebase...');
  const DATA_FIREBASE_JOIN = await getFirebaseData();

  if (DATA_FIREBASE_JOIN) {
    console.log('Data received:', DATA_FIREBASE_JOIN);
  } else {
    console.log('Failed to fetch data.');
  }
}

init();
console.log('Main js funktioniert');
