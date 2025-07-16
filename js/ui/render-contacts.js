// render (raw input test)

import {
  createContact,
  updateContact,
  deleteContact,
  getInitials
} from '../events/contact-actions.js';

import { getFirebaseData } from '../data/api.js';

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
            <img src="../assets/icons/btn/contact-edit.svg" alt="Edit" /> Edit
          </button>
          <button
            class="contact-details-card-icon-button delete-button"
            data-id="${contact.id}"
            id="detailsDeleteBtn">
            <img src="../assets/icons/btn/contact-delete.svg" alt="Delete" /> Delete
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

