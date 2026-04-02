document.addEventListener("DOMContentLoaded", () => {
    const galleries = document.querySelectorAll(".gallery");
    const isEnglish = document.documentElement.lang === "en";
    const isBixioPage = window.location.pathname.includes("marosa-bixio");

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
    const mobileBreakpoint = window.matchMedia("(max-width: 768px)");
    const tabletBreakpoint = window.matchMedia("(max-width: 1024px)");

    const closeLightbox = () => {
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    };

    const updateLightbox = () => {
        const currentItem = items[currentIndex];

        if (!currentItem) return;

        image.classList.add("is-transitioning");
        caption.classList.add("is-transitioning");

        window.clearTimeout(imageTransitionTimeout);
        imageTransitionTimeout = window.setTimeout(() => {
            image.src = currentItem.src;
            image.alt = currentItem.alt || "";
            caption.textContent = currentItem.alt || "";
            image.classList.remove("is-transitioning");
            caption.classList.remove("is-transitioning");
        }, 140);
    };

    const openLightbox = (galleryItems, startIndex) => {
        items = galleryItems;
        currentIndex = startIndex;
        overlay.classList.add("is-opening");
        updateLightbox();
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
        window.setTimeout(() => {
            overlay.classList.remove("is-opening");
        }, 280);
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
            button.textContent = labels.showAll(galleryItems.length);

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

    const handlePrevClick = isBixioPage ? showNext : showPrev;
    const handleNextClick = isBixioPage ? showPrev : showNext;

    prevButton.addEventListener("click", handlePrevClick);
    nextButton.addEventListener("click", handleNextClick);

    document.addEventListener("keydown", (event) => {
        if (!overlay.classList.contains("active")) return;

        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowRight") showNext();
        if (event.key === "ArrowLeft") showPrev();
    });
});
