import { getFirebaseData } from './js/data/API.js';

 export let firebaseData = null;

export async function loadFirebaseData() {
  if (!firebaseData) {
    console.log('Firebase-Daten werden geladen...');
    firebaseData = await getFirebaseData();
    console.log('Firebase-Daten empfangen:', firebaseData);
  }
  return firebaseData;
}
console.log('golbale Data'); // Claudia für dich der fetch, einfach importiern mit dem main.js pfad
