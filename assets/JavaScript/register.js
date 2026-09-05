// ===============================================
//          TRENDSPHERE REGISTRATION
// ===============================================


//===============================================
//          GET REGISTER FORM
//===============================================

const registerForm = document.getElementById("register-form");

const registerMessage = document.getElementById("register-message");

const registerSubmit = document.getElementById("register-submit");


//===============================================
//          PASSWORD TOGGLE
//===============================================

const togglePassword = document.getElementById("toggle-register-password");

const registerPassword = document.getElementById("register-password");


if(togglePassword && registerPassword){

    togglePassword.addEventListener(
        "click",
        () => {

            if(
                registerPassword.type ===
                "password"
            ){

                registerPassword.type =
                    "text";

                togglePassword.innerHTML =
                    '<i class="bx bx-hide"></i>';

            }
            else{

                registerPassword.type =
                    "password";

                togglePassword.innerHTML =
                    '<i class="bx bx-show"></i>';

            }

        }
    );

}


//===============================================
//          CONFIRM PASSWORD TOGGLE
//===============================================

const toggleConfirmPassword =
    document.getElementById(
        "toggle-register-confirm-password"
    );

const confirmPassword =
    document.getElementById(
        "register-confirm-password"
    );


if(
    toggleConfirmPassword &&
    confirmPassword
){

    toggleConfirmPassword.addEventListener(
        "click",
        () => {

            if(
                confirmPassword.type ===
                "password"
            ){

                confirmPassword.type =
                    "text";

                toggleConfirmPassword.innerHTML =
                    '<i class="bx bx-hide"></i>';

            }
            else{

                confirmPassword.type =
                    "password";

                toggleConfirmPassword.innerHTML =
                    '<i class="bx bx-show"></i>';

            }

        }
    );

}


//===============================================
//          SHOW MESSAGE
//===============================================

function showRegisterMessage(
    message,
    type = "error"
){

    if(!registerMessage){

        return;

    }


    registerMessage.textContent =
        message;


    registerMessage.className =
        `auth-message ${type}`;

}


//===============================================
//          REGISTER USER
//===============================================

if(registerForm){

    registerForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            //===================================
            //          GET FORM VALUES
            //===================================

            const fullName =
                document
                    .getElementById(
                        "register-full-name"
                    )
                    .value
                    .trim();


            const username =
                document
                    .getElementById(
                        "register-username"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const email =
                document
                    .getElementById(
                        "register-email"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById(
                        "register-password"
                    )
                    .value;


            const confirmPassword =
                document
                    .getElementById(
                        "register-confirm-password"
                    )
                    .value;


            //===================================
            //          VALIDATION
            //===================================

            if(
                !fullName ||
                !username ||
                !email ||
                !password ||
                !confirmPassword
            ){

                showRegisterMessage(
                    "Please fill in all fields."
                );

                return;

            }


            if(password.length < 6){

                showRegisterMessage(
                    "Password must be at least 6 characters."
                );

                return;

            }


            if(password !== confirmPassword){

                showRegisterMessage(
                    "Passwords do not match."
                );

                return;

            }


            if(!/^[a-zA-Z0-9_]+$/.test(username)){

                showRegisterMessage(
                    "Username can only contain letters, numbers and underscores."
                );

                return;

            }


            //===================================
            //          DISABLE BUTTON
            //===================================

            registerSubmit.disabled =
                true;


            registerSubmit.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                Creating Account...

            `;


            showRegisterMessage(
                "",
                "success"
            );


            try{

                //===================================
                //          SUPABASE SIGN UP
                //===================================

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signUp({

                        email: email,

                        password: password,

                        options: {

                            data: {

                                full_name:
                                    fullName,

                                username:
                                    username

                            }

                        }

                    });


                //===================================
                //          ERROR
                //===================================

                if(error){

                    console.error(
                        "Supabase registration error:",
                        error
                    );

                    showRegisterMessage(
                        error.message
                    );

                    return;

                }


                console.log(
                    "Registration successful:",
                    data
                );


                //===================================
                //          SUCCESS
                //===================================

                showRegisterMessage(
                    "Account created successfully! Please check your email to confirm your account.",
                    "success"
                );


                registerForm.reset();


            }
            catch(error){

                console.error(
                    "Registration error:",
                    error
                );


                showRegisterMessage(
                    "Something went wrong. Please try again."
                );

            }
            finally{

                registerSubmit.disabled =
                    false;


                registerSubmit.innerHTML = `

                    <i class="bx bx-user-plus"></i>

                    Create Account

                `;

            }

        }
    );

}