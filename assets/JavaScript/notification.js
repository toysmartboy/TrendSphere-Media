
//==================================================
//==================================================
//              NOTIFICATION SYSTEM
//              TrendSphere Media
//              Supabase + Web Push
//==================================================
//==================================================


//==================================================
//              CONFIGURATION
//==================================================

const PUSH_SERVER_URL =
    "https://trendsphere-push-server.onrender.com";


// IMPORTANT:
// This must be the same VAPID PUBLIC KEY
// stored in your server .env file.
//
// Replace this value with your real PUBLIC key.
//
// NEVER put the VAPID PRIVATE KEY here.

const VAPID_PUBLIC_KEY =
    "BFlBbphJ-ppIx2jhgzcYO6W2knPIUEKRkESSp6_GR1nI5_K_jjd7kIdsrJV0bfWHKT5DN6K09izQStUE-Tb2UNU";


//==================================================
//              NOTIFICATION ELEMENTS
//==================================================

const notificationButton =
    document.getElementById(
        "notification-btn"
    );


const notificationPanel =
    document.getElementById(
        "notification-panel"
    );


const closeNotification =
    document.getElementById(
        "close-notification"
    );


const notificationList =
    document.getElementById(
        "notification-list"
    );


const notificationCount =
    document.getElementById(
        "notification-count"
    );


const clearNotifications =
    document.getElementById(
        "clear-notifications"
    );


const enablePushButton =
    document.getElementById(
        "enable-push-notifications"
    );


const notificationSummary =
    document.getElementById(
        "notification-summary"
    );


//==================================================
//              SUPABASE CHECK
//==================================================

function isNotificationSupabaseReady(){

    return (

        typeof supabaseClient !==
            "undefined" &&

        supabaseClient &&

        supabaseClient.auth

    );

}


//==================================================
//              GET CURRENT USER
//==================================================

async function getNotificationUser(){

    if(
        !isNotificationSupabaseReady()
    ){

        return null;

    }


    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if(error){

            console.error(
                "Unable to get notification user:",
                error
            );

            return null;

        }


        return (
            data?.session?.user ||
            null
        );

    }
    catch(error){

        console.error(
            "Notification user error:",
            error
        );

        return null;

    }

}


//==================================================
//          LOAD NOTIFICATIONS
//==================================================

async function loadNotifications(){

    const user =
        await getNotificationUser();


    if(!user){

        return [];

    }


    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from("notifications")
                .select(`
                    id,
                    user_id,
                    title,
                    message,
                    type,
                    is_read,
                    created_at,
                    article_url,
                    category,
                    article_data
                `)
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(20);


        if(error){

            console.error(
                "Unable to load notifications:",
                error
            );

            return [];

        }


        return data || [];

    }
    catch(error){

        console.error(
            "Notification loading error:",
            error
        );

        return [];

    }

}


//==================================================
//          UPDATE NOTIFICATION COUNT
//==================================================

async function updateNotificationCount(){

    if(!notificationCount){

        return;

    }


    const user =
        await getNotificationUser();


    if(!user){

        notificationCount.textContent =
            "0";

        notificationCount.classList.add(
            "hidden"
        );

        if(notificationSummary){

            notificationSummary.textContent =
                "Login to receive notifications";

        }

        return;

    }


    try{

        const {
            count,
            error
        } =
            await supabaseClient
                .from("notifications")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "is_read",
                    false
                );


        if(error){

            console.error(
                "Unable to get notification count:",
                error
            );

            return;

        }


        const total =
            count || 0;


        notificationCount.textContent =
            total;


        if(total === 0){

            notificationCount.classList.add(
                "hidden"
            );

            if(notificationSummary){

                notificationSummary.textContent =
                    "You're all caught up";

            }

        }
        else{

            notificationCount.classList.remove(
                "hidden"
            );

            if(notificationSummary){

                notificationSummary.textContent =
                    `${total} unread ${
                        total === 1
                            ? "notification"
                            : "notifications"
                    }`;

            }

        }

    }
    catch(error){

        console.error(
            "Notification count error:",
            error
        );

    }

}


//==================================================
//          FORMAT NOTIFICATION TIME
//==================================================

