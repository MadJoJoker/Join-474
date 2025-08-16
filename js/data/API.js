/**
 * Fetches data from the Firebase database.
 * @returns {Promise<object|null>} The Firebase data object or null if an error occurs.
 */
export async function getFirebaseData() {
  const URL_FIREBASE_JOIN =
    "https://join-474-default-rtdb.europe-west1.firebasedatabase.app/.json";
  try {
    const RESPONSE_FIREBASE = await fetch(URL_FIREBASE_JOIN);
    if (!RESPONSE_FIREBASE.ok) {
      console.error(
        "Network response was not ok:",
        RESPONSE_FIREBASE.statusText
      );
      return null;
    }
    const DATA_FIREBASE_JOIN = await RESPONSE_FIREBASE.json();
    return DATA_FIREBASE_JOIN;
  } catch (error) {
    console.error("There was a problem with your fetch operation:", error);
    return null;
  }
}
