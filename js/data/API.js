export async function getFirebaseData() {
  const url = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/.json';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Network response was not ok:', response.statusText);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was a problem with your fetch operation:', error);
    return null;
  }
}
