// render (raw input test)

import { getFirebaseData } from '../data/API.js';

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

function createContactDetailsHTML(contact) {
    const colorVar = contact.avatarColor?.trim();
    const bgColor = colorVar ? `style="background-color: var(${colorVar})"` : `style="background-color: #ccc"`;
    return `
    <div class="contact-details-header">
      <div class="contact-details-avatar-big" ${bgColor}>${contact.initials}</div>
      <div class="contact-details-name-actions">
        <h2>${contact.name}</h2>
        <div class="contact-details-actions">
          <button class="contact-details-card-icon-button">
            <img src="../assets/icons/btn/contact-edit.svg" alt="Edit" /> Edit
          </button>
          <button class="contact-details-card-icon-button">
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

window.onContactClickById = function (contactId) {
    const contact = allContacts[contactId];
    onContactClick(contact);
};

function onContactClick(contact) {
  const card = document.querySelector('.contact-details-card');
  if (isAnimating) return;
  isAnimating = true;
  document.querySelectorAll('.contact').forEach(el => el.classList.remove('active'));
  const clickedContactElement = document.querySelector(`.contact[data-id="${contact.id}"]`);
  if (activeContactId === contact.id) {
    card.classList.remove('visible');
    clickedContactElement?.classList.remove('active');
    setTimeout(() => {
      card.innerHTML = '';
      activeContactId = null;
      isAnimating = false;
    }, 400);
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