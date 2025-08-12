/**
 * Tracks whether live validation for the "New Contact" form
 * has been enabled to avoid adding duplicate event listeners.
 * @type {boolean}
 */
let newFormLiveEnabled = false;

/**
 * Tracks whether live validation for the "Edit Contact" form
 * has been enabled to avoid adding duplicate event listeners.
 * @type {boolean}
 */
let editFormLiveEnabled = false;

/**
 * Retrieves the trimmed value of the "New Contact Name" input.
 * @returns {string}
 */
export function getNewContactName() { return document.getElementById('newContactName')?.value.trim() || ''; }

/**
 * Retrieves the trimmed value of the "New Contact Email" input.
 * @returns {string}
 */
export function getNewContactEmail() { return document.getElementById('newContactEmail')?.value.trim() || ''; }

/**
 * Retrieves the trimmed value of the "New Contact Phone" input.
 * @returns {string}
 */
export function getNewContactPhone() { return document.getElementById('newContactPhone')?.value.trim() || ''; }

/**
 * Retrieves the trimmed value of the "Edit Contact Name" input.
 * @returns {string}
 */
export function getEditName()  { return document.getElementById('editNameInput')?.value.trim() || ''; }

/**
 * Retrieves the trimmed value of the "Edit Contact Email" input.
 * @returns {string}
 */
export function getEditEmail() { return document.getElementById('editEmailInput')?.value.trim() || ''; }

/**
 * Retrieves the trimmed value of the "Edit Contact Phone" input.
 * @returns {string}
 */
export function getEditPhone() { return document.getElementById('editPhoneInput')?.value.trim() || ''; }

/**
 * Validates the contact form fields and returns error messages per field.
 * @param {string} name - Full name (expects first + last separated by space).
 * @param {string} email - Email address.
 * @param {string} phone - Phone number.
 * @returns {{ name: string, email: string, phone: string }}
 */
export function validateCustomContactForm(name, email, phone) {
  const errors = { name: '', email: '', phone: '' };
  if (!name || !/^[A-Za-zÄÖÜäöüß\-]{2,}\s+[A-Za-zÄÖÜäöüß\-]{2,}$/.test(name)) {
    errors.name = 'First and last name required separated by a space.';
  }
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    errors.email = 'Valid email required';
  }
  if (!phone || !/^\+?[0-9\s\/\-]{6,}$/.test(phone)) {
    errors.phone = 'Valid phone number required (min. 6 digits).';
  }
  return errors;
}

/**
 * Thin wrapper over validateCustomContactForm for edit flows.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @returns {{ name: string, email: string, phone: string }}
 */
export function validateEditContact(name, email, phone) {
  return validateCustomContactForm(name, email, phone);
}

/**
 * Toggles the "input-error" CSS class on an input element.
 * @param {HTMLElement} inputEl - Target input element.
 * @param {boolean} hasError - Whether the field is invalid.
 * @returns {void}
 */
export function toggleErrorClass(inputEl, hasError) {
  if (!inputEl) return;
  inputEl.classList.toggle('input-error', !!hasError);
}

/**
 * Displays validation error messages for the "Add New Contact" form.
 * @param {{ name: string, email: string, phone: string }} errors
 * @returns {void}
 */
export function showNewContactErrors(errors) {
  const nameInput  = document.getElementById('newContactName');
  const emailInput = document.getElementById('newContactEmail');
  const phoneInput = document.getElementById('newContactPhone');
  document.getElementById('nameError').textContent  = errors.name;
  document.getElementById('emailError').textContent = errors.email;
  document.getElementById('phoneError').textContent = errors.phone;
  toggleErrorClass(nameInput, !!errors.name);
  toggleErrorClass(emailInput, !!errors.email);
  toggleErrorClass(phoneInput, !!errors.phone);
}

/**
 * Displays validation error messages for the "Edit Contact" form.
 * @param {{ name: string, email: string, phone: string }} errors
 * @returns {void}
 */
export function showEditContactErrors(errors) {
  const nameInput  = document.getElementById('editNameInput');
  const emailInput = document.getElementById('editEmailInput');
  const phoneInput = document.getElementById('editPhoneInput');
  document.getElementById('editNameError').textContent  = errors.name;
  document.getElementById('editEmailError').textContent = errors.email;
  document.getElementById('editPhoneError').textContent = errors.phone;
  toggleErrorClass(nameInput, !!errors.name);
  toggleErrorClass(emailInput, !!errors.email);
  toggleErrorClass(phoneInput, !!errors.phone);
}

