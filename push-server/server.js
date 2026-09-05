
//==================================================
//              TRENDSPHERE MEDIA
//              PUSH NOTIFICATION SERVER
//==================================================

import express from "express";
import cors from "cors";
import webpush from "web-push";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";


//==================================================
//              LOAD ENVIRONMENT
//==================================================

dotenv.config();


//==================================================
//              SERVER CONFIGURATION
//==================================================

const app = express();

const PORT =
    process.env.PORT || 3000;


//==================================================
//              MIDDLEWARE
//==================================================

app.use(
    cors()
);

app.use(
    express.json({
        limit: "1mb"
    })
);


//==================================================
//              SUPABASE CONFIGURATION
//==================================================

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_SECRET_KEY =
    process.env.SUPABASE_SECRET_KEY;


if(
    !SUPABASE_URL ||
    !SUPABASE_SECRET_KEY
){

    console.error(
        "❌ Supabase configuration is missing from .env"
    );

    process.exit(1);

}


const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_SECRET_KEY
    );


console.log(
    "✅ TrendSphere Supabase connection configured successfully."
);


//==================================================
//              VAPID CONFIGURATION
//==================================================

const VAPID_PUBLIC_KEY =
    process.env.VAPID_PUBLIC_KEY;

const VAPID_PRIVATE_KEY =
    process.env.VAPID_PRIVATE_KEY;

const VAPID_SUBJECT =
    process.env.VAPID_SUBJECT;


if(
    !VAPID_PUBLIC_KEY ||
    !VAPID_PRIVATE_KEY ||
    !VAPID_SUBJECT
){

    console.error(
        "❌ VAPID configuration is missing from .env"
    );

    process.exit(1);

}






//==================================================
//              NEWS API CONFIGURATION
//==================================================

const NEWS_API_KEY =
    process.env.NEWS_API_KEY;


if(!NEWS_API_KEY){

    console.error(
        "❌ NEWS_API_KEY is missing from .env"
    );

    process.exit(1);

}


const NEWS_API_URL =
    "https://newsapi.org/v2/top-headlines?country=us&pageSize=20";


console.log(
    "✅ TrendSphere NewsAPI configuration loaded successfully."
);








//==================================================
//              CONFIGURE WEB PUSH
//==================================================

try{

    webpush.setVapidDetails(

        VAPID_SUBJECT,

        VAPID_PUBLIC_KEY,

        VAPID_PRIVATE_KEY

    );


    console.log(
        "✅ TrendSphere VAPID configuration loaded successfully."
    );

}
catch(error){

    console.error(
        "❌ Unable to configure VAPID:",
        error
    );

    process.exit(1);

}









//==================================================
//              NEWS API ENDPOINT
//==================================================

app.get(
    "/api/news",
    async (req, res) => {

        try{

            //==================================================
            //          GET REQUEST PARAMETERS
            //==================================================

            const {

                country = "us",

                category,

                page = 1,

                pageSize = 20,

                q

            } = req.query;


            //==================================================
            //          BUILD NEWS API URL
            //==================================================

            const newsApiUrl =
                new URL(
                    "https://newsapi.org/v2/top-headlines"
                );


            //==================================================
            //          ADD COUNTRY
            //==================================================

            newsApiUrl.searchParams.set(
                "country",
                country
            );


            //==================================================
            //          ADD CATEGORY
            //==================================================

            if(category){

                newsApiUrl.searchParams.set(
                    "category",
                    category
                );

            }


            //==================================================
            //          ADD SEARCH QUERY
            //==================================================

            if(q){

                newsApiUrl.searchParams.set(
                    "q",
                    q
                );

            }


            //==================================================
            //          ADD PAGINATION
            //==================================================

            newsApiUrl.searchParams.set(
                "page",
                page
            );


            newsApiUrl.searchParams.set(
                "pageSize",
                pageSize
            );


            //==================================================
            //          REQUEST NEWSAPI
            //==================================================

            console.log(
                "📰 Requesting news from NewsAPI..."
            );


            const response =
                await fetch(
                    newsApiUrl,
                    {

                        headers: {

                            "X-Api-Key":
                                NEWS_API_KEY

                        }

                    }
                );


            //==================================================
            //          READ RESPONSE
            //==================================================

            const data =
                await response.json();


            //==================================================
            //          HANDLE NEWSAPI ERROR
            //==================================================

            if(!response.ok){

                console.error(
                    "❌ NewsAPI request failed:",
                    data
                );


                return res.status(
                    response.status
                ).json({

                    success:
                        false,

                    ...data

                });

            }


            //==================================================
            //          SUCCESS
            //==================================================

            console.log(
                "✅ NewsAPI request successful."
            );


            return res.json(
                data
            );

        }
        catch(error){

            console.error(
                "❌ NewsAPI server error:",
                error
            );


            return res.status(
                500
            ).json({

                success:
                    false,

                message:
                    "Unable to retrieve news from NewsAPI.",

                error:
                    error.message

            });

        }

    }
);








