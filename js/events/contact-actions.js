/**
 * Provides all functions related to creating, updating, and deleting contacts.
 * These are used in render-contacts.js and other contact-related modules.
 */

// Fetches data from Firebase Realtime Database (wrapper for GET requests)
import { getFirebaseData } from '../data/API.js';

/**
 * Saves contact data to Firebase (via PUT or DELETE).
 * 
 * @param {object} params 
 * @param {string} params.path - The Firebase path where data will be saved (e.g., 'contacts/contact-001').
 * @param {object|null} params.data - The data to save; null deletes the entry.
 * @returns {Promise<void>}
 * @throws Will throw an error if the request to Firebase fails.
 */
async function saveFirebaseData({ path, data }) {
    const url = buildFirebaseUrl(path);
    try {
        const response = await sendFirebaseRequest(url, data);
        await handleFirebaseResponse(response);
    } catch (error) {
        if (location.hostname === 'localhost') {
            console.error('[Firebase]', error);
        }
    }
}

/**
 * Builds the Firebase URL for a given path.
 * 
 * @param {string} path - Firebase path segment.
 * @returns {string} Fully qualified Firebase URL.
 */
function buildFirebaseUrl(path) {
    return `https://join-474-default-rtdb.europe-west1.firebasedatabase.app/${path}.json`;
}

/**
 * Sends the request to Firebase (PUT or DELETE).
 * 
 * @param {string} url - The Firebase URL.
 * @param {object|null} data - Data to send; null means DELETE.
 * @returns {Promise<Response>} The fetch response object.
 */
async function sendFirebaseRequest(url, data) {
    return fetch(url, {
        method: data === null ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data === null ? undefined : JSON.stringify(data),
    });
}

/**
 * Processes the Firebase response.
 * 
 * @param {Response} response - The fetch response.
 * @throws Will throw if the response is not OK.
 */
async function handleFirebaseResponse(response) {
    const responseText = await response.text();
    if (!response.ok) {
        throw new Error('Firebase update failed: ' + response.statusText);
    }
}

// ---------------------------
// Avatar and Initials Utils
// ---------------------------

/** 
 * 15 predefined avatar colors – used for random assignment.
 */
const avatarColors = [
    '--orange', '--hotPink', '--violet', '--lila', '--petrol',
    '--turquoise', '--coralRed', '--peach', '--neonPink', '--goldYellow',
    '--vividBlue', '--neonGreen', '--lightYellow', '--red', '--yellow'
];

/**
 * Picks a random avatar color from the predefined list.
 * 
 * @returns {string} A hex color string.
 */
export function getRandomAvatarColor() {
    return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

/**
 * Converts a name string into initials.
 * 
 * @param {string} name - Full name of the contact.
 * @returns {string} Initials in uppercase (e.g., "Anna Müller" → "AM").
 */
export function getInitials(name) {
    const parts = name.trim().split(' ');
    return (parts[0][0] + (parts.pop()[0] || '')).toUpperCase();
}

// ---------------------------
// CRUD Operations
// ---------------------------

/**
 * Creates a new contact and stores it in Firebase.
 * 
 * @param {object} contactData
 * @param {string} contactData.name - Contact name.
 * @param {string} contactData.email - Contact email.
 * @param {string} contactData.phone - Contact phone number.
 * @returns {Promise<object>} The newly created contact object.
 */
export async function createContact({ name, email, phone }) {
    const id = await getNextContactId();
    const contact = {
        id,
        name,
        email,
        phone,
        initials: getInitials(name),
        avatarColor: getRandomAvatarColor()
    };
    await saveFirebaseData({ path: `contacts/${id}`, data: contact });
    return contact;
}

/**
 * Updates an existing contact in Firebase.
 * 
 * @param {object} contact - The full contact object with updated data.
 * @returns {Promise<void>}
 */
export async function updateContact(contact) {
    await saveFirebaseData({ path: `contacts/${contact.id}`, data: contact });
}

/**
 * Deletes a contact from Firebase by ID.
 * 
 * @param {string} id - Contact ID to delete (e.g., "contact-003").
 * @returns {Promise<void>}
 */
export async function deleteContact(id) {
    await saveFirebaseData({ path: `contacts/${id}`, data: null });
}

// ---------------------------
// ID Generation
// ---------------------------

/**
 * Generates the next available contact ID (e.g., "contact-004").
 * 
 * @returns {Promise<string>} The next available contact ID.
 */
async function getNextContactId() {
    const contacts = await fetchContactsFromFirebase();
    const usedContactNumbers = extractUsedContactNumbers(contacts);
    const nextAvailableNumber = findNextAvailableNumber(usedContactNumbers);
    return formatContactId(nextAvailableNumber);
}

/**
 * Retrieves all existing contacts from Firebase.
 * 
 * @returns {Promise<object>} An object containing all contacts keyed by ID.
 */
async function fetchContactsFromFirebase() {
    const data = await getFirebaseData();
    return data?.contacts || {};
}

/**
 * Extracts and returns sorted numeric IDs from contact keys.
 * 
 * @param {object} contacts - All contacts retrieved from Firebase.
 * @returns {number[]} Sorted array of numeric contact IDs.
 */
function extractUsedContactNumbers(contacts) {
    return Object.keys(contacts)
        .map(contactId => parseInt(contactId.replace('contact-', '')))
        .filter(contactNumber => !isNaN(contactNumber))
        .sort((firstNumber, secondNumber) => firstNumber - secondNumber);
}

/**
 * Finds the next unused number in a sorted array of contact numbers.
 * 
 * @param {number[]} sortedNumbers - List of used numbers.
 * @returns {number} The next available number.
 */
function findNextAvailableNumber(sortedNumbers) {
    let nextAvailable = 1;
    for (const number of sortedNumbers) {
        if (number === nextAvailable) {
            nextAvailable++;
        } else {
            break;
        }
    }
    return nextAvailable;
}

/**
 * Converts a number into a formatted contact ID (e.g., 4 → "contact-004").
 * 
 * @param {number} number - Contact number.
 * @returns {string} Formatted contact ID.
 */
function formatContactId(number) {
    return `contact-${String(number).padStart(3, '0')}`;
}
