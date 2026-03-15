document.addEventListener("DOMContentLoaded", () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const revealSelectors = [
        "section h2",
        ".hero-apartment h1",
        ".hero-apartment p",
        ".section-lead",
        ".hero-kicker",
        ".hero-buttons .btn",
        ".trust-item",
        ".apartment-card",
        ".apartment > p",
        ".apartment-anchors",
        ".quick-info-item",
        ".gallery img",
        ".why-grid > div",
        ".reviews-grid > .review-card",
        ".info-card",
        ".amenity",
        ".faq-item",
        ".quick-info-item",
        ".features-grid > div",
        ".guide-card",
        ".map-box",
        ".map-item",
        ".map-cta",
        ".direct-booking-card",
        ".stay-times-card",
        ".availability-calendar",
        ".availability-legend span",
        ".request-card",
        ".booking .btn",
    ];

    const elements = Array.from(document.querySelectorAll(revealSelectors.join(",")));

    if (elements.length === 0) return;

    elements.forEach((element, index) => {
        element.classList.add("reveal-on-scroll");
        element.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
    });

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            rootMargin: "0px 0px -8% 0px",
            threshold: 0.16,
        }
    );

    elements.forEach((element) => observer.observe(element));
});