//==================================================
//              HEALTH CHECK
//==================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success:
                true,

            message:
                "TrendSphere Push Server is running.",

            service:
                "TrendSphere Media Push Notifications"

        });

    }
);


//==================================================
//          TEST SUPABASE CONNECTION
//==================================================

app.get(
    "/test-supabase",
    async (req, res) => {

        try{

            const {
                data,
                error
            } =
                await supabase
                    .from("push_subscriptions")
                    .select("id")
                    .limit(1);


            if(error){

                console.error(
                    "❌ Supabase test failed:",
                    error
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Supabase connection failed.",

                    error:
                        error.message

                });

            }


            console.log(
                "✅ Supabase connection test successful."
            );


            return res.json({

                success:
                    true,

                message:
                    "Supabase connection is working.",

                subscriptionCount:
                    data?.length || 0

            });

        }
        catch(error){

            console.error(
                "❌ Supabase test error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to test Supabase.",

                error:
                    error.message

            });

        }

    }
);


//==================================================
//          SEND PUSH TO ONE SUBSCRIPTION
//==================================================

async function sendPushNotification(
    subscription,
    notificationData
){

    try{

        await webpush.sendNotification(

            subscription,

            JSON.stringify(
                notificationData
            )

        );


        return {

            success:
                true,

            error:
                null

        };

    }
    catch(error){

        console.error(
            "❌ Push delivery failed:",
            error
        );


        return {

            success:
                false,

            error:
                error

        };

    }

}


//==================================================
//          SEND TEST NOTIFICATION
//==================================================