function getNotificationTime(
    timestamp
){

    if(!timestamp){

        return "";

    }


    const time =
        new Date(
            timestamp
        ).getTime();


    if(
        Number.isNaN(time)
    ){

        return "";

    }


    const seconds =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    time
                ) / 1000
            )
        );


    if(seconds < 60){

        return "Just now";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if(minutes < 60){

        return `${minutes} ${
            minutes === 1
                ? "minute"
                : "minutes"
        } ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if(hours < 24){

        return `${hours} ${
            hours === 1
                ? "hour"
                : "hours"
        } ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    if(days < 30){

        return `${days} ${
            days === 1
                ? "day"
                : "days"
        } ago`;

    }


    const months =
        Math.floor(
            days / 30
        );


    return `${months} ${
        months === 1
            ? "month"
            : "months"
    } ago`;

}


//==================================================
//          GET NOTIFICATION ICON
//==================================================

function getNotificationIcon(
    type
){

    switch(type){

        case "saved_article":

            return "bx-bookmark";


        case "unsaved_article":

            return "bx-bookmark-minus";


        case "news":

            return "bx-news";


        case "breaking_news":

            return "bx-error-circle";


        case "sports":

            return "bx-football";


        case "technology":

            return "bx-chip";


        case "entertainment":

            return "bx-movie-play";


        case "general":

            return "bx-bell";


        default:

            return "bx-bell";

    }

}


//==================================================
//          ESCAPE HTML
//==================================================

function escapeNotificationHTML(
    value
){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


//==================================================
//          DISPLAY NOTIFICATIONS
//==================================================

async function displayNotifications(){

    if(!notificationList){

        return;

    }


    notificationList.innerHTML = `

        <div class="notification-loading">

            <i class="bx bx-loader-alt bx-spin"></i>

            <p>
                Loading notifications...
            </p>

        </div>

    `;


    const notifications =
        await loadNotifications();


    notificationList.innerHTML =
        "";


    if(!notifications.length){

        notificationList.innerHTML = `

            <div class="notification-empty">

                <i class="bx bx-bell-off"></i>

                <h3>
                    No Notifications
                </h3>

                <p>
                    You don't have any notifications yet.
                </p>

            </div>

        `;

        return;

    }


    notifications.forEach(
        notification => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "notification-item";


            if(!notification.is_read){

                item.classList.add(
                    "unread"
                );

            }


            const icon =
                getNotificationIcon(
                    notification.type
                );


            const newsTypes = [

                "news",
                "breaking_news",
                "sports",
                "technology",
                "entertainment"

            ];


            const isNewsNotification =
                newsTypes.includes(
                    notification.type
                );


            let readStoryButton =
                "";


            if(
                isNewsNotification &&
                notification.article_data
            ){

                readStoryButton = `

                    <a
                        href="#"
                        class="notification-read-news"
                        data-notification-id="${
                            escapeNotificationHTML(
                                notification.id
                            )
                        }"
                    >
                        Read Story
                    </a>

                `;

            }


            let savedButton =
                "";


            if(
                notification.type ===
                "saved_article"
            ){

                savedButton = `

                    <a
                        href="#"
                        class="notification-open-saved"
                        data-notification-id="${
                            escapeNotificationHTML(
                                notification.id
                            )
                        }"
                    >
                        View Saved Articles
                    </a>

                `;

            }


            item.innerHTML = `

                <div
                    class="notification-item-icon"
                >

                    <i
                        class="bx ${escapeNotificationHTML(
                            icon
                        )}"
                    ></i>

                </div>


                <div
                    class="notification-item-content"
                >

                    <strong>
                        ${
                            escapeNotificationHTML(
                                notification.title ||
                                "Notification"
                            )
                        }
                    </strong>


                    <p>
                        ${
                            escapeNotificationHTML(
                                notification.message ||
                                ""
                            )
                        }
                    </p>


                    <small
                        class="notification-time"
                    >
                        ${
                            getNotificationTime(
                                notification.created_at
                            )
                        }
                    </small>


                    ${readStoryButton}


                    ${savedButton}

                </div>

            `;


            notificationList.appendChild(
                item
            );

        }
    );


    //==================================================
    //      OPEN NEWS FROM NOTIFICATION
    //==================================================

    notificationList
        .querySelectorAll(
            ".notification-read-news"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async event => {

                        event.preventDefault();


                        const notificationId =
                            Number(
                                button.dataset.notificationId
                            );


                        if(!notificationId){

                            console.error(
                                "Notification ID not found."
                            );

                            return;

                        }


                        const user =
                            await getNotificationUser();


                        if(!user){

                            console.warn(
                                "User is not logged in."
                            );

                            return;

                        }


                        try{

                            const {
                                data,
                                error
                            } =
                                await supabaseClient
                                    .from(
                                        "notifications"
                                    )
                                    .select(
                                        "article_data"
                                    )
                                    .eq(
                                        "id",
                                        notificationId
                                    )
                                    .eq(
                                        "user_id",
                                        user.id
                                    )
                                    .single();


                            if(error){

                                console.error(
                                    "Unable to get article data:",
                                    error
                                );

                                return;

                            }


                            if(
                                !data ||
                                !data.article_data
                            ){

                                console.error(
                                    "Article data is missing."
                                );

                                return;

                            }


                            localStorage.setItem(
                                "selectedArticle",
                                JSON.stringify(
                                    data.article_data
                                )
                            );


                            await markNotificationAsRead(
                                notificationId
                            );


                            window.location.href =
                                "news-details.html";

                        }
                        catch(error){

                            console.error(
                                "Unable to open news:",
                                error
                            );

                        }

                    }
                );

            }
        );


    //==================================================
    //      OPEN SAVED ARTICLES
    //==================================================

    notificationList
        .querySelectorAll(
            ".notification-open-saved"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async event => {

                        event.preventDefault();


                        const notificationId =
                            Number(
                                button.dataset.notificationId
                            );


                        if(notificationId){

                            await markNotificationAsRead(
                                notificationId
                            );

                        }


                        window.location.href =
                            "save-articles.html";

                    }
                );

            }
        );


    updateNotificationCount();

}


