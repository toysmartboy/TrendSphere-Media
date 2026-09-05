// ===============================================
//          TRENDSPHERE ACCOUNT SYSTEM
// ===============================================


//===============================================
//          ACCOUNT ELEMENTS
//===============================================

const accountNav =
    document.getElementById(
        "account-nav"
    );

const accountBtn =
    document.getElementById(
        "account-btn"
    );

const accountMenu =
    document.getElementById(
        "account-menu"
    );

const accountName =
    document.getElementById(
        "account-name"
    );

const accountEmail =
    document.getElementById(
        "account-email"
    );

const accountLogin =
    document.getElementById(
        "account-login"
    );

const accountRegister =
    document.getElementById(
        "account-register"
    );

const accountProfile =
    document.getElementById(
        "account-profile"
    );

const accountLogout =
    document.getElementById(
        "account-logout"
    );

const accountAdminMessages =
    document.getElementById(
        "account-admin-messages"
    );


//===============================================
//          SUPABASE CHECK
//===============================================

function isAccountSupabaseReady(){

    return (
        typeof supabaseClient !==
            "undefined" &&
        supabaseClient &&
        supabaseClient.auth
    );

}


//===============================================
//          TOGGLE ACCOUNT MENU
//===============================================

if(
    accountBtn &&
    accountMenu
){

    accountBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            accountMenu.classList.toggle(
                "show"
            );

        }
    );

}


//===============================================
//          CLOSE ACCOUNT MENU
//===============================================

document.addEventListener(
    "click",
    event => {

        if(
            !accountMenu ||
            !accountNav 

        ){
            return;
        }

        if(
            !accountNav.contains(
                event.target
            )
        ){

            accountMenu.classList.remove(
                "show"
            );

        }

    }
);


//===============================================
//      PREVENT ACCOUNT MENU CLOSING
//      WHEN CLICKING INSIDE IT
//===============================================

if(accountMenu){

    accountMenu.addEventListener(
        "click",
        event => {

            event.stopPropagation();

        }
    );

}



//===============================================
//          CLOSE MENU WITH ESCAPE
//===============================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            accountMenu
        ){

            accountMenu.classList.remove(
                "show"
            );

        }

    }
);


//===============================================
//          GET USER DISPLAY NAME
//===============================================

function getUserDisplayName(
    user
){

    if(!user){

        return "Guest";

    }


    const metadata =
        user.user_metadata ||
        {};


    return (
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        metadata.username ||
        user.email?.split("@")[0] ||
        "TrendSphere User"
    );

}


//===============================================
//          UPDATE GUEST UI
//===============================================

function showGuestAccountUI(){

    if(accountName){

        accountName.textContent =
            "Guest";

    }


    if(accountEmail){

        accountEmail.textContent =
            "Not signed in";

    }


    if(accountLogin){

        accountLogin.classList.remove(
            "hidden"
        );

    }


    if(accountRegister){

        accountRegister.classList.remove(
            "hidden"
        );

    }


    if(accountProfile){

        accountProfile.classList.add(
            "hidden"
        );

    }


    if(accountLogout){

        accountLogout.classList.add(
            "hidden"
        );

        accountLogout.disabled =
            false;

    }


    if(accountMenu){

        accountMenu.classList.remove(
            "show"
        );

    }

}


//===============================================
//          UPDATE LOGGED-IN UI
//===============================================

function showLoggedInAccountUI(
    user
){

    if(!user){

        showGuestAccountUI();

        return;

    }


    const displayName =
        getUserDisplayName(
            user
        );


    if(accountName){

        accountName.textContent =
            displayName;

    }


    if(accountEmail){

        accountEmail.textContent =
            user.email ||
            "";

    }


    if(accountLogin){

        accountLogin.classList.add(
            "hidden"
        );

    }


    if(accountRegister){

        accountRegister.classList.add(
            "hidden"
        );

    }


    if(accountProfile){

        accountProfile.classList.remove(
            "hidden"
        );

    }


    if(accountLogout){

        accountLogout.classList.remove(
            "hidden"
        );

        accountLogout.disabled =
            false;

        accountLogout.innerHTML = `

            <i class="bx bx-log-out"></i>

            <span>
                Sign Out
            </span>

        `;

    }

}


