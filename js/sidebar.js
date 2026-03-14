const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("mobile-menu");
const overlay = document.getElementById("menu-overlay");
const menuLinks = menu ? menu.querySelectorAll("a") : [];

if (toggle && menu && overlay) {
    const closeMenu = () => {
        menu.classList.remove("active");
        overlay.classList.remove("active");
        toggle.classList.remove("active");
        document.body.style.overflow = "";
    };

    toggle.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("active");
        overlay.classList.toggle("active", isOpen);
        toggle.classList.toggle("active", isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "";
    });

    overlay.addEventListener("click", closeMenu);

    menuLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });
}