//==================================================
//          MARK ONE AS READ
//==================================================

async function markNotificationAsRead(
    notificationId
){

    const user =
        await getNotificationUser();


    if(
        !user ||
        !notificationId
    ){

        return false;

    }


    try{

        const {
            error
        } =
            await supabaseClient
                .from("notifications")
                .update({

                    is_read:
                        true

                })
                .eq(
                    "id",
                    notificationId
                )
                .eq(
                    "user_id",
                    user.id
                );


        if(error){

            console.error(
                "Unable to mark notification as read:",
                error
            );

            return false;

        }


        updateNotificationCount();

        return true;

    }
    catch(error){

        console.error(
            "Mark notification read error:",
            error
        );

        return false;

    }

}


//==================================================
//          MARK ALL AS READ
//==================================================

async function markAllNotificationsAsRead(){

    const user =
        await getNotificationUser();


    if(!user){

        return;

    }


    try{

        const {
            error
        } =
            await supabaseClient
                .from("notifications")
                .update({

                    is_read:
                        true

                })
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "is_read",
                    false
                );


        if(error){

            console.error(
                "Unable to mark all notifications as read:",
                error
            );

            return;

        }


        await displayNotifications();

        updateNotificationCount();

    }
    catch(error){

        console.error(
            "Mark all notifications error:",
            error
        );

    }

}


//==================================================
//          SERVICE WORKER SUPPORT
//==================================================

function isPushSupported(){

    return (

        "serviceWorker" in navigator &&

        "PushManager" in window &&

        "Notification" in window

    );

}


//==================================================
//          CONVERT VAPID KEY
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
//          REGISTER SERVICE WORKER
//==================================================

async function registerNotificationServiceWorker(){

    if(
        !("serviceWorker" in navigator)
    ){

        throw new Error(
            "Service workers are not supported by this browser."
        );

    }


    try{

        const registration =
            await navigator
                .serviceWorker
                .register(
                    "/service-worker.js"
                );


        console.log(
            "✅ TrendSphere service worker registered:",
            registration.scope
        );


        return registration;

    }
    catch(error){

        console.error(
            "❌ Service worker registration failed:",
            error
        );

        throw error;

    }

}


//==================================================
//          SAVE PUSH SUBSCRIPTION
//==================================================

