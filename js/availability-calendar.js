document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll(".availability-calendar");

    if (containers.length === 0 || !window.marosaAvailability) return;

    const pageLang = document.documentElement.lang === "en" ? "en" : "it";
    const locale = pageLang === "en" ? "en-GB" : "it-IT";
    const monthFormatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
    const shortDateFormatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
    const weekdayLabels = pageLang === "en"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
    const copy = {
        it: {
            open: "Seleziona le date",
            triggerHint: "Scegli check-in e check-out per vedere il riepilogo del soggiorno.",
            modalTitleIdle: "Seleziona le date",
            modalTitleSelecting: "Seleziona la data di check-out",
            modalSubtitleIdle: "Scegli check-in e check-out per conoscere il prezzo indicativo.",
            modalSubtitleSelecting: "Continua sui mesi successivi se ti serve un soggiorno piu lungo.",
            clear: "Annulla date",
            close: "Chiudi",
            closeSymbol: "×",
            selectedRange: "Date selezionate",
            from: "Da",
            to: "A",
            nights: (count) => `${count} ${count === 1 ? "notte" : "notti"}`,
            total: "Totale indicativo",
            average: "Media a notte",
            comingSoon: "Prezzo indicativo in aggiornamento",
            bookNow: "Prenota",
            editDates: "Modifica date",
            summaryPlaceholder: "Nessuna data selezionata",
            footerPlaceholder: "Aggiungi le date per conoscere il prezzo"
        },
        en: {
            open: "Select dates",
            triggerHint: "Choose check-in and check-out to view your stay summary.",
            modalTitleIdle: "Select dates",
            modalTitleSelecting: "Select your check-out date",
            modalSubtitleIdle: "Choose check-in and check-out to view the indicative price.",
            modalSubtitleSelecting: "Keep browsing upcoming months if you need a longer stay.",
            clear: "Clear dates",
            close: "Close",
            closeSymbol: "×",
            selectedRange: "Selected dates",
            from: "From",
            to: "To",
            nights: (count) => `${count} ${count === 1 ? "night" : "nights"}`,
            total: "Indicative total",
            average: "Average per night",
            comingSoon: "Indicative price coming soon",
            bookNow: "Book",
            editDates: "Edit dates",
            summaryPlaceholder: "No dates selected",
            footerPlaceholder: "Add dates to view the price"
        }
    }[pageLang];

    const toKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const fromKey = (key) => {
        const [year, month, day] = key.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const addDays = (date, amount) => {
        const next = new Date(date);
        next.setDate(next.getDate() + amount);
        return next;
    };

    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const isWeekendDate = (date) => {
        const day = date.getDay();
        return day === 5 || day === 6;
    };

    const formatPriceRange = (price) => `${price.min}€ - ${price.max}€`;

    const getDatePrice = (prices, date) => {
        const monthData = prices?.[String(date.getMonth() + 1).padStart(2, "0")] || null;
        if (!monthData) return null;
        if (monthData.weekday || monthData.weekend) {
            return isWeekendDate(date)
                ? monthData.weekend || monthData.weekday || null
                : monthData.weekday || monthData.weekend || null;
        }
        return monthData;
    };

    const getDayState = (key, bookedSet, todayKey) => {
        if (key <= todayKey) return "past";
        if (bookedSet.has(key)) return "booked";
        return "free";
    };

    const rangeIsFree = (startKey, endKey, bookedSet, todayKey) => {
        let cursor = fromKey(startKey);
        const endDate = fromKey(endKey);
        while (cursor <= endDate) {
            const key = toKey(cursor);
            if (getDayState(key, bookedSet, todayKey) !== "free") return false;
            cursor = addDays(cursor, 1);
        }
        return true;
    };

    const getRangeDetails = (startKey, endKey, prices) => {
        const startDate = fromKey(startKey);
        const endDate = fromKey(endKey);
        const nights = [];
        let cursor = new Date(startDate);
        while (cursor < endDate) {
            nights.push(new Date(cursor));
            cursor = addDays(cursor, 1);
        }
        if (nights.length === 0) return null;

        const nightlyPrices = nights.map((date) => getDatePrice(prices, date));
        if (nightlyPrices.some((price) => !price)) {
            return { nightsCount: nights.length, average: null, total: null };
        }

        const total = nightlyPrices.reduce(
            (acc, price) => {
                acc.min += price.min;
                acc.max += price.max;
                return acc;
            },
            { min: 0, max: 0 }
        );

        return {
            nightsCount: nights.length,
            total,
            average: {
                min: Math.round(total.min / nights.length),
                max: Math.round(total.max / nights.length)
            }
        };
    };

    const buildWeekdaysMarkup = () =>
        `<div class="availability-modal-weekdays">${weekdayLabels
            .map((label) => `<span>${label}</span>`)
            .join("")}</div>`;

    containers.forEach((container) => {
        const apartment = container.dataset.apartment;
        const config = window.marosaAvailability[apartment];
        if (!config) return;

        const bookedSet = new Set(config.booked);
        const prices = config.prices || {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayKey = toKey(today);
        const startMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const maxOffset = 5;
        const selection = { start: null, end: null };

        const trigger = document.createElement("div");
        trigger.className = "availability-trigger";
        trigger.innerHTML = `
            <div class="availability-trigger-copy">
                <span>${copy.selectedRange}</span>
                <strong>${copy.summaryPlaceholder}</strong>
                <p>${copy.triggerHint}</p>
            </div>
            <div class="availability-trigger-preview"></div>
            <button class="availability-trigger-button" type="button">${copy.open}</button>
        `;

        const overlay = document.createElement("div");
        overlay.className = "availability-modal";
        overlay.hidden = true;
        overlay.innerHTML = `
            <div class="availability-modal__panel availability-modal__panel--calendar" role="dialog" aria-modal="true" aria-label="${copy.modalTitleIdle}">
                <div class="availability-modal__top">
                    <button class="availability-modal__close" type="button" aria-label="${copy.close}">${copy.closeSymbol}</button>
                    <button class="availability-modal__clear" type="button">${copy.clear}</button>
                </div>
                <div class="availability-modal__intro">
                    <h3>${copy.modalTitleIdle}</h3>
                    <p>${copy.modalSubtitleIdle}</p>
                </div>
                <div class="availability-modal__calendar-wrap">
                    <div class="availability-modal__sticky">${buildWeekdaysMarkup()}</div>
                    <div class="availability-modal__calendar-scroll"></div>
                </div>
                <div class="availability-modal__footer">
                    <div class="availability-modal__summary">
                        <strong>${copy.footerPlaceholder}</strong>
                    </div>
                    <a class="availability-modal__cta is-disabled" href="#" aria-disabled="true">${copy.bookNow}</a>
                </div>
            </div>
        `;

        const closeButton = overlay.querySelector(".availability-modal__close");
        const clearButton = overlay.querySelector(".availability-modal__clear");
        const introTitle = overlay.querySelector(".availability-modal__intro h3");
        const introText = overlay.querySelector(".availability-modal__intro p");
        const scroll = overlay.querySelector(".availability-modal__calendar-scroll");
        const footerSummary = overlay.querySelector(".availability-modal__summary");
        const footerCta = overlay.querySelector(".availability-modal__cta");
        const preview = trigger.querySelector(".availability-trigger-preview");

        const updateTrigger = () => {
            const title = trigger.querySelector("strong");
            const button = trigger.querySelector(".availability-trigger-button");
            if (selection.start && selection.end) {
                const details = getRangeDetails(selection.start, selection.end, prices);
                title.textContent = `${shortDateFormatter.format(fromKey(selection.start))} - ${shortDateFormatter.format(fromKey(selection.end))} · ${copy.nights(details.nightsCount)}`;
                button.textContent = copy.editDates;
            } else if (selection.start) {
                title.textContent = shortDateFormatter.format(fromKey(selection.start));
                button.textContent = copy.editDates;
            } else {
                title.textContent = copy.summaryPlaceholder;
                button.textContent = copy.open;
            }
        };

        const renderPreview = () => {
            const month = new Date(startMonth);
            const firstDay = startOfMonth(month);
            const leading = (firstDay.getDay() + 6) % 7;
            const totalDays = daysInMonth(month);

            preview.innerHTML = `<h4>${monthFormatter.format(month)}</h4>`;
            const grid = document.createElement("div");
            grid.className = "availability-trigger-grid";

            weekdayLabels.forEach((label) => {
                const cell = document.createElement("span");
                cell.className = "availability-trigger-weekday";
                cell.textContent = label.slice(0, 1);
                grid.appendChild(cell);
            });

            for (let i = 0; i < leading; i += 1) {
                const empty = document.createElement("span");
                empty.className = "availability-day is-empty";
                grid.appendChild(empty);
            }

            for (let day = 1; day <= totalDays; day += 1) {
                const date = new Date(month.getFullYear(), month.getMonth(), day);
                const key = toKey(date);
                const state = getDayState(key, bookedSet, todayKey);
                const cell = document.createElement("span");
                cell.className = `availability-day ${state === "past" ? "is-past" : state === "booked" ? "is-booked" : "is-free"}`;
                cell.textContent = String(day);

                if (key === todayKey) cell.classList.add("is-today");
                if (selection.start === key && !selection.end) cell.classList.add("is-selected");
                if (selection.start === key && selection.end) cell.classList.add("is-range-start");
                if (selection.end === key) cell.classList.add("is-range-end");
                if (selection.start && selection.end && key > selection.start && key < selection.end) cell.classList.add("is-in-range");

                grid.appendChild(cell);
            }

            preview.appendChild(grid);
        };

        const updateFooter = () => {
            if (!(selection.start && selection.end)) {
                footerSummary.innerHTML = `<strong>${copy.footerPlaceholder}</strong>`;
                footerCta.classList.add("is-disabled");
                footerCta.setAttribute("href", "#");
                footerCta.setAttribute("aria-disabled", "true");
                return;
            }

            const details = getRangeDetails(selection.start, selection.end, prices);
            const average = details.average ? formatPriceRange(details.average) : copy.comingSoon;
            const total = details.total ? formatPriceRange(details.total) : copy.comingSoon;
            footerSummary.innerHTML = `
                <strong>${copy.nights(details.nightsCount)}</strong>
                <span>${copy.average}: ${average}</span>
                <span>${copy.total}: ${total}</span>
            `;

            const targetPage = pageLang === "en" ? "prenota-en.html" : "prenota.html";
            footerCta.classList.remove("is-disabled");
            footerCta.setAttribute("aria-disabled", "false");
            footerCta.setAttribute("href", `${targetPage}?apartment=${apartment}&checkin=${selection.start}&checkout=${selection.end}`);
        };

        const updateIntro = () => {
            if (selection.start && !selection.end) {
                introTitle.textContent = copy.modalTitleSelecting;
                introText.textContent = copy.modalSubtitleSelecting;
            } else {
                introTitle.textContent = copy.modalTitleIdle;
                introText.textContent = copy.modalSubtitleIdle;
            }
        };

        const openModal = () => {
            overlay.hidden = false;
            document.body.classList.add("calendar-modal-open");
            requestAnimationFrame(() => overlay.classList.add("is-open"));
        };

        const closeModal = () => {
            document.body.classList.remove("calendar-modal-open");
            overlay.classList.remove("is-open");
            window.setTimeout(() => {
                overlay.hidden = true;
            }, 220);
        };

        const renderCalendar = () => {
            scroll.innerHTML = "";

            for (let offset = 0; offset <= maxOffset; offset += 1) {
                const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + offset, 1);
                const block = document.createElement("section");
                block.className = "availability-modal-month";
                block.innerHTML = `<h4>${monthFormatter.format(month)}</h4>`;

                const grid = document.createElement("div");
                grid.className = "availability-modal-grid";

                const firstDay = startOfMonth(month);
                const leading = (firstDay.getDay() + 6) % 7;

                for (let i = 0; i < leading; i += 1) {
                    const empty = document.createElement("span");
                    empty.className = "availability-day is-empty";
                    grid.appendChild(empty);
                }

                const totalDays = daysInMonth(month);
                for (let day = 1; day <= totalDays; day += 1) {
                    const date = new Date(month.getFullYear(), month.getMonth(), day);
                    const key = toKey(date);
                    const state = getDayState(key, bookedSet, todayKey);
                    const cell = document.createElement("button");
                    cell.type = "button";
                    cell.className = `availability-day ${state === "past" ? "is-past" : state === "booked" ? "is-booked" : "is-free"}`;
                    cell.textContent = String(day);

                if (key === todayKey) cell.classList.add("is-today");
                if (selection.start === key && !selection.end) cell.classList.add("is-selected");
                if (selection.start === key && selection.end) {
                    cell.classList.add("is-range-start");
                    cell.dataset.label = copy.from;
                }
                if (selection.end === key) {
                    cell.classList.add("is-range-end");
                    cell.dataset.label = copy.to;
                }
                if (selection.start && selection.end && key > selection.start && key < selection.end) cell.classList.add("is-in-range");
                if (selection.start === key && !selection.end) cell.dataset.label = copy.from;
                if (selection.start && !selection.end && state === "free" && key > selection.start) cell.classList.add("is-checkout-candidate");

                    cell.addEventListener("click", () => {
                        if (state !== "free") return;

                        if (!selection.start || selection.end) {
                            selection.start = key;
                            selection.end = null;
                        } else if (key <= selection.start) {
                            selection.start = key;
                            selection.end = null;
                        } else if (rangeIsFree(selection.start, key, bookedSet, todayKey)) {
                            selection.end = key;
                        } else {
                            selection.start = key;
                            selection.end = null;
                        }

                        updateIntro();
                        updateFooter();
                        updateTrigger();
                        renderPreview();
                        renderCalendar();
                    });

                    grid.appendChild(cell);
                }

                block.appendChild(grid);
                scroll.appendChild(block);
            }
        };

        trigger.addEventListener("click", () => {
            updateIntro();
            updateFooter();
            renderCalendar();
            openModal();
        });

        clearButton.addEventListener("click", () => {
            selection.start = null;
            selection.end = null;
            updateIntro();
            updateFooter();
            updateTrigger();
            renderPreview();
            renderCalendar();
        });

        closeButton.addEventListener("click", closeModal);
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) closeModal();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !overlay.hidden) closeModal();
        });

        container.innerHTML = "";
        container.appendChild(trigger);
        document.body.appendChild(overlay);
        updateTrigger();
        updateFooter();
        renderPreview();
    });
});
