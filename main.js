import { getFirebaseData } from './js/data/API.js';

 export let firebaseData = null;

export async function loadFirebaseData() {
  if (!firebaseData) {
    firebaseData = await getFirebaseData();
  }
  return firebaseData;
}
