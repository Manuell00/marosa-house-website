document.addEventListener("DOMContentLoaded", () => {
    const galleries = document.querySelectorAll(".gallery");
    const isEnglish = document.documentElement.lang === "en";

    if (galleries.length === 0) return;

    const overlay = document.getElementById("gallery-lightbox");
    const image = document.getElementById("gallery-lightbox-image");
    const caption = document.getElementById("gallery-lightbox-caption");
    const closeButton = document.getElementById("gallery-lightbox-close");
    const prevButton = document.getElementById("gallery-lightbox-prev");
    const nextButton = document.getElementById("gallery-lightbox-next");
    const labels = isEnglish
        ? {
              showAll: (count) => `Show all ${count} photos`,
          }
        : {
              showAll: (count) => `Vedi tutte le ${count} foto`,
          };

    if (!overlay || !image || !caption || !closeButton || !prevButton || !nextButton) {
        return;
    }

    let items = [];
    let currentIndex = 0;
    let imageTransitionTimeout = null;
    let opener = null;
    let previousOverflow = "";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileBreakpoint = window.matchMedia("(max-width: 768px)");
    const tabletBreakpoint = window.matchMedia("(max-width: 1024px)");

    const closeLightbox = () => {
        overlay.classList.remove("active");
        document.body.style.overflow = previousOverflow;
        opener?.focus();
    };

    const updateLightbox = () => {
        const currentItem = items[currentIndex];

        if (!currentItem) return;

        const showImage = () => {
            image.src = currentItem.src;
            image.alt = currentItem.alt || "";
            caption.textContent = currentItem.alt || "";
            image.classList.remove("is-transitioning");
            caption.classList.remove("is-transitioning");
        };

        window.clearTimeout(imageTransitionTimeout);
        if (reducedMotion.matches || !overlay.classList.contains("active")) {
            showImage();
            return;
        }
        image.classList.add("is-transitioning");
        caption.classList.add("is-transitioning");
        imageTransitionTimeout = window.setTimeout(showImage, 140);
    };

    const openLightbox = (galleryItems, startIndex, trigger) => {
        items = galleryItems;
        currentIndex = startIndex;
        opener = trigger;
        previousOverflow = document.body.style.overflow;
        updateLightbox();
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        closeButton.focus();
        if (!reducedMotion.matches) {
            overlay.classList.add("is-opening");
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => overlay.classList.remove("is-opening"));
            });
        }
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
            item.setAttribute("role", "button");
            item.addEventListener("click", () => openLightbox(galleryItems, index, item));
            item.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(galleryItems, index, item);
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
            button.textContent = labels.showAll(galleryItems.length);

            button.addEventListener("click", () => {
                openLightbox(galleryItems, 0, button);
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

    overlay.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "Escape":
                closeLightbox();
                break;
            case "ArrowRight":
                showNext();
                break;
            case "ArrowLeft":
                showPrev();
                break;
            case "Tab":
                if (event.shiftKey && document.activeElement === closeButton) {
                    event.preventDefault();
                    nextButton.focus();
                } else if (!event.shiftKey && document.activeElement === nextButton) {
                    event.preventDefault();
                    closeButton.focus();
                }
                return;
            default:
                return;
        }
        event.preventDefault();
    });
});
