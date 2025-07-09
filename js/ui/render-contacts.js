// render (raw input test)

import { getFirebaseData } from '../data/API.js';

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
  console.log(`${contact.name} | avatarColor: "${contact.avatarColor}"`);
  const colorVar = contact.avatarColor?.trim();
  const bgColor = colorVar ? `style="background-color: var(${colorVar})"` : `style="background-color: #ccc"`;
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
 */
async function renderContacts() {
  const data = await getFirebaseData();
  const rawContacts = data?.contacts;
  if (!rawContacts) {
    console.error("Keine Kontaktdaten gefunden");
    return;
  }
  const contacts = Object.values(cleanContacts(rawContacts));
  const grouped = groupContactsByInitials(contacts);
  const container = document.querySelector(".contacts-list");
  container.innerHTML = "";
  contacts.forEach(contact => {
    allContacts[contact.id] = contact;
  });
  for (const initial in grouped) {
    let contactsHtml = `
        <div class="contact-section">
            <div class="contact-initial">${initial}</div>
        `;
    grouped[initial].forEach(contact => {
      contactsHtml += createContactTemplate(contact);
    });
    contactsHtml += `</div>`;
    container.insertAdjacentHTML("beforeend", contactsHtml);
  }
}
renderContacts();

// reateContactDetails

/**
 * Generiert das HTML für die Detailansicht eines ausgewählten Kontakts.
 */
function createContactDetailsHTML(contact) {
  const colorVar = contact.avatarColor?.trim();
  const bgColor = colorVar ? `style="background-color: var(${colorVar})"` : `style="background-color: #ccc"`;
  return `
    <div class="contact-details-header">
      <div class="contact-details-avatar-big" ${bgColor}>${contact.initials}</div>
      <div class="contact-details-name-actions">
        <h2>${contact.name}</h2>
        <div class="contact-details-actions">
        <button class="contact-details-card-icon-button edit-button" onclick="onEditContact('${contact.id}')">
        <img src="../assets/icons/btn/contact-edit.svg" alt="Edit" /> Edit
        </button>
        <button class="contact-details-card-icon-button delete-button">
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
  const overlay = document.getElementById('editContactOverlay');
  document.getElementById('editNameInput').value = contact.name;
  document.getElementById('editEmailInput').value = contact.email;
  document.getElementById('editPhoneInput').value = contact.phone;
  document.getElementById('editContactAvatar').textContent = contact.initials;
  const colorVar = contact.avatarColor?.trim();
  document.getElementById('editContactAvatar').style.backgroundColor = colorVar ? `var(${colorVar})` : '#ccc';
  openOverlay('editContactOverlay');

  // Speichern: schließt sofort & aktualisiert Kontakt
  document.getElementById('saveEditBtn').onclick = () => {
    contact.name = document.getElementById('editNameInput').value.trim();
    contact.email = document.getElementById('editEmailInput').value.trim();
    contact.phone = document.getElementById('editPhoneInput').value.trim();
    contact.initials = getInitials(contact.name);
    closeOverlay('editContactOverlay', true);
    renderContacts();
  };

  // Löschen: entfernt Kontakt & schließt sofort
  document.getElementById('deleteContactBtn').onclick = () => {
    delete allContacts[contact.id];
    closeOverlay('editContactOverlay', true);
    renderContacts();
  };
}

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

/**
 * Wandelt Namen in Initialen um.
 * z. B. "Anna Müller" → "AM"
 */
function getInitials(name) {
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

// Contact successfully created
// Speichert einen neuen Kontakt und zeigt Feedback-Message
document.getElementById('createContactBtn').addEventListener('click', () => {
  const nameInput = document.getElementById('newContactName');
  const name = nameInput.value.trim();
  const email = document.querySelector('#contactOverlay input[type="email"]').value.trim();
  const phone = document.querySelector('#contactOverlay input[type="tel"]').value.trim();
  if (!name || !email || !phone) return;
  const id = Date.now().toString();
  const initials = getInitials(name);
  allContacts[id] = {
    id,
    name,
    email,
    phone,
    initials,
    avatarColor: '--avatar-default-color'
  };
  closeOverlay('contactOverlay', true);
  renderContacts();
  showContactCreatedMessage();
  nameInput.value = '';
  document.querySelector('#contactOverlay input[type="email"]').value = '';
  document.querySelector('#contactOverlay input[type="tel"]').value = '';
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

// sessionStorage ???