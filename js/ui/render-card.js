import { getTaskOverlay } from "../templates/task-details-template.js";
import {
  openSpecificOverlay,
  closeSpecificOverlay,
  initOverlayListeners,
} from "../events/overlay-handler.js";
import { getAddTaskFormHTML } from "../templates/add-task-template.js";
import {
  setCategoryFromTaskForCard,
  setAssignedContactsFromTaskForCard,
} from "../events/dropdown-menu.js";
import { CWDATA } from "../data/task-to-firbase.js";

/**
 * Validiert die Eingabedaten für die Task-Karte.
 * @param {object} boardData - Die gesamten Board-Daten.
 * @param {string} taskID - Die ID der Task.
 * @returns {boolean} True, wenn die Daten gültig sind, sonst false.
 */
function validateTaskCardInput(boardData, taskID) {
  if (!boardData || !taskID || !boardData.tasks || !boardData.contacts) {
    return false;
  }
  const task = boardData.tasks[taskID];
  if (!task) {
    return false;
  }
  return true;
}

/**
 * Extrahiert grundlegende Task-Details.
 * @param {object} task - Das Task-Objekt.
 * @returns {{title: string, description: string, type: string, priority: string}} Die extrahierten Details.
 */
function getTaskDetails(task) {
  const title = task.title || "Kein Titel";
  const description = (task.description || "").trim();
  const type = task.type || "Unbekannt";
  const priority = task.priority || "Unbekannt";
  return { title, description, type, priority };
}

/**
 * Ermittelt die CSS-Klasse für die Task-Kategorie.
 * @param {string} type - Der Typ der Task (z.B. 'User Story').
 * @returns {string} Die entsprechende CSS-Klasse.
 */
function getCategoryClass(type) {
  if (type === "User Story") return "category-user-story";
  if (type === "Technical Task") return "category-technical-task";
  if (type === "Meeting") return "category-meeting";
  return "category-default";
}

/**
 * Berechnet den Fortschritt der Subtasks.
 * @param {object} task - Das Task-Objekt.
 * @returns {{done: number, total: number, percent: number, subText: string}} Der Fortschritt der Subtasks.
 */
function calculateSubtaskProgress(task) {
  let subtasksArray = [];
  // Standard: Array von Objekten mit .completed
  if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
    subtasksArray = task.subtasks;
  } else if (
    Array.isArray(task.totalSubtask) &&
    Array.isArray(task.checkedSubtasks) &&
    task.totalSubtask.length === task.checkedSubtasks.length
  ) {
    // Kompatibilität: totalSubtask (Texte) + checkedSubtasks (Booleans)
    subtasksArray = task.totalSubtask.map((text, i) => ({
      text,
      completed: !!task.checkedSubtasks[i],
    }));
  }
  const done = subtasksArray.filter((sub) => sub.completed).length;
  const total = subtasksArray.length;
  const percent = total > 0 ? (done / total) * 100 : 0;
  const subText =
    total > 0 ? `${done}/${total} Subtasks` : "Keine Unteraufgaben";
  return { done, total, percent, subText };
}

/**
 * Generiert den HTML-String für die Avatare der zugewiesenen Benutzer.
 * @param {string[]} assignedUserIDs - IDs der zugewiesenen Benutzer.
 * @param {object} contacts - Das Kontakte-Objekt.
 * @returns {string} Der HTML-String der Avatare.
 */
function generateAssignedAvatarsHtml(assignedUserIDs, contacts) {
  let avatarsHtml = "";
  const users = Array.isArray(assignedUserIDs) ? assignedUserIDs : [];
  const displayCount = 3;
  for (let i = 0; i < Math.min(users.length, displayCount); i++) {
    const id = users[i];
    const contact = contacts[id];
    avatarsHtml += renderContactAvatar(contact);
  }
  if (users.length > displayCount) {
    avatarsHtml += `<div class="assigned-initials-circle more-users-circle">+${
      users.length - displayCount
    }</div>`;
  }
  return avatarsHtml;
}

