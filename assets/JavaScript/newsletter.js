// =====================================================
//              TRENDSPHERE MEDIA
//              NEWSLETTER SUBSCRIPTION
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("newsletter-form");

    const input =
        document.getElementById("newsletter-email");

    const message =
        document.getElementById("newsletter-message");

    const button =
        document.getElementById("newsletter-submit");


    // =================================================
    //              CHECK ELEMENTS
    // =================================================

    if (!form || !input || !message || !button) {

        console.error(
            "Newsletter elements are missing."
        );

        return;
    }


    // =================================================
    //              SUBMIT FORM
    // =================================================

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // =========================================
            //              GET EMAIL
            // =========================================

            const email =
                String(input.value || "")
                    .trim()
                    .toLowerCase();


            // =========================================
            //              VALIDATE EMAIL
            // =========================================

            if (!email) {

                message.textContent =
                    "Please enter your email address.";

                message.className =
                    "newsletter-message error";

                return;
            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                message.textContent =
                    "Please enter a valid email address.";

                message.className =
                    "newsletter-message error";

                return;
            }


            // =========================================
            //              SUPABASE CHECK
            // =========================================

            if (
                typeof supabaseClient ===
                "undefined"
            ) {

                message.textContent =
                    "Newsletter service is unavailable.";

                message.className =
                    "newsletter-message error";

                console.error(
                    "supabaseClient is not available."
                );

                return;
            }


            // =========================================
            //              LOADING STATE
            // =========================================

            button.disabled = true;

            button.textContent =
                "Subscribing...";

            message.textContent = "";


            try {

                // =====================================
                //          INSERT SUBSCRIBER
                // =====================================

                const { error } =
                    await supabaseClient
                        .from(
                            "newsletter_subscribers"
                        )
                        .insert([
                            {
                                email: email
                            }
                        ]);


                // =====================================
                //              HANDLE ERROR
                // =====================================

                if (error) {

                    console.error(
                        "Newsletter subscription error:",
                        error
                    );


                    // Duplicate email
                    if (
                        error.code === "23505"
                    ) {

                        message.textContent =
                            "This email is already subscribed.";

                    } else {

                        message.textContent =
                            "Unable to subscribe right now. Please try again.";

                    }


                    message.className =
                        "newsletter-message error";

                    return;
                }


                // =====================================
                //              SUCCESS
                // =====================================

                message.textContent =
                    "Thank you for subscribing to TrendSphere Media!";

                message.className =
                    "newsletter-message success";


                // Clear input only after success
                input.value = "";


            }
            catch (error) {

                console.error(
                    "Newsletter submission error:",
                    error
                );


                message.textContent =
                    "Something went wrong. Please try again.";

                message.className =
                    "newsletter-message error";

            }


            finally {

                button.disabled = false;

                button.textContent =
                    "Subscribe";

            }

        }
    );

});