document.addEventListener("DOMContentLoaded", () => {
    const amenitiesGrids = document.querySelectorAll(".amenities-grid");
    const tabletBreakpoint = window.matchMedia("(max-width: 1024px)");

    if (amenitiesGrids.length === 0) return;

    amenitiesGrids.forEach((grid) => {
        const items = Array.from(grid.querySelectorAll(".amenity"));

        if (items.length <= 6) return;

        grid.classList.add("has-mobile-preview");

        const actionWrap = document.createElement("div");
        actionWrap.className = "gallery-mobile-actions amenities-mobile-actions";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "gallery-more-button amenities-more-button";

        const showAllLabel = grid.dataset.showAllLabel || `Vedi tutte le ${items.length} dotazioni`;
        const showLessLabel = grid.dataset.showLessLabel || "Mostra meno";

        const syncLabel = () => {
            button.textContent = grid.classList.contains("is-expanded") ? showLessLabel : showAllLabel;
        };

        button.addEventListener("click", () => {
            grid.classList.toggle("is-expanded");
            syncLabel();
        });

        syncLabel();
        actionWrap.appendChild(button);
        grid.insertAdjacentElement("afterend", actionWrap);

        const syncVisibility = () => {
            actionWrap.hidden = !tabletBreakpoint.matches;

            if (!tabletBreakpoint.matches) {
                grid.classList.remove("is-expanded");
            }

            syncLabel();
        };

        syncVisibility();
        tabletBreakpoint.addEventListener("change", syncVisibility);
    });
});