/**
 * Clears all validation messages and error classes for the edit form inputs.
 * @returns {void}
 */
export function clearEditContactErrors() {
  [['editNameInput','editNameError'],['editEmailInput','editEmailError'],['editPhoneInput','editPhoneError']]
    .forEach(([inputId, errorId]) => {
      const el = document.getElementById(errorId);
      if (el) el.textContent = '';
      const input = document.getElementById(inputId);
      if (input) input.classList.remove('input-error');
    });
}

/**
 * Adds live validation to a single input field.
 * Uses a dataset flag to avoid duplicate listeners.
 * @param {string} inputId - The input element's id.
 * @param {() => string} getValue - Getter returning the current value.
 * @param {string} errorId - The element id where error text should be shown.
 * @param {(value: string) => string} validateFn - Returns an error message or empty string.
 * @returns {void}
 */
export function setupLiveFieldValidation(inputId, getValue, errorId, validateFn) {
  const input = document.getElementById(inputId);
  const errorElement = document.getElementById(errorId);
  if (!input || !errorElement) return;
  if (input.dataset.liveValidation === 'true') return;
  const handler = () => {
    const value = getValue();
    const error = validateFn(value);
    errorElement.textContent = error || '';
    toggleErrorClass(input, !!error);
  };
  input.addEventListener('input', handler);
  input.dataset.liveValidation = 'true';
}

/**
 * Enables live validation for the new contact form fields (name, email, phone).
 * @returns {void}
 */
export function setupLiveValidationForNewContactForm() {
  setupLiveFieldValidation('newContactName',  getNewContactName,  'nameError',  v => validateCustomContactForm(v,'','').name);
  setupLiveFieldValidation('newContactEmail', getNewContactEmail, 'emailError', v => validateCustomContactForm('',v,'').email);
  setupLiveFieldValidation('newContactPhone', getNewContactPhone, 'phoneError', v => validateCustomContactForm('','',v).phone);
}

/**
 * Enables live validation for the edit contact form fields (name, email, phone).
 * @returns {void}
 */
export function setupLiveValidationForEditContactForm() {
  setupLiveFieldValidation('editNameInput',  getEditName,  'editNameError',  v => validateCustomContactForm(v,'','').name);
  setupLiveFieldValidation('editEmailInput', getEditEmail, 'editEmailError', v => validateCustomContactForm('',v,'').email);
  setupLiveFieldValidation('editPhoneInput', getEditPhone, 'editPhoneError', v => validateCustomContactForm('','',v).phone);
}

/**
 * Validates the "New Contact" payload and, on first error, enables live validation.
 * @param {{ name: string, email: string, phone: string }} param0
 * @returns {boolean} True if valid; otherwise false.
 */
export function validateNewContactOrEnableLive({ name, email, phone }) {
  const errors = validateCustomContactForm(name, email, phone);
  showNewContactErrors(errors);
  if (errors.name || errors.email || errors.phone) {
    if (!newFormLiveEnabled) {
      newFormLiveEnabled = true;
      setupLiveValidationForNewContactForm();
    }
    return false;
  }
  return true;
}

/**
 * Validates the "Edit Contact" payload and, on first error, enables live validation.
 * @param {{ name: string, email: string, phone: string }} param0
 * @returns {boolean} True if valid; otherwise false.
 */
export function validateEditedContactOrEnableLive({ name, email, phone }) {
  const errors = validateEditContact(name, email, phone);
  showEditContactErrors(errors);
  if (errors.name || errors.email || errors.phone) {
    if (!editFormLiveEnabled) {
      editFormLiveEnabled = true;
      setupLiveValidationForEditContactForm();
    }
    return false;
  }
  return true;
}

/**
 * Resets the live-validation "enabled" flag for the new contact form.
 * Call this when (re)opening the new contact overlay.
 * @returns {void}
 */
export function resetNewLiveValidationFlag()  { newFormLiveEnabled  = false; }

/**
 * Resets the live-validation "enabled" flag for the edit contact form.
 * Call this when (re)opening the edit contact overlay.
 * @returns {void}
 */
export function resetEditLiveValidationFlag() { editFormLiveEnabled = false; }