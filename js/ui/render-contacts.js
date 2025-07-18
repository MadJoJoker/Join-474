// render (raw input test)

import {
  createContact,
  updateContact,
  deleteContact,
  getInitials
} from '../events/contact-actions.js';

import { getFirebaseData } from '/js/data/API.js';

let currentlyEditingContact = null;

/**
 * Bereinigt die rohen Kontaktdaten aus Firebase.
 * Falls Keys wie " name" statt "name" vorkommen, werden sie auch erkannt.
 */
function cleanContacts(rawContacts) {
  const cleanedContacts = {};
  for (const [contactId, rawContact] of Object.entries(rawContacts)) {
    cleanedContacts[contactId] = {
      id: contactId,
      name: rawContact.name || rawContact[" name"],
      initials: rawContact.initials || rawContact[" initials"],
      email: rawContact.email,
      avatarColor: rawContact.avatarColor || rawContact[" avatarColor"] || "",
      phone: rawContact.phone || rawContact[" phone"] || "",
    };
  }
  return cleanedContacts;
}

/**
 * Gruppiert die Kontakte alphabetisch nach dem ersten Buchstaben des Namens.
 * Sortiert innerhalb der Gruppe die Kontakte nach Name (A-Z).
 */
function groupContactsByInitials(contactsArray) {
  const groupedByInitial = {};
  for (const contact of contactsArray) {
    const initial = contact.name?.charAt(0).toUpperCase() || "#";
    if (!groupedByInitial[initial]) {
      groupedByInitial[initial] = [];
    }
    groupedByInitial[initial].push(contact);
  }
  const sortedGroupedContacts = Object.keys(groupedByInitial)
    .sort()
    .reduce((sortedGroups, currentInitial) => {
      const contactsInGroup = groupedByInitial[currentInitial];
      sortedGroups[currentInitial] = contactsInGroup.sort((contactA, contactB) =>
        contactA.name.localeCompare(contactB.name)
      );
      return sortedGroups;
    }, {});
  return sortedGroupedContacts;
}

/**
 * Generiert das HTML für einen einzelnen Kontakt in der Liste.
 * Fügt onclick-Handler zur Auswahl hinzu.
 */
function createContactTemplate(contact) {
  const bgColor = contact.avatarColor
    ? contact.avatarColor.startsWith('--')
      ? `style="background-color: var(${contact.avatarColor})"`
      : `style="background-color: ${contact.avatarColor}"`
    : `style="background-color: #ccc"`;

  return `
    <div class="contact" data-id="${contact.id}" onclick="onContactClickById('${contact.id}')">
      <div class="contact-avatar" ${bgColor}>${contact.initials}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-email">${contact.email}</div>
      </div>
    </div>
  `;
}

const allContacts = {};

/**
 * Lädt Kontakte aus Firebase, bereinigt sie, gruppiert sie und rendert sie in die DOM.
 * es wird closest() genutzt, damit auch Klicks auf das Icon innerhalb des Buttons erkannt werden.
 */
async function renderContacts() {
  /* 1) Daten vom Server holen */
  const fullData = await getFirebaseData();
  const rawContacts = fullData?.contacts;

  if (!rawContacts) {
    console.error('No contact data found (API returned null/undefined)');
    return;
  }

  /* 2) Daten wie bisher aufbereiten und rendern */
  const contacts = Object.values(cleanContacts(rawContacts));
  const grouped = groupContactsByInitials(contacts);

  const container = document.querySelector('.contacts-list');
  container.innerHTML = '';

  contacts.forEach(c => (allContacts[c.id] = c));

  for (const initial in grouped) {
    let html = `
      <div class="contact-section">
        <div class="contact-initial">${initial}</div>
    `;
    grouped[initial].forEach(c => (html += createContactTemplate(c)));
    html += '</div>';

    container.insertAdjacentHTML('beforeend', html);
  }
}
renderContacts();

// GLOBALER Listener für den Delete-Button in der Detail-Card
document.addEventListener('click', async (e) => {
  if (e.target.closest('#detailsDeleteBtn')) {
    const btn = e.target.closest('#detailsDeleteBtn');
    const id = btn.dataset.id;
    if (!id) return;

    await deleteContact(id);

    // Karte schließen, wenn sie gerade den Kontakt zeigt
    const card = document.querySelector('.contact-details-card');
    card.innerHTML = '';
    activeContactId = null;

    renderContacts();                // Liste links neu bauen
  }
});

