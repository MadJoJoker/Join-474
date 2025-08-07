import { addSubtask } from "./subtask-handler.js";
import {
  demoSelectAssignedContact,
  demoSelectCategory,
} from "./dropdown-menu.js";
import { clearInvalidFields } from "./dropdown-menu-auxiliary-function.js";

/** *
 * This script handles the autofill functionality for the add task form.
 * It automatically fills the left and right forms with predefined values.
 * Clears invalid fields before autofilling.
 */
export function autofillForms() {
  clearInvalidFields();
  autofillLeftForm();
  autofillRightForm();
}

/**
 * Automatically fills the left form with predefined values.
 */
function autofillLeftForm() {

  document.getElementById("title").value = "Join prüfen";
  document.getElementById("task-description").value =
    "Die erfolgreiche Prüfung eines IT-Projekts ist entscheidend. Beginnen Sie mit der Verifizierung der Projektziele und Anforderungen. Dokumentieren Sie alle Erkenntnisse präzise. Fassen Sie die Ergebnisse zusammen und leiten Sie konkrete Handlungsempfehlungen ab. Eine transparente und systematische Prüfung ebnet den Weg für den Erfolg Ihres IT-Projekts.";
  document.getElementById("datepicker").value = "22.07.2026";
}

/**
 * Automatically fills the right form with predefined values.
 */
async function autofillRightForm() {

  demoSelectAssignedContact("Gisela Gänsehaut");
  demoSelectCategory("User Story");
  document.getElementById("subtask-input").value =
    "Smile if it worked until here.";
  try {
    await addSubtask();
  } catch (err) {
    console.error("Error adding subtask:", err);
  }
}