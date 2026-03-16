document.addEventListener("DOMContentLoaded", () => {
    const stickyCta = document.querySelector(".mobile-sticky-cta");
    const footer = document.querySelector("footer");
    const availabilitySection = document.querySelector("#disponibilita");
    const closeButton = document.querySelector(".mobile-sticky-dismiss");
    let footerVisible = false;
    let availabilityVisible = false;

    if (!stickyCta) return;

    const syncStickyVisibility = () => {
        if (stickyCta.classList.contains("is-dismissed")) return;
        if (footerVisible || availabilityVisible) {
            stickyCta.classList.add("is-hidden");
        } else {
            stickyCta.classList.remove("is-hidden");
        }
    };

    if (closeButton) {
        closeButton.addEventListener("click", () => {
            stickyCta.classList.add("is-dismissed");
        });
    }

    if (footer && "IntersectionObserver" in window) {
        const footerObserver = new IntersectionObserver(
            ([entry]) => {
                footerVisible = entry.isIntersecting;
                syncStickyVisibility();
            },
            {
                threshold: 0.15,
            }
        );

        footerObserver.observe(footer);
    }

    if (availabilitySection && "IntersectionObserver" in window) {
        const availabilityObserver = new IntersectionObserver(
            ([entry]) => {
                availabilityVisible = entry.isIntersecting;
                syncStickyVisibility();
            },
            {
                threshold: 0.2,
            }
        );

        availabilityObserver.observe(availabilitySection);
    }
});
