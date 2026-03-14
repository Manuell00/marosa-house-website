const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("mobile-menu");
const overlay = document.getElementById("menu-overlay");

toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    overlay.classList.toggle("active");
});

overlay.addEventListener("click", () => {
    menu.classList.remove("active");
    overlay.classList.remove("active");
});