/**
 * Rendert einen einzelnen Kontakt-Avatar.
 * @param {object} contact - Das Kontakt-Objekt.
 * @returns {string} Der HTML-String des Avatars.
 */
function renderContactAvatar(contact) {
  if (!contact) {
    return `<div class="assigned-initials-circle" style="background-color: var(--grey);" title="Unbekannt">?</div>`;
  }
  const initials = (contact.initials || "").trim();
  const name = (contact.name || "").trim();
  const colorRaw = contact.avatarColor || "default";
  const colorStyle = colorRaw.startsWith("--") ? `var(${colorRaw})` : colorRaw;
  return `<div class="assigned-initials-circle" style="background-color: ${colorStyle};" title="${name}">${initials}</div>`;
}

/**
 * Ermittelt das Icon und den Text für die Priorität.
 * @param {string} prio - Die Priorität ('low', 'medium', 'urgent').
 * @returns {{icon: string, prioText: string}} Icon-Pfad und Prioritäts-Text.
 */
function getPriorityIconAndText(prio) {
  if (prio === "low")
    return { icon: `../assets/icons/property/low.svg`, prioText: "Niedrig" };
  if (prio === "medium")
    return { icon: `../assets/icons/property/medium.svg`, prioText: "Mittel" };
  if (prio === "urgent")
    return {
      icon: `../assets/icons/property/urgent.svg`,
      prioText: "Dringend",
    };
  return {
    icon: `../assets/icons/property/default.svg`,
    prioText: "Unbekannt",
  };
}

/**
 * Baut den vollständigen HTML-Inhalt einer Task-Karte.
 * @param {string} taskID - Die ID der Task.
 * @param {object} taskDetails - Die Task-Details.
 * @param {object} subtaskProgress - Der Subtask-Fortschritt.
 * @param {string} avatarsHtml - Die Avatare der zugewiesenen Benutzer.
 * @param {object} priorityInfo - Prioritätsinformationen.
 * @returns {string} Der HTML-String der Task-Karte.
 */