async function savePushSubscription(
    subscription
){

    const user =
        await getNotificationUser();


    if(!user){

        throw new Error(
            "You must be logged in before enabling notifications."
        );

    }


    const subscriptionJSON =
        subscription.toJSON();


    const endpoint =
        subscriptionJSON.endpoint;


    const p256dh =
        subscriptionJSON.keys?.p256dh;


    const auth =
        subscriptionJSON.keys?.auth;


    if(
        !endpoint ||
        !p256dh ||
        !auth
    ){

        throw new Error(
            "Invalid push subscription."
        );

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("push_subscriptions")
            .upsert(

                {

                    user_id:
                        user.id,

                    endpoint:
                        endpoint,

                    p256dh:
                        p256dh,

                    auth:
                        auth

                },

                {

                    onConflict:
                        "user_id,endpoint"

                }

            )
            .select()
            .single();


    if(error){

        console.error(
            "Unable to save push subscription:",
            error
        );

        throw error;

    }


    console.log(
        "✅ Push subscription saved:",
        data
    );


    return data;

}


//==================================================
//          ENABLE PUSH NOTIFICATIONS
//==================================================

async function enablePushNotifications(){

    if(!isPushSupported()){

        alert(
            "Push notifications are not supported by this browser."
        );

        return;

    }


    const user =
        await getNotificationUser();


    if(!user){

        alert(
            "Please log in before enabling notifications."
        );

        return;

    }


    if(
        VAPID_PUBLIC_KEY ===
        "YOUR_VAPID_PUBLIC_KEY"
    ){

        alert(
            "VAPID public key has not been configured yet."
        );

        console.error(
            "Replace YOUR_VAPID_PUBLIC_KEY in Notification.js with the VAPID_PUBLIC_KEY from your .env file."
        );

        return;

    }


    try{

        if(enablePushButton){

            enablePushButton.disabled =
                true;

            enablePushButton.innerHTML = `

                <i class="bx bx-loader-alt bx-spin"></i>

                Enabling...

            `;

        }


        //==================================================
        //      REQUEST BROWSER PERMISSION
        //==================================================

        const permission =
            await Notification.requestPermission();


        if(permission !== "granted"){

            alert(
                "Notification permission was not granted."
            );

            return;

        }


        //==================================================
        //      REGISTER SERVICE WORKER
        //==================================================

        const registration =
            await registerNotificationServiceWorker();


        //==================================================
        //      GET EXISTING SUBSCRIPTION
        //==================================================

        let subscription =
            await registration
                .pushManager
                .getSubscription();


        //==================================================
        //      CREATE NEW SUBSCRIPTION
        //==================================================

        if(!subscription){

            subscription =
                await registration
                    .pushManager
                    .subscribe({

                        userVisibleOnly:
                            true,

                        applicationServerKey:
                            urlBase64ToUint8Array(
                                VAPID_PUBLIC_KEY
                            )

                    });

        }


        //==================================================
        //      SAVE TO SUPABASE
        //==================================================

        await savePushSubscription(
            subscription
        );


        if(enablePushButton){

            enablePushButton.innerHTML = `

                <i class="bx bx-check"></i>

                Notifications Enabled

            `;

            enablePushButton.classList.add(
                "enabled"
            );

        }


        console.log(
            "✅ Browser push notifications enabled successfully."
        );


        alert(
            "Notifications have been enabled successfully!"
        );

    }
    catch(error){

        console.error(
            "❌ Unable to enable push notifications:",
            error
        );


        alert(
            error?.message ||
            "Unable to enable notifications."
        );

    }
    finally{

        if(enablePushButton){

            enablePushButton.disabled =
                false;

        }

    }

}


//==================================================
//          CHECK PUSH STATUS
//==================================================

async function checkPushNotificationStatus(){

    if(
        !enablePushButton ||
        !isPushSupported()
    ){

        return;

    }


    try{

        const user =
            await getNotificationUser();


        if(!user){

            enablePushButton.innerHTML = `

                <i class="bx bx-log-in"></i>

                Login to Enable Notifications

            `;

            return;

        }


        const registration =
            await navigator
                .serviceWorker
                .getRegistration(
                    "/service-worker.js"
                );


        if(!registration){

            return;

        }


        const subscription =
            await registration
                .pushManager
                .getSubscription();


        if(subscription){

            enablePushButton.innerHTML = `

                <i class="bx bx-check"></i>

                Notifications Enabled

            `;

            enablePushButton.classList.add(
                "enabled"
            );

        }

    }
    catch(error){

        console.warn(
            "Unable to check push notification status:",
            error
        );

    }

}


//==================================================
//          OPEN NOTIFICATION PANEL
//==================================================

if(notificationButton){

    notificationButton.addEventListener(
        "click",
        async event => {

            event.stopPropagation();


            const user =
                await getNotificationUser();


            if(!user){

                if(notificationPanel){

                    notificationPanel.classList.toggle(
                        "show"
                    );

                }

                await displayNotifications();

                return;

            }


            await displayNotifications();


            notificationPanel?.classList.toggle(
                "show"
            );

        }
    );

}


//==================================================
//              CLOSE BUTTON
//==================================================

if(closeNotification){

    closeNotification.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            notificationPanel?.classList.remove(
                "show"
            );

        }
    );

}


