document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById("cookie-banner");
    const acceptButton = document.getElementById("cookie-accept");
    const rejectButton = document.getElementById("cookie-reject");
    const storageKey = "marosa_cookie_choice";
    const emitChoice = (choice) => {
        document.dispatchEvent(
            new CustomEvent("marosa:cookie-consent", {
                detail: { choice },
            })
        );
    };

    if (!banner || !acceptButton || !rejectButton) return;

    const savedChoice = localStorage.getItem(storageKey);

    if (!savedChoice) {
        banner.classList.add("active");
    } else {
        emitChoice(savedChoice);
    }

    const saveChoice = (value) => {
        localStorage.setItem(storageKey, value);
        banner.classList.remove("active");
        emitChoice(value);
    };

    acceptButton.addEventListener("click", () => saveChoice("accepted"));
    rejectButton.addEventListener("click", () => saveChoice("rejected"));
});
