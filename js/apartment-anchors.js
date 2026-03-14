document.addEventListener("DOMContentLoaded", () => {
    const anchorNav = document.querySelector(".apartment-anchors");

    if (!anchorNav) return;

    const links = Array.from(anchorNav.querySelectorAll("a[href^='#']"));
    const sections = links
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (links.length === 0 || sections.length === 0) return;

    const setActive = (id) => {
        links.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", isActive);
            link.setAttribute("aria-current", isActive ? "true" : "false");
        });
    };

    const updateActiveSection = () => {
        const offset = 190;
        const scrollY = window.scrollY + offset;
        let currentSection = sections[0];

        sections.forEach((section) => {
            if (scrollY >= section.offsetTop) {
                currentSection = section;
            }
        });

        if (currentSection?.id) {
            setActive(currentSection.id);
        }
    };

    links.forEach((link) => {
        link.addEventListener("click", () => {
            const id = link.getAttribute("href").slice(1);
            setActive(id);
        });
    });

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    updateActiveSection();
});
