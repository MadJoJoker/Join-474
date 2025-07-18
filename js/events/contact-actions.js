/* contact-actions.js
 * Enthält alle Funktionen für Create, Edit und Delete von Kontakten.
 * (wird in render-contacts.js gefüllt).
 */
import { getFirebaseData } from 'js/data/API.js';

async function saveFirebaseData({ path, data }) {
    const url = `https://join-474-default-rtdb.europe-west1.firebasedatabase.app/${path}.json`;

    console.log('🌍 Speichere Daten an:', url);
    console.log('📤 Dateninhalt:', data);

    try {
        const response = await fetch(url, {
            method: data === null ? 'DELETE' : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: data === null ? undefined : JSON.stringify(data)
        });

        const resText = await response.text();
        console.log('✅ Firebase-Antwort:', response.status, resText);

        if (!response.ok) {
            throw new Error('Firebase update failed: ' + response.statusText);
        }

    } catch (error) {
        console.error('❌ Fehler beim Speichern in Firebase:', error);
    }
}

/** 15 mögliche Avatar-Farben – wird für Zufallsauswahl genutzt */
const avatarColors = [
    '#ff7a00', '#ff5eb3', '#6e52ff', '#9327ff', '#00bee8',
    '#1fd7c1', '#ff745e', '#ffa35e', '#fc71ff', '#ffc701',
    '#0038ff', '#c3ff2b', '#ffe62b', '#ff4646', '#ffbb2b'
];

/** Gibt eine beliebige Farbe aus dem Pool zurück */
export function getRandomAvatarColor() {
    return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

/** Name → Initialen (Anna Müller → AM) */
export function getInitials(name) {
    const parts = name.trim().split(' ');
    return (parts[0][0] + (parts.pop()[0] || '')).toUpperCase();
}

/** Neues Contact-Objekt anlegen */
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
    console.info('[createContact] gespeichert →', contact);
    return contact;
}
async function getNextContactId() {
    const data = await getFirebaseData();
    const contacts = data?.contacts || {};

    const usedIds = Object.keys(contacts)
        .map(id => parseInt(id.replace('contact-', '')))
        .filter(num => !isNaN(num))
        .sort((a, b) => a - b);

    let nextId = 1;
    for (const idNum of usedIds) {
        if (idNum === nextId) {
            nextId++;
        } else {
            break;
        }
    }

    return `contact-${String(nextId).padStart(3, '0')}`;
}

/** Bestehenden Kontakt aktualisieren */
export async function updateContact(contact) {
    console.log('🛠 [updateContact] →', contact);
    await saveFirebaseData({ path: `contacts/${contact.id}`, data: contact });
}

/** Kontakt löschen */
export async function deleteContact(id) {
    await saveFirebaseData({ path: `contacts/${id}`, data: null });
    console.info('[deleteContact] gelöscht →', id);
}

// eine Umschaltlogik zwischen „lokal“ und „Firebase“ einzubauen – per Umgebungsvariable oder Flag wie: const USE_FIREBASE = true; ?