//===============================================
//          UPDATE ACCOUNT UI
//===============================================

async function updateAccountUI(){

    if(
        !isAccountSupabaseReady()
    ){

        console.error(
            "Supabase client not available."
        );

        showGuestAccountUI();

        return;

    }


    try{

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if(error){

            console.error(
                "Unable to read session:",
                error
            );

            showGuestAccountUI();

            return;

        }


        const session =
            data?.session ||
            null;


        if(!session){

            showGuestAccountUI();

            return;

        }


        showLoggedInAccountUI(
            session.user
        );

    }
    catch(error){

        console.error(
            "Account UI error:",
            error
        );

        showGuestAccountUI();

    }

}


//===============================================
//          LOGOUT
//===============================================

if(accountLogout){

    accountLogout.addEventListener(
        "click",
        async () => {

            if(
                accountLogout.disabled
            ){

                return;

            }


            accountLogout.disabled =
                true;


            accountLogout.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                <span>
                    Signing Out...
                </span>

            `;


            try{

                const {
                    error
                } =
                    await supabaseClient.auth
                        .signOut();


                if(error){

                    console.error(
                        "Logout error:",
                        error
                    );


                    accountLogout.disabled =
                        false;


                    accountLogout.innerHTML = `

                        <i class="bx bx-log-out"></i>

                        <span>
                            Sign Out
                        </span>

                    `;


                    return;

                }


                // Immediately reset UI
                showGuestAccountUI();


                // Return to homepage
                window.location.href =
                    "index.html";

            }
            catch(error){

                console.error(
                    "Logout error:",
                    error
                );


                accountLogout.disabled =
                    false;


                accountLogout.innerHTML = `

                    <i class="bx bx-log-out"></i>

                    <span>
                        Sign Out
                    </span>

                `;

            }

        }
    );

}


//===============================================
//          AUTH STATE CHANGES
//===============================================

if(
    isAccountSupabaseReady()
){

    supabaseClient.auth.onAuthStateChange(
        (
            event,
            session
        ) => {

            console.log(
                "Auth state changed:",
                event
            );


            // Give Supabase a moment to finish
            // updating its session state.

            setTimeout(
                () => {

                    if(session?.user){

                        showLoggedInAccountUI(
                            session.user
                        );

                    }
                    else{

                        showGuestAccountUI();

                    }

                },
                0
            );

        }
    );

}


//===============================================
//          UPDATE WHEN TAB GETS FOCUS
//===============================================

window.addEventListener(
    "focus",
    () => {

        updateAccountUI();

    }
);


//===============================================
//          UPDATE WHEN PAGE BECOMES VISIBLE
//===============================================

document.addEventListener(
    "visibilitychange",
    () => {

        if(
            document.visibilityState ===
            "visible"
        ){

            updateAccountUI();

        }

    }
);


//===============================================
//          INITIAL CHECK
//===============================================

updateAccountUI();
updateAdminMenu();








//===============================================
//          CHECK ADMIN STATUS
//===============================================

async function checkTrendSphereAdmin(){

    if(
        typeof supabaseClient ===
            "undefined" ||
        !supabaseClient
    ){

        return false;

    }


    try{

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if(sessionError){

            console.error(
                "Admin session error:",
                sessionError
            );

            return false;

        }


        const user =
            sessionData?.session?.user;


        if(!user){

            return false;

        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "admin_users"
                )
                .select(
                    "user_id"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .maybeSingle();


        if(error){

            console.error(
                "Admin check error:",
                error
            );

            return false;

        }


        return !!data;

    }
    catch(error){

        console.error(
            "Admin check failed:",
            error
        );

        return false;

    }

}


//===============================================
//          UPDATE ADMIN MENU ITEM
//===============================================

async function updateAdminMenu(){

    if(!accountAdminMessages){

        return;

    }


    const isAdmin =
        await checkTrendSphereAdmin();


    if(isAdmin){

        accountAdminMessages.classList.remove(
            "hidden"
        );

    }
    else{

        accountAdminMessages.classList.add(
            "hidden"
        );

    }

}