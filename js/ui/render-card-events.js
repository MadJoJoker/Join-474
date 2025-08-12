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
} from "../events/dropdown-menu-auxiliary-function.js";
import { CWDATA } from "../data/task-to-firbase.js";
import { editedTaskData } from "./render-card.js";
import { addedSubtasks } from "../events/subtask-handler.js";

export let detailOverlayElement = null;
export let editOverlayElement = null;

/**
 * @param {string} overlayId - The ID of the overlay to load.
 * @returns {Promise<void>} Resolves when the overlay is loaded.
 */
async function loadDetailOverlayHtmlOnce() {
  if (detailOverlayElement) {
    return;
  }
  try {
    const response = await fetch("../js/templates/task-details-overlay.html");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const overlayContainer = document.getElementById("overlay-container");
    if (overlayContainer) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      detailOverlayElement = tempDiv.firstElementChild;
      overlayContainer.appendChild(detailOverlayElement);
      initOverlayListeners("overlay-task-detail");
    }
  } catch (error) {}
}

/**
 * @param {string} overlayId - The ID of the overlay to load.
 * @returns {Promise<void>} Resolves when the overlay is loaded.
 */
async function loadEditOverlayHtmlOnce() {
  if (editOverlayElement) return;
  try {
    const response = await fetch(
      "../js/templates/task-detail-edit-overlay.html"
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const overlayContainer = document.getElementById("overlay-container");
    if (overlayContainer) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      editOverlayElement = tempDiv.firstElementChild;
      overlayContainer.appendChild(editOverlayElement);
      initOverlayListeners("overlay-task-detail-edit");
    }
  } catch (error) {}
}

/**
 * @param {object} boardData - The board data object containing tasks, contacts, etc.
 * @param {function} updateBoardFunction - Callback function to update the board after changes.
 * @returns {Promise<void>} Resolves when listeners are registered.
 */
