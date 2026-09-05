// =====================================================
//              TRENDSPHERE MEDIA
//              AD MANAGER
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // =================================================
    //              AD CONFIGURATION
    // =================================================

    const AD_CONFIG = {

        "homepage-top": {
            name: "Homepage Top",
            enabled: false,
            slotId: "",
            format: "auto",
            responsive: true
        },

        "homepage-banner": {
            name: "Homepage Banner",
            enabled: false,
            slotId: "",
            format: "auto",
            responsive: true
        },

        "sidebar": {
            name: "Sidebar",
            enabled: false,
            slotId: "",
            format: "auto",
            responsive: true
        }

    };


    // =================================================
    //              COOKIE CONSENT
    // =================================================

    function hasAdvertisingConsent() {

        const saved =
            localStorage.getItem(
                "trendSphereCookiePreferences"
            );

        if (!saved) {
            return false;
        }

        try {

            const preferences =
                JSON.parse(saved);

            return preferences.advertising === true;

        }
        catch (error) {

            console.error(
                "Unable to read advertising preferences:",
                error
            );

            return false;
        }
    }


    // =================================================
    //              CREATE PLACEHOLDER
    // =================================================

    function showPlaceholder(container) {

        if (!container) {
            return;
        }

        if (
            container.querySelector(
                ".ad-fallback"
            )
        ) {
            return;
        }

        const fallback =
            document.createElement("div");

        fallback.className =
            "ad-fallback";

        fallback.innerHTML = `
            <i class="bx bx-broadcast"></i>

            <span>
                Advertisement Space
            </span>

            <p>
                Your advertisement could appear here.
            </p>
        `;

        container.appendChild(
            fallback
        );
    }


    // =================================================
    //              INITIALIZE AD SLOT
    // =================================================

    function initializeAdSlot(container) {

        if (!container) {
            return;
        }

        const slotName =
            container.dataset.adSlot;

        if (!slotName) {
            return;
        }

        const config =
            AD_CONFIG[slotName];

        if (!config) {

            console.warn(
                `Unknown advertisement slot: ${slotName}`
            );

            return;
        }


        // =============================================
        //              SAVE SLOT INFO
        // =============================================

        container.dataset.adName =
            config.name;

        container.dataset.adStatus =
            "not-configured";


        // =============================================
        //          CHECK AD CONSENT
        // =============================================

        if (!hasAdvertisingConsent()) {

            container.dataset.adStatus =
                "consent-required";

            showPlaceholder(container);

            return;
        }


        // =============================================
        //          CHECK REAL AD CONFIG
        // =============================================

        if (
            !config.enabled ||
            !config.slotId
        ) {

            container.dataset.adStatus =
                "not-configured";

            showPlaceholder(container);

            return;
        }


        // =============================================
        //          READY FOR REAL AD
        // =============================================

        container.dataset.adStatus =
            "ready";


        /*
        =================================================
        REAL GOOGLE ADSENSE CODE WILL BE INSERTED HERE
        AFTER THE ACTUAL ADSENSE ACCOUNT/PUBLISHER ID
        AND AD SLOT IDs ARE AVAILABLE.
        =================================================
        */
    }


    // =================================================
    //          INITIALIZE ALL AD SLOTS
    // =================================================

    function initializeAllAds() {

        const containers =
            document.querySelectorAll(
                "[data-ad-slot]"
            );

        containers.forEach(
            initializeAdSlot
        );
    }


    // =================================================
    //          COOKIE PREFERENCE CHANGES
    // =================================================

    window.addEventListener(
        "cookiePreferencesUpdated",
        () => {

            initializeAllAds();

        }
    );


    // =================================================
    //          PUBLIC AD MANAGER
    // =================================================

    window.TrendSphereAds = {

        initialize:
            initializeAdSlot,

        initializeAll:
            initializeAllAds,

        hasConsent:
            hasAdvertisingConsent,

        config:
            AD_CONFIG
    };


    // =================================================
    //              START AD MANAGER
    // =================================================

    initializeAllAds();

});