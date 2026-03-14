document.addEventListener("DOMContentLoaded", () => {
    const stickyCta = document.querySelector(".mobile-sticky-cta");
    const footer = document.querySelector("footer");
    const closeButton = document.querySelector(".mobile-sticky-dismiss");

    if (!stickyCta) return;

    const hideSticky = () => {
        stickyCta.classList.add("is-hidden");
    };

    const showSticky = () => {
        stickyCta.classList.remove("is-hidden");
    };

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            stickyCta.classList.add("is-dismissed");
        });
    }

    if (footer && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (stickyCta.classList.contains("is-dismissed")) return;

                if (entry.isIntersecting) {
                    hideSticky();
                } else {
                    showSticky();
                }
            },
            {
                threshold: 0.15,
            }
        );

        observer.observe(footer);
    }
});
