// ===============================================
//          TRENDSPHERE RESET PASSWORD
// ===============================================


//===============================================
//          GET FORM ELEMENTS
//===============================================

const resetPasswordForm =
    document.getElementById(
        "reset-password-form"
    );

const resetPasswordMessage =
    document.getElementById(
        "reset-password-message"
    );

const resetPasswordSubmit =
    document.getElementById(
        "reset-password-submit"
    );


//===============================================
//          PASSWORD TOGGLE
//===============================================

function setupPasswordToggle(
    buttonId,
    inputId
){

    const button =
        document.getElementById(
            buttonId
        );

    const input =
        document.getElementById(
            inputId
        );


    if(!button || !input){

        return;

    }


    button.addEventListener(
        "click",
        () => {

            if(input.type === "password"){

                input.type = "text";

                button.innerHTML =
                    '<i class="bx bx-hide"></i>';

                button.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            }
            else{

                input.type = "password";

                button.innerHTML =
                    '<i class="bx bx-show"></i>';

                button.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}


//===============================================
//          INITIALIZE TOGGLES
//===============================================

setupPasswordToggle(
    "toggle-reset-password",
    "reset-password"
);


setupPasswordToggle(
    "toggle-reset-confirm-password",
    "reset-confirm-password"
);


//===============================================
//          SHOW MESSAGE
//===============================================

function showResetPasswordMessage(
    message,
    type = "error"
){

    if(!resetPasswordMessage){

        return;

    }


    resetPasswordMessage.textContent =
        message;


    resetPasswordMessage.className =
        `auth-message ${type}`;

}


//===============================================
//          RESET PASSWORD
//===============================================

if(resetPasswordForm){

    resetPasswordForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            //===================================
            //          GET PASSWORDS
            //===================================

            const password =
                document
                    .getElementById(
                        "reset-password"
                    )
                    .value;


            const confirmPassword =
                document
                    .getElementById(
                        "reset-confirm-password"
                    )
                    .value;


            //===================================
            //          VALIDATION
            //===================================

            if(!password || !confirmPassword){

                showResetPasswordMessage(
                    "Please fill in all fields."
                );

                return;

            }


            if(password.length < 6){

                showResetPasswordMessage(
                    "Password must be at least 6 characters."
                );

                return;

            }


            if(password !== confirmPassword){

                showResetPasswordMessage(
                    "Passwords do not match."
                );

                return;

            }


            //===================================
            //          DISABLE BUTTON
            //===================================

            resetPasswordSubmit.disabled =
                true;


            resetPasswordSubmit.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                Updating Password...

            `;


            showResetPasswordMessage(
                "",
                "success"
            );


            try{

                //===================================
                //          UPDATE PASSWORD
                //===================================

                const {
                    error
                } =
                    await supabaseClient.auth
                        .updateUser({

                            password:
                                password

                        });


                //===================================
                //          ERROR
                //===================================

                if(error){

                    console.error(
                        "Supabase password update error:",
                        error
                    );


                    showResetPasswordMessage(
                        error.message
                    );


                    return;

                }


                //===================================
                //          SUCCESS
                //===================================

                showResetPasswordMessage(
                    "Your password has been updated successfully. Redirecting to Sign In...",
                    "success"
                );


                resetPasswordForm.reset();


                //===================================
                //          REDIRECT TO LOGIN
                //===================================

                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    2500
                );

            }
            catch(error){

                console.error(
                    "Reset password error:",
                    error
                );


                showResetPasswordMessage(
                    "Something went wrong. Please try again."
                );

            }
            finally{

                //===================================
                //          RESTORE BUTTON
                //===================================

                resetPasswordSubmit.disabled =
                    false;


                resetPasswordSubmit.innerHTML = `

                    <i class="bx bx-lock-alt"></i>

                    Update Password

                `;

            }

        }
    );

}