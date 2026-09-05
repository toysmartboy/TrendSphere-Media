// ===============================================
//          TRENDSPHERE LOGIN SYSTEM
// ===============================================


//===============================================
//          GET LOGIN ELEMENTS
//===============================================

const loginForm =
    document.getElementById("login-form");

const loginMessage =
    document.getElementById("login-message");

const loginSubmit =
    document.getElementById("login-submit");

const loginEmail =
    document.getElementById("login-email");

const loginPassword =
    document.getElementById("login-password");


//===============================================
//          SHOW LOGIN MESSAGE
//===============================================

function showLoginMessage(
    message,
    type = "error"
){

    if(!loginMessage){

        return;

    }

    loginMessage.textContent =
        message;

    loginMessage.className =
        `auth-message ${type}`;

}


//===============================================
//          TOGGLE PASSWORD
//===============================================

const toggleLoginPassword =
    document.getElementById(
        "toggle-login-password"
    );


if(
    toggleLoginPassword &&
    loginPassword
){

    toggleLoginPassword.addEventListener(
        "click",
        () => {

            if(
                loginPassword.type ===
                "password"
            ){

                loginPassword.type =
                    "text";

                toggleLoginPassword.innerHTML =
                    '<i class="bx bx-hide"></i>';

                toggleLoginPassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            }
            else{

                loginPassword.type =
                    "password";

                toggleLoginPassword.innerHTML =
                    '<i class="bx bx-show"></i>';

                toggleLoginPassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );

}


//===============================================
//          LOGIN USER
//===============================================

if(loginForm){

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                loginEmail.value
                    .trim()
                    .toLowerCase();


            const password =
                loginPassword.value;


            //===================================
            //          VALIDATION
            //===================================

            if(!email || !password){

                showLoginMessage(
                    "Please enter your email and password."
                );

                return;

            }


            //===================================
            //          LOADING STATE
            //===================================

            loginSubmit.disabled =
                true;


            loginSubmit.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                Signing In...

            `;


            showLoginMessage(
                "",
                "success"
            );


            try{

                //===================================
                //          SUPABASE LOGIN
                //===================================

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                //===================================
                //          LOGIN ERROR
                //===================================

                if(error){

                    console.error(
                        "Supabase login error:",
                        error
                    );


                    showLoginMessage(
                        error.message
                    );


                    return;

                }


                //===================================
                //          LOGIN SUCCESS
                //===================================

                console.log(
                    "Login successful:",
                    data
                );


                showLoginMessage(
                    "Login successful! Redirecting...",
                    "success"
                );


                //===================================
                //          REDIRECT
                //===================================

                setTimeout(
                    () => {

                        window.location.href =
                            "index.html";

                    },
                    800
                );


            }
            catch(error){

                console.error(
                    "Login error:",
                    error
                );


                showLoginMessage(
                    "Something went wrong. Please try again."
                );

            }
            finally{

                loginSubmit.disabled =
                    false;


                loginSubmit.innerHTML = `

                    <i class="bx bx-log-in"></i>

                    Sign In

                `;

            }

        }
    );

}


//===============================================
//          CHECK EXISTING SESSION
//===============================================

async function checkExistingLogin(){

    try{

        const {
            data
        } =
            await supabaseClient.auth
                .getSession();


        if(
            data &&
            data.session
        ){

            console.log(
                "User is already logged in:",
                data.session.user
            );

        }

    }
    catch(error){

        console.error(
            "Session check error:",
            error
        );

    }

}


checkExistingLogin();


















//===============================================
//          GOOGLE LOGIN
//===============================================

const googleLoginButton =
    document.getElementById("google-login");


if(googleLoginButton){

    googleLoginButton.addEventListener(
        "click",
        async () => {

            googleLoginButton.disabled = true;

            googleLoginButton.innerHTML = `
                <i class="bx bx-loader-alt bx-spin"></i>
                Connecting to Google...
            `;

            showLoginMessage(
                "",
                "success"
            );

            try{

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithOAuth({

                            provider: "google",

                            options: {

                                redirectTo:
                                    `${window.location.origin}/index.html`

                            }

                        });


                if(error){

                    console.error(
                        "Google login error:",
                        error
                    );

                    showLoginMessage(
                        error.message
                    );

                    googleLoginButton.disabled = false;

                    googleLoginButton.innerHTML = `
                        <i class="bx bxl-google"></i>
                        Continue with Google
                    `;

                }

            }
            catch(error){

                console.error(
                    "Google login error:",
                    error
                );

                showLoginMessage(
                    "Unable to connect to Google. Please try again."
                );

                googleLoginButton.disabled = false;

                googleLoginButton.innerHTML = `
                    <i class="bx bxl-google"></i>
                    Continue with Google
                `;

            }

        }
    );

}