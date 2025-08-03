import { addSubtask } from "./subtask-handler.js";
import {
  demoSelectAssignedContact,
  demoSelectCategory,
} from "./dropdown-menu.js";
import { clearInvalidFields } from "./dropdown-menu-auxiliary-function.js";

export let autofillLeft = true;
export let autofillRight = true;

/**
 * Automatically fills the left form with predefined values.
 * Clears invalid fields before filling.
 */
export function autoFillLeftForm() {
  clearInvalidFields();

  if (autofillLeft) {
    document.getElementById("title").value = "Join prüfen";
    document.getElementById("task-description").value =
      "Die erfolgreiche Prüfung eines IT-Projekts ist entscheidend. Beginnen Sie mit der Verifizierung der Projektziele und Anforderungen. Dokumentieren Sie alle Erkenntnisse präzise. Fassen Sie die Ergebnisse zusammen und leiten Sie konkrete Handlungsempfehlungen ab. Eine transparente und systematische Prüfung ebnet den Weg für den Erfolg Ihres IT-Projekts.";
    document.getElementById("datepicker").value = "22.07.2025";
    autofillLeft = false;
  }
}

/**
 * Automatically fills the right form with predefined values.
 * Clears invalid fields before filling.
 */
export async function autofillRightForm() {
  clearInvalidFields();

  if (autofillRight) {
    demoSelectAssignedContact("Gisela Gänsehaut");
    demoSelectCategory("User Story");
    document.getElementById("subtask-input").value =
      "Smile if it worked until here.";
    try {
      await addSubtask();
    } catch (err) {
      console.error("Fehler beim Hinzufügen der Subtask:", err);
    }

    autofillRight = false;
  }
}
