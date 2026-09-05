
//==================================================
//              TRENDSPHERE MEDIA
//              PUSH NOTIFICATIONS
//==================================================


//==================================================
//              SERVICE WORKER
//==================================================

async function registerTrendSphereServiceWorker(){

    if(
        !("serviceWorker" in navigator)
    ){

        console.warn(
            "Service Workers are not supported by this browser."
        );

        return null;

    }


    try{

        const registration =
            await navigator.serviceWorker.register(
                "/service-worker.js"
            );


        console.log(
            "TrendSphere Service Worker registered:",
            registration
        );


        return registration;

    }
    catch(error){

        console.error(
            "Service Worker registration failed:",
            error
        );

        return null;

    }

}



//==================================================
//          ENABLE PUSH NOTIFICATIONS
//==================================================

const enablePushNotifications =
    document.getElementById(
        "enable-push-notifications"
    );



//==================================================
//          REQUEST NOTIFICATION PERMISSION
//==================================================

async function enableTrendSphereNotifications(){

    if(
        !("Notification" in window)
    ){

        console.warn(
            "This browser does not support notifications."
        );

        return null;

    }


    const permission =
        await Notification.requestPermission();


    if(
        permission !== "granted"
    ){

        console.warn(
            "Notification permission was not granted."
        );

        return null;

    }


    console.log(
        "TrendSphere notification permission granted."
    );


    if(enablePushNotifications){

        enablePushNotifications.innerHTML = `

            <i class="bx bx-loader-alt bx-spin"></i>

            Connecting...

        `;

        enablePushNotifications.disabled = true;

    }


    return await createTrendSpherePushSubscription();

}



//==================================================
//          CREATE PUSH SUBSCRIPTION
//==================================================

async function createTrendSpherePushSubscription(){

    try{

        const registration =
            await navigator.serviceWorker.ready;


        console.log(
            "Service Worker is ready."
        );


        //==================================================
        //      CHECK EXISTING SUBSCRIPTION
        //==================================================

        let subscription =
            await registration.pushManager.getSubscription();


        if(subscription){

            console.log(
                "Existing push subscription found:",
                subscription
            );

        }


        //==================================================
        //      CREATE NEW SUBSCRIPTION
        //==================================================

        else{

            console.log(
                "Creating new push subscription..."
            );


            //==================================================
            //          VAPID PUBLIC KEY
            //==================================================

            const VAPID_PUBLIC_KEY =
                "BFlBbphJ-ppIx2jhgzcYO6W2knPIUEKRkESSp6_GR1nI5_K_jjd7kIdsrJV0bfWHKT5DN6K09izQStUE-Tb2UNU";


            if(!VAPID_PUBLIC_KEY){

                console.warn(
                    "VAPID public key has not been configured yet."
                );


                if(enablePushNotifications){

                    enablePushNotifications.innerHTML = `

                        <i class="bx bx-bell"></i>

                        Enable Notifications

                    `;

                    enablePushNotifications.disabled =
                        false;

                }


                return null;

            }


            console.log(
                "VAPID public key configured."
            );


            //==================================================
            //      CONVERT VAPID PUBLIC KEY
            //==================================================

            const applicationServerKey =
                urlBase64ToUint8Array(
                    VAPID_PUBLIC_KEY
                );


            console.log(
                "VAPID key converted successfully."
            );


            //==================================================
            //      REQUEST PUSH SUBSCRIPTION
            //==================================================

            console.log(
                "Requesting push subscription..."
            );


            subscription =
                await registration.pushManager.subscribe({

                    userVisibleOnly:
                        true,

                    applicationServerKey:
                        applicationServerKey

                });


            console.log(
                "New push subscription created:",
                subscription
            );

        }


        //==================================================
        //          SAVE SUBSCRIPTION TO SUPABASE
        //==================================================

        console.log(
            "Saving push subscription to Supabase..."
        );


        const saved =
            await saveTrendSpherePushSubscription(
                subscription
            );


        if(!saved){

            console.error(
                "Push subscription could not be saved."
            );


            if(enablePushNotifications){

                enablePushNotifications.innerHTML = `

                    <i class="bx bx-bell"></i>

                    Enable Notifications

                `;

                enablePushNotifications.disabled =
                    false;

            }


            return null;

        }


        //==================================================
        //          SHOW SUCCESS
        //==================================================

        if(enablePushNotifications){

            enablePushNotifications.innerHTML = `

                <i class="bx bx-check"></i>

                Notifications Enabled

            `;

            enablePushNotifications.disabled =
                true;

        }


        //==================================================
        //          SHOW SUBSCRIPTION DATA
        //==================================================

        console.log(
            "Push subscription JSON:",
            subscription.toJSON()
        );


        console.log(
            "TrendSphere push notifications are ready."
        );


        return subscription;

    }
    catch(error){

        console.error(
            "Push subscription failed:",
            error
        );


        if(enablePushNotifications){

            enablePushNotifications.innerHTML = `

                <i class="bx bx-bell"></i>

                Enable Notifications

            `;

            enablePushNotifications.disabled =
                false;

        }


        return null;

    }

}