//==================================================
//              OUTSIDE CLICK
//==================================================

document.addEventListener(
    "click",
    event => {

        if(

            notificationPanel &&

            notificationPanel.classList.contains(
                "show"
            ) &&

            notificationButton &&

            !notificationPanel.contains(
                event.target
            ) &&

            !notificationButton.contains(
                event.target
            )

        ){

            notificationPanel.classList.remove(
                "show"
            );

        }

    }
);


//==================================================
//              ESCAPE KEY
//==================================================

document.addEventListener(
    "keydown",
    event => {

        if(

            event.key === "Escape" &&

            notificationPanel &&

            notificationPanel.classList.contains(
                "show"
            )

        ){

            notificationPanel.classList.remove(
                "show"
            );

        }

    }
);


//==================================================
//              ENABLE PUSH BUTTON
//==================================================

if(enablePushButton){

    enablePushButton.addEventListener(
        "click",
        enablePushNotifications
    );

}


//==================================================
//              WINDOW FOCUS
//==================================================

window.addEventListener(
    "focus",
    () => {

        updateNotificationCount();

        checkPushNotificationStatus();

    }
);


//==================================================
//              PAGE VISIBILITY
//==================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if(
            document.visibilityState ===
            "visible"
        ){

            updateNotificationCount();

            checkPushNotificationStatus();

        }

    }
);


//==================================================
//              AUTH STATE
//==================================================

if(
    isNotificationSupabaseReady()
){

    supabaseClient.auth.onAuthStateChange(
        (
            event,
            session
        ) => {

            setTimeout(
                () => {

                    if(!session){

                        if(notificationCount){

                            notificationCount.textContent =
                                "0";

                            notificationCount.classList.add(
                                "hidden"
                            );

                        }


                        if(notificationSummary){

                            notificationSummary.textContent =
                                "Login to receive notifications";

                        }


                        if(enablePushButton){

                            enablePushButton.innerHTML = `

                                <i class="bx bx-log-in"></i>

                                Login to Enable Notifications

                            `;

                            enablePushButton.classList.remove(
                                "enabled"
                            );

                        }


                        if(notificationList){

                            notificationList.innerHTML = `

                                <div class="notification-empty">

                                    <i class="bx bx-bell-off"></i>

                                    <h3>
                                        No Notifications
                                    </h3>

                                    <p>
                                        Please log in to view your notifications.
                                    </p>

                                </div>

                            `;

                        }


                        return;

                    }


                    updateNotificationCount();

                    checkPushNotificationStatus();

                },
                0
            );

        }
    );

}


//==================================================
//          INITIAL NOTIFICATION COUNT
//==================================================

updateNotificationCount();


//==================================================
//          INITIAL PUSH STATUS
//==================================================

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            checkPushNotificationStatus();

        }
    );

}
else{

    checkPushNotificationStatus();

}


//==================================================
//          MARK ALL NOTIFICATIONS AS READ
//==================================================

if(clearNotifications){

    clearNotifications.addEventListener(
        "click",
        async () => {

            await markAllNotificationsAsRead();

        }
    );

}


//==================================================
//          TEST NOTIFICATION SYSTEM
//==================================================

async function testNotificationSystem(){

    const user =
        await getNotificationUser();


    if(!user){

        console.log(
            "Notification system waiting for user login."
        );

        return;

    }


    console.log(
        "✅ Notification system connected for user:",
        user.id
    );


    const notifications =
        await loadNotifications();


    console.log(
        "Total notifications:",
        notifications.length
    );

}


//==================================================
//          DEVELOPMENT TEST
//==================================================

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        testNotificationSystem
    );

}
else{

    testNotificationSystem();

}

