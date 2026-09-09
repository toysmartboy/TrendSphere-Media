//==================================================
//==================================================
//              TrendSphere Media
//              PUSH NOTIFICATION SERVER
//              Supabase + Web Push + RSS
//==================================================
//==================================================


//==================================================
//              IMPORT MODULES
//==================================================

import express from "express";
import cors from "cors";
import webpush from "web-push";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";


//==================================================
//              LOAD ENVIRONMENT VARIABLES
//==================================================

dotenv.config();


//==================================================
//              APP CONFIGURATION
//==================================================

const app = express();

const PORT =
    process.env.PORT || 3000;


//==================================================
//              RSS SERVER
//==================================================

// TrendSphere RSS Server
//
// The Push Server receives news from the RSS Server
// instead of contacting NewsAPI directly.

const RSS_SERVER_URL =
    "https://trendsphere-rss.onrender.com";


// Automatic news checking category.

const RSS_NEWS_CATEGORY =
    "general";


//==================================================
//              MIDDLEWARE
//==================================================

app.use(
    cors()
);

app.use(
    express.json()
);


//==================================================
//              SUPABASE CONFIGURATION
//==================================================

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY;


//==================================================
//              SUPABASE VALIDATION
//==================================================

if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY
) {

    console.error(
        "❌ Missing Supabase environment variables."
    );

    console.error(
        "Required:"
    );

    console.error(
        "SUPABASE_URL"
    );

    console.error(
        "SUPABASE_SERVICE_ROLE_KEY"
    );

    process.exit(1);
}


//==================================================
//              SUPABASE CLIENT
//==================================================

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    );


console.log(
    "TrendSphere Supabase connection configured successfully."
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


//==================================================
//              VAPID VALIDATION
//==================================================

if (
    !VAPID_PUBLIC_KEY ||
    !VAPID_PRIVATE_KEY ||
    !VAPID_SUBJECT
) {

    console.error(
        "❌ Missing VAPID environment variables."
    );

    console.error(
        "Required:"
    );

    console.error(
        "VAPID_PUBLIC_KEY"
    );

    console.error(
        "VAPID_PRIVATE_KEY"
    );

    console.error(
        "VAPID_SUBJECT"
    );

    process.exit(1);
}


//==================================================
//              CONFIGURE WEB PUSH
//==================================================

webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);


console.log(
    "✅ TrendSphere VAPID configuration loaded successfully."
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
                "TrendSphere Push Server is running",

            rssServer:
                RSS_SERVER_URL,

            rssCategory:
                RSS_NEWS_CATEGORY

        });

    }
);


//==================================================
//              RSS FETCH HELPER
//==================================================