app.post(
    "/send-test-notification",
    async (req, res) => {

        try{

            //==================================================
            //          GET ALL SUBSCRIPTIONS
            //==================================================

            const {
                data: subscriptions,
                error
            } =
                await supabase
                    .from("push_subscriptions")
                    .select(
                        "id,user_id,endpoint,p256dh,auth"
                    );


            if(error){

                console.error(
                    "❌ Unable to get push subscriptions:",
                    error
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Unable to get push subscriptions.",

                    error:
                        error.message

                });

            }


            //==================================================
            //          CHECK SUBSCRIPTIONS
            //==================================================

            if(
                !subscriptions ||
                subscriptions.length === 0
            ){

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "No push subscriptions found."

                });

            }


            //==================================================
            //          NOTIFICATION DATA
            //==================================================

            const notificationData = {

                title:
                    "TrendSphere Media",

                body:
                    "A new story has been published on TrendSphere Media.",

                message:
                    "A new story has been published on TrendSphere Media.",

                icon:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                badge:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                url:
                    "/index.html"

            };


            let sent =
                0;

            let failed =
                0;

            let removed =
                0;


            //==================================================
            //          SEND TO EVERY SUBSCRIBER
            //==================================================

            for(
                const subscriptionRow
                of subscriptions
            ){

                console.log(
                    "Supabase endpoint ending:",
                    subscriptionRow.endpoint.slice(-20)
                );

                //==================================================
                //      VALIDATE SUBSCRIPTION
                //==================================================

                if(
                    !subscriptionRow.endpoint ||
                    !subscriptionRow.p256dh ||
                    !subscriptionRow.auth
                ){

                    console.warn(
                        "⚠️ Invalid push subscription:",
                        subscriptionRow.id
                    );

                    failed++;

                    continue;

                }


                const pushSubscription = {

                    endpoint:
                        subscriptionRow.endpoint,

                    keys: {

                        p256dh:
                            subscriptionRow.p256dh,

                        auth:
                            subscriptionRow.auth

                    }

                };


                const result =
                    await sendPushNotification(
                        pushSubscription,
                        notificationData
                    );


                if(result.success){

                    sent++;


                    console.log(
                        "✅ Push notification sent to:",
                        subscriptionRow.user_id
                    );

                }
                else{

                    failed++;


                    //==================================================
                    //      REMOVE EXPIRED SUBSCRIPTION
                    //==================================================

                    const statusCode =
                        result.error?.statusCode;


                    if(
                        statusCode === 404 ||
                        statusCode === 410
                    ){

                        console.log(
                            "🗑️ Removing expired push subscription:",
                            subscriptionRow.id
                        );


                        const {
                            error:
                                deleteError
                        } =
                            await supabase
                                .from(
                                    "push_subscriptions"
                                )
                                .delete()
                                .eq(
                                    "id",
                                    subscriptionRow.id
                                );


                        if(deleteError){

                            console.error(
                                "Unable to remove expired subscription:",
                                deleteError
                            );

                        }
                        else{

                            removed++;

                        }

                    }

                }

            }


            //==================================================
            //          RESPONSE
            //==================================================

            return res.json({

                success:
                    true,

                message:
                    "Push notification process completed.",

                totalSubscriptions:
                    subscriptions.length,

                sent:
                    sent,

                failed:
                    failed,

                removedExpired:
                    removed

            });

        }
        catch(error){

            console.error(
                "❌ Send test notification error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to send push notifications.",

                error:
                    error.message

            });

        }

    }
);






//==================================================
//          AUTOMATIC NEWS CHECKER
//==================================================


//==================================================
//          NEWS PUSH HISTORY
//==================================================

// Check whether an article has already been
// successfully processed and sent.

async function hasNewsBeenSent(articleUrl){

    if(!articleUrl){

        return false;
    }


    try{

        const {
            data,
            error
        } =
            await supabase
                .from("news_push_history")
                .select("id")
                .eq(
                    "article_url",
                    articleUrl
                )
                .limit(1);


        if(error){

            console.error(
                "❌ Unable to check news push history:",
                error
            );

            // IMPORTANT:
            // If Supabase history cannot be checked,
            // do NOT send the notification.
            return true;
        }


        return (
            Array.isArray(data) &&
            data.length > 0
        );

    }
    catch(error){

        console.error(
            "❌ News push history check error:",
            error
        );

        // Fail safe:
        // Do not send if history cannot be verified.
        return true;
    }

}


//==================================================
//          SAVE SENT NEWS ARTICLE
//==================================================

async function saveNewsPushHistory(
    article,
    category = "general"
){

    if(
        !article ||
        !article.url
    ){

        return false;
    }


    try{

        const {
            error
        } =
            await supabase
                .from("news_push_history")
                .upsert(
                    {

                        article_url:
                            article.url,

                        article_title:
                            article.title ||
                            null,

                        category:
                            category ||
                            "general"

                    },
                    {

                        onConflict:
                            "article_url"

                    }
                );


        if(error){

            console.error(
                "❌ Unable to save news push history:",
                error
            );

            return false;
        }


        console.log(
            "💾 News article saved to push history:",
            article.title
        );


        return true;

    }
    catch(error){

        console.error(
            "❌ Save news push history error:",
            error
        );

        return false;
    }

}


//==================================================
//          CHECK NEWS FROM NEWSAPI
//==================================================

