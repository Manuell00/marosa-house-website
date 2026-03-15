document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("request-form");
    const whatsappButton = document.getElementById("request-whatsapp");
    const status = document.getElementById("request-status");
    const apartment = document.getElementById("apartment");
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const guests = document.getElementById("guests");
    const toast = document.getElementById("request-toast");
    const isEnglish = document.documentElement.lang === "en";

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

    const labels = isEnglish
        ? {
              select: "Select",
              invalidFields: "Please fill in the main fields before continuing.",
              invalidDates: "Check-out must be after check-in.",
              emailReady: "Email draft ready. If nothing opens, check the email app on your device.",
              whatsappReady: "WhatsApp message ready.",
              toastEmail: "Request ready: opening your email app.",
              toastWhatsapp: "Request ready: opening WhatsApp.",
              subject: (apartmentName, name) => `Stay request ${apartmentName} | ${name}`,
              intro: (checkinDate, checkoutDate) =>
                  `Hello, I would like to request information for a stay from ${checkinDate} to ${checkoutDate}.`,
              apartment: "Apartment",
              guests: "Guests",
              name: "Name",
              email: "Email",
              phone: "Phone",
              message: "Message",
          }
        : {
              select: "Seleziona",
              invalidFields: "Compila i campi principali prima di continuare.",
              invalidDates: "La data di check-out deve essere successiva al check-in.",
              emailReady: "Bozza email pronta. Se non si apre nulla, controlla il client email del dispositivo.",
              whatsappReady: "Messaggio WhatsApp pronto.",
              toastEmail: "Richiesta pronta: apertura email in corso.",
              toastWhatsapp: "Messaggio pronto: apertura WhatsApp in corso.",
              subject: (apartmentName, name) => `Richiesta soggiorno ${apartmentName} | ${name}`,
              intro: (checkinDate, checkoutDate) =>
                  `Ciao, vorrei richiedere informazioni per un soggiorno da ${checkinDate} a ${checkoutDate}.`,
              apartment: "Appartamento",
              guests: "Ospiti",
              name: "Nome",
              email: "Email",
              phone: "Telefono",
              message: "Messaggio",
          };

    const guestOptionsByApartment = {
        "MaRoSa Bixio": isEnglish ? ["1 guest", "2 guests"] : ["1 ospite", "2 ospiti"],
        "MaRoSa Magnolie": isEnglish
            ? ["1 guest", "2 guests", "3 guests", "4 guests"]
            : ["1 ospite", "2 ospiti", "3 ospiti", "4 ospiti"],
    };

    const updateGuestOptions = () => {
        const selectedApartment = apartment.value;
        const options = guestOptionsByApartment[selectedApartment] || [];
        const currentValue = guests.value;

        guests.innerHTML = `<option value="">${labels.select}</option>`;

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
            status.textContent = labels.invalidFields;
            return null;
        }

        if (values.checkout <= values.checkin) {
            status.textContent = labels.invalidDates;
            return null;
        }

        status.textContent = "";

        const lines = [
            labels.intro(values.checkin, values.checkout),
            "",
            `${labels.apartment}: ${values.apartment}`,
            `${labels.guests}: ${values.guests}`,
            `${labels.name}: ${values.name}`,
            `${labels.email}: ${values.email}`,
        ];

        if (values.phone) {
            lines.push(`${labels.phone}: ${values.phone}`);
        }

        if (values.message) {
            lines.push("", `${labels.message}: ${values.message}`);
        }

        return {
            subject: labels.subject(values.apartment, values.name),
            body: lines.join("\n"),
        };
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const payload = getPayload();

        if (!payload) return;

        const mailto = `mailto:manuell.caselli@gmail.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;
        status.textContent = labels.emailReady;
        showToast(labels.toastEmail);
        window.setTimeout(() => {
            window.location.href = mailto;
        }, 180);
    });

    whatsappButton.addEventListener("click", () => {
        const payload = getPayload();

        if (!payload) return;

        const whatsappUrl = `https://wa.me/393383232007?text=${encodeURIComponent(payload.body)}`;
        showToast(labels.toastWhatsapp);
        window.open(whatsappUrl, "_blank", "noopener");
        status.textContent = labels.whatsappReady;
    });
});