function buildTaskCardHtmlContent(
  taskID,
  taskDetails,
  subtaskProgress,
  avatarsHtml,
  priorityInfo
) {
  const { title, description, type } = taskDetails;
  const { total, percent, subText } = subtaskProgress;
  const { icon, prioText } = priorityInfo;
  const categoryClass = getCategoryClass(type);

  return `
        <div class="task-card" id="${taskID}" draggable="true">
           <div class="d-flex space-between"> <div class="task-category ${categoryClass}">${type}</div><div>
            <button class="dropdown-menu-board-site-btn"><div><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_294678_9764" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
<rect y="20" width="20" height="20" transform="rotate(-90 0 20)" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_294678_9764)">
<path d="M13.3333 15.1457L14.8958 13.5832C15.0486 13.4304 15.2396 13.354 15.4688 13.354C15.6979 13.354 15.8958 13.4304 16.0625 13.5832C16.2292 13.7498 16.3125 13.9478 16.3125 14.1769C16.3125 14.4061 16.2292 14.604 16.0625 14.7707L13.0833 17.7498C13 17.8332 12.9097 17.8922 12.8125 17.9269C12.7153 17.9616 12.6111 17.979 12.5 17.979C12.3889 17.979 12.2847 17.9616 12.1875 17.9269C12.0903 17.8922 12 17.8332 11.9167 17.7498L8.91667 14.7498C8.75 14.5832 8.67014 14.3887 8.67708 14.1665C8.68403 13.9443 8.77083 13.7498 8.9375 13.5832C9.10417 13.4304 9.29861 13.3505 9.52083 13.3436C9.74306 13.3366 9.9375 13.4165 10.1042 13.5832L11.6667 15.1457V9.99984C11.6667 9.76373 11.7465 9.56581 11.9062 9.40609C12.066 9.24636 12.2639 9.1665 12.5 9.1665C12.7361 9.1665 12.934 9.24636 13.0938 9.40609C13.2535 9.56581 13.3333 9.76373 13.3333 9.99984V15.1457ZM8.33333 4.854V9.99984C8.33333 10.2359 8.25347 10.4339 8.09375 10.5936C7.93403 10.7533 7.73611 10.8332 7.5 10.8332C7.26389 10.8332 7.06597 10.7533 6.90625 10.5936C6.74653 10.4339 6.66667 10.2359 6.66667 9.99984L6.66667 4.854L5.10417 6.4165C4.95139 6.56928 4.76042 6.64567 4.53125 6.64567C4.30208 6.64567 4.10417 6.56928 3.9375 6.4165C3.77083 6.24984 3.6875 6.05192 3.6875 5.82275C3.6875 5.59359 3.77083 5.39567 3.9375 5.229L6.91667 2.24984C7 2.1665 7.09028 2.10748 7.1875 2.07275C7.28472 2.03803 7.38889 2.02067 7.5 2.02067C7.61111 2.02067 7.71528 2.03803 7.8125 2.07275C7.90972 2.10748 8 2.1665 8.08333 2.24984L11.0833 5.24984C11.25 5.4165 11.3299 5.61095 11.3229 5.83317C11.316 6.05539 11.2292 6.24984 11.0625 6.4165C10.8958 6.56928 10.7014 6.64914 10.4792 6.65609C10.2569 6.66303 10.0625 6.58317 9.89583 6.4165L8.33333 4.854Z" fill="#2A3647"/>
</g>
</svg>

</button>
  <div id="dropdown-menu-board-site" class="dropdown-menu-board-site">
                <h3 class="dorpdown-headline">Move to</h3>
                <div class="d-flex justify-content flex-direction">
    <a href="#" class="move-task-up" data-task-id="${taskID}">↑ Up</a>
    <a href="#" class="move-task-down" data-task-id="${taskID}">↓ Down</a>
    <a href="/index.html">Home <img src="../assets/icons/logo/joinLogo.svg" alt="joinLogo" width="20" height="15"></a>
</div>
  </div>
</div></div>
            <div class="task-content">
                <h3 class="task-title">${title}</h3>
                <p class="task-description">${description}</p>
                ${
                  total > 0
                    ? `
                    <div class="progress-container">
                        <div class="progress-bar-track">
                            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                        </div>
                        <span class="subtasks-text">${subText}</span>
                    </div>`
                    : ""
                }
            </div>
            <div class="task-footer">
                <div class="assigned-users">${avatarsHtml}</div>
                <div class="priority-icon">
                    <img src="${icon}" alt="${prioText}" title="${prioText}">
                </div>
            </div>
        </div>
    `;
}

/**
 * Erstellt den HTML-String für eine einzelne Task-Karte auf dem Board.
 * @param {object} boardData - Das gesamte Board-Datenobjekt (Tasks, Kontakte etc.).
 * @param {string} taskID - Die ID der Task, die gerendert werden soll.
 * @returns {string} Der HTML-String der Task-Karte.
 */
export function createSimpleTaskCard(boardData, taskID) {
  if (!validateTaskCardInput(boardData, taskID)) return "";
  const task = boardData.tasks[taskID];
  const contacts = boardData.contacts;
  const taskDetails = getTaskDetails(task);
  const subtaskProgress = calculateSubtaskProgress(task);
  const avatarsHtml = generateAssignedAvatarsHtml(task.assignedUsers, contacts);
  const priorityInfo = getPriorityIconAndText(task.priority);
  return buildTaskCardHtmlContent(
    taskID,
    taskDetails,
    subtaskProgress,
    avatarsHtml,
    priorityInfo
  );
}

// --- Overlay-Management und Event-Listener für Overlays ---
// Exportierte Variable für die geänderten Task-Daten
export let editedTaskData = null;

// Globale Referenzen für die Overlay-Elemente
let detailOverlayElement = null;
let editOverlayElement = null;

/**
 * Lädt das HTML für das Task-Detail-Overlay einmalig in den DOM.
 */