async function checkForNewNews(){

    try{

        console.log(
            "🔎 Checking NewsAPI for new stories..."
        );


        //==================================================
        //          REQUEST NEWS
        //==================================================

        const response =
            await fetch(
                `${NEWS_API_URL}&apiKey=${NEWS_API_KEY}`
            );


        if(!response.ok){

            console.error(
                "❌ NewsAPI request failed:",
                response.status
            );

            return;

        }


        const data =
            await response.json();


        //==================================================
        //          CHECK NEWSAPI RESPONSE
        //==================================================

        if(
            data.status !== "ok"
        ){

            console.error(
                "❌ NewsAPI error:",
                data.message
            );

            return;

        }


        if(
            !data.articles ||
            data.articles.length === 0
        ){

            console.log(
                "ℹ️ No news articles returned."
            );

            return;

        }


        console.log(
            `📰 NewsAPI returned ${data.articles.length} article(s).`
        );


        //==================================================
        //          CHECK ARTICLES
        //==================================================

        for(
            const article
            of data.articles
        ){

            if(
                !article ||
                !article.url ||
                !article.title
            ){

                continue;

            }


            
            //==================================================
//      PREVENT DUPLICATE PUSH
//==================================================

const alreadySent =
    await hasNewsBeenSent(
        article.url
    );


if(alreadySent){

    console.log(
        "⏭️ Article already sent. Skipping:",
        article.title
    );

    continue;

}







            //==================================================
            //      PREPARE NOTIFICATION
            //==================================================

            const notificationData = {

                title:
                    "New Story",

                message:
                    article.title,

                url:
                    "/news-details.html",

                category:
                    "general",

                article:
                    article

            };


            console.log(
                "🆕 New article detected:",
                article.title
            );


            //==================================================
            //      SEND NEWS PUSH
            //==================================================

            try{

                const pushResponse =
                    await fetch(
                        "http://localhost:3000/send-news-notification",
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    notificationData
                                )

                        }
                    );


                const pushResult =
                    await pushResponse.json();


                if(
    pushResponse.ok &&
    pushResult.success &&
    pushResult.sent > 0
){

    //==================================================
    //      SAVE ARTICLE TO SUPABASE HISTORY
    //==================================================

    const historySaved =
        await saveNewsPushHistory(
            article,
            "general"
        );


    if(historySaved){

        console.log(
            "✅ Automatic news push completed:",
            article.title
        );

    }
    else{

        console.warn(
            "⚠️ Push was sent, but article history could not be saved:",
            article.title
        );

    }

}
                else{

                    console.log(
                        "⚠️ News push was not delivered:",
                        pushResult
                    );

                }

            }
            catch(pushError){

                console.error(
                    "❌ Unable to send automatic news push:",
                    pushError
                );

            }


            //==================================================
            //      ONLY PROCESS ONE NEW STORY PER CHECK
            //==================================================

            break;

        }

    }
    catch(error){

        console.error(
            "❌ Automatic news check error:",
            error
        );

    }

}


//==================================================
//          START AUTOMATIC NEWS CHECKER
//==================================================

setInterval(
    checkForNewNews,
    5 * 60 * 1000
);


//==================================================
//          INITIAL NEWS CHECK
//==================================================

setTimeout(
    checkForNewNews,
    10000
);










//==================================================
//              START SERVER
//==================================================

app.listen(
    PORT,
    () => {

        console.log(
            "=========================================="
        );

        console.log(
            "      TrendSphere Push Server"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            "✅ Supabase push subscriptions enabled."
        );

        console.log(
            "✅ Web Push/VAPID enabled."
        );

        console.log(
            "=========================================="
        );

    }
);









//==================================================
//          SEND NEWS PUSH NOTIFICATION
//==================================================

