
//==================================================
//              TRENDSPHERE MEDIA
//              SERVICE WORKER
//==================================================


//==================================================
//              INSTALL
//==================================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "TrendSphere Service Worker installed."
        );

        self.skipWaiting();

    }
);


//==================================================
//              ACTIVATE
//==================================================

self.addEventListener(
    "activate",
    event => {

        console.log(
            "TrendSphere Service Worker activated."
        );

        event.waitUntil(
            self.clients.claim()
        );

    }
);


//==================================================
//              PUSH NOTIFICATION
//==================================================

self.addEventListener(
    "push",
    event => {

        //==================================================
        //          DEFAULT NOTIFICATION
        //==================================================

        let notificationData = {

            title:
                "TrendSphere Media",

            body:
                "A new story has been published...",

            icon:
                "assets/Images/icons/TrendSphere Media Logo ICON.jpg",

            badge:
                "assets/Images/icons/TrendSphere Media Logo ICON.jpg",

            url:
                "/index.html"

        };


        //==================================================
        //          READ PUSH DATA
        //==================================================

        if(event.data){

            try{

                const data =
                    event.data.json();


                console.log(
                    "TrendSphere push data:",
                    data
                );


                notificationData = {

                    ...notificationData,

                    ...data

                };


                //==================================================
                //      SUPPORT "MESSAGE" FROM SERVER
                //==================================================

                if(
                    data.message &&
                    !data.body
                ){

                    notificationData.body =
                        data.message;

                }


                //==================================================
                //      SUPPORT NESTED DATA
                //==================================================

                if(
                    data.data &&
                    data.data.url
                ){

                    notificationData.url =
                        data.data.url;

                }


            }
            catch(error){

                console.error(
                    "Unable to read push data:",
                    error
                );

            }

        }


        //==================================================
        //          NOTIFICATION OPTIONS
        //==================================================

        const notificationOptions = {

            body:
                notificationData.body ||
                notificationData.message ||
                "A new story has been published...",

            icon:
                notificationData.icon ||
                "/assets/Images/logo.png",

            badge:
                notificationData.badge ||
                "/assets/Images/logo.png",

            data: {

                url:
                    notificationData.url ||
                    "/index.html"

            },

            requireInteraction:
                false,

            tag:
                "trendsphere-notification"

        };


        //==================================================
        //          SHOW NOTIFICATION
        //==================================================

        event.waitUntil(

            self.registration.showNotification(

                notificationData.title ||
                "TrendSphere Media",

                notificationOptions

            )

        );

    }
);


//==================================================
//              NOTIFICATION CLICK
//==================================================

self.addEventListener(
    "notificationclick",
    event => {

        console.log(
            "TrendSphere notification clicked."
        );


        //==================================================
        //          CLOSE NOTIFICATION
        //==================================================

        event.notification.close();


        //==================================================
        //          GET TARGET URL
        //==================================================

        const notificationUrl =
            event.notification?.data?.url ||
            "/index.html";


        //==================================================
        //          CONVERT TO ABSOLUTE URL
        //==================================================

        const targetUrl =
            new URL(
                notificationUrl,
                self.location.origin
            ).href;


        //==================================================
        //          OPEN OR FOCUS WEBSITE
        //==================================================

        event.waitUntil(

            clients.matchAll({

                type:
                    "window",

                includeUncontrolled:
                    true

            })

            .then(
                clientList => {

                    //==================================================
                    //      FIND EXISTING TRENDSPHERE TAB
                    //==================================================

                    for(
                        const client
                        of clientList
                    ){

                        if(
                            client.url.startsWith(
                                self.location.origin
                            )
                        ){

                            if(
                                "navigate" in client
                            ){

                                client.navigate(
                                    targetUrl
                                );

                            }


                            if(
                                "focus" in client
                            ){

                                return client.focus();

                            }

                        }

                    }


                    //==================================================
                    //          OPEN NEW TAB
                    //==================================================

                    if(
                        clients.openWindow
                    ){

                        return clients.openWindow(
                            targetUrl
                        );

                    }

                }
            )

        );

    }
);