async function fetchRSSNews(
    category = RSS_NEWS_CATEGORY
) {

    const rssURL =
        `${RSS_SERVER_URL}/rss/${encodeURIComponent(category)}`;


    console.log(
        `🔎 Fetching RSS news from: ${rssURL}`
    );


    //==================================================
    //              REQUEST TIMEOUT
    //==================================================

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            120000
        );


    try {

        const response =
            await fetch(
                rssURL,
                {
                    method:
                        "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    signal:
                        controller.signal
                }
            );


        clearTimeout(timeout);


        if (!response.ok) {

            throw new Error(
                `RSS Server returned HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            !data.success
        ) {

            throw new Error(
                "RSS Server returned an unsuccessful response"
            );

        }


        if (
            !Array.isArray(
                data.articles
            )
        ) {

            throw new Error(
                "RSS Server response does not contain an articles array"
            );

        }


        console.log(
            `📰 RSS Server returned ${data.articles.length} article(s).`
        );


        return data;


    }
    catch (error) {

        clearTimeout(timeout);


        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "RSS Server request timed out"
            );

        }


        throw error;

    }

}


//==================================================
//              API NEWS ROUTE
//==================================================
//
// This route is kept for compatibility.
//
// The Push Server no longer uses NewsAPI.
// It now gets news from the TrendSphere RSS Server.
//
// Example:
// /api/news
// /api/news?category=sports
// /api/news?category=technology
//
//==================================================

app.get(
    "/api/news",
    async (req, res) => {

        try {

            const category =
                String(
                    req.query.category ||
                    "general"
                ).toLowerCase();


            const page =
                Math.max(
                    Number(
                        req.query.page
                    ) || 1,
                    1
                );


            const pageSize =
                Math.min(
                    Math.max(
                        Number(
                            req.query.pageSize
                        ) || 20,
                        1
                    ),
                    30
                );


            const data =
                await fetchRSSNews(
                    category
                );


            let articles =
                Array.isArray(
                    data.articles
                )
                    ? data.articles
                    : [];


            //==================================================
            //              OPTIONAL SEARCH
            //==================================================

            const searchQuery =
                String(
                    req.query.q ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (searchQuery) {

                articles =
                    articles.filter(
                        article => {

                            const title =
                                String(
                                    article.title ||
                                    ""
                                ).toLowerCase();


                            const description =
                                String(
                                    article.description ||
                                    ""
                                ).toLowerCase();


                            return (
                                title.includes(
                                    searchQuery
                                ) ||
                                description.includes(
                                    searchQuery
                                )
                            );

                        }
                    );

            }


            //==================================================
            //              PAGINATION
            //==================================================

            const startIndex =
                (page - 1) *
                pageSize;


            const paginatedArticles =
                articles.slice(
                    startIndex,
                    startIndex + pageSize
                );


            res.json({

                success:
                    true,

                source:
                    data.source,

                category:
                    category,

                page:
                    page,

                pageSize:
                    pageSize,

                count:
                    paginatedArticles.length,

                totalResults:
                    articles.length,

                articles:
                    paginatedArticles

            });


        }
        catch (error) {

            console.error(
                "❌ /api/news error:",
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    "Failed to fetch news from RSS Server",

                error:
                    error.message

            });

        }

    }
);


//==================================================
//              TEST SUPABASE
//==================================================

app.get(
    "/test-supabase",
    async (req, res) => {

        try {

            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "push_subscriptions"
                    )
                    .select(
                        "id",
                        {
                            count:
                                "exact"
                        }
                    )
                    .limit(1);


            if (error) {

                console.error(
                    "Supabase test error:",
                    error
                );


                return res.status(
                    500
                ).json({

                    success:
                        false,

                    message:
                        "Supabase connection failed",

                    error:
                        error.message

                });

            }


            res.json({

                success:
                    true,

                message:
                    "Supabase connection successful",

                subscriptionCount:
                    data?.length || 0

            });


        }
        catch (error) {

            console.error(
                "Supabase test exception:",
                error
            );


            res.status(
                500
            ).json({

                success:
                    false,

                message:
                    "Supabase test failed",

                error:
                    error.message

            });

        }

    }
);


//==================================================
//              SEND SINGLE PUSH
//==================================================

async function sendPushNotification(
    subscription,
    notificationData
) {

    try {

        await webpush.sendNotification(

            subscription,

            JSON.stringify(
                notificationData
            )

        );


        return {

            success:
                true

        };

    }
    catch (error) {

        console.error(
            "Web Push error:",
            error.statusCode,
            error.message
        );


        return {

            success:
                false,

            statusCode:
                error.statusCode,

            message:
                error.message

        };

    }

}


//==================================================
//              SEND TO ALL SUBSCRIBERS
//==================================================

async function sendNotificationToSubscribers(
    notificationData
) {

    console.log(
        "📢 Sending notification to subscribers..."
    );


    //==================================================
    //              GET SUBSCRIPTIONS
    //==================================================

    const {
        data: subscriptions,
        error
    } =
        await supabase
            .from(
                "push_subscriptions"
            )
            .select(
                "id,user_id,endpoint,p256dh,auth"
            );


    if (error) {

        console.error(
            "❌ Failed to load push subscriptions:",
            error.message
        );


        return {

            success:
                false,

            sent:
                0,

            failed:
                0,

            removedExpired:
                0,

            error:
                error.message

        };

    }


    if (
        !subscriptions ||
        subscriptions.length === 0
    ) {

        console.log(
            "ℹ️ No push subscriptions found."
        );


        return {

            success:
                true,

            sent:
                0,

            failed:
                0,

            removedExpired:
                0

        };

    }


    let sent =
        0;

    let failed =
        0;

    let removedExpired =
        0;


    //==================================================
    //              SEND NOTIFICATION
    //==================================================

    for (
        const row of subscriptions
    ) {

        const subscription = {

            endpoint:
                row.endpoint,

            keys: {

                p256dh:
                    row.p256dh,

                auth:
                    row.auth

            }

        };


        //==================================================
        //              VALIDATE SUBSCRIPTION
        //==================================================

        if (
            !row.endpoint ||
            !row.p256dh ||
            !row.auth
        ) {

            console.log(
                `⚠️ Invalid subscription skipped: ${row.id}`
            );


            failed++;

            continue;

        }


        const result =
            await sendPushNotification(
                subscription,
                notificationData
            );


        //==================================================
        //              SUCCESS
        //==================================================

        if (
            result.success
        ) {

            sent++;


            console.log(
                `✅ Push notification sent to: ${row.user_id}`
            );


            continue;

        }


        //==================================================
        //              EXPIRED SUBSCRIPTION
        //==================================================

        if (
            result.statusCode === 404 ||
            result.statusCode === 410
        ) {

            console.log(
                `🗑️ Removing expired subscription: ${row.id}`
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
                        row.id
                    );


            if (deleteError) {

                console.error(
                    "❌ Failed to remove expired subscription:",
                    deleteError.message
                );

            }
            else {

                removedExpired++;

            }


        }
        else {

            failed++;

        }

    }


    console.log(
        "=========================================="
    );

    console.log(
        "Push notification process completed."
    );

    console.log(
        `Total subscriptions: ${subscriptions.length}`
    );

    console.log(
        `Sent: ${sent}`
    );

    console.log(
        `Failed: ${failed}`
    );

    console.log(
        `Removed expired: ${removedExpired}`
    );

    console.log(
        "=========================================="
    );


    return {

        success:
            true,

        totalSubscriptions:
            subscriptions.length,

        sent:
            sent,

        failed:
            failed,

        removedExpired:
            removedExpired

    };

}


//==================================================
//              TEST PUSH NOTIFICATION
//==================================================

app.post(
    "/send-test-notification",
    async (req, res) => {

        try {

            console.log(
                "🧪 Test notification requested."
            );


            const notificationData = {

                title:
                    "TrendSphere Media",

                body:
                    "This is a test push notification from TrendSphere Media.",

                message:
                    "This is a test push notification from TrendSphere Media.",

                icon:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                badge:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                url:
                    "/",

                category:
                    "general"

            };


            const result =
                await sendNotificationToSubscribers(
                    notificationData
                );


            res.json({

                success:
                    result.success,

                message:
                    "Test notification process completed.",

                result:
                    result

            });


        }
        catch (error) {

            console.error(
                "❌ Test notification error:",
                error
            );


            res.status(
                500
            ).json({

                success:
                    false,

                message:
                    "Test notification failed",

                error:
                    error.message

            });

        }

    }
);


//==================================================
//              CHECK NEWS HISTORY
//==================================================

async function hasNewsBeenSent(
    articleUrl
) {

    if (!articleUrl) {

        return false;

    }


    try {

        const {
            data,
            error
        } =
            await supabase
                .from(
                    "news_push_history"
                )
                .select(
                    "id"
                )
                .eq(
                    "article_url",
                    articleUrl
                )
                .limit(1);


        if (error) {

            console.error(
                "❌ News history check error:",
                error.message
            );


            return false;

        }


        return (
            Array.isArray(data) &&
            data.length > 0
        );

    }
    catch (error) {

        console.error(
            "❌ News history exception:",
            error.message
        );


        return false;

    }

}


//==================================================
//              SAVE NEWS HISTORY
//==================================================

async function saveNewsPushHistory(
    article,
    category = "general"
) {

    if (
        !article ||
        !article.url
    ) {

        return false;

    }


    try {

        const {
            error
        } =
            await supabase
                .from(
                    "news_push_history"
                )
                .upsert(

                    {

                        article_url:
                            article.url,

                        article_title:
                            article.title || "",

                        category:
                            category

                    },

                    {

                        onConflict:
                            "article_url"

                    }

                );


        if (error) {

            console.error(
                "❌ Failed to save news push history:",
                error.message
            );


            return false;

        }


        console.log(
            `💾 News article saved to push history: ${article.title}`
        );


        return true;

    }
    catch (error) {

        console.error(
            "❌ News history save exception:",
            error.message
        );


        return false;

    }

}


//==================================================
//              MANUAL NEWS NOTIFICATION
//==================================================

app.post(
    "/send-news-notification",
    async (req, res) => {

        try {

            const article =
                req.body?.article;


            const category =
                req.body?.category ||
                "general";


            if (
                !article ||
                !article.title ||
                !article.url
            ) {

                return res.status(
                    400
                ).json({

                    success:
                        false,

                    message:
                        "Valid article data is required."

                });

            }


            const notificationData = {

                title:
                    "New Story",

                body:
                    article.title,

                message:
                    article.title,

                icon:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                badge:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                url:
                    "/news-details.html",

                category:
                    category,

                article:
                    article

            };


            const pushResult =
                await sendNotificationToSubscribers(
                    notificationData
                );


            if (
                pushResult.success &&
                pushResult.sent > 0
            ) {

                await saveNewsPushHistory(
                    article,
                    category
                );

            }


            res.json({

                success:
                    pushResult.success,

                message:
                    "News notification process completed.",

                result:
                    pushResult

            });


        }
        catch (error) {

            console.error(
                "❌ News notification error:",
                error
            );


            res.status(
                500
            ).json({

                success:
                    false,

                message:
                    "News notification failed",

                error:
                    error.message

            });

        }

    }
);


//==================================================
//              AUTOMATIC NEWS CHECKER
//==================================================
//
// RSS Server
//     ↓
// Push Server
//     ↓
// Check news_push_history
//     ↓
// New article?
//     ↓
// Send Web Push
//
//==================================================

async function checkForNewNews() {

    console.log(
        "=========================================="
    );

    console.log(
        "🔎 Checking TrendSphere RSS Server for new stories..."
    );

    console.log(
        "=========================================="
    );


    try {

        //==================================================
        //              FETCH RSS NEWS
        //==================================================

        const data =
            await fetchRSSNews(
                RSS_NEWS_CATEGORY
            );


        const articles =
            Array.isArray(
                data.articles
            )
                ? data.articles
                : [];


        if (
            articles.length === 0
        ) {

            console.log(
                "ℹ️ RSS Server returned no articles."
            );

            return;

        }


        //==================================================
        //              FIND NEW ARTICLE
        //==================================================

        for (
            const article of articles
        ) {

            if (
                !article ||
                !article.url
            ) {

                continue;

            }


            const alreadySent =
                await hasNewsBeenSent(
                    article.url
                );


            if (
                alreadySent
            ) {

                continue;

            }


            console.log(
                `🆕 New article detected: ${article.title}`
            );


            //==================================================
            //              NOTIFICATION DATA
            //==================================================

            const notificationData = {

                title:
                    "New Story",

                body:
                    article.title,

                message:
                    article.title,

                icon:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                badge:
                    "/assets/Images/icons/TrendSphere Media Logo ICON.jpg",

                url:
                    "/news-details.html",

                category:
                    article.category ||
                    RSS_NEWS_CATEGORY,

                article:
                    article

            };


            //==================================================
            //              SEND PUSH
            //==================================================

            const pushResult =
                await sendNotificationToSubscribers(
                    notificationData
                );


            //==================================================
            //              SAVE HISTORY
            //==================================================

            if (
                pushResult.success &&
                pushResult.sent > 0
            ) {

                const historySaved =
                    await saveNewsPushHistory(
                        article,
                        article.category ||
                        RSS_NEWS_CATEGORY
                    );


                if (
                    historySaved
                ) {

                    console.log(
                        `✅ Automatic news push completed: ${article.title}`
                    );

                }

            }
            else {

                console.log(
                    "ℹ️ Notification was not sent to any subscribers."
                );

            }


            //==================================================
            //              ONLY ONE NEW STORY PER CHECK
            //==================================================

            break;

        }


    }
    catch (error) {

        console.error(
            "❌ Automatic RSS news checker error:",
            error.message
        );

    }

}


//==================================================
//              AUTOMATIC CHECK INTERVAL
//==================================================

// Check every 5 minutes.

const NEWS_CHECK_INTERVAL =
    5 * 60 * 1000;


setInterval(
    checkForNewNews,
    NEWS_CHECK_INTERVAL
);


//==================================================
//              FIRST NEWS CHECK
//==================================================

// Wait 10 seconds after startup.
//
// This gives Render time to finish starting.

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
            `✅ RSS Server: ${RSS_SERVER_URL}`
        );

        console.log(
            `✅ RSS category: ${RSS_NEWS_CATEGORY}`
        );

        console.log(
            "✅ Supabase push subscriptions enabled."
        );

        console.log(
            "✅ Web Push/VAPID enabled."
        );

        console.log(
            "✅ Automatic RSS news checker enabled."
        );

        console.log(
            "⏱️ News check interval: 5 minutes"
        );

        console.log(
            "=========================================="
        );

    }
);