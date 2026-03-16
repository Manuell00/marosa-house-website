document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("request-form");
    const emailButton = document.getElementById("request-email");
    const whatsappButton = document.getElementById("request-whatsapp");
    const submitButton = document.getElementById("request-submit");
    const status = document.getElementById("request-status");
    const apartment = document.getElementById("apartment");
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const guests = document.getElementById("guests");
    const toast = document.getElementById("request-toast");
    const isEnglish = document.documentElement.lang === "en";
    const formEndpoint = form?.dataset.formEndpoint?.trim() || "";
    const formSuccessMessage = form?.dataset.successMessage;
    const formErrorMessage = form?.dataset.errorMessage;

    if (!form || !whatsappButton || !emailButton || !submitButton || !status || !apartment || !checkin || !checkout || !guests) return;

    const today = new Date().toISOString().split("T")[0];
    checkin.min = today;
    checkout.min = today;

    const params = new URLSearchParams(window.location.search);
    const apartmentParam = params.get("apartment");
    const checkinParam = params.get("checkin");
    const checkoutParam = params.get("checkout");

    if (apartmentParam === "bixio") {
        apartment.value = "MaRoSa Bixio";
    }

    if (apartmentParam === "magnolie") {
        apartment.value = "MaRoSa Magnolie";
    }

    if (checkinParam) {
        checkin.value = checkinParam;
        checkout.min = checkinParam;
    }

    if (checkoutParam) {
        checkout.value = checkoutParam;
    }

    const labels = isEnglish
        ? {
              select: "Select",
              invalidFields: "Please fill in the main fields before continuing.",
              invalidDates: "Check-out must be after check-in.",
              invalidSpam: "Request blocked.",
              submitReady: "Request sent successfully. We will reply as soon as possible.",
              submitSending: "Sending request...",
              submitError: "Could not send the request. You can still use email or WhatsApp.",
              emailReady: "Email draft ready. If nothing opens, check the email app on your device.",
              whatsappReady: "WhatsApp message ready.",
              toastSuccessTitle: "Request sent",
              toastInfoTitle: "Ready to continue",
              toastSubmit: "Request sent successfully.",
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
              invalidSpam: "Richiesta bloccata.",
              submitReady: "Richiesta inviata correttamente. Ti risponderemo il prima possibile.",
              submitSending: "Invio della richiesta in corso...",
              submitError: "Invio non riuscito. Puoi comunque usare email o WhatsApp.",
              emailReady: "Bozza email pronta. Se non si apre nulla, controlla il client email del dispositivo.",
              whatsappReady: "Messaggio WhatsApp pronto.",
              toastSuccessTitle: "Richiesta inviata",
              toastInfoTitle: "Tutto pronto",
              toastSubmit: "Richiesta inviata correttamente.",
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

    const markFieldState = (fieldElement) => {
        const wrapper = fieldElement.closest(".field");
        if (!wrapper) return;

        wrapper.classList.remove("is-valid", "is-invalid");

        if (!fieldElement.value) return;

        if (fieldElement.checkValidity()) {
            wrapper.classList.add("is-valid");
        } else {
            wrapper.classList.add("is-invalid");
        }
    };

    form.querySelectorAll("input, select, textarea").forEach((fieldElement) => {
        fieldElement.addEventListener("blur", () => markFieldState(fieldElement));
        fieldElement.addEventListener("input", () => markFieldState(fieldElement));
        fieldElement.addEventListener("change", () => markFieldState(fieldElement));
    });

    let toastTimeout = null;

    const showToast = (message, type = "info") => {
        if (!toast) return;

        const icon = type === "success" ? "fa-circle-check" : "fa-circle-info";
        const title = type === "success" ? labels.toastSuccessTitle : labels.toastInfoTitle;

        toast.innerHTML = `
            <div class="request-toast-icon">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="request-toast-copy">
                <strong>${title}</strong>
                <span>${message}</span>
            </div>
        `;
        toast.classList.remove("is-info", "is-success");
        toast.classList.add(`is-${type}`);
        toast.classList.add("is-visible");

        window.clearTimeout(toastTimeout);
        toastTimeout = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 2600);
    };

    const setStatus = (message, type = "") => {
        status.textContent = message;
        status.classList.remove("is-error", "is-success");

        if (type) {
            status.classList.add(type);
        }
    };

    const setSubmitting = (isSubmitting) => {
        submitButton.disabled = isSubmitting;
        emailButton.disabled = isSubmitting;
        whatsappButton.disabled = isSubmitting;
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
            setStatus(labels.invalidFields, "is-error");
            return null;
        }

        if (values.checkout <= values.checkin) {
            setStatus(labels.invalidDates, "is-error");
            return null;
        }

        if (values.website) {
            setStatus(labels.invalidSpam, "is-error");
            return null;
        }

        setStatus("");

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
            values,
        };
    };

    const openEmailDraft = (payload) => {
        const mailto = `mailto:manuell.caselli@gmail.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.body)}`;
        setStatus(labels.emailReady, "is-success");
        showToast(labels.toastEmail, "info");
        window.setTimeout(() => {
            window.location.href = mailto;
        }, 180);
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const payload = getPayload();

        if (!payload) return;

        if (!formEndpoint) {
            openEmailDraft(payload);
            return;
        }

        setSubmitting(true);
        setStatus(formSuccessMessage || labels.submitSending);

        try {
            const response = await fetch(formEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    apartment: payload.values.apartment,
                    checkin: payload.values.checkin,
                    checkout: payload.values.checkout,
                    guests: payload.values.guests,
                    name: payload.values.name,
                    email: payload.values.email,
                    phone: payload.values.phone || "",
                    message: payload.values.message || "",
                    email_subject: payload.subject,
                    formatted_message: payload.body,
                }),
            });

            if (!response.ok) {
                throw new Error("submit_failed");
            }

            form.reset();
            updateGuestOptions();
            checkin.min = today;
            checkout.min = today;
            form.querySelectorAll(".field").forEach((field) => {
                field.classList.remove("is-valid", "is-invalid");
            });
            setStatus(formSuccessMessage || labels.submitReady, "is-success");
            showToast(labels.toastSubmit, "success");
        } catch (error) {
            setStatus(formErrorMessage || labels.submitError, "is-error");
        } finally {
            setSubmitting(false);
        }
    });

    emailButton.addEventListener("click", () => {
        const payload = getPayload();

        if (!payload) return;

        openEmailDraft(payload);
    });

    whatsappButton.addEventListener("click", () => {
        const payload = getPayload();

        if (!payload) return;

        const whatsappUrl = `https://wa.me/393383232007?text=${encodeURIComponent(payload.body)}`;
        showToast(labels.toastWhatsapp, "info");
        window.open(whatsappUrl, "_blank", "noopener");
        setStatus(labels.whatsappReady, "is-success");
    });
});
