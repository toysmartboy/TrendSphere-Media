//=================================================
//              TRENDSPHERE MEDIA
//                  PROFILE PAGE
//=================================================


//=================================================
//              PROFILE ELEMENTS
//=================================================

const profileFullName =
    document.getElementById("profile-full-name");

const profileUsername =
    document.getElementById("profile-username");

const profileEmail =
    document.getElementById("profile-email");

const profileCreatedAt =
    document.getElementById("profile-created-at");

const profileAccountStatus =
    document.getElementById("profile-account-status");

const profileEmailStatus =
    document.getElementById("profile-email-status");

const profileMessage =
    document.getElementById("profile-message");

const profileLogout =
    document.getElementById("profile-logout");


//=================================================
//              EDIT PROFILE
//=================================================

const editProfileBtn =
    document.getElementById("edit-profile-btn");

const editProfileForm =
    document.getElementById("edit-profile-form");

const editFullName =
    document.getElementById("edit-full-name");

const editUsername =
    document.getElementById("edit-username");

const editProfileMessage =
    document.getElementById("edit-profile-message");

const saveProfileBtn =
    document.getElementById("save-profile-btn");

const cancelEditProfile =
    document.getElementById("cancel-edit-profile");


//=================================================
//              CHANGE PASSWORD
//=================================================

const changePasswordBtn =
    document.getElementById("change-password-btn");

const changePasswordForm =
    document.getElementById("change-password-form");

const newPassword =
    document.getElementById("new-password");

const confirmNewPassword =
    document.getElementById("confirm-new-password");

const changePasswordMessage =
    document.getElementById("change-password-message");

const savePasswordBtn =
    document.getElementById("save-password-btn");

const cancelPassword =
    document.getElementById("cancel-password");


//=================================================
//              PASSWORD TOGGLES
//=================================================

const toggleNewPassword =
    document.getElementById("toggle-new-password");

const toggleConfirmNewPassword =
    document.getElementById(
        "toggle-confirm-new-password"
    );


//=================================================
//              CURRENT USER
//=================================================

let currentUser = null;


//=================================================
//              SHOW PROFILE MESSAGE
//=================================================

function showProfileMessage(
    message,
    type = "error"
){

    if(!profileMessage){

        return;

    }


    profileMessage.textContent =
        message;


    profileMessage.className =
        `profile-message ${type}`;

}


//=================================================
//              SHOW EDIT MESSAGE
//=================================================

function showEditMessage(
    message,
    type = "error"
){

    if(!editProfileMessage){

        return;

    }


    editProfileMessage.textContent =
        message;


    editProfileMessage.className =
        `profile-message ${type}`;

}


//=================================================
//              SHOW PASSWORD MESSAGE
//=================================================

function showPasswordMessage(
    message,
    type = "error"
){

    if(!changePasswordMessage){

        return;

    }


    changePasswordMessage.textContent =
        message;


    changePasswordMessage.className =
        `profile-message ${type}`;

}


//=================================================
//              FORMAT ACCOUNT DATE
//=================================================