//==================================================
//      CONVERT VAPID KEY
//==================================================

function urlBase64ToUint8Array(
    base64String
){

    const padding =
        "=".repeat(
            (
                4 -
                base64String.length % 4
            ) % 4
        );


    const base64 =
        (
            base64String +
            padding
        )
        .replace(
            /-/g,
            "+"
        )
        .replace(
            /_/g,
            "/"
        );


    const rawData =
        window.atob(
            base64
        );


    return Uint8Array.from(
        [...rawData].map(
            char =>
                char.charCodeAt(0)
        )
    );

}



//==================================================
//          SAVE PUSH SUBSCRIPTION
//==================================================

async function saveTrendSpherePushSubscription(
    subscription
){

    if(!subscription){

        console.warn(
            "No push subscription to save."
        );

        return false;

    }


    //==================================================
    //          CHECK SUPABASE
    //==================================================

    if(
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ){

        console.error(
            "Supabase client is not available."
        );

        return false;

    }


    try{

        //==================================================
        //          GET CURRENT USER
        //==================================================

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if(sessionError){

            console.error(
                "Unable to get Supabase session:",
                sessionError
            );

            return false;

        }


        const user =
            sessionData?.session?.user;


        if(!user){

            console.warn(
                "No logged-in user. Push subscription was not saved."
            );

            return false;

        }


        console.log(
            "Logged-in user found:",
            user.id
        );


        //==================================================
        //          GET SUBSCRIPTION JSON
        //==================================================

        const subscriptionData =
            subscription.toJSON();


        if(
            !subscriptionData.endpoint ||
            !subscriptionData.keys
        ){

            console.error(
                "Push subscription data is incomplete."
            );

            return false;

        }


        if(
            !subscriptionData.keys.p256dh ||
            !subscriptionData.keys.auth
        ){

            console.error(
                "Push subscription keys are missing."
            );

            return false;

        }


        //==================================================
        //          SAVE TO SUPABASE
        //==================================================

        const {
            data,
            error
        } =
            await supabaseClient
                .from("push_subscriptions")
                .upsert({

                    user_id:
                        user.id,

                    endpoint:
                        subscriptionData.endpoint,

                    p256dh:
                        subscriptionData.keys.p256dh,

                    auth:
                        subscriptionData.keys.auth,

                    updated_at:
                        new Date().toISOString()

                },{
                    onConflict:
                        "user_id,endpoint"
                })
                .select()
                .single();


        if(error){

            console.error(
                "Unable to save push subscription:",
                error
            );

            return false;

        }


        console.log(
            "TrendSphere push subscription saved successfully:",
            data
        );


        return true;

    }
    catch(error){

        console.error(
            "Save push subscription error:",
            error
        );

        return false;

    }

}



//==================================================
//          BUTTON EVENT
//==================================================

if(enablePushNotifications){

    enablePushNotifications.addEventListener(
        "click",
        enableTrendSphereNotifications
    );

}



//==================================================
//          INITIALIZE SERVICE WORKER
//==================================================

if(
    document.readyState === "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        registerTrendSphereServiceWorker
    );

}
else{

    registerTrendSphereServiceWorker();

}