export async function registerTaskCardDetailOverlay(
  boardData,
  updateBoardFunction
) {
  await loadDetailOverlayHtmlOnce();
  await loadEditOverlayHtmlOnce();
  const cards = document.querySelectorAll(".task-card");
  cards.forEach((card) => {
    // Check if the card already has a click listener and remove it
    const oldClickListener = card.getAttribute("data-has-click-listener");
    if (oldClickListener) {
      card.removeEventListener("click", card._currentClickListener);
    }
    const dropdownBtn = card.querySelector(".dropdown-menu-board-site-btn");
    const dropdownMenu = card.querySelector(".dropdown-menu-board-site");
    if (dropdownBtn && dropdownMenu) {
      dropdownBtn.addEventListener("click", function (e) {
        // Mobile: Toggle dropdown menu and close others
        if (window.innerWidth <= 768) {
          e.stopPropagation();
          dropdownMenu.classList.toggle("show");
          document
            .querySelectorAll(".dropdown-menu-board-site.show")
            .forEach((menu) => {
              if (menu !== dropdownMenu) menu.classList.remove("show");
            });
          // Close dropdown when clicking outside
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
      const moveUp = dropdownMenu.querySelector(".move-task-up");
      const moveDown = dropdownMenu.querySelector(".move-task-down");
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
          if (!task) return;
          const currentIdx = columnOrder.findIndex(
            (col) => col.key === task.columnID
          );
          if (currentIdx > 0) {
            const newColumnID = columnOrder[currentIdx - 1].key;
            task.columnID = newColumnID;
            await CWDATA({ [taskId]: task }, boardData);
            window.location.href = "board-site.html";
          }
        });
      }
      if (moveDown) {
        moveDown.addEventListener("click", async function (ev) {
          ev.preventDefault();
          ev.stopPropagation();
          const taskId = this.dataset.taskId;
          const task = boardData.tasks[taskId];
          if (!task) return;
          const currentIdx = columnOrder.findIndex(
            (col) => col.key === task.columnID
          );
          if (currentIdx < columnOrder.length - 1) {
            const newColumnID = columnOrder[currentIdx + 1].key;
            task.columnID = newColumnID;
            await CWDATA({ [taskId]: task }, boardData);
            window.location.href = "board-site.html";
          }
        });
      }
    }
    const newClickListener = async function (e) {
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
        return;
      }
      if (!detailOverlayElement) {
        return;
      }
      function renderDetailOverlay(taskId) {
        openSpecificOverlay("overlay-task-detail");
        const task = boardData.tasks[taskId];
        const container = detailOverlayElement.querySelector("#task-container");
        // Render the task overlay content
        if (container) {
          const html = getTaskOverlay(task, taskId, boardData.contacts);
          container.innerHTML = html;
        }
        // Add close button event listener for overlay
        const closeBtn = detailOverlayElement.querySelector(
          ".close-modal-btn, .close-modal-btn-svg"
        );
        if (closeBtn) {
          closeBtn.onclick = async () => {
            await handleDetailOverlayClose(taskId, boardData);
            closeSpecificOverlay("overlay-task-detail");
            if (container) {
              container.innerHTML = "";
            }
          };
        }
        // Add event listener for clicking outside the overlay content
        if (detailOverlayElement) {
          const overlayBg = detailOverlayElement;
          overlayBg.onclick = async (e) => {
            if (e.target === overlayBg) {
              await handleDetailOverlayClose(taskId, boardData);
              closeSpecificOverlay("overlay-task-detail");
              if (container) {
                container.innerHTML = "";
              }
            }
          };
        }
        // Add event listener for edit button
        const editButton = detailOverlayElement.querySelector(".edit-task-btn");
        if (editButton) {
          editButton.dataset.taskId = taskId;
          editButton.onclick = null;
          editButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            renderEditOverlay(taskId);
          });
        }
        // Add event listener for delete button
        const deleteButton =
          detailOverlayElement.querySelector(".delete-task-btn");
        if (deleteButton) {
          deleteButton.dataset.taskId = taskId;
          deleteButton.onclick = null;
          deleteButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            const deleteId = event.currentTarget.dataset.taskId;
            if (boardData.tasks[deleteId]) {
              await CWDATA({ [deleteId]: null }, boardData);
              // Remove the task from local data
              delete boardData.tasks[deleteId];
              if (window.firebaseData && window.firebaseData.tasks) {
                delete window.firebaseData.tasks[deleteId];
              }
              closeSpecificOverlay("overlay-task-detail");
              window.location.href = "board-site.html";
            }
          });
        }
      }
      /**
       * @param {string} taskId - The ID of the task to close the overlay for.
       * @param {object} boardData - The board data object.
       */
      async function handleDetailOverlayClose(taskId, boardData) {
        const task = boardData.tasks[taskId];
        const container = detailOverlayElement.querySelector("#task-container");
        // Try to read current values from the overlay
        let title =
          container?.querySelector(".task-title")?.textContent?.trim() ||
          task.title;
        let description =
          container?.querySelector(".task-description")?.textContent?.trim() ||
          task.description;
        let deadline =
          container?.querySelector(".task-deadline")?.textContent?.trim() ||
          task.deadline;
        let type =
          container?.querySelector(".task-type")?.textContent?.trim() ||
          task.type;
        let priority =
          container
            ?.querySelector(".priority-icon.active")
            ?.getAttribute("data-priority") || task.priority;
        // Extract assignedUsers from the initials circles
        let assignedUsers = Array.from(
          container?.querySelectorAll(".assigned-initials-circle") || []
        )
          .map((el) => el.getAttribute("data-contact-id"))
          .filter(Boolean);
        if (!assignedUsers.length) assignedUsers = task.assignedUsers || [];
        // Subtasks and checkedSubtasks
        let totalSubtasks = Array.from(
          container?.querySelectorAll(".subtask-text") || []
        ).map((el) => el.textContent.trim());
        if (!totalSubtasks.length && Array.isArray(task.totalSubtasks))
          totalSubtasks = task.totalSubtasks;
        let checkedSubtasks = Array.from(
          container?.querySelectorAll(".subtask-item")
        ).map((el) => el.classList.contains("completed"));
        if (!checkedSubtasks.length && Array.isArray(task.checkedSubtasks))
          checkedSubtasks = task.checkedSubtasks;
        let subtasksCompleted = String(checkedSubtasks.filter(Boolean).length);
        // Timestamp
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const updatedAt = `${day}.${month}.${year}`;
        // Object structure
        const editTaskObjekt = {
          assignedUsers,
          boardID: task.boardID || "board-1",
          checkedSubtasks,
          columnID: task.columnID || "inProgress",
          createdAt: task.createdAt || updatedAt,
          deadline,
          description,
          priority,
          subtasksCompleted,
          title,
          totalSubtasks,
          type,
          updatedAt,
        };
        const objForCWDATA = { [taskId]: editTaskObjekt };
        await CWDATA(objForCWDATA, boardData);
      }
      function renderEditOverlay(taskToEditId) {
        closeSpecificOverlay("overlay-task-detail");
        openSpecificOverlay("overlay-task-detail-edit");
        if (!editOverlayElement) {
          // Edit overlay element not initialized. Cannot open edit overlay.
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
          import("../events/dropdown-menu-auxiliary-function.js").then(
            async (mod) => {
              await mod.initDropdowns(
                Object.values(boardData.contacts),
                taskEditContainer
              );
              await setCategoryFromTaskForCard(taskToEdit.type);
              await setAssignedContactsFromTaskForCard(
                taskToEdit.assignedUsers
              );
            }
          );
          import("../templates/add-task-template.js").then((mod) => {
            if (mod.initDatePicker) mod.initDatePicker(taskEditContainer);
          });
          import("../events/subtask-handler.js").then((mod) => {
            let subtasks = [];
            if (
              Array.isArray(taskToEdit.subtasks) &&
              taskToEdit.subtasks.length > 0
            ) {
              subtasks = taskToEdit.subtasks.map((st) =>
                typeof st === "string" ? { text: st, completed: false } : st
              );
            } else if (
              Array.isArray(taskToEdit.totalSubtasks) &&
              Array.isArray(taskToEdit.checkedSubtasks) &&
              taskToEdit.totalSubtasks.length ===
                taskToEdit.checkedSubtasks.length
            ) {
              subtasks = taskToEdit.totalSubtasks.map((text, i) => ({
                text,
                completed: !!taskToEdit.checkedSubtasks[i],
              }));
            }
            mod.addedSubtasks.length = 0;
            subtasks.forEach((st) => mod.addedSubtasks.push({ ...st }));
            if (mod.initSubtaskManagementLogic)
              mod.initSubtaskManagementLogic(taskEditContainer);
            if (mod.renderSubtasks) mod.renderSubtasks();
          });
          const cancelEditBtn = taskEditContainer.querySelector(".cancel-btn");
          if (cancelEditBtn) {
            cancelEditBtn.onclick = () => {
              closeSpecificOverlay("overlay-task-detail-edit");
              renderDetailOverlay(taskToEditId);
            };
          }
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
              const fetchData = window.firebaseData || boardData;

              const title =
                taskEditForm.querySelector("[name='title']")?.value || "";
              console.log("[DEBUG] Titel:", title);
              const description =
                taskEditForm.querySelector("[name='task-description']")
                  ?.value || "";
              console.log("[DEBUG] Beschreibung:", description);
              const deadline =
                taskEditForm.querySelector("[name='datepicker']")?.value || "";
              console.log("[DEBUG] Deadline:", deadline);
              let type = "";
              const selectedCategoryElem =
                taskEditForm.querySelector("#selected-category");
              if (selectedCategoryElem) {
                type = selectedCategoryElem.textContent.trim();
              }
              console.log("[DEBUG] Typ/Kategorie:", type);
              let priority = "";
              const activePrioBtn = taskEditForm.querySelector(
                ".priority-btn.active"
              );
              if (activePrioBtn) {
                priority = activePrioBtn.getAttribute("data-priority");
              }
              console.log("[DEBUG] Priority:", priority);

              let assignedUsers = [];
              // Extract names from selected contact options and match with fetchData.contacts
              const assignedOptions = taskEditForm.querySelectorAll(
                ".contact-option.assigned"
              );
              const contactsObj =
                fetchData && fetchData.contacts ? fetchData.contacts : {};
              if (assignedOptions && contactsObj) {
                assignedUsers = Array.from(assignedOptions)
                  .map((option) => {
                    const name =
                      option.getAttribute("data-name") ||
                      option.textContent.trim();
                    return (
                      Object.entries(contactsObj).find(
                        ([id, contact]) => contact.name === name
                      )?.[0] || null
                    );
                  })
                  .filter(Boolean);
              }
              console.log("[DEBUG] assignedUsers:", assignedUsers);
              // Read subtasks and checked status directly from the DOM of the edit form
              const subtaskInputs =
                taskEditForm.querySelectorAll(".subtask-input");
              let totalSubtasks = Array.from(subtaskInputs)
                .map((input) => input.value.trim())
                .filter((text) => text !== "");
              let checkedSubtasks = Array.from(subtaskInputs).map(
                (input) => input.checked
              );
              // If there are no subtasks in the input, try to read from .subtask-text or .subtask-item
              if (totalSubtasks.length === 0) {
                const subtaskTextNodes =
                  taskEditForm.querySelectorAll(".subtask-text");
                if (subtaskTextNodes.length > 0) {
                  totalSubtasks = Array.from(subtaskTextNodes)
                    .map((node) => node.textContent.trim())
                    .filter((text) => text !== "");
                } else {
                  const subtaskItemNodes =
                    taskEditForm.querySelectorAll(".subtask-item");
                  totalSubtasks = Array.from(subtaskItemNodes)
                    .map((node) => node.textContent.trim())
                    .filter((text) => text !== "");
                }
                // checkedSubtasks ggf. aus .subtask-item.completed
                if (checkedSubtasks.length === 0) {
                  // If still empty, read checkedSubtasks from .subtask-item.completed
                  checkedSubtasks = Array.from(
                    taskEditForm.querySelectorAll(".subtask-item")
                  ).map((node) => node.classList.contains("completed"));
                }
                // If still empty, use values from the task object
                if (totalSubtasks.length === 0) {
                  totalSubtasks = Array.isArray(taskToEdit.totalSubtasks)
                    ? [...taskToEdit.totalSubtasks]
                    : [];
                  checkedSubtasks = Array.isArray(taskToEdit.checkedSubtasks)
                    ? [...taskToEdit.checkedSubtasks]
                    : [];
                }
              }
              console.log("[DEBUG] totalSubtasks:", totalSubtasks);
              console.log("[DEBUG] checkedSubtasks:", checkedSubtasks);
              const subtasksCompleted = checkedSubtasks.filter(Boolean).length;
              console.log("[DEBUG] completedSubtasks:", subtasksCompleted);
              // Timestamp
              const now = new Date();
              const day = String(now.getDate()).padStart(2, "0");
              const month = String(now.getMonth() + 1).padStart(2, "0");
              const year = now.getFullYear();
              const updatedAt = `${day}.${month}.${year}`;
              console.log("[DEBUG] updatedAt:", updatedAt);
              // Task-ID
              let currentTaskId =
                taskEditForm.getAttribute("data-task-id") || taskToEditId;
              // Object exactly as in Add-Task-Overlay
              const editTaskObjekt = {
                assignedUsers: Array.isArray(assignedUsers)
                  ? assignedUsers
                  : [],
                boardID: "board-1",
                checkedSubtasks,
                columnID: taskToEdit.columnID || "inProgress",
                createdAt: taskToEdit.createdAt || updatedAt,
                deadline,
                description,
                priority,
                subtasksCompleted: subtasksCompleted,
                title,
                totalSubtasks,
                type,
                updatedAt,
              };
              const objForCWDATA = { [currentTaskId]: editTaskObjekt };
              console.log(
                "[DEBUG] Übergabe an CWDATA:",
                objForCWDATA,
                fetchData
              );
              await CWDATA(objForCWDATA, fetchData);
              closeSpecificOverlay("overlay-task-detail-edit");
              if (updateBoardFunction) {
                await updateBoardFunction();
              }
              renderDetailOverlay(taskToEditId);
            });
          }
        }
      }
      renderDetailOverlay(taskId);
    };
    card.addEventListener("click", newClickListener);
    card.setAttribute("data-has-click-listener", "true");
    card._currentClickListener = newClickListener;
  });
}