function formatAccountDate(date){

    if(!date){

        return "Unknown";

    }


    const formattedDate =
        new Date(date);


    return formattedDate.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


//=================================================
//              LOAD PROFILE
//=================================================

async function loadProfile(){

    try{

        //=========================================
        //          GET CURRENT SESSION
        //=========================================

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if(error){

            console.error(
                "Get user error:",
                error
            );

            showProfileMessage(
                "Unable to load your profile. Please try again."
            );

            return;

        }


        currentUser =
            data.user;


        //=========================================
        //          CHECK LOGIN
        //=========================================

        if(!currentUser){

            window.location.href =
                "login.html";

            return;

        }


        console.log(
            "Current profile user:",
            currentUser
        );


        //=========================================
        //          USER METADATA
        //=========================================

        const metadata =
            currentUser.user_metadata || {};


        const fullName =
            metadata.full_name ||
            "Not provided";


        const username =
            metadata.username ||
            "Not provided";


        //=========================================
        //          DISPLAY PROFILE
        //=========================================

        if(profileFullName){

            profileFullName.textContent =
                fullName;

        }


        if(profileUsername){

            profileUsername.textContent =
                username;

        }


        if(profileEmail){

            profileEmail.textContent =
                currentUser.email ||
                "Not provided";

        }


        //=========================================
        //          ACCOUNT CREATED
        //=========================================

        if(profileCreatedAt){

            profileCreatedAt.textContent =
                formatAccountDate(
                    currentUser.created_at
                );

        }


        //=========================================
        //          ACCOUNT STATUS
        //=========================================

        if(profileAccountStatus){

            profileAccountStatus.textContent =
                "Active";

        }


        //=========================================
        //          EMAIL STATUS
        //=========================================

        if(profileEmailStatus){

            if(currentUser.email_confirmed_at){

                profileEmailStatus.textContent =
                    "Verified";

            }
            else{

                profileEmailStatus.textContent =
                    "Not Verified";

            }

        }


        //=========================================
        //          FILL EDIT FORM
        //=========================================

        if(editFullName){

            editFullName.value =
                metadata.full_name || "";

        }


        if(editUsername){

            editUsername.value =
                metadata.username || "";

        }


    }
    catch(error){

        console.error(
            "Profile loading error:",
            error
        );


        showProfileMessage(
            "Unable to load your profile. Please try again."
        );

    }

}


//=================================================
//              EDIT PROFILE TOGGLE
//=================================================

if(editProfileBtn){

    editProfileBtn.addEventListener(
        "click",
        () => {

            if(
                editProfileForm.classList.contains(
                    "hidden"
                )
            ){

                editProfileForm.classList.remove(
                    "hidden"
                );

            }
            else{

                editProfileForm.classList.add(
                    "hidden"
                );

            }

        }
    );

}


//=================================================
//              CANCEL EDIT PROFILE
//=================================================

if(cancelEditProfile){

    cancelEditProfile.addEventListener(
        "click",
        () => {

            editProfileForm.classList.add(
                "hidden"
            );


            showEditMessage(
                ""
            );


            if(currentUser){

                const metadata =
                    currentUser.user_metadata || {};


                editFullName.value =
                    metadata.full_name || "";


                editUsername.value =
                    metadata.username || "";

            }

        }
    );

}


//=================================================
//              SAVE PROFILE
//=================================================

if(editProfileForm){

    editProfileForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if(!currentUser){

                return;

            }


            const fullName =
                editFullName.value.trim();


            const username =
                editUsername.value
                    .trim()
                    .toLowerCase();


            //=====================================
            //          VALIDATION
            //=====================================

            if(!fullName || !username){

                showEditMessage(
                    "Please fill in all fields."
                );

                return;

            }


            if(
                !/^[a-zA-Z0-9_]+$/.test(
                    username
                )
            ){

                showEditMessage(
                    "Username can only contain letters, numbers and underscores."
                );

                return;

            }


            //=====================================
            //          DISABLE BUTTON
            //=====================================

            saveProfileBtn.disabled =
                true;


            saveProfileBtn.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                Saving...

            `;


            showEditMessage(
                ""
            );


            try{

                //=================================
                //          UPDATE USER
                //=================================

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.updateUser({

                        data: {

                            full_name:
                                fullName,

                            username:
                                username

                        }

                    });


                if(error){

                    console.error(
                        "Profile update error:",
                        error
                    );


                    showEditMessage(
                        error.message
                    );

                    return;

                }


                //=================================
                //          UPDATE LOCAL USER
                //=================================

                currentUser =
                    data.user;


                //=================================
                //          UPDATE DISPLAY
                //=================================

                profileFullName.textContent =
                    fullName;


                profileUsername.textContent =
                    username;


                //=================================
                //          SUCCESS
                //=================================

                showEditMessage(
                    "Profile updated successfully.",
                    "success"
                );


            }
            catch(error){

                console.error(
                    "Profile update error:",
                    error
                );


                showEditMessage(
                    "Unable to update your profile. Please try again."
                );

            }
            finally{

                saveProfileBtn.disabled =
                    false;


                saveProfileBtn.innerHTML = `

                    <i class="bx bx-save"></i>

                    Save Changes

                `;

            }

        }
    );

}


//=================================================
//              CHANGE PASSWORD TOGGLE
//=================================================

if(toggleNewPassword){

    toggleNewPassword.addEventListener(
        "click",
        () => {

            if(
                newPassword.type ===
                "password"
            ){

                newPassword.type =
                    "text";


                toggleNewPassword.innerHTML =
                    '<i class="bx bx-hide"></i>';

            }
            else{

                newPassword.type =
                    "password";


                toggleNewPassword.innerHTML =
                    '<i class="bx bx-show"></i>';

            }

        }
    );

}


if(toggleConfirmNewPassword){

    toggleConfirmNewPassword.addEventListener(
        "click",
        () => {

            if(
                confirmNewPassword.type ===
                "password"
            ){

                confirmNewPassword.type =
                    "text";


                toggleConfirmNewPassword.innerHTML =
                    '<i class="bx bx-hide"></i>';

            }
            else{

                confirmNewPassword.type =
                    "password";


                toggleConfirmNewPassword.innerHTML =
                    '<i class="bx bx-show"></i>';

            }

        }
    );

}


//=================================================
//              CHANGE PASSWORD TOGGLE FORM
//=================================================

if(changePasswordBtn){

    changePasswordBtn.addEventListener(
        "click",
        () => {

            if(
                changePasswordForm.classList.contains(
                    "hidden"
                )
            ){

                changePasswordForm.classList.remove(
                    "hidden"
                );

            }
            else{

                changePasswordForm.classList.add(
                    "hidden"
                );

            }

        }
    );

}


//=================================================
//              CANCEL PASSWORD
//=================================================

if(cancelPassword){

    cancelPassword.addEventListener(
        "click",
        () => {

            changePasswordForm.classList.add(
                "hidden"
            );


            newPassword.value =
                "";


            confirmNewPassword.value =
                "";


            showPasswordMessage(
                ""
            );

        }
    );

}


//=================================================
//              UPDATE PASSWORD
//=================================================

if(changePasswordForm){

    changePasswordForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const password =
                newPassword.value;


            const confirmPassword =
                confirmNewPassword.value;


            //=====================================
            //          VALIDATION
            //=====================================

            if(
                !password ||
                !confirmPassword
            ){

                showPasswordMessage(
                    "Please fill in both password fields."
                );

                return;

            }


            if(password.length < 6){

                showPasswordMessage(
                    "Password must be at least 6 characters."
                );

                return;

            }


            if(password !== confirmPassword){

                showPasswordMessage(
                    "Passwords do not match."
                );

                return;

            }


            //=====================================
            //          DISABLE BUTTON
            //=====================================

            savePasswordBtn.disabled =
                true;


            savePasswordBtn.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                Updating...

            `;


            showPasswordMessage(
                ""
            );


            try{

                //=================================
                //          UPDATE PASSWORD
                //=================================

                const {
                    error
                } =
                    await supabaseClient.auth.updateUser({

                        password:
                            password

                    });


                if(error){

                    console.error(
                        "Password update error:",
                        error
                    );


                    showPasswordMessage(
                        error.message
                    );

                    return;

                }


                //=================================
                //          SUCCESS
                //=================================

                showPasswordMessage(
                    "Password updated successfully.",
                    "success"
                );


                newPassword.value =
                    "";


                confirmNewPassword.value =
                    "";


            }
            catch(error){

                console.error(
                    "Password update error:",
                    error
                );


                showPasswordMessage(
                    "Unable to update your password. Please try again."
                );

            }
            finally{

                savePasswordBtn.disabled =
                    false;


                savePasswordBtn.innerHTML = `

                    <i class="bx bx-lock-alt"></i>

                    Update Password

                `;

            }

        }
    );

}


//=================================================
//              SIGN OUT
//=================================================

if(profileLogout){

    profileLogout.addEventListener(
        "click",
        async () => {

            profileLogout.disabled =
                true;


            profileLogout.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                Signing Out...

            `;


            try{

                const {
                    error
                } =
                    await supabaseClient.auth.signOut();


                if(error){

                    console.error(
                        "Sign out error:",
                        error
                    );


                    showProfileMessage(
                        error.message
                    );


                    profileLogout.disabled =
                        false;


                    profileLogout.innerHTML = `

                        <i class="bx bx-log-out"></i>

                        Sign Out

                    `;

                    return;

                }


                //=================================
                //          REDIRECT
                //=================================

                window.location.href =
                    "index.html";

            }
            catch(error){

                console.error(
                    "Sign out error:",
                    error
                );


                showProfileMessage(
                    "Unable to sign out. Please try again."
                );


                profileLogout.disabled =
                    false;


                profileLogout.innerHTML = `

                    <i class="bx bx-log-out"></i>

                    Sign Out

                `;

            }

        }
    );

}


//=================================================
//              INITIALIZE PROFILE
//=================================================

loadProfile();