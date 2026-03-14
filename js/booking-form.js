document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("request-form");
    const whatsappButton = document.getElementById("request-whatsapp");
    const status = document.getElementById("request-status");
    const apartment = document.getElementById("apartment");
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const guests = document.getElementById("guests");
    const toast = document.getElementById("request-toast");

    if (!form || !whatsappButton || !status || !apartment || !checkin || !checkout || !guests) return;

    const today = new Date().toISOString().split("T")[0];
    checkin.min = today;
    checkout.min = today;

    const params = new URLSearchParams(window.location.search);
    const apartmentParam = params.get("apartment");

    if (apartmentParam === "bixio") {
        apartment.value = "MaRoSa Bixio";
    }

    if (apartmentParam === "magnolie") {
        apartment.value = "MaRoSa Magnolie";
    }

    const guestOptionsByApartment = {
        "MaRoSa Bixio": ["1 ospite", "2 ospiti"],
        "MaRoSa Magnolie": ["1 ospite", "2 ospiti", "3 ospiti", "4 ospiti"],
    };

    const updateGuestOptions = () => {
        const selectedApartment = apartment.value;
        const options = guestOptionsByApartment[selectedApartment] || [];
        const currentValue = guests.value;

        guests.innerHTML = '<option value="">Seleziona</option>';

        options.forEach((optionValue) => {
            const option = document.createElement("option");
            option.value = optionValue;
            option.textContent = optionValue;
            guests.appendChild(option);
        });

        if (options.includes(currentValue)) {
            guests.value = currentValue;
        }
    };

    apartment.addEventListener("change", updateGuestOptions);
    updateGuestOptions();

    let toastTimeout = null;

    const showToast = (message) => {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("is-visible");

        window.clearTimeout(toastTimeout);
        toastTimeout = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 2600);
    };

    checkin.addEventListener("change", () => {
        checkout.min = checkin.value || today;

        if (checkout.value && checkin.value && checkout.value < checkin.value) {
            checkout.value = "";
        }
    });

    const getPayload = () => {
        const formData = new FormData(form);
        const values = Object.fromEntries(formData.entries());

        if (
            !values.apartment ||
            !values.checkin ||
            !values.checkout ||
            !values.guests ||
            !values.name ||
            !values.email
        ) {
            status.textContent = "Compila i campi principali prima di continuare.";
            return null;
        }

        if (values.checkout <= values.checkin) {
            status.textContent = "La data di check-out deve essere successiva al check-in.";
            return null;
        }

        status.textContent = "";

        const lines = [
            `Ciao, vorrei richiedere informazioni per un soggiorno da ${values.checkin} a ${values.checkout}.`,
            "",
            `Appartamento: ${values.apartment}`,
            `Ospiti: ${values.guests}`,
            `Nome: ${values.name}`,
            `Email: ${values.email}`,
        ];

        if (values.phone) {
            lines.push(`Telefono: ${values.phone}`);
        }

        if (values.message) {
            lines.push("", `Messaggio: ${values.message}`);
        }

        return {
            subject: `Richiesta soggiorno ${values.apartment} | ${values.name}`,
            body: lines.join("\n"),
        };
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const payload = getPayload();

        if (!payload) return;

        const mailto = `mailto:manuell.caselli@gmail.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;
        status.textContent = "Bozza email pronta. Se non si apre nulla, controlla il client email del dispositivo.";
        showToast("Richiesta pronta: apertura email in corso.");
        window.setTimeout(() => {
            window.location.href = mailto;
        }, 180);
    });

    whatsappButton.addEventListener("click", () => {
        const payload = getPayload();

        if (!payload) return;

        const whatsappUrl = `https://wa.me/393383232007?text=${encodeURIComponent(payload.body)}`;
        showToast("Messaggio pronto: apertura WhatsApp in corso.");
        window.open(whatsappUrl, "_blank", "noopener");
        status.textContent = "Messaggio WhatsApp pronto.";
    });
});
