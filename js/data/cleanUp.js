const localData = null;

// start function at bottom of script
async function startCleanUp() {
  await getFirebaseData();
  await cleanUpFirebaseDatabase(localData);
}

async function getFirebaseData(path = '') {
  const url = 'https://join-474-default-rtdb.europe-west1.firebasedatabase.app/' + path + '.json';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('network response:', response.statusText);
      return null;
    }
    const data = await response.json();
    localData = data;
    // return response;
  } catch (error) {
    console.error('problem occurred while fetching:', error);
    return null;
  }
}

async function saveToFirebase(path, data) {
  const url = `https://join-474-default-rtdb.europe-west1.firebasedatabase.app/${path}.json`;
  try {
    const response = await fetch(url, {
      method: data === null ? "DELETE" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: data === null ? undefined : JSON.stringify(data),
    });
    const resText = await response.text();
    console.log("Firebase response:", response.status, resText);
    if (!response.ok) {
      throw new Error("Firebase update failed: " + response.statusText);
    }
  } catch (error) {
    console.error("sending data failed:", error);
  }
}

async function cleanUpFirebaseDatabase(localData) {
  const userEntries = localData.users || {};
  const taskEntries = localData.tasks || {};
  const contactEntries = localData.contacts || {};

  // helper function to extract number suffix
  const extractNum = (key, prefix) => {
    const match = key.match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? parseInt(match[1], 10) : null;
  };

  // 1. clean up users
  for (const key in userEntries) {
    const num = extractNum(key, "demoUser");
    if (num && num > 6) {
      await saveToFirebase(`users/${key}`, null);
    }
  }

  // 2. clean up tasks
  for (const key in taskEntries) {
    const num = extractNum(key, "task");
    if (num && num > 6) {
      await saveToFirebase(`tasks/${key}`, null);
    }
  }

  // 3. clean up contacts
  for (const key in contactEntries) {
    const num = extractNum(key, "contact");
    if (num && num > 12) {
      await saveToFirebase(`contacts/${key}`, null);
    }
  }
  console.log("Firebase cleanup completed.");
}

// uncomment when you want to clean up Firebase:

// startCleanUp();
