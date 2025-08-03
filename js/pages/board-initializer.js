import {
  openSpecificOverlay,
  initOverlayListeners,
} from "../../js/events/overlay-handler.js";
import { clearForm } from "./add-task.js";
import { initAddTaskForm } from "./add-task-auxiliary-functions.js";
import { getAddTaskFormHTML } from "../templates/add-task-template.js";

import { loadFirebaseData } from "../../main.js";
import { filterTaskCardsByTitle } from "../events/find-task.js";

let isOverlayLoaded = false;

/**
 * Loads the add-task overlay and initializes it.
 * If the overlay is already loaded, it clears the form and opens the overlay.
 */
export async function loadAndInitAddTaskOverlay() {
  if (isOverlayLoaded) {
    clearForm();
    openSpecificOverlay("overlay");
    return;
  }

  try {
    const response = await fetch("../js/templates/add-task-overlay.html");
    if (!response.ok) {
      throw new Error(
        `HTTP Error! Status: ${response.status} when retrieving add-task-overlay.html`
      );
    }
    const addTaskOverlayHtml = await response.text();
    const overlayContainer = document.getElementById("overlay-container");

    if (overlayContainer) {
      const existingOverlay = document.getElementById("overlay");
      if (existingOverlay) {
        existingOverlay.remove();
      }

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = addTaskOverlayHtml;
      const overlayElement = tempDiv.firstElementChild;
      overlayContainer.appendChild(overlayElement);

      isOverlayLoaded = true;

      initOverlayListeners("overlay");

      const formContainerInOverlay = overlayElement.querySelector(
        "#add-task-form-container"
      );
      if (formContainerInOverlay) {
        formContainerInOverlay.innerHTML = getAddTaskFormHTML();
      } else {
        return;
      }

      await initAddTaskForm();
    }
  } catch (error) {
    console.error("Error loading add-task overlay:", error);
  }
}

/**
 * Initializes the add-task overlay and sets up event listeners when the DOM content is loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
  const addTaskButton = document.getElementById("add-task");
  if (addTaskButton) {
    addTaskButton.addEventListener("click", async () => {
      await loadAndInitAddTaskOverlay();
      openSpecificOverlay("overlay");
    });
  }

  const fastAddTaskButtons = document.querySelectorAll(
    '[id^="fast-add-task-"]'
  );
  fastAddTaskButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const columnId = event.currentTarget.id.replace("fast-add-task-", "");
      await loadAndInitAddTaskOverlay();
      openSpecificOverlay("overlay");
    });
  });

  const searchInput = document.getElementById("find-task");
  if (searchInput) {
    searchInput.addEventListener("input", filterTaskCardsByTitle);
  }
});

/**
 * Shows a find-task-info-no-found message after no task is found.
 * The message slides in, stays visible for a short time, and then slides out.
 */
export async function showFindTaskInfoNoFoundMsg() {
  const noFoundMsg = document.getElementById("find-task-info-no-found-Msg");
  if (!noFoundMsg) return;

  noFoundMsg.classList.remove("slide-in", "slide-out", "hidden");
  void noFoundMsg.offsetWidth;
  noFoundMsg.classList.add("slide-in");
  await new Promise((resolve) => setTimeout(resolve, 900));

  noFoundMsg.classList.remove("slide-in");
  noFoundMsg.classList.add("slide-out");

  await new Promise((resolve) => setTimeout(resolve, 1600));

  noFoundMsg.classList.add("hidden");
}