app.post(
    "/send-news-notification",
    async (req, res) => {

        try{

            //==================================================
            //          GET NEWS DATA FROM WEBSITE
            //==================================================

            const {
                title,
                message,
                url,
                category,
                article
            } = req.body;


            //==================================================
            //          VALIDATE NEWS DATA
            //==================================================

            if(
                !title ||
                !message ||
                !url
            ){

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "title, message and url are required."

                });

            }

             console.log(
                "📰 Preparing news notification:",
                title
            );

            //==================================================
            //          GET ALL SUBSCRIPTIONS
            //==================================================

            const {
                data: subscriptions,
                error
            } =
                await supabase
                    .from("push_subscriptions")
                    .select(
                        "id,user_id,endpoint,p256dh,auth"
                    );


            if(error){

                console.error(
                    "❌ Unable to get push subscriptions:",
                    error
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Unable to get push subscriptions.",

                    error:
                        error.message

                });

            }


            //==================================================
            //          CHECK SUBSCRIPTIONS
            //==================================================

            if(
                !subscriptions ||
                subscriptions.length === 0
            ){

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "No push subscriptions found.",

                        totalSubscriptions:
                            0,

                        sent:
                            0,

                        failed:
                            0
                });
            }

            //==================================================
            //          PREPARE PUSH DATA
            //==================================================

            const notificationData = {

                title:
                    title,

                body:
                    message,

                message:
                    message,

                icon:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                badge:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                url:
                    url,

                category:
                    category ||
                    "general",

                article:
                    article

            };


            console.log(
                "📢 Sending news notification to:",
                subscriptions.length,
                "subscriber(s)"
            );


            let sent =
                0;

            let failed =
                0;

            let removed =
                0;

            

            //==================================================
            //          SEND TO ALL SUBSCRIBERS
            //==================================================

            for(
                const subscriptionRow
                of subscriptions
            ){

                //==================================================
                //      VALIDATE SUBSCRIPTION
                //==================================================

                if(
                    !subscriptionRow.endpoint ||
                    !subscriptionRow.p256dh ||
                    !subscriptionRow.auth
                ){

                    console.warn(
                        "⚠️ Invalid subscription:",
                        subscriptionRow.id
                    );

                    failed++;

                    continue;

                }


            //==================================================
                //      CREATE PUSH SUBSCRIPTION
                //==================================================

                const pushSubscription = {

                    endpoint:
                        subscriptionRow.endpoint,

                    keys: {

                        p256dh:
                            subscriptionRow.p256dh,

                        auth:
                            subscriptionRow.auth

                    }

                };


             //==================================================
                //      SEND PUSH
                //==================================================

                const result =
                    await sendPushNotification(
                        pushSubscription,
                        notificationData
                    );


                //==================================================
                //      SUCCESS
                //==================================================

                if(result.success){

                    sent++;


                    console.log(
                        "✅ News push sent to:",
                        subscriptionRow.user_id
                    );

                }

            
             //==================================================
                //      FAILED
                //==================================================

                else{

                    failed++;


                    const statusCode =
                        result.error?.statusCode;


                    //==================================================
                    //      REMOVE EXPIRED SUBSCRIPTION
                    //==================================================

                    if(
                        statusCode === 404 ||
                        statusCode === 410
                    ){

                        console.log(
                            "🗑️ Removing expired subscription:",
                            subscriptionRow.id
                        );


                        const {

                            error:
                                deleteError

                        } =
                            await supabase
                                .from(
                                    "push_subscriptions"
                                )
                                .delete()
                                .eq(
                                    "id",
                                    subscriptionRow.id
                                );


                        if(deleteError){

                            console.error(
                                "❌ Unable to remove expired subscription:",
                                deleteError
                            );

                        }
                        else{

                            removed++;

                        }

                    }

                }

            }




            //==================================================
            //          FINAL RESPONSE
            //==================================================

            console.log(
                "=========================================="
            );

            console.log(
                "📰 News push notification process completed."
            );

            console.log(
                `📢 Total subscribers: ${subscriptions.length}`
            );

            console.log(
                `✅ Sent: ${sent}`
            );

            console.log(
                `❌ Failed: ${failed}`
            );

            console.log(
                `🗑️ Removed expired: ${removed}`
            );

            console.log(
                "=========================================="
            );


            return res.json({

                success:
                    true,

                message:
                    "News push notification process completed.",

                totalSubscriptions:
                    subscriptions.length,

                sent:
                    sent,

                failed:
                    failed,

                removedExpired:
                    removed

            });

            }
        catch(error){

            console.error(
                "❌ News push notification error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to send news push notification.",

                error:
                    error.message

            });

        }

    }
);


            