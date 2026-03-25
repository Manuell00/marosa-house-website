(function () {
    const storageKey = "marosa_cookie_choice";
    const config = window.MAROSA_ANALYTICS_CONFIG || {};
    const measurementId = config.gaMeasurementId || "";
    const hasValidMeasurementId = /^G-[A-Z0-9]+$/i.test(measurementId) && measurementId !== "G-XXXXXXXXXX";
    let initialized = false;

    const loadScript = (src) =>
        new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[src="${src}"]`);
            if (existing) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.async = true;
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.head.appendChild(script);
        });

    const getPageContext = () => ({
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_language: document.documentElement.lang || "it",
    });

    const sendEvent = (eventName, params = {}) => {
        if (!initialized || typeof window.gtag !== "function") return;
        window.gtag("event", eventName, {
            ...getPageContext(),
            ...params,
        });
    };

    const getLinkLabel = (element) => {
        const explicit = element.dataset.analyticsLabel?.trim();
        if (explicit) return explicit;
        return element.textContent?.replace(/\s+/g, " ").trim() || element.getAttribute("href") || "unknown";
    };

    const classifyInteraction = (element) => {
        const href = (element.getAttribute("href") || "").trim();
        const label = getLinkLabel(element);

        if (href.includes("wa.me")) {
            return {
                eventName: "generate_lead",
                params: {
                    method: "whatsapp",
                    link_text: label,
                    outbound: true,
                },
            };
        }

        if (href.includes("airbnb.")) {
            return {
                eventName: "select_content",
                params: {
                    content_type: "ota",
                    content_id: "airbnb",
                    link_text: label,
                    outbound: true,
                },
            };
        }

        if (href.includes("booking.com")) {
            return {
                eventName: "select_content",
                params: {
                    content_type: "ota",
                    content_id: "booking",
                    link_text: label,
                    outbound: true,
                },
            };
        }

        if (href.startsWith("mailto:")) {
            return {
                eventName: "generate_lead",
                params: {
                    method: "email",
                    link_text: label,
                    outbound: true,
                },
            };
        }

        return null;
    };

    const wireInteractionTracking = () => {
        document.addEventListener("click", (event) => {
            const clickable = event.target.closest("a, button");
            if (!clickable) return;

            const analyticsEvent = classifyInteraction(clickable);
            if (!analyticsEvent) return;

            sendEvent(analyticsEvent.eventName, analyticsEvent.params);
        });
    };

    const initAnalytics = async () => {
        if (initialized || !hasValidMeasurementId) return;

        await loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };

        window.gtag("js", new Date());
        window.gtag("config", measurementId, {
            anonymize_ip: true,
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
        });

        initialized = true;
        wireInteractionTracking();
    };

    const applyConsent = async (choice) => {
        if (choice !== "accepted") return;

        try {
            await initAnalytics();
        } catch (error) {
            console.error("Analytics initialization failed", error);
        }
    };

    window.marosaTrackEvent = (eventName, params = {}) => {
        sendEvent(eventName, params);
    };

    document.addEventListener("marosa:cookie-consent", (event) => {
        applyConsent(event.detail?.choice);
    });

    const savedChoice = window.localStorage?.getItem(storageKey);
    if (savedChoice === "accepted") {
        applyConsent(savedChoice);
    }
})();
