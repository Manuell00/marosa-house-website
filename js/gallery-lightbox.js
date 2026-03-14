document.addEventListener("DOMContentLoaded", () => {
    const galleries = document.querySelectorAll(".gallery");

    if (galleries.length === 0) return;

    const overlay = document.getElementById("gallery-lightbox");
    const image = document.getElementById("gallery-lightbox-image");
    const caption = document.getElementById("gallery-lightbox-caption");
    const closeButton = document.getElementById("gallery-lightbox-close");
    const prevButton = document.getElementById("gallery-lightbox-prev");
    const nextButton = document.getElementById("gallery-lightbox-next");

    if (!overlay || !image || !caption || !closeButton || !prevButton || !nextButton) {
        return;
    }

    let items = [];
    let currentIndex = 0;
    const mobileBreakpoint = window.matchMedia("(max-width: 768px)");
    const tabletBreakpoint = window.matchMedia("(max-width: 1024px)");

    const closeLightbox = () => {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    };

    const updateLightbox = () => {
        const currentItem = items[currentIndex];

        if (!currentItem) return;

        image.src = currentItem.src;
        image.alt = currentItem.alt || "";
        caption.textContent = currentItem.alt || "";
    };

    const openLightbox = (galleryItems, startIndex) => {
        items = galleryItems;
        currentIndex = startIndex;
        updateLightbox();
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const showNext = () => {
        currentIndex = (currentIndex + 1) % items.length;
        updateLightbox();
    };

    const showPrev = () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateLightbox();
    };

    galleries.forEach((gallery) => {
        const galleryItems = Array.from(gallery.querySelectorAll("img"));

        galleryItems.forEach((item, index) => {
            item.setAttribute("tabindex", "0");
            item.addEventListener("click", () => openLightbox(galleryItems, index));
            item.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(galleryItems, index);
                }
            });
        });

        if (galleryItems.length > 3) {
            gallery.classList.add("has-mobile-preview");

            if (galleryItems.length > 4) {
                gallery.classList.add("has-tablet-preview");
            }

            const actionWrap = document.createElement("div");
            actionWrap.className = "gallery-mobile-actions";

            const button = document.createElement("button");
            button.type = "button";
            button.className = "gallery-more-button";
            button.textContent = `Vedi tutte le ${galleryItems.length} foto`;

            button.addEventListener("click", () => {
                openLightbox(galleryItems, 0);
            });

            actionWrap.appendChild(button);
            gallery.insertAdjacentElement("afterend", actionWrap);

            const syncPreviewState = () => {
                actionWrap.hidden = !tabletBreakpoint.matches;
            };

            syncPreviewState();
            tabletBreakpoint.addEventListener("change", syncPreviewState);
            mobileBreakpoint.addEventListener("change", syncPreviewState);
        }
    });

    closeButton.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeLightbox();
        }
    });

    prevButton.addEventListener("click", showPrev);
    nextButton.addEventListener("click", showNext);

    document.addEventListener("keydown", (event) => {
        if (!overlay.classList.contains("active")) return;

        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowRight") showNext();
        if (event.key === "ArrowLeft") showPrev();
    });
});
