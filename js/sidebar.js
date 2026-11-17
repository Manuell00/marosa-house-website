const toggle = document.getElementById("menu-toggle");
const menu = document.getElementById("mobile-menu");
const overlay = document.getElementById("menu-overlay");
const closeButton = document.getElementById("mobile-menu-close");

if (toggle && menu && overlay && closeButton) {
    const menuLinks = menu.querySelectorAll("a[href]");
    const lastLink = menuLinks[menuLinks.length - 1];
    const mobileViewport = window.matchMedia("(max-width: 1024px)");
    let previousOverflow = "";

    const setMenuOpen = (isOpen) => {
        menu.classList.toggle("active", isOpen);
        overlay.classList.toggle("active", isOpen);
        toggle.classList.toggle("active", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));

        if (isOpen) {
            previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            closeButton.focus();
        } else {
            document.body.style.overflow = previousOverflow;
            if (mobileViewport.matches) toggle.focus();
        }
    };
    const closeMenu = () => setMenuOpen(false);

    toggle.addEventListener("click", () => {
        setMenuOpen(!menu.classList.contains("active"));
    });

    overlay.addEventListener("click", closeMenu);
    closeButton.addEventListener("click", closeMenu);

    menuLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    mobileViewport.addEventListener("change", () => {
        if (!mobileViewport.matches && menu.classList.contains("active")) closeMenu();
    });

    menu.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            closeMenu();
        }
        if (event.key !== "Tab" || !lastLink) return;

        if (event.shiftKey && document.activeElement === closeButton) {
            event.preventDefault();
            lastLink.focus();
        } else if (!event.shiftKey && document.activeElement === lastLink) {
            event.preventDefault();
            closeButton.focus();
        }
    });
}
