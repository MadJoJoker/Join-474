  export let autofillLeft = true;
  export let autofillRight = true;


export function autoFillLeftForm() {

  if (autofillLeft) {
    document.getElementById("title").value = "Join prüfen";
    document.getElementById("task-description").value = "Die erfolgreiche Prüfung eines IT-Projekts ist entscheidend. Beginnen Sie mit der Verifizierung der Projektziele und Anforderungen. Dokumentieren Sie alle Erkenntnisse präzise. Fassen Sie die Ergebnisse zusammen und leiten Sie konkrete Handlungsempfehlungen ab. Eine transparente und systematische Prüfung ebnet den Weg für den Erfolg Ihres IT-Projekts."
    document.getElementById("datepicker").value = "22.07.2025";
    autofillLeft = false;
  }
}

export function autofillRightForm() {

  if (autofillRight) {
    document.getElementById("subtask-input").value = "Smile if it worked until here.";

    autofillRight = false;
  }
}
