document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll(".availability-calendar");

    if (containers.length === 0 || !window.marosaAvailability) return;

    const pageLang = document.documentElement.lang === "en" ? "en" : "it";
    const locale = pageLang === "en" ? "en-GB" : "it-IT";
    const formatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
    const weekdayLabels = pageLang === "en"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
    const copy = {
        it: {
            previousMonth: "Mese precedente",
            nextMonth: "Mese successivo",
            pastDate: "Data passata",
            booked: "Occupato",
            available: "Disponibile",
            todayLabel: "Data di oggi",
            selectedDate: "Data selezionata",
            currentState: "Stato",
            indicativePrice: "Prezzo indicativo",
            averagePrice: "Media a notte",
            totalPrice: "Totale indicativo",
            priceType: "Tipologia prezzo",
            weekendLabel: "Weekend",
            weekdayLabel: "Giorno feriale",
            mixedLabel: "Feriali e weekend",
            rangeHintHtml:
                '<span class="availability-helper-step">1</span><span>Scegli il <strong>check-in</strong></span><span class="availability-helper-divider">·</span><span class="availability-helper-step">2</span><span>Scegli il <strong>check-out</strong></span>',
            nights: (count) => `${count} ${count === 1 ? "notte" : "notti"}`,
            nightlySuffix: "/ notte",
            comingSoon: "Prezzo indicativo in aggiornamento",
            rangeHint: "Tocca una data di arrivo e poi una data di check-out per vedere il riepilogo del soggiorno.",
            checkoutHint: "Check-in selezionato. Ora tocca il giorno di check-out. Se serve, scorri i mesi per continuare.",
            invalidRangeHint: "Seleziona un intervallo disponibile continuo.",
            statusPast: "Questa data non è più prenotabile.",
            statusBooked: "Questa data non è disponibile.",
            statusAvailable: "Questa data è disponibile.",
            modalTitle: "Dettaglio disponibilità",
            checkinLabel: "Check-in",
            checkoutLabel: "Check-out",
            close: "Chiudi",
            bookNow: "Prenota",
            resetSelection: "Nuova selezione"
        },
        en: {
            previousMonth: "Previous month",
            nextMonth: "Next month",
            pastDate: "Past date",
            booked: "Booked",
            available: "Available",
            todayLabel: "Today's date",
            selectedDate: "Selected date",
            currentState: "Status",
            indicativePrice: "Indicative price",
            averagePrice: "Average per night",
            totalPrice: "Indicative total",
            priceType: "Rate type",
            weekendLabel: "Weekend",
            weekdayLabel: "Weekday",
            mixedLabel: "Weekdays and weekends",
            rangeHintHtml:
                '<span class="availability-helper-step">1</span><span>Choose <strong>check-in</strong></span><span class="availability-helper-divider">·</span><span class="availability-helper-step">2</span><span>Choose <strong>check-out</strong></span>',
            nights: (count) => `${count} ${count === 1 ? "night" : "nights"}`,
            nightlySuffix: "/ night",
            comingSoon: "Indicative price coming soon",
            rangeHint: "Tap a check-in date and then a check-out date to view the stay summary.",
            checkoutHint: "Check-in selected. Now choose the check-out date. Move across months if needed.",
            invalidRangeHint: "Select a continuous available date range.",
            statusPast: "This date can no longer be booked.",
            statusBooked: "This date is not available.",
            statusAvailable: "This date is available.",
            modalTitle: "Availability details",
            checkinLabel: "Check-in",
            checkoutLabel: "Check-out",
            close: "Close",
            bookNow: "Book",
            resetSelection: "New selection"
        }
    }[pageLang];

    const dayFormatter = new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long"
    });

    const shortDateFormatter = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short"
    });

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

    const isWeekendDate = (date) => {
        const day = date.getDay();
        return day === 5 || day === 6;
    };

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

    const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const formatPriceRange = (price) => `${price.min}€ - ${price.max}€ ${copy.nightlySuffix}`;

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

    const getDayState = (key, bookedSet, todayKey) => {
        if (key < todayKey) return "past";
        if (bookedSet.has(key)) return "booked";
        return "free";
    };

    const getDayTitle = (state, isToday) => {
        if (isToday) return copy.todayLabel;
        if (state === "past") return copy.pastDate;
        if (state === "booked") return copy.booked;
        return copy.available;
    };

    const buildModal = () => {
        const overlay = document.createElement("div");
        overlay.className = "availability-modal";
        overlay.hidden = true;

        const panel = document.createElement("div");
        panel.className = "availability-modal__panel";
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-label", copy.modalTitle);

        const closeButton = document.createElement("button");
        closeButton.className = "availability-modal__close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", copy.close);
        closeButton.textContent = "×";

        const body = document.createElement("div");
        body.className = "availability-modal__body";

        panel.appendChild(closeButton);
        panel.appendChild(body);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        const close = () => {
            document.body.classList.remove("calendar-modal-open");
            overlay.classList.remove("is-open");
            window.setTimeout(() => {
                overlay.hidden = true;
            }, 220);
        };

        closeButton.addEventListener("click", close);
        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) close();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !overlay.hidden) {
                close();
            }
        });

        return {
            overlay,
            body,
            open() {
                overlay.hidden = false;
                document.body.classList.add("calendar-modal-open");
                requestAnimationFrame(() => {
                    overlay.classList.add("is-open");
                });
            },
            close
        };
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
        const hasMissingPrices = nightlyPrices.some((price) => !price);

        if (hasMissingPrices) {
            const includesWeekend = nights.some(isWeekendDate);
            const includesWeekday = nights.some((date) => !isWeekendDate(date));
            return {
                nightsCount: nights.length,
                average: null,
                total: null,
                rateType: includesWeekend && includesWeekday
                    ? copy.mixedLabel
                    : includesWeekend
                        ? copy.weekendLabel
                        : copy.weekdayLabel
            };
        }

        const totals = nightlyPrices.reduce(
            (acc, price) => {
                acc.min += price.min;
                acc.max += price.max;
                return acc;
            },
            { min: 0, max: 0 }
        );

        const includesWeekend = nights.some(isWeekendDate);
        const includesWeekday = nights.some((date) => !isWeekendDate(date));

        return {
            nightsCount: nights.length,
            average: {
                min: Math.round(totals.min / nights.length),
                max: Math.round(totals.max / nights.length)
            },
            total: totals,
            rateType: includesWeekend && includesWeekday
                ? copy.mixedLabel
                : includesWeekend
                    ? copy.weekendLabel
                    : copy.weekdayLabel
        };
    };

    const rangeIsContinuousAndFree = (startKey, endKey, bookedSet, todayKey) => {
        let cursor = fromKey(startKey);
        const endDate = fromKey(endKey);

        while (cursor <= endDate) {
            const key = toKey(cursor);
            if (getDayState(key, bookedSet, todayKey) !== "free") {
                return false;
            }
            cursor = addDays(cursor, 1);
        }

        return true;
    };

    const renderSingleDateModal = (modalBody, key, state, date, price) => {
        const dateText = dayFormatter.format(date);
        const stateLabel = state === "past" ? copy.pastDate : state === "booked" ? copy.booked : copy.available;
        const statusCopy = state === "past" ? copy.statusPast : state === "booked" ? copy.statusBooked : copy.statusAvailable;
        const priceType = isWeekendDate(date) ? copy.weekendLabel : copy.weekdayLabel;
        const priceMarkup = state !== "free"
            ? ""
            : `
                <div class="availability-selection-row">
                    <span>${copy.indicativePrice}</span>
                    <strong>${price ? formatPriceRange(price) : copy.comingSoon}</strong>
                </div>
                <div class="availability-selection-row">
                    <span>${copy.priceType}</span>
                    <strong>${priceType}</strong>
                </div>
            `;

        modalBody.innerHTML = `
            <div class="availability-selection-head">
                <p>${copy.modalTitle}</p>
                <h4>${dateText}</h4>
            </div>
            <div class="availability-selection-row">
                <span>${copy.selectedDate}</span>
                <strong>${dateText}</strong>
            </div>
            <div class="availability-selection-row">
                <span>${copy.currentState}</span>
                <strong>${stateLabel}</strong>
            </div>
            ${priceMarkup}
            <p>${statusCopy}</p>
        `;
    };

    const renderRangeModal = (modalBody, apartment, startKey, endKey, prices) => {
        const startDate = fromKey(startKey);
        const endDate = fromKey(endKey);
        const details = getRangeDetails(startKey, endKey, prices);
        const targetPage = pageLang === "en" ? "prenota-en.html" : "prenota.html";
        const bookingLink = `${targetPage}?apartment=${apartment}&checkin=${startKey}&checkout=${endKey}`;

        const averageMarkup = details?.average
            ? `<div class="availability-selection-row"><span>${copy.averagePrice}</span><strong>${formatPriceRange(details.average)}</strong></div>`
            : `<div class="availability-selection-row"><span>${copy.averagePrice}</span><strong>${copy.comingSoon}</strong></div>`;

        const totalMarkup = details?.total
            ? `<div class="availability-selection-row"><span>${copy.totalPrice}</span><strong>${details.total.min}€ - ${details.total.max}€</strong></div>`
            : `<div class="availability-selection-row"><span>${copy.totalPrice}</span><strong>${copy.comingSoon}</strong></div>`;

        modalBody.innerHTML = `
            <div class="availability-selection-head">
                <p>${copy.modalTitle}</p>
                <h4>${copy.nights(details.nightsCount)}</h4>
            </div>
            <div class="availability-selection-row">
                <span>${copy.checkinLabel}</span>
                <strong>${shortDateFormatter.format(startDate)}</strong>
            </div>
            <div class="availability-selection-row">
                <span>${copy.checkoutLabel}</span>
                <strong>${shortDateFormatter.format(endDate)}</strong>
            </div>
            <div class="availability-selection-row">
                <span>${copy.currentState}</span>
                <strong>${copy.available}</strong>
            </div>
            ${averageMarkup}
            ${totalMarkup}
            <div class="availability-selection-row">
                <span>${copy.priceType}</span>
                <strong>${details.rateType}</strong>
            </div>
            <div class="availability-selection-actions">
                <button class="availability-selection-reset" type="button">${copy.resetSelection}</button>
                <a class="availability-selection-cta" href="${bookingLink}">${copy.bookNow}</a>
            </div>
        `;
    };

    const renderMonth = (grid, currentMonth, bookedSet, todayKey, prices, selection, openModal, setStartSelection) => {
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
            const state = getDayState(key, bookedSet, todayKey);
            const isToday = key === todayKey;
            const cell = document.createElement("button");
            const stateClass = state === "past" ? "is-past" : state === "booked" ? "is-booked" : "is-free";

            cell.className = `availability-day ${stateClass}`;
            cell.type = "button";

            if (isToday) {
                cell.classList.add("is-today");
            }

            if (selection.start === key && !selection.end) {
                cell.classList.add("is-selected");
                cell.dataset.badge = copy.checkinLabel;
            }

            if (selection.start === key && selection.end) {
                cell.classList.add("is-range-start");
                cell.dataset.badge = copy.checkinLabel;
            }

            if (selection.end === key) {
                cell.classList.add("is-range-end");
                cell.dataset.badge = copy.checkoutLabel;
            }

            if (selection.start && selection.end && key > selection.start && key < selection.end) {
                cell.classList.add("is-in-range");
            }

            if (selection.start && !selection.end && state === "free") {
                if (key > selection.start) {
                    cell.classList.add("is-checkout-candidate");
                }

                if (key < selection.start) {
                    cell.classList.add("is-before-start");
                }
            }

            cell.textContent = String(day);
            cell.dataset.key = key;
            cell.setAttribute("title", getDayTitle(state, isToday));
            cell.setAttribute("aria-label", `${dayFormatter.format(date)} - ${getDayTitle(state, isToday)}`);

            cell.addEventListener("click", () => {
                if (state !== "free") {
                    selection.start = null;
                    selection.end = null;
                    setStartSelection(false);
                    openModal("single", { key, state, date, price: getDatePrice(prices, date) });
                    return;
                }

                if (!selection.start || selection.end) {
                    selection.start = key;
                    selection.end = null;
                    setStartSelection(true);
                    openModal("close");
                    return;
                }

                if (key <= selection.start) {
                    selection.start = key;
                    selection.end = null;
                    setStartSelection(true);
                    openModal("close");
                    return;
                }

                if (!rangeIsContinuousAndFree(selection.start, key, bookedSet, todayKey)) {
                    selection.start = key;
                    selection.end = null;
                    setStartSelection(false, true);
                    openModal("close");
                    return;
                }

                selection.end = key;
                setStartSelection(false);
                openModal("range", { startKey: selection.start, endKey: selection.end });
            });

            grid.appendChild(cell);
        }
    };

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
        let currentOffset = 0;
        let direction = "next";
        const selection = { start: null, end: null };

        const modal = buildModal();

        const wrapper = document.createElement("div");
        wrapper.className = "availability-month";

        const header = document.createElement("div");
        header.className = "availability-header";

        const prevButton = document.createElement("button");
        prevButton.className = "availability-nav";
        prevButton.type = "button";
        prevButton.setAttribute("aria-label", copy.previousMonth);
        prevButton.textContent = "‹";

        const title = document.createElement("h3");

        const nextButton = document.createElement("button");
        nextButton.className = "availability-nav";
        nextButton.type = "button";
        nextButton.setAttribute("aria-label", copy.nextMonth);
        nextButton.textContent = "›";

        header.appendChild(prevButton);
        header.appendChild(title);
        header.appendChild(nextButton);

        const weekdays = buildWeekdays();
        const grid = document.createElement("div");
        grid.className = "availability-grid";

        const helper = document.createElement("p");
        helper.className = "availability-helper";
        helper.innerHTML = copy.rangeHintHtml;

        const setStartSelection = (isSelectingEnd, showInvalidHint = false) => {
            if (showInvalidHint) {
                wrapper.classList.remove("is-selecting-range");
                helper.textContent = copy.invalidRangeHint;
                return;
            }

            wrapper.classList.toggle("is-selecting-range", isSelectingEnd);

            if (isSelectingEnd) {
                helper.textContent = copy.checkoutHint;
            } else {
                helper.innerHTML = copy.rangeHintHtml;
            }
        };

        const update = () => {
            const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + currentOffset, 1);
            wrapper.classList.remove("is-slide-next", "is-slide-prev");
            wrapper.classList.add("is-transitioning", direction === "next" ? "is-slide-next" : "is-slide-prev");
            title.textContent = formatter.format(month);
            window.setTimeout(() => {
                renderMonth(
                    grid,
                    month,
                    bookedSet,
                    todayKey,
                    prices,
                    selection,
                    (mode, payload) => {
                        if (mode === "close") {
                            modal.close();
                            update();
                            return;
                        }

                        if (mode === "single") {
                            renderSingleDateModal(modal.body, payload.key, payload.state, payload.date, payload.price);
                            modal.open();
                            update();
                            return;
                        }

                        if (mode === "range") {
                            renderRangeModal(modal.body, apartment, payload.startKey, payload.endKey, prices);
                            const resetButton = modal.body.querySelector(".availability-selection-reset");
                            if (resetButton) {
                                resetButton.addEventListener("click", () => {
                                    selection.start = null;
                                    selection.end = null;
                                    setStartSelection(false);
                                    modal.close();
                                    update();
                                });
                            }
                            modal.open();
                            update();
                        }
                    },
                    setStartSelection
                );
                wrapper.classList.remove("is-transitioning");
            }, 110);
            prevButton.disabled = currentOffset === 0;
            nextButton.disabled = currentOffset === maxOffset;
        };

        prevButton.addEventListener("click", () => {
            if (currentOffset > 0) {
                direction = "prev";
                currentOffset -= 1;
                update();
            }
        });

        nextButton.addEventListener("click", () => {
            if (currentOffset < maxOffset) {
                direction = "next";
                currentOffset += 1;
                update();
            }
        });

        wrapper.appendChild(header);
        wrapper.appendChild(weekdays);
        wrapper.appendChild(grid);
        wrapper.appendChild(helper);
        container.appendChild(wrapper);

        update();
    });
});
