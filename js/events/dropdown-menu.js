document.addEventListener("DOMContentLoaded", () => {
    const initials = document.getElementById("initials");
    const dropdown = document.getElementById("dropdown");
    initials.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".profile-wrapper")) {
            dropdown.classList.remove("show");
        }
    });
});