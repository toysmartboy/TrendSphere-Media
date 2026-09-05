// =====================================================
//              COOKIE CONSENT SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const cookieConsent =
        document.getElementById("cookie-consent");

    const cookieModal =
        document.getElementById("cookie-modal");

    const acceptButton =
        document.getElementById("cookie-accept-btn");

    const rejectButton =
        document.getElementById("cookie-reject-btn");

    const settingsButton =
        document.getElementById("cookie-settings-btn");

    const closeButton =
        document.getElementById("cookie-modal-close");

    const saveButton =
        document.getElementById("save-cookie-settings");

    const analyticsCookies =
        document.getElementById("analytics-cookies");

    const advertisingCookies =
        document.getElementById("advertising-cookies");


    // =========================================
    //          CHECK SAVED PREFERENCES
    // =========================================

    const savedPreferences =
        localStorage.getItem(
            "trendSphereCookiePreferences"
        );


    if(!savedPreferences){

        setTimeout(() => {

            cookieConsent.classList.add("show");

        }, 1000);

    }


    // =========================================
    //          SAVE PREFERENCES
    // =========================================

    function savePreferences(
        analytics,
        advertising
    ){

        const preferences = {

            essential: true,

            analytics: analytics,

            advertising: advertising,

            timestamp: Date.now()

        };


        localStorage.setItem(
            "trendSphereCookiePreferences",
            JSON.stringify(preferences)
        );

        window.dispatchEvent(
            new CustomEvent(
            "cookiePreferencesUpdated"
            )
        );


        cookieConsent.classList.remove("show");

        cookieModal.classList.remove("show");

        cookieModal.setAttribute(
            "aria-hidden",
            "true"
        );


        console.log(
            "Cookie preferences saved:",
            preferences
        );

    }


    // =========================================
    //          ACCEPT ALL
    // =========================================

    if(acceptButton){

        acceptButton.addEventListener(
            "click",
            () => {

                savePreferences(
                    true,
                    true
                );

            }
        );

    }


    // =========================================
    //          REJECT OPTIONAL
    // =========================================

    if(rejectButton){

        rejectButton.addEventListener(
            "click",
            () => {

                savePreferences(
                    false,
                    false
                );

            }
        );

    }


    // =========================================
    //          OPEN SETTINGS
    // =========================================

    if(settingsButton){

        settingsButton.addEventListener(
            "click",
            () => {

                const saved =
                    localStorage.getItem(
                        "trendSphereCookiePreferences"
                    );


                if(saved){

                    try{

                        const preferences =
                            JSON.parse(saved);


                        analyticsCookies.checked =
                            preferences.analytics === true;


                        advertisingCookies.checked =
                            preferences.advertising === true;

                    }
                    catch(error){

                        console.error(
                            "Unable to read cookie preferences.",
                            error
                        );

                    }

                }


                cookieModal.classList.add("show");

                cookieModal.setAttribute(
                    "aria-hidden",
                    "false"
                );

            }
        );

    }


    // =========================================
    //          CLOSE SETTINGS
    // =========================================

    if(closeButton){

        closeButton.addEventListener(
            "click",
            () => {

                cookieModal.classList.remove("show");

                cookieModal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );

    }


    // =========================================
    //          SAVE CUSTOM SETTINGS
    // =========================================

    if(saveButton){

        saveButton.addEventListener(
            "click",
            () => {

                savePreferences(

                    analyticsCookies.checked,

                    advertisingCookies.checked

                );

            }
        );

    }


    // =========================================
    //          CLOSE WHEN CLICKING OVERLAY
    // =========================================

    const modalOverlay =
        document.querySelector(
            ".cookie-modal-overlay"
        );


    if(modalOverlay){

        modalOverlay.addEventListener(
            "click",
            () => {

                cookieModal.classList.remove(
                    "show"
                );

                cookieModal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );

    }


});