// reateContactDetails

/**
 * Generiert das HTML für die Detailansicht eines ausgewählten Kontakts.
 */
function createContactDetailsHTML(contact) {
  const bgColor = contact.avatarColor
    ? contact.avatarColor.startsWith('--')
      ? `style="background-color: var(${contact.avatarColor})"`
      : `style="background-color: ${contact.avatarColor}"`
    : `style="background-color: #ccc"`;

  return `
    <div class="contact-details-header">
      <div class="contact-details-avatar-big" ${bgColor}>${contact.initials}</div>
      <div class="contact-details-name-actions">
        <h2>${contact.name}</h2>
        <div class="contact-details-actions">
          <button class="contact-details-card-icon-button edit-button" onclick="onEditContact('${contact.id}')">
            <svg viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
            <path d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z" fill="var(--sidebarNoticeGrey)"/>
            </svg>
            Edit
          </button>
          <button
            class="contact-details-card-icon-button delete-button"
            data-id="${contact.id}"
            id="detailsDeleteBtn">
            <svg viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
            <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" fill="var(--sidebarNoticeGrey)"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
    <div class="contact-details-info-block">
      <h3>Contact Information</h3><br>
      <p><strong>Email</strong></p><br>
      <p><a>${contact.email}</a></p><br>
      <p><strong>Phone</strong></p><br>
      <p>${contact.phone}</p>
    </div>
  `;
}

let activeContactId = null;
let isAnimating = false;

/**
 * Wird über onclick="..." aus dem HTML aufgerufen und übergibt an Hauptfunktion.
 */
window.onContactClickById = function (contactId) {
  const contact = allContacts[contactId];
  onContactClick(contact);
};

/**
 * Öffnet oder schließt die Kontakt-Details rechts.
 */
function onContactClick(contact) {
  const card = document.querySelector('.contact-details-card');
  if (isAnimating) return;
  isAnimating = true;
  document.querySelectorAll('.contact').forEach(el => el.classList.remove('active'));
  const clickedContactElement = document.querySelector(`.contact[data-id="${contact.id}"]`);
  if (activeContactId === contact.id) {
    card.classList.remove('visible');
    clickedContactElement?.classList.remove('active');
    card.innerHTML = '';
    activeContactId = null;
    isAnimating = false;
    return;
  } else {
    card.innerHTML = createContactDetailsHTML(contact);
    clickedContactElement?.classList.add('active');
    setTimeout(() => {
      card.classList.add('visible');
      isAnimating = false;
    }, 10);
    activeContactId = contact.id;
  }
}

// neu add contact small window

// Öffnet das Overlay für neuen Kontakt
document.querySelector('.add-new-contact-button').addEventListener('click', () => {
  // Felder zurücksetzen
  ['newContactName', 'newContactEmail', 'newContactPhone']
    .forEach(id => (document.getElementById(id).value = ''));

  openOverlay('contactOverlay');
});

// Schließt das Overlay über X oder Abbrechen
document.getElementById('closeOverlayBtn').addEventListener('click', () => {
  closeOverlay('contactOverlay');
});
document.getElementById('cancelOverlayBtn').addEventListener('click', () => {
  closeOverlay('contactOverlay');
});
document.getElementById('contactOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    closeOverlay('contactOverlay');
  }
});

// neu edit contact small window

/**
 * Öffnet das Overlay zum Bearbeiten eines Kontakts.
 * Befüllt das Formular mit vorhandenen Werten.
 */
function openEditContactOverlay(contact) {
  currentlyEditingContact = { ...contact };

  document.getElementById('editNameInput').value = contact.name;
  document.getElementById('editEmailInput').value = contact.email;
  document.getElementById('editPhoneInput').value = contact.phone;
  document.getElementById('editContactAvatar').textContent = contact.initials;

  const bg = contact.avatarColor?.startsWith('--')
    ? `var(${contact.avatarColor})`
    : contact.avatarColor || '#ccc';
  document.getElementById('editContactAvatar').style.backgroundColor = bg;

  openOverlay('editContactOverlay');
}