async function loadDetailOverlayHtmlOnce() {
  if (detailOverlayElement) return;

  try {
    const response = await fetch("../js/templates/task-details-overlay.html");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const overlayContainer = document.getElementById("overlay-container");
    if (overlayContainer) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      detailOverlayElement = tempDiv.firstElementChild;
      overlayContainer.appendChild(detailOverlayElement);
      initOverlayListeners("overlay-task-detail");
    } else {
      console.error("Overlay container not found!");
    }
  } catch (error) {
    console.error("Failed to load task-detail-overlay.html:", error);
  }
}

/**
 * Lädt das HTML für das Task-Bearbeitungs-Overlay einmalig in den DOM.
 */
async function loadEditOverlayHtmlOnce() {
  if (editOverlayElement) return;

  try {
    const response = await fetch(
      "../js/templates/task-detail-edit-overlay.html"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const overlayContainer = document.getElementById("overlay-container");
    if (overlayContainer) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      editOverlayElement = tempDiv.firstElementChild;
      overlayContainer.appendChild(editOverlayElement);
      initOverlayListeners("overlay-task-detail-edit");
    } else {
      console.error("Overlay container not found!");
    }
  } catch (error) {
    console.error("Failed to load task-details-edit-overlay.html:", error);
  }
}

/**
 * Registriert Event-Listener für alle Task-Karten, um Overlays zu öffnen
 * und die Bearbeitungsfunktion zu ermöglichen.
 * @param {object} boardData - Das gesamte Board-Datenobjekt (Tasks, Kontakte etc.).
 * @param {Function} updateBoardFunction - Callback-Funktion zum Aktualisieren des Boards nach dem Speichern (optional).
 */
