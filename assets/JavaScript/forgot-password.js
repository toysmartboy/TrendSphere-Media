// ===============================================
//          TRENDSPHERE FORGOT PASSWORD
// ===============================================


//===============================================
//          GET FORM ELEMENTS
//===============================================

const forgotPasswordForm =
    document.getElementById(
        "forgot-password-form"
    );

const forgotPasswordMessage =
    document.getElementById(
        "forgot-password-message"
    );

const forgotPasswordSubmit =
    document.getElementById(
        "forgot-password-submit"
    );


//===============================================
//          SHOW MESSAGE
//===============================================

function showForgotPasswordMessage(
    message,
    type = "error"
){

    if(!forgotPasswordMessage){

        return;

    }


    forgotPasswordMessage.textContent =
        message;


    forgotPasswordMessage.className =
        `auth-message ${type}`;

}


//===============================================
//          FORGOT PASSWORD
//===============================================

if(forgotPasswordForm){

    forgotPasswordForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            //===================================
            //          GET EMAIL
            //===================================

            const email =
                document
                    .getElementById(
                        "forgot-email"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            //===================================
            //          VALIDATION
            //===================================

            if(!email){

                showForgotPasswordMessage(
                    "Please enter your email address."
                );

                return;

            }


            //===================================
            //          DISABLE BUTTON
            //===================================

            forgotPasswordSubmit.disabled =
                true;


            forgotPasswordSubmit.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                Sending Reset Link...

            `;


            showForgotPasswordMessage(
                "",
                "success"
            );


            try{

                //===================================
                //          SUPABASE PASSWORD RESET
                //===================================

                const {
                    error
                } =
                    await supabaseClient.auth
                        .resetPasswordForEmail(
                            email,
                            {
                                redirectTo:
                                    `${window.location.origin}/reset-password.html`
                            }
                        );


                //===================================
                //          ERROR
                //===================================

                if(error){

                    console.error(
                        "Supabase password reset error:",
                        error
                    );


                    showForgotPasswordMessage(
                        error.message
                    );


                    return;

                }


                //===================================
                //          SUCCESS
                //===================================

                showForgotPasswordMessage(
                    "Password reset link sent successfully. Please check your email.",
                    "success"
                );


                forgotPasswordForm.reset();


            }
            catch(error){

                console.error(
                    "Forgot password error:",
                    error
                );


                showForgotPasswordMessage(
                    "Something went wrong. Please try again."
                );

            }
            finally{

                //===================================
                //          RESTORE BUTTON
                //===================================

                forgotPasswordSubmit.disabled =
                    false;


                forgotPasswordSubmit.innerHTML = `

                    <i class="bx bx-mail-send"></i>

                    Send Reset Link

                `;

            }

        }
    );

}