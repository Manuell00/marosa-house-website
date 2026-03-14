document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll(".availability-calendar");

    if (containers.length === 0 || !window.marosaAvailability) return;

    const formatter = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" });
    const weekdayLabels = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

    const toKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const buildWeekdays = () => {
        const weekdays = document.createElement("div");
        weekdays.className = "availability-weekdays";
        weekdayLabels.forEach((label) => {
            const el = document.createElement("span");
            el.textContent = label;
            weekdays.appendChild(el);
        });
        return weekdays;
    };

    const renderMonth = (grid, currentMonth, bookedSet) => {
        grid.innerHTML = "";

        const firstDay = startOfMonth(currentMonth);
        const offset = (firstDay.getDay() + 6) % 7;

        for (let i = 0; i < offset; i += 1) {
            const empty = document.createElement("span");
            empty.className = "availability-day is-empty";
            grid.appendChild(empty);
        }

        const totalDays = daysInMonth(currentMonth);

        for (let day = 1; day <= totalDays; day += 1) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const key = toKey(date);
            const isBooked = bookedSet.has(key);
            const cell = document.createElement("span");
            cell.className = `availability-day ${isBooked ? "is-booked" : "is-free"}`;
            cell.textContent = String(day);
            cell.setAttribute("title", isBooked ? "Occupato" : "Disponibile");
            grid.appendChild(cell);
        }
    };

    containers.forEach((container) => {
        const apartment = container.dataset.apartment;
        const config = window.marosaAvailability[apartment];

        if (!config) return;

        const bookedSet = new Set(config.booked);
        const today = new Date();
        const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const maxOffset = 5;
        let currentOffset = 0;

        const wrapper = document.createElement("div");
        wrapper.className = "availability-month";

        const header = document.createElement("div");
        header.className = "availability-header";

        const prevButton = document.createElement("button");
        prevButton.className = "availability-nav";
        prevButton.type = "button";
        prevButton.setAttribute("aria-label", "Mese precedente");
        prevButton.textContent = "‹";

        const title = document.createElement("h3");

        const nextButton = document.createElement("button");
        nextButton.className = "availability-nav";
        nextButton.type = "button";
        nextButton.setAttribute("aria-label", "Mese successivo");
        nextButton.textContent = "›";

        header.appendChild(prevButton);
        header.appendChild(title);
        header.appendChild(nextButton);

        const weekdays = buildWeekdays();
        const grid = document.createElement("div");
        grid.className = "availability-grid";

        const update = () => {
            const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + currentOffset, 1);
            title.textContent = formatter.format(month);
            renderMonth(grid, month, bookedSet);
            prevButton.disabled = currentOffset === 0;
            nextButton.disabled = currentOffset === maxOffset;
        };

        prevButton.addEventListener("click", () => {
            if (currentOffset > 0) {
                currentOffset -= 1;
                update();
            }
        });

        nextButton.addEventListener("click", () => {
            if (currentOffset < maxOffset) {
                currentOffset += 1;
                update();
            }
        });

        wrapper.appendChild(header);
        wrapper.appendChild(weekdays);
        wrapper.appendChild(grid);
        container.appendChild(wrapper);

        update();
    });
});
