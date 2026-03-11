const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("mobile-menu");

toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
});

document.querySelectorAll(".mobile-menu a").forEach(link => {
    link.addEventListener("click", () => {
        menu.classList.remove("open");
    });
});