export async function registerTaskCardDetailOverlay(
  boardData,
  updateBoardFunction
) {
  // Lade beide Overlays einmalig beim Start der Anwendung
  await loadDetailOverlayHtmlOnce();
  await loadEditOverlayHtmlOnce();

  const cards = document.querySelectorAll(".task-card");

  cards.forEach((card) => {
    // Remove old click listener if present
    const oldClickListener = card.getAttribute("data-has-click-listener");
    if (oldClickListener) {
      card.removeEventListener("click", card._currentClickListener);
    }

    // Dropdown-Button-Handler
    const dropdownBtn = card.querySelector(".dropdown-menu-board-site-btn");
    const dropdownMenu = card.querySelector(".dropdown-menu-board-site");
    if (dropdownBtn && dropdownMenu) {
      dropdownBtn.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
          e.stopPropagation();
          dropdownMenu.classList.toggle("show");
          document
            .querySelectorAll(".dropdown-menu-board-site.show")
            .forEach((menu) => {
              if (menu !== dropdownMenu) menu.classList.remove("show");
            });
          const closeDropdown = (ev) => {
            if (
              !dropdownMenu.contains(ev.target) &&
              ev.target !== dropdownBtn
            ) {
              dropdownMenu.classList.remove("show");
              document.removeEventListener("click", closeDropdown);
            }
          };
          setTimeout(
            () => document.addEventListener("click", closeDropdown),
            0
          );
        }
      });

      // Move-Up/Down-Handler
      const moveUp = dropdownMenu.querySelector(".move-task-up");
      const moveDown = dropdownMenu.querySelector(".move-task-down");
      // Mapping für Firebase-kompatible columnIDs
      const columnOrder = [
        { key: "toDo", label: "todo" },
        { key: "inProgress", label: "inProgress" },
        { key: "review", label: "review" },
        { key: "done", label: "done" },
      ];
      if (moveUp) {
        moveUp.addEventListener("click", async function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          const taskId = this.dataset.taskId;
          const task = boardData.tasks[taskId];
          console.log("[MoveUp] Clicked for taskId:", taskId, "task:", task);
          if (!task) return;
          const currentIdx = columnOrder.findIndex(
            (col) => col.key === task.columnID
          );
          console.log(
            "[MoveUp] Current column index:",
            currentIdx,
            "columnID:",
            task.columnID
          );
          if (currentIdx > 0) {
            const newColumnID = columnOrder[currentIdx - 1].key;
            console.log("[MoveUp] Moving task to new columnID:", newColumnID);
            task.columnID = newColumnID;
            await CWDATA(task, boardData); // Persistiere Änderung
            console.log(
              "[MoveUp] Persisted new columnID, redirecting to board-site.html"
            );
            window.location.href = "board-site.html";
          }
        });
        console.log(
          "[registerTaskCardDetailOverlay] MoveUp-Listener attached for card:",
          card.id
        );
      }
      if (moveDown) {
        moveDown.addEventListener("click", async function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          const taskId = this.dataset.taskId;
          const task = boardData.tasks[taskId];
          console.log("[MoveDown] Clicked for taskId:", taskId, "task:", task);
          if (!task) return;
          const currentIdx = columnOrder.findIndex(
            (col) => col.key === task.columnID
          );
          console.log(
            "[MoveDown] Current column index:",
            currentIdx,
            "columnID:",
            task.columnID
          );
          if (currentIdx < columnOrder.length - 1) {
            const newColumnID = columnOrder[currentIdx + 1].key;
            console.log("[MoveDown] Moving task to new columnID:", newColumnID);
            task.columnID = newColumnID;
            await CWDATA(task, boardData); // Persistiere Änderung
            console.log(
              "[MoveDown] Persisted new columnID, redirecting to board-site.html"
            );
            window.location.href = "board-site.html";
          }
        });
        console.log(
          "[registerTaskCardDetailOverlay] MoveDown-Listener attached for card:",
          card.id
        );
      }
    }

    // Card-Click-Handler (öffnet Overlay, aber nicht wenn auf Dropdown-Button)
    const newClickListener = async function (e) {
      // Verhindere, dass Klicks auf Avatare, Prioritätsicons oder Dropdown-Button das Overlay öffnen
      if (
        e.target.classList.contains("assigned-initials-circle") ||
        e.target.closest(".priority-icon") ||
        e.target.closest(".dropdown-menu-board-site-btn")
      ) {
        return;
      }

      const taskId = card.id;
      const task = boardData.tasks[taskId];
      if (!task) {
        console.error(
          `Task with ID ${taskId} not found. Cannot open detail overlay.`
        );
        return;
      }
      if (!detailOverlayElement) {
        console.error(
          "Detail overlay element not initialized. Cannot open detail overlay."
        );
        return;
      }
      function renderDetailOverlay(taskId) {
        openSpecificOverlay("overlay-task-detail");
        const task = boardData.tasks[taskId];
        const container = detailOverlayElement.querySelector("#task-container");
        if (container) {
          const html = getTaskOverlay(task, taskId, boardData.contacts);
          container.innerHTML = html;
        }
        // Attach close button listener
        const closeBtn = detailOverlayElement.querySelector(
          ".close-modal-btn, .close-modal-btn-svg"
        );
        if (closeBtn) {
          closeBtn.onclick = () => {
            closeSpecificOverlay("overlay-task-detail");
            if (container) {
              container.innerHTML = "";
            }
          };
        }
        // Attach edit button listener
        const editButton = detailOverlayElement.querySelector(".edit-task-btn");
        if (editButton) {
          editButton.dataset.taskId = taskId;
          editButton.onclick = null;
          editButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            renderEditOverlay(taskId);
          });
        }

        // Delegated delete button listener
        const deleteButton =
          detailOverlayElement.querySelector(".delete-task-btn");
        if (deleteButton) {
          deleteButton.dataset.taskId = taskId;
          deleteButton.onclick = null;
          deleteButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            const deleteId = event.currentTarget.dataset.taskId;
            console.debug("[Delete] Clicked for taskId:", deleteId);
            if (boardData.tasks[deleteId]) {
              delete boardData.tasks[deleteId];
              console.debug("[Delete] Task removed from boardData:", deleteId);
              await CWDATA({}, boardData);
              console.debug(
                "[Delete] CWDATA called with empty object for:",
                deleteId
              );
              closeSpecificOverlay("overlay-task-detail");
              if (updateBoardFunction) {
                await updateBoardFunction();
              }
            } else {
              console.warn("[Delete] Task not found for deletion:", deleteId);
            }
          });
          console.debug(
            "[Delete] Delegated event listener set for delete button, taskId:",
            taskId
          );
        } else {
          console.debug(
            "[Delete] No delete button found in detail overlay for taskId:",
            taskId
          );
        }
      }

      function renderEditOverlay(taskToEditId) {
        closeSpecificOverlay("overlay-task-detail");
        openSpecificOverlay("overlay-task-detail-edit");
        if (!editOverlayElement) {
          console.error(
            "Edit overlay element not initialized. Cannot open edit overlay."
          );
          return;
        }
        const taskToEdit = boardData.tasks[taskToEditId];
        const taskEditContainer = editOverlayElement.querySelector(
          "#task-edit-container"
        );
        if (taskEditContainer) {
          taskEditContainer.innerHTML = getAddTaskFormHTML(taskToEdit);
          import("../events/priorety-handler.js").then((mod) => {
            mod.initPriorityButtons();
            const prio = taskToEdit.priority || "medium";
            const prioBtn = taskEditContainer.querySelector(
              `.priority-btn[data-priority="${prio}"]`
            );
            if (prioBtn) mod.setPriority(prioBtn, prio);
          });
          import("../events/dropdown-menu.js").then(async (mod) => {
            await mod.initDropdowns(
              Object.values(boardData.contacts),
              taskEditContainer
            );
            await setCategoryFromTaskForCard(taskToEdit.type);
            await setAssignedContactsFromTaskForCard(taskToEdit.assignedUsers);
          });
          import("../templates/add-task-template.js").then((mod) => {
            if (mod.initDatePicker) mod.initDatePicker(taskEditContainer);
          });
          import("../events/subtask-handler.js").then((mod) => {
            if (mod.initSubtaskManagementLogic)
              mod.initSubtaskManagementLogic(taskEditContainer);
          });
          // Cancel button returns to details overlay
          const cancelEditBtn = taskEditContainer.querySelector(".cancel-btn");
          if (cancelEditBtn) {
            cancelEditBtn.onclick = () => {
              closeSpecificOverlay("overlay-task-detail-edit");
              renderDetailOverlay(taskToEditId);
            };
          }
          // Submit handler
          const taskEditForm =
            taskEditContainer.querySelector("#add-task-form");
          if (taskEditForm) {
            taskEditForm.addEventListener("submit", async (formEvent) => {
              const submitter = formEvent.submitter;
              if (!submitter || submitter.type !== "submit") {
                formEvent.preventDefault();
                return;
              }
              formEvent.preventDefault();
              const formData = new FormData(taskEditForm);
              editedTaskData = {
                id: taskToEditId,
                title: formData.get("title"),
                description: formData.get("task-description"),
                dueDate: formData.get("datepicker"),
                assignedTo: formData.get("select-contacts")
                  ? formData
                      .get("select-contacts")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [],
                category: formData.get("hidden-category-input"),
                subtasks: Array.from(
                  taskEditForm.querySelectorAll("#subtasks-list li")
                ).map((li) => li.textContent),
              };
              closeSpecificOverlay("overlay-task-detail-edit");
              if (updateBoardFunction) {
                await updateBoardFunction();
              }
              // Show the details overlay for the updated task
              renderDetailOverlay(taskToEditId);
            });
          }
        } else {
          console.error(
            "Task edit container (#task-edit-container) not found in edit overlay."
          );
        }
      }

      // Initial render of details overlay for this card
      renderDetailOverlay(taskId);
    };
    card.addEventListener("click", newClickListener);
    card.setAttribute("data-has-click-listener", "true");
    card._currentClickListener = newClickListener;
  });
}
