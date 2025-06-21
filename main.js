import { getFirebaseData } from './js/data/API.js';

async function init() {
  console.log('Fetching data from Firebase...');
  const data = await getFirebaseData();

  if (data) {
    console.log('Data received:', data);
  } else {
    console.log('Failed to fetch data.');
  }
}

init();
console.log('Main js funktioniert');
