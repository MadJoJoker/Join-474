/**
 * Cleans raw contact data retrieved from Firebase.
 * Handles cases where keys might have leading spaces (e.g., " name" instead of "name").
 *
 * @param {object} rawContacts - An object containing raw contact data from Firebase.
 * @returns {object} An object with cleaned contact data.
 */
export function cleanContacts(rawContacts) {
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
 * Groups contacts into an object based on the first letter of their name.
 * @param {object[]} contactsArray - Array of contact objects.
 * @returns {object} Ungrouped object of initials → contacts array.
 */
function groupByInitial(contactsArray) {
  const groups = {};
  for (const contact of contactsArray) {
    const initial = contact.name?.charAt(0).toUpperCase() || "#";
    if (!groups[initial]) {
      groups[initial] = [];
    }
    groups[initial].push(contact);
  }
  return groups;
}

/**
 * Sorts an array of contacts by their name (A–Z).
 * 
 * @param {object[]} contacts - Array of contact objects.
 * @returns {object[]} Sorted array of contacts.
 */
function sortContactsByName(contacts) {
  return contacts.sort((firstContact, secondContact) =>
    firstContact.name.localeCompare(secondContact.name)
  );
}

/**
 * Sorts all contact groups by initial and then by name within each group.
 * 
 * @param {object} groupedContacts - Object with initials as keys and arrays of contacts as values.
 * @returns {object} Sorted contact groups.
 */
function sortGroupedContacts(groupedContacts) {
  const sortedInitials = Object.keys(groupedContacts).sort();
  const sortedGroups = {};
  for (const initial of sortedInitials) {
    const contactsInGroup = groupedContacts[initial];
    sortedGroups[initial] = sortContactsByName(contactsInGroup);
  }
  return sortedGroups;
}

/**
 * Groups and sorts contacts by the first initial of their name.
 * @param {object[]} contactsArray
 * @returns {object} Sorted contact groups.
 */
export function groupContactsByInitials(contactsArray) {
  const unstructuredGroups = groupByInitial(contactsArray);
  return sortGroupedContacts(unstructuredGroups);
}