document.addEventListener("DOMContentLoaded", async () => {
    const calendars = document.querySelectorAll(".availability-calendar");
    if (calendars.length === 0) return;

    const version = Date.now().toString();

    const loadScript = (src) =>
        new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = src;
            script.async = false;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Unable to load ${src}`));
            document.body.appendChild(script);
        });

    try {
        await loadScript(`js/availability-data.js?v=${version}`);
        await loadScript(`js/availability-calendar.js?v=${version}`);
    } catch (error) {
        console.error("Availability calendar failed to initialize.", error);
    }

    const isEnglish = document.documentElement.lang === "en";
    calendars.forEach((calendar) => {
        if (calendar.querySelector(".availability-trigger")) return;

        const message = document.createElement("p");
        message.className = "availability-fallback";
        message.textContent = isEnglish
            ? "The online calendar is temporarily unavailable. "
            : "Il calendario online non è al momento consultabile. ";
        const link = document.createElement("a");
        const bookingPage = isEnglish ? "prenota-en.html" : "prenota.html";
        link.href = `${bookingPage}?apartment=${encodeURIComponent(calendar.dataset.apartment)}`;
        link.textContent = isEnglish ? "Ask us about your dates." : "Chiedici la disponibilità per le tue date.";

        message.append(link);
        calendar.replaceChildren(message);
        const section = calendar.closest(".availability");
        section?.querySelector(".availability-legend")?.remove();
        section?.querySelector(":scope > p")?.remove();
    });
});
