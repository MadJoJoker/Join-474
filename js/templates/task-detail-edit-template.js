import { getAddTaskFormHTML } from "./add-task-template.js";
import {
  openSpecificOverlay,
  initOverlayListeners,
} from "../events/overlay-handler.js";


/**
 * Öffnet das Edit-Overlay und zeigt das ausgefüllte Add-Task-Formular an.
 * @param {Object} task - Das Aufgabenobjekt.
 */
export async function openTaskDetailEditOverlay(task) {
  // Lade das Overlay-HTML
  const response = await fetch("js/templates/task-detail-edit-overlay.html");
  const editOverlayHtml = await response.text();

  const overlayContainer = document.getElementById("overlay-container");
  if (!overlayContainer) {
    console.error("Overlay-Container nicht gefunden!");
    return;
  }
  overlayContainer.innerHTML = editOverlayHtml;

  const overlayElement = document.getElementById("overlay-task-detail-edit");
  if (!overlayElement) {
    console.error("Edit-Overlay-Element nicht gefunden!");
    return;
  }
  const container = overlayElement.querySelector("#task-edit-container");
  if (!container) {
    console.error("Edit-Formular-Container nicht gefunden!");
    return;
  }
  container.innerHTML = getAddTaskFormHTML(task);

  openSpecificOverlay("overlay-task-detail-edit");
  initOverlayListeners("overlay-task-detail-edit");
}

/**
 * Lädt das HTML für das Task-Bearbeitungsformular (via getAddTaskFormHTML)
 * und befüllt es mit den übergebenen Task-Daten.
 * @param {object} task - Das Task-Objekt, dessen Daten im Formular angezeigt werden sollen.
 * @returns {Promise<string>} Ein Promise, das den befüllten HTML-String des Formulars auflöst.
 */
export async function getPopulatedTaskEditFormHtml(task) {
    try {
        // Holen Sie das Basis-HTML für das Add Task Formular
        const htmlString = getAddTaskFormHTML(); // Rufen Sie die Funktion direkt auf

        // Ein temporäres DOM-Element erstellen, um das HTML zu parsen und zu manipulieren
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        // --- HIER DIE ANPASSUNGEN FÜR DAS BEARBEITEN VORNEHMEN ---
        // 1. Titel im Überschriftenbereich anpassen
        const mainTitleH1 = tempDiv.querySelector('h1');
        if (mainTitleH1) {
            mainTitleH1.textContent = 'Edit Task'; // Oder 'Aufgabe bearbeiten'
        }
        // Optionale Beschriftung unter dem H1, falls du einen spezifischen Platzhalter hast
        const editTaskTitlePlaceholder = tempDiv.querySelector('#edit-task-title-placeholder');
        if (editTaskTitlePlaceholder) {
             editTaskTitlePlaceholder.textContent = task.title || '';
        }

        // 2. Felder mit Task-Daten befüllen
        const titleInput = tempDiv.querySelector('#title'); // Achtung: ID ist jetzt 'title', nicht 'edit-title'
        if (titleInput) {
            titleInput.value = task.title || '';
            // Da es ein Edit-Formular ist, könnte man den "required" Sternchen hinzufügen
            // und die Fehlermeldungen temporär ausblenden, falls sie nicht validiert wurden.
        }

        const descriptionTextarea = tempDiv.querySelector('#task-description'); // Achtung: ID ist 'task-description'
        if (descriptionTextarea) {
            descriptionTextarea.value = task.description || '';
        }

        const dueDateInput = tempDiv.querySelector('#datepicker'); // Achtung: ID ist 'datepicker'
        if (dueDateInput && task.dueDate) {
            // Stelle sicher, dass task.dueDate im richtigen Format (YYYY-MM-DD) ist
            // oder konvertiere es bei Bedarf, da input type="date" das erwartet.
            dueDateInput.value = task.dueDate;
        }

        // 3. Priorität setzen
        // Entferne zuerst die 'active' Klasse von allen Prioritäts-Buttons
        const priorityButtons = tempDiv.querySelectorAll('.priority-btn');
        priorityButtons.forEach(btn => btn.classList.remove('active'));

        // Füge die 'active' Klasse zum entsprechenden Button hinzu
        const selectedPriorityBtn = tempDiv.querySelector(`.priority-btn[data-priority="${task.priority}"]`);
        if (selectedPriorityBtn) {
            selectedPriorityBtn.classList.add('active');
        }

        // 4. Assigned to Section (Komplexer, da es ein Dropdown ist)
        // Hier müsstest du Logik hinzufügen, um Kontakte als ausgewählt zu markieren
        // Dies würde wahrscheinlich bedeuten, dass du durch boardData.contacts iterierst
        // und für jeden zugewiesenen Kontakt ein Initialen-Circle erstellst
        // und die entsprechenden Optionen im Dropdown markierst.
        // Das kann nicht einfach mit innerHTML.replace gemacht werden, da es DOM-Interaktion benötigt.
        // Du würdest hier wahrscheinlich die Kontaktliste und die zugewiesenen Kontakte
        // im 'assigned-to-options-container' und 'assigned-to-area' dynamisch aufbauen.

        // 5. Category Section (ähnlich wie Assigned to)
        // Hier müsstest du die ausgewählte Kategorie im 'selected-category' anzeigen
        // und die entsprechende Option im 'category-options-container' markieren.

        // 6. Subtasks Section
        // Hier müsstest du die Subtasks aus task.subtasks laden und als <li>-Elemente in die 'subtasks-list' einfügen.

        // 7. Button-Texte anpassen (von "Create Task" zu "Save Changes")
        const createBtn = tempDiv.querySelector('.create-btn');
        if (createBtn) {
            createBtn.textContent = 'Save Changes';
            // Optional: Das Icon anpassen, wenn du ein anderes Icon für "Speichern" hast
            const checkMarkIcon = createBtn.querySelector('img');
            if (checkMarkIcon) {
                // checkMarkIcon.src = '../assets/icons/btn/save.svg'; // Beispiel für anderes Icon
            }
        }

        return tempDiv.innerHTML;

    } catch (error) {
        console.error('Fehler beim Laden oder Befüllen des Bearbeitungsformular-Templates:', error);
        return '<div>Fehler beim Laden des Bearbeitungsformulars.</div>';
    }
}