// Save Button (nur 1x registrieren)
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveEditBtn');

  if (!saveBtn) {
    console.error('❌ Save-Button (#saveEditBtn) wurde NICHT im DOM gefunden!');
    return;
  }

  saveBtn.addEventListener('click', async () => {
    console.log('✅ Klick auf SAVE erkannt');

    const form = document.getElementById('editContactForm');
    if (!form.checkValidity()) {
      console.warn('❌ Formular ist ungültig');
      form.reportValidity();
      return;
    }

    if (!currentlyEditingContact) {
      console.error('❌ currentlyEditingContact ist NULL oder UNDEFINED!');
      return;
    }

    // Erstelle das neue Objekt für den Speicherprozess
    const updated = {
      ...currentlyEditingContact,
      name: document.getElementById('editNameInput').value.trim(),
      email: document.getElementById('editEmailInput').value.trim(),
      phone: document.getElementById('editPhoneInput').value.trim(),
      initials: getInitials(document.getElementById('editNameInput').value.trim())
    };

    console.log('📦 Neuer Kontakt-Datensatz (updateContact):', updated);

    // Versuche das Update via Firebase
    try {
      await updateContact(updated);
      console.log('✅ updateContact() erfolgreich');

      // Lokalen Cache aktualisieren
      allContacts[updated.id] = updated;

      // Falls aktuell im Detail angezeigt, DOM neu setzen
      if (activeContactId === updated.id) {
        const card = document.querySelector('.contact-details-card');
        card.innerHTML = createContactDetailsHTML(updated);
      }

      // Overlay schließen und Liste neu rendern
      closeOverlay('editContactOverlay', true);
      await renderContacts();

    } catch (error) {
      console.error('❌ Fehler beim Update-Vorgang:', error);
    }
  });
});


// Delete Button (nur 1x registrieren)
document.getElementById('deleteContactBtn').addEventListener('click', async () => {
  if (!currentlyEditingContact) return;

  await deleteContact(currentlyEditingContact.id);

  if (activeContactId === currentlyEditingContact.id) {
    document.querySelector('.contact-details-card').innerHTML = '';
    activeContactId = null;
  }

  closeOverlay('editContactOverlay', true);
  renderContacts();
});


// Klick außerhalb: Overlay schließen
document.getElementById('editContactOverlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    closeOverlay('editContactOverlay');
  }
});
document.getElementById('closeEditOverlayBtn').addEventListener('click', () => {
  closeOverlay('editContactOverlay');
});

/**
 * Öffnet das Bearbeitungsfenster über den Edit-Button
 */
window.onEditContact = function (contactId) {
  const contact = allContacts[contactId];
  if (!contact) return;
  openEditContactOverlay(contact);
};

/**
 * Öffnet ein Overlay mit Slide-In-Effekt.
 */
function openOverlay(id) {
  const overlay = document.getElementById(id);
  overlay.classList.remove('hidden', 'slide-out');
  overlay.classList.add('slide-in', 'active');
}

/**
 * Schließt ein Overlay mit Slide-Out-Effekt.
 * Optional: `immediate = true` => sofortiges Schließen ohne Animation.
 */
function closeOverlay(id, immediate = false) {
  const overlay = document.getElementById(id);
  if (immediate) {
    overlay.classList.add('hidden');
    overlay.classList.remove('slide-in', 'slide-out', 'active');
    return;
  }
  overlay.classList.remove('slide-in');
  overlay.classList.add('slide-out');
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.classList.remove('slide-out', 'active');
  }, 400);
}


// Contact successfully created
// Speichert einen neuen Kontakt und zeigt Feedback-Message
// Create Contact
// Create-Button – <form> validieren
const newContactForm = document.getElementById('newContactForm');

newContactForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Formular-Reload verhindern

  if (!newContactForm.checkValidity()) {
    newContactForm.reportValidity(); // Zeigt HTML5-Fehlerhinweise
    return;
  }

  const name = document.getElementById('newContactName').value.trim();
  const email = document.getElementById('newContactEmail').value.trim();
  const phone = document.getElementById('newContactPhone').value.trim();

  await createContact({ name, email, phone });

  closeOverlay('contactOverlay', true);
  renderContacts();
  showContactCreatedMessage();
});

/**
 * Zeigt die Message "Contact successfully created" für 2 Sekunden.
 */
function showContactCreatedMessage() {
  const msg = document.getElementById('contactSuccessMsg');
  msg.classList.remove('hidden', 'slide-in', 'slide-out');
  void msg.offsetWidth;
  requestAnimationFrame(() => {
    msg.classList.add('slide-in');
  });
  setTimeout(() => {
    msg.classList.remove('slide-in');
    msg.classList.add('slide-out');
    setTimeout(() => {
      msg.classList.add('hidden');
    }, 400);
  }, 2000);
}

