// =====================================================
//                    RSS CONFIGURATION
//                    TrendSphere Media
// =====================================================

// TrendSphere RSS Server
const RSS_SERVER_URL =
    "https://trendsphere-rss.onrender.com";


// =====================================================
//                    RSS ENDPOINTS
// =====================================================

const BASE_URL =
    `${RSS_SERVER_URL}/rss/general`;

const TECHNOLOGY_URL =
    `${RSS_SERVER_URL}/rss/technology`;

const BUSINESS_URL =
    `${RSS_SERVER_URL}/rss/business`;

const SPORTS_URL =
    `${RSS_SERVER_URL}/rss/sports`;

const ENTERTAINMENT_URL =
    `${RSS_SERVER_URL}/rss/entertainment`;

const CELEBRITY_URL =
    `${RSS_SERVER_URL}/rss/celebrity`;

const MUSIC_URL =
    `${RSS_SERVER_URL}/rss/music`;

const LIFESTYLE_URL =
    `${RSS_SERVER_URL}/rss/lifestyle`;

const VIDEO_URL =
    `${RSS_SERVER_URL}/rss/video`;

// =====================================================
//                    SEARCH
// =====================================================

// Search will be handled separately.
// The old NewsAPI search URL is no longer used.
const SEARCH_URL = "";


// =====================================================
//                    RSS CATEGORIES
// =====================================================

const RSS_CATEGORIES = {

    general:
        `${RSS_SERVER_URL}/rss/general`,

    technology:
        `${RSS_SERVER_URL}/rss/technology`,

    business:
        `${RSS_SERVER_URL}/rss/business`,

    sports:
        `${RSS_SERVER_URL}/rss/sports`,

    entertainment:
        `${RSS_SERVER_URL}/rss/entertainment`,

    celebrity:
        `${RSS_SERVER_URL}/rss/celebrity`,

    music:
        `${RSS_SERVER_URL}/rss/music`,

    lifestyle:
    `${RSS_SERVER_URL}/rss/lifestyle`,

    video:
        `${RSS_SERVER_URL}/rss/video`,

};

// =====================================================
//                    DOM ELEMENTS
// =====================================================

const heroTitle =
    document.getElementById("hero-title");

const heroDescription =
    document.getElementById("hero-description");

const heroImage =
    document.getElementById("hero-image");

const heroLink =
    document.getElementById("hero-link");

const heroSource =
    document.getElementById("hero-source");

const trendingContainer =
    document.getElementById("trending-news");

const breakingNews =
    document.getElementById("breaking-news");

const latestNews =
    document.getElementById("latest-news");

const sportsNews =
    document.getElementById("sports-news");

const technologyNews =
    document.getElementById("technology-news");

const entertainmentNews =
    document.getElementById("entertainment-news");

const celebrityNews =
    document.getElementById("celebrity-news");

const musicNews =
    document.getElementById("music-news");

const businessNews =
    document.getElementById("business-news");

const lifestyleNews =
    document.getElementById("lifestyle-news");

const featuredContainer =
    document.getElementById("featured-container");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const loadMoreBtn =
    document.getElementById("load-more-btn");

const progressBar =
    document.getElementById("reading-progress-bar");


// =====================================================
//                    BOOKMARKS
// =====================================================

let bookmarks =
    JSON.parse(
        localStorage.getItem("bookmarks")
    ) || [];


// =====================================================
//                    API CACHE
// =====================================================

const CACHE_TIME =
    5 * 60 * 1000;


async function fetchWithCache(url){

    const cacheKey =
        `newsCache_${url}`;


    const cached =
        localStorage.getItem(
            cacheKey
        );


    // =================================================
    //              CHECK LOCAL CACHE
    // =================================================

    if(cached){

        try{

            const cacheData =
                JSON.parse(cached);


            const cacheAge =
                Date.now() -
                cacheData.timestamp;


            if(cacheAge < CACHE_TIME){

                console.log(
                    "Using cached news:",
                    url
                );


                return cacheData.data;
            }


            localStorage.removeItem(
                cacheKey
            );

        }
        catch(error){

            console.warn(
                "Invalid cache removed:",
                error
            );


            localStorage.removeItem(
                cacheKey
            );
        }
    }


    // =================================================
    //              FETCH RSS SERVER
    // =================================================

    const response =
        await fetch(url);


    if(!response.ok){

        throw new Error(
            `HTTP Error: ${response.status}`
        );
    }


    const rssData =
        await response.json();


    // =================================================
    //              VALIDATE RSS RESPONSE
    // =================================================

    if(
        !rssData ||
        !rssData.success ||
        !Array.isArray(
            rssData.articles
        )
    ){

        throw new Error(
            "Invalid RSS server response."
        );
    }


    // =================================================
    //      CONVERT RSS RESPONSE TO NEWS FORMAT
    // =================================================

    const data = {

        status:
            "ok",

        source:
            rssData.source,

        category:
            rssData.category,

        count:
            rssData.count,

        articles:
            rssData.articles

    };


    // =================================================
    //              SAVE TO CACHE
    // =================================================

    localStorage.setItem(
        cacheKey,
        JSON.stringify({

            timestamp:
                Date.now(),

            data:
                data

        })
    );


    console.log(
        "Fresh RSS news loaded:",
        url
    );


    return data;
}


// =====================================================
//              CLEAN EXPIRED NEWS CACHE
// =====================================================

function cleanNewsCache(){

    const now =
        Date.now();


    for(
        let i = localStorage.length - 1;
        i >= 0;
        i--
    ){

        const key =
            localStorage.key(i);


        if(
            !key ||
            !key.startsWith("newsCache_")
        ){

            continue;
        }


        try{

            const cached =
                JSON.parse(
                    localStorage.getItem(key)
                );


            if(
                !cached ||
                !cached.timestamp ||
                now - cached.timestamp >= CACHE_TIME
            ){

                localStorage.removeItem(key);
            }

        }
        catch(error){

            localStorage.removeItem(key);
        }
    }
}


cleanNewsCache();


// =====================================================
//              READING PROGRESS BAR
// =====================================================

window.addEventListener(
    "scroll",
    () => {

        if(!progressBar){
            return;
        }


        const scrollTop =
            window.scrollY;

        const scrollHeight =
            document.documentElement.scrollHeight;

        const clientHeight =
            document.documentElement.clientHeight;

        const totalScrollable =
            scrollHeight -
            clientHeight;


        if(totalScrollable <= 0){

            progressBar.style.width =
                "0%";

            return;
        }


        const progress =
            (scrollTop /
            totalScrollable) *
            100;


        progressBar.style.width =
            `${Math.min(progress, 100)}%`;
    }
);


// =====================================================
//              OPEN NEWS DETAILS
// =====================================================

function openNewsDetails(
    article,
    category = "general"
){

    if(!article){

        console.error(
            "No article selected."
        );

        return;
    }


    const articleWithCategory = {

        ...article,

        category:
            category
    };


    localStorage.setItem(
        "selectedArticle",
        JSON.stringify(
            articleWithCategory
        )
    );


    window.location.href =
        "news-details.html";
}


// =====================================================
//                  SAVE ARTICLE
// =====================================================

function saveBookmark(article){

    if(!article){
        return;
    }


    const exists =
        bookmarks.find(
            item =>
                item.url ===
                article.url
        );


    if(exists){

        alert(
            "Article already Saved."
        );

        return;
    }


    bookmarks.push(article);


    localStorage.setItem(
        "bookmarks",
        JSON.stringify(bookmarks)
    );


    alert(
        "Article bookmarked successfully!"
    );
}


// =====================================================
//                  SHARE ARTICLE
// =====================================================

function shareArticle(url){

    console.log(
        "Share button clicked!"
    );

    console.log(url);


    if(navigator.share){

        navigator.share({

            title:
                "TrendSphere Media",

            url:
                url

        }).catch(error => {

            console.log(
                "Share cancelled:",
                error
            );

        });

    }
    else{

        navigator.clipboard
            .writeText(url)
            .then(() => {

                alert(
                    "Article link copied successfully!"
                );

            })
            .catch(error => {

                console.error(
                    "Unable to copy link:",
                    error
                );

            });
    }
}


// =====================================================
//          SUPABASE NOTIFICATION CHECK
// =====================================================

function isNewsNotificationSupabaseReady(){

    return (
        typeof supabaseClient !==
            "undefined" &&
        supabaseClient &&
        supabaseClient.auth
    );
}


// =====================================================
//          GET LOGGED-IN USER
// =====================================================

async function getNewsNotificationUser(){

    if(
        !isNewsNotificationSupabaseReady()
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
                "Unable to get user for notification:",
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


// =====================================================
//          NOTIFICATION TYPE
// =====================================================

function getNotificationType(
    category = "general"
){

    const normalizedCategory =
        String(category)
            .toLowerCase();


    switch(
        normalizedCategory
    ){

        case "sports":
            return "sports";


        case "technology":
            return "technology";


        case "entertainment":
            return "entertainment";


        case "breaking_news":
            return "breaking_news";


        default:
            return "news";
    }
}













// =====================================================
//          AUTOMATIC NEWS PUSH
// =====================================================

const NEWS_PUSH_SERVER_URL =
    "http://localhost:3000";


// =====================================================
//          CHECK IF ARTICLE WAS ALREADY PUSHED
// =====================================================

function hasArticleBeenPushed(article){

    if(
        !article ||
        !article.url
    ){

        return false;
    }


    const pushedArticles =
        JSON.parse(
            localStorage.getItem(
                "trendspherePushedArticles"
            )
        ) || [];


    return pushedArticles.includes(
        article.url
    );
}


// =====================================================
//          REMEMBER PUSHED ARTICLE
// =====================================================

function rememberPushedArticle(article){

    if(
        !article ||
        !article.url
    ){

        return;
    }


    let pushedArticles =
        JSON.parse(
            localStorage.getItem(
                "trendspherePushedArticles"
            )
        ) || [];


    if(
        pushedArticles.includes(
            article.url
        )
    ){

        return;
    }


    pushedArticles.push(
        article.url
    );


    // Keep only the newest 100 articles.
    pushedArticles =
        pushedArticles.slice(
            -100
        );


    localStorage.setItem(
        "trendspherePushedArticles",
        JSON.stringify(
            pushedArticles
        )
    );

}


// =====================================================
//          SEND NEWS PUSH TO SERVER
// =====================================================

async function sendNewsPushNotification(
    article,
    category = "general"
){

    if(
        !article ||
        !article.url ||
        !article.title
    ){

        console.warn(
            "Invalid article. Push notification skipped."
        );

        return false;
    }


    //==================================================
    //      PREVENT DUPLICATE PUSH
    //==================================================

    if(
        hasArticleBeenPushed(
            article
        )
    ){

        console.log(
            "Article push already sent:",
            article.title
        );

        return false;
    }


    //==================================================
    //      NOTIFICATION TITLE
    //==================================================

    let notificationTitle =
        "New Story";


    switch(
        String(category)
            .toLowerCase()
    ){

        case "sports":

            notificationTitle =
                "New Sports Story";

            break;


        case "technology":

            notificationTitle =
                "New Technology Story";

            break;


        case "entertainment":

            notificationTitle =
                "New Entertainment Story";

            break;


        case "breaking_news":

            notificationTitle =
                "Breaking News";

            break;

    }


    //==================================================
    //      NOTIFICATION MESSAGE
    //==================================================

    const notificationMessage =
        article.title;


    //==================================================
    //      SEND TO PUSH SERVER
    //==================================================

    try{

        const response =
            await fetch(
                `${NEWS_PUSH_SERVER_URL}/send-news-notification`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            title:
                                notificationTitle,

                            message:
                                notificationMessage,

                            url:
                                "/news-details.html",

                            category:
                                category,

                            article:
                                article

                        })

                }
            );


        const result =
            await response.json();


        if(
            !response.ok ||
            !result.success
        ){

            console.error(
                "❌ News push failed:",
                result
            );

            return false;
        }


        console.log(
            "✅ News push sent successfully:",
            result
        );


        //==================================================
        //      REMEMBER ARTICLE
        //==================================================

        if(
            result.sent &&
            result.sent > 0
        ){

            rememberPushedArticle(
                article
            );

        }


        return true;

    }
    catch(error){

        console.error(
            "❌ Unable to connect to news push server:",
            error
        );

        return false;

    }

}








// =====================================================
//          CREATE NEWS NOTIFICATION
// =====================================================

async function createNewsNotification(
    article,
    category = "general"
){

    if(!article){

        console.warn(
            "No article supplied for notification."
        );

        return false;
    }


    if(
        !isNewsNotificationSupabaseReady()
    ){

        console.warn(
            "Supabase is not ready for notifications."
        );

        return false;
    }


    if(!article.url){

        console.warn(
            "Article has no URL. Notification skipped."
        );

        return false;
    }


    const user =
        await getNewsNotificationUser();


    if(!user){

        console.log(
            "No logged-in user. News notification skipped."
        );

        return false;
    }


    try{

        // =================================================
        //      CHECK FOR DUPLICATE NOTIFICATION
        // =================================================

        const {
            data: existing,
            error: checkError
        } =
            await supabaseClient
                .from("notifications")
                .select("id")
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "article_url",
                    article.url
                )
                .limit(1);


        if(checkError){

            console.error(
                "Unable to check notification:",
                checkError
            );

            return false;
        }


        if(
            existing &&
            existing.length > 0
        ){

            console.log(
                "Notification already exists:",
                article.title
            );

            return false;
        }


        // =================================================
        //              PREPARE DATA
        // =================================================

        const notificationType =
            getNotificationType(
                category
            );


        let notificationTitle =
            "New Story";


        if(
            notificationType ===
            "sports"
        ){

            notificationTitle =
                "New Sports Story";
        }


        if(
            notificationType ===
            "technology"
        ){

            notificationTitle =
                "New Technology Story";
        }


        if(
            notificationType ===
            "entertainment"
        ){

            notificationTitle =
                "New Entertainment Story";
        }


        if(
            notificationType ===
            "breaking_news"
        ){

            notificationTitle =
                "Breaking News";
        }


        const notificationMessage =
            article.title ||
            "A new story has been published on TrendSphere Media.";


        const articleData = {

            ...article,

            category:
                category || "general"
        };


        // =================================================
        //              INSERT NOTIFICATION
        // =================================================

        const {
            data,
            error
        } =
            await supabaseClient
                .from("notifications")
                .insert({

                    user_id:
                        user.id,

                    title:
                        notificationTitle,

                    message:
                        notificationMessage,

                    type:
                        notificationType,

                    is_read:
                        false,

                    article_url:
                        article.url,

                    category:
                        category ||
                        "general",

                    article_data:
                        articleData

                })
                .select()
                .single();


        if(error){

            console.error(
                "Unable to create news notification:",
                error
            );

            return false;
        }


        console.log(
            "News notification created successfully:",
            data
        );


        // =================================================
        //      UPDATE NOTIFICATION BADGE
        // =================================================

        if(
            typeof updateNotificationCount ===
            "function"
        ){

            updateNotificationCount();
        }


        return true;

    }
    catch(error){

        console.error(
            "Create news notification error:",
            error
        );

        return false;
    }
}










// =====================================================
//      CREATE NOTIFICATIONS FOR NEW ARTICLES
// =====================================================

async function createNotificationsForArticles(
    articles,
    category = "general",
    limit = 3
){

    if(
        !Array.isArray(articles) ||
        articles.length === 0
    ){

        return;
    }


    const user =
        await getNewsNotificationUser();


    if(!user){

        console.log(
            "No logged-in user. Automatic notifications skipped."
        );

        return;
    }


    // =================================================
    //      SELECT NEWEST ARTICLES
    // =================================================

    const articlesToNotify =
        articles
            .filter(
                article =>
                    article &&
                    article.url &&
                    article.title
            )
            .slice(0, limit);


    // =================================================
    //      PROCESS ARTICLES
    // =================================================

    for(
        const article
        of articlesToNotify
    ){

        // =================================================
        //      CREATE SUPABASE NOTIFICATION
        // =================================================

        const notificationCreated =
            await createNewsNotification(
                article,
                category
            );


        // =================================================
        //      SEND BROWSER PUSH
        // =================================================

        if(notificationCreated){

            await sendNewsPushNotification(
                article,
                category
            );

        }

    }

}










// =====================================================
//                    LOAD MORE
// =====================================================

let currentPage = 1;

const PAGE_SIZE = 20;


if(loadMoreBtn){

    loadMoreBtn.addEventListener(
        "click",
        () => {

            currentPage++;

            loadMoreNews();
        }
    );
}


// =====================================================
//                    LOAD MORE NEWS
// =====================================================

async function loadMoreNews(){

    try{

        const data =
            await fetchWithCache(
                BASE_URL
            );


        if(
            data.status !== "ok" ||
            !data.articles
        ){

            console.error(
                "Unable to load more RSS news."
            );

            return;
        }


        // =================================================
        //      CALCULATE NEXT BATCH
        // =================================================

        const startIndex =
            12 +
            ((currentPage - 2) * 6);


        const nextArticles =
            data.articles.slice(
                startIndex,
                startIndex + 6
            );


        if(
            nextArticles.length === 0
        ){

            console.log(
                "No more RSS articles available."
            );


            if(loadMoreBtn){

                loadMoreBtn.disabled =
                    true;

                loadMoreBtn.textContent =
                    "No More News";
            }


            return;
        }


        // =================================================
        //              APPEND ARTICLES
        // =================================================

        appendLatestNews(
            nextArticles
        );


        // =================================================
        //      CREATE NOTIFICATIONS
        // =================================================

        await createNotificationsForArticles(
            nextArticles,
            "general",
            2
        );

    }
    catch(error){

        console.error(
            "Load more RSS error:",
            error
        );
    }
}


// =====================================================
//              APPEND LATEST NEWS
// =====================================================

function appendLatestNews(news){

    if(!latestNews){
        return;
    }


    news.forEach(article => {

        latestNews.innerHTML += `

            <article class="latest-card">

                <img
                    src="${
                        article.urlToImage ||
                        "./assets/images/no-image.png"
                    }"
                    alt="News"
                    loading="lazy"
                >

                <div class="latest-content">

                    <span>
                        ${
                            article.source?.name ||
                            "Unknown Source"
                        }
                    </span>

                    <h3>
                        ${article.title}
                    </h3>

                    <a
                        href="#"
                        class="latest-read-more"
                        data-url="${article.url}"
                    >
                        Read More
                    </a>

                </div>

            </article>
        `;
    });
}


// =====================================================
//              SHOW LOADING
// =====================================================

function showLoading(){

    if(trendingContainer){

        trendingContainer.innerHTML =
            `<h2 class="loading">
                Loading news...
            </h2>`;
    }


    if(latestNews){

        latestNews.innerHTML =
            `<h2 class="loading">
                Loading news...
            </h2>`;
    }


    if(breakingNews){

        breakingNews.innerHTML =
            `<h2 class="loading">
                Loading news...
            </h2>`;
    }


    if(featuredContainer){

        featuredContainer.innerHTML =
            `<div class="featured-loading">

                <i class="bx bx-loader-alt bx-spin"></i>

                <p>
                    Loading featured stories...
                </p>

            </div>`;
    }
}


// =====================================================
//              SHOW NEWS LOADING
// =====================================================

function showNewsLoading(container){

    if(container){

        container.innerHTML =
            `<div class="news-loading">
                Loading latest news...
            </div>`;
    }
}


// =====================================================
//              SHOW NEWS ERROR
// =====================================================

function showNewsError(
    container,
    message = "Unable to load news.",
    retryFunction
){

    if(!container){
        return;
    }


    container.innerHTML = `

        <div class="news-error">

            <i class='bx bx-error-circle'></i>

            <p>
                ${message}
            </p>

            <button
                class="retry-news-btn"
            >
                Try Again
            </button>

        </div>
    `;


    const retryButton =
        container.querySelector(
            ".retry-news-btn"
        );


    if(retryButton){

        retryButton.addEventListener(
            "click",
            () => {

                if(retryFunction){

                    showNewsLoading(
                        container
                    );

                    retryFunction();
                }
            }
        );
    }
}


// =====================================================
//              FETCH CATEGORY NEWS
// =====================================================

async function fetchCategoryNews(
    url,
    callback,
    container,
    category = "general"
){

    try{

        const data =
            await fetchWithCache(url);


        console.log(
            "Category URL:",
            url
        );


        console.log(
            "Category data:",
            data
        );


        if(data.status !== "ok"){

            showNewsError(
                container,
                data.message ||
                "Unable to load news.",
                () =>
                    fetchCategoryNews(
                        url,
                        callback,
                        container,
                        category
                    )
            );

            return;
        }


        if(
            !data.articles ||
            data.articles.length === 0
        ){

            showNewsError(
                container,
                "No news articles are available right now."
            );

            return;
        }


        callback(
            data.articles
        );


        // =================================================
        //      AUTOMATIC NEWS NOTIFICATIONS
        // =================================================

        await createNotificationsForArticles(
            data.articles,
            category,
            2
        );

    }
    catch(error){

        console.error(
            "Category fetch error:",
            error
        );


        showNewsError(
            container,
            "Unable to connect to the news service.",
            () =>
                fetchCategoryNews(
                    url,
                    callback,
                    container,
                    category
                )
        );
    }
}


// =====================================================
//              FETCH TECHNOLOGY
// =====================================================

if(technologyNews){

    showNewsLoading(
        technologyNews
    );


    fetchCategoryNews(
        TECHNOLOGY_URL,
        displayTechnologyNews,
        technologyNews,
        "technology"
    );
}


// =====================================================
//              FETCH SPORTS
// =====================================================

if(sportsNews){

    showNewsLoading(
        sportsNews
    );


    fetchCategoryNews(
        SPORTS_URL,
        displaySportsNews,
        sportsNews,
        "sports"
    );
}


// =====================================================
//              FETCH ENTERTAINMENT
// =====================================================

if(entertainmentNews){

    showNewsLoading(
        entertainmentNews
    );


    fetchCategoryNews(
        ENTERTAINMENT_URL,
        displayEntertainmentNews,
        entertainmentNews,
        "entertainment"
    );
}


if(celebrityNews){
    showNewsLoading(celebrityNews);

    fetchCategoryNews(
        CELEBRITY_URL,
        displayCelebrityNews,
        celebrityNews,
        "celebrity"
    );
}





if(musicNews){

    showNewsLoading(
        musicNews
    );

    fetchCategoryNews(
        MUSIC_URL,
        displayMusicNews,
        musicNews,
        "music"
    );

}




if(businessNews){

    showNewsLoading(
        businessNews
    );

    fetchCategoryNews(
        BUSINESS_URL,
        displayBusinessNews,
        businessNews,
        "business"
    );

}



if(lifestyleNews){

    showNewsLoading(
        lifestyleNews
    );

    fetchCategoryNews(
        LIFESTYLE_URL,
        displayLifestyleNews,
        lifestyleNews,
        "lifestyle"
    );

}


// =====================================================
//              FETCH CATEGORY
// =====================================================

// =====================================================
//              FETCH CATEGORY NEWS
// =====================================================

async function fetchNewsByCategory(
    category
){

    showLoading();


    const normalizedCategory =
        String(category)
            .toLowerCase()
            .trim();


    // =================================================
    //              GET RSS URL
    // =================================================

    const rssUrl =
        RSS_CATEGORIES[
            normalizedCategory
        ];


    if(!rssUrl){

        console.warn(
            "RSS category not available:",
            normalizedCategory
        );


        if(featuredContainer){

            featuredContainer.innerHTML = `

                <div class="featured-empty">

                    <i class="bx bx-error-circle"></i>

                    <h3>
                        Category unavailable
                    </h3>

                    <p>
                        This category is not available
                        from the current RSS sources.
                    </p>

                </div>
            `;
        }


        return;
    }


    try{

        // =================================================
        //              FETCH RSS NEWS
        // =================================================

        const data =
            await fetchWithCache(
                rssUrl
            );


        console.log(
            "RSS Category:",
            normalizedCategory
        );


        console.log(
            "RSS Category Data:",
            data
        );


        if(
            data.status !== "ok"
        ){

            console.error(
                "RSS error:",
                data
            );


            return;
        }


        if(
            !data.articles ||
            data.articles.length === 0
        ){

            console.warn(
                "No RSS articles returned."
            );


            return;
        }


        // =================================================
        //              HERO NEWS
        // =================================================

        displayHeroNews(
            data.articles[0]
        );


        // =================================================
        //              BREAKING NEWS
        // =================================================

        displayBreakingNews(
            data.articles
        );


        // =================================================
        //              TRENDING NEWS
        // =================================================

        displayTrendingNews(
            data.articles
        );


        // =================================================
        //              LATEST NEWS
        // =================================================

        displayLatestNews(
            data.articles
        );


        // =================================================
        //              FEATURED NEWS
        // =================================================

        displayFeaturedArticles(
            data.articles
        );


        // =================================================
        //      AUTOMATIC CATEGORY NOTIFICATIONS
        // =================================================

        await createNotificationsForArticles(
            data.articles,
            normalizedCategory,
            3
        );

    }
    catch(error){

        console.error(
            "RSS category fetch error:",
            error
        );


        if(featuredContainer){

            featuredContainer.innerHTML = `

                <div class="featured-empty">

                    <i class="bx bx-error-circle"></i>

                    <h3>
                        Unable to load featured stories
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;
        }

    }
}


// =====================================================
//              CATEGORY BUTTONS
// =====================================================

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );
                    }
                );


                button.classList.add(
                    "active"
                );


                const category =
                    button.dataset.category;


                console.log(
                    "Selected category:",
                    category
                );


                if(
                    category ===
                    "general"
                ){

                    fetchTrendingNews();

                    return;
                }


                fetchNewsByCategory(
                    category
                );
            }
        );
    }
);


// =====================================================
//              FETCH TRENDING NEWS
// =====================================================

// =====================================================
//              FETCH TRENDING NEWS
// =====================================================

async function fetchTrendingNews(){

    if(trendingContainer){

        trendingContainer.innerHTML =
            `<div class="news-loading">
                Loading latest news...
            </div>`;
    }


    if(featuredContainer){

        featuredContainer.innerHTML =
            `<div class="featured-loading">

                <i class="bx bx-loader-alt bx-spin"></i>

                <p>
                    Loading featured stories...
                </p>

            </div>`;
    }


    try{

        // =================================================
        //              FETCH RSS GENERAL NEWS
        // =================================================

        const data =
            await fetchWithCache(
                BASE_URL
            );


        console.log(
            "Main RSS news data:",
            data
        );


        if(
            data.status !== "ok"
        ){

            console.error(
                "RSS error:",
                data
            );


            if(featuredContainer){

                featuredContainer.innerHTML = `

                    <div class="featured-empty">

                        <i class="bx bx-error-circle"></i>

                        <h3>
                            Featured stories unavailable
                        </h3>

                        <p>
                            Unable to load news.
                        </p>

                    </div>
                `;
            }


            return;
        }


        if(
            !data.articles ||
            data.articles.length === 0
        ){

            console.warn(
                "No RSS articles returned."
            );


            return;
        }


        // =================================================
        //              HERO NEWS
        // =================================================

        displayHeroNews(
            data.articles[0]
        );


        // =================================================
        //              TRENDING NEWS
        // =================================================

        displayTrendingNews(
            data.articles
        );


        // =================================================
        //              BREAKING NEWS
        // =================================================

        displayBreakingNews(
            data.articles
        );


        // =================================================
        //              LATEST NEWS
        // =================================================

        displayLatestNews(
            data.articles
        );


        // =================================================
        //              FEATURED ARTICLES
        // =================================================

        displayFeaturedArticles(
            data.articles
        );


        // =================================================
        //      AUTOMATIC NEWS NOTIFICATIONS
        // =================================================

        await createNotificationsForArticles(
            data.articles,
            "general",
            3
        );

    }
    catch(error){

        console.error(
            "Error fetching RSS trending news:",
            error
        );


        if(trendingContainer){

            trendingContainer.innerHTML =
                `<h3>
                    Unable to load news...
                </h3>`;
        }


        if(featuredContainer){

            featuredContainer.innerHTML = `

                <div class="featured-empty">

                    <i class="bx bx-error-circle"></i>

                    <h3>
                        Unable to load featured stories
                    </h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;
        }
    }
}


// =====================================================
//              HERO NEWS
// =====================================================

function displayHeroNews(article){

    if(!article){
        return;
    }


    if(heroTitle){

        heroTitle.textContent =
            article.title ||
            "No title available";
    }


    if(heroDescription){

        heroDescription.textContent =
            article.description ||
            "Click below to read the full story.";
    }


    if(heroSource){

        heroSource.textContent =
            article.source?.name ||
            "Unknown Source";
    }


    if(heroImage){

        heroImage.src =
            article.urlToImage ||
            "./assets/images/no-image.png";


        heroImage.onerror =
            () => {

                heroImage.src =
                    "./assets/images/no-image.png";
            };
    }


    if(heroLink){

        heroLink.href =
            "news-details.html";


        heroLink.onclick =
            () => {

                localStorage.setItem(
                    "selectedArticle",
                    JSON.stringify(article)
                );
            };
    }
}


// =====================================================
//              BREAKING NEWS
// =====================================================

function displayBreakingNews(
    articles
){

    if(!breakingNews){
        return;
    }


    breakingNews.innerHTML =
        "";


    articles
        .slice(0, 10)
        .forEach(
            article => {

                breakingNews.innerHTML +=
                    `${article.title}
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`;
            }
        );
}


// =====================================================
//              TRENDING NEWS
// =====================================================

function displayTrendingNews(
    news
){

    if(!trendingContainer){
        return;
    }


    trendingContainer.innerHTML =
        "";


    news
        .slice(0, 6)
        .forEach(
            article => {

                trendingContainer.innerHTML += `

                    <article class="trending-card">

                        <img
                            src="${
                                article.urlToImage ||
                                "./assets/images/no-image.png"
                            }"
                            alt="${article.title}"
                            loading="lazy"
                        >


                        <div class="news-actions">

                            <span>
                                ${
                                    article.source?.name ||
                                    "Unknown Source"
                                }
                            </span>


                            <h3>
                                ${article.title}
                            </h3>


                            <p>
                                ${
                                    article.description ||
                                    "Click below to continue reading this story."
                                }
                            </p>


                            <div class="news-actions">

                                <a
                                    href="#"
                                    class="details-btn"
                                >
                                    Read Full Story
                                </a>


                                <div class="action-buttons">

                                    <button
                                        class="share-btn"
                                        data-url="${article.url}"
                                    >
                                        <i class="bx bx-share-alt"></i>
                                    </button>


                                    <button
                                        class="bookmark-btn"
                                    >
                                        <i class="bx bx-bookmark"></i>
                                    </button>

                                </div>

                            </div>

                        </div>

                    </article>
                `;
            }
        );


    // =================================================
    //              SHARE BUTTONS
    // =================================================

    trendingContainer
        .querySelectorAll(
            ".share-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const url =
                            button.dataset.url;


                        shareArticle(
                            url
                        );
                    }
                );
            }
        );


    // =================================================
    //              TRENDING DETAILS
    // =================================================

    trendingContainer
        .querySelectorAll(
            ".details-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event){

                        event.preventDefault();


                        const card =
                            this.closest(
                                ".trending-card"
                            );


                        if(!card){
                            return;
                        }


                        const title =
                            card
                                .querySelector("h3")
                                ?.textContent
                                .trim();


                        const article =
                            news.find(
                                item =>
                                    item.title ===
                                    title
                            );


                        if(article){

                            openNewsDetails(
                                article,
                                "general"
                            );
                        }
                    }
                );
            }
        );
}


// =====================================================
//              LATEST NEWS
// =====================================================

function displayLatestNews(
    articles
){

    if(!latestNews){
        return;
    }


    latestNews.innerHTML =
        "";


    articles
        .slice(6, 12)
        .forEach(
            article => {

                latestNews.innerHTML += `

                    <article class="latest-card">

                        <img
                            src="${
                                article.urlToImage ||
                                "./assets/images/no-image.png"
                            }"
                            alt="${article.title}"
                            loading="lazy"
                        >


                        <div class="latest-content">

                            <span>
                                ${
                                    article.source?.name ||
                                    "Unknown Source"
                                }
                            </span>


                            <h3>
                                ${article.title}
                            </h3>


                            <p>
                                ${
                                    article.description ||
                                    "No description available."
                                }
                            </p>


                            <a
                                href="#"
                                class="latest-read-more"
                                data-url="${article.url}"
                            >
                                Read Full Story
                            </a>

                        </div>

                    </article>
                `;
            }
        );


    // =================================================
    //              LATEST DETAILS
    // =================================================

    latestNews
        .querySelectorAll(
            ".latest-read-more"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event){

                        event.preventDefault();


                        const articleUrl =
                            this.dataset.url;


                        const article =
                            articles.find(
                                item =>
                                    item.url ===
                                    articleUrl
                            );


                        if(article){

                            openNewsDetails(
                                article,
                                "general"
                            );
                        }
                    }
                );
            }
        );
}


// =====================================================
//              TECHNOLOGY NEWS
// =====================================================

function displayTechnologyNews(
    articles
){

    if(!technologyNews){
        return;
    }


    technologyNews.innerHTML =
        "";


    articles.forEach(
        article => {

            technologyNews.innerHTML += `

                <article class="tech-card">

                    <img
                        src="${
                            article.urlToImage ||
                            "./assets/images/no-image.png"
                        }"
                        alt="${article.title}"
                        loading="lazy"
                    >


                    <div class="tech-content">

                        <span>
                            ${
                                article.source?.name ||
                                "Unknown Source"
                            }
                        </span>


                        <h3>
                            ${article.title}
                        </h3>


                        <p>
                            ${
                                article.description ||
                                "No description available."
                            }
                        </p>


                        <a
                            href="#"
                            class="technology-read-more"
                            data-url="${article.url}"
                        >
                            Read Full Story
                        </a>

                    </div>

                </article>
            `;
        }
    );


    technologyNews
        .querySelectorAll(
            ".technology-read-more"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event){

                        event.preventDefault();


                        const articleUrl =
                            this.dataset.url;


                        const article =
                            articles.find(
                                item =>
                                    item.url ===
                                    articleUrl
                            );


                        if(article){

                            openNewsDetails(
                                article,
                                "technology"
                            );
                        }
                    }
                );
            }
        );
}


// =====================================================
//              SPORTS NEWS
// =====================================================

function displaySportsNews(
    articles
){

    if(!sportsNews){
        return;
    }


    sportsNews.innerHTML =
        "";


    articles.forEach(
        article => {

            sportsNews.innerHTML += `

                <article class="sports-card">

                    <img
                        src="${
                            article.urlToImage ||
                            "./assets/images/no-image.png"
                        }"
                        alt="${article.title}"
                        loading="lazy"
                    >


                    <div class="sports-content">

                        <span>
                            ${
                                article.source?.name ||
                                "Unknown Source"
                            }
                        </span>


                        <h3>
                            ${article.title}
                        </h3>


                        <p>
                            ${
                                article.description ||
                                "No description available."
                            }
                        </p>


                        <a
                            href="#"
                            class="sports-read-more"
                            data-url="${article.url}"
                        >
                            Read Full Story
                        </a>

                    </div>

                </article>
            `;
        }
    );


    sportsNews
        .querySelectorAll(
            ".sports-read-more"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event){

                        event.preventDefault();


                        const articleUrl =
                            this.dataset.url;


                        const article =
                            articles.find(
                                item =>
                                    item.url ===
                                    articleUrl
                            );


                        if(article){

                            openNewsDetails(
                                article,
                                "sports"
                            );
                        }
                    }
                );
            }
        );
}


// =====================================================
//              FEATURED ARTICLES
// =====================================================

function displayFeaturedArticles(
    articles
){

    console.log(
        "Displaying featured articles:",
        articles
    );


    if(!featuredContainer){

        console.error(
            "Featured container not found!"
        );

        return;
    }


    if(
        !articles ||
        !articles.length
    ){

        featuredContainer.innerHTML = `

            <div class="featured-empty">

                <i class="bx bx-news"></i>

                <h3>
                    Featured stories unavailable
                </h3>

                <p>
                    We couldn't load featured
                    articles right now.
                </p>

            </div>
        `;

        return;
    }


    const featuredArticles =
        articles
            .filter(
                article =>
                    article &&
                    article.title
            )
            .slice(0, 3);


    if(
        featuredArticles.length === 0
    ){

        featuredContainer.innerHTML = `

            <div class="featured-empty">

                <i class="bx bx-news"></i>

                <h3>
                    Featured stories unavailable
                </h3>

                <p>
                    No featured articles are available.
                </p>

            </div>
        `;

        return;
    }


    featuredContainer.innerHTML =
        featuredArticles
            .map(
                (article, index) => {

                    const image =
                        article.urlToImage ||
                        "./assets/images/no-image.png";


                    const category =
                        article.category ||
                        "Featured";


                    const title =
                        article.title ||
                        "Untitled Article";


                    return `

                        <article
                            class="featured-card ${
                                index === 0
                                    ? "large"
                                    : ""
                            }"
                        >

                            <img
                                src="${image}"
                                alt="${title}"
                                loading="lazy"
                                onerror="
                                    this.src='./assets/images/no-image.png'
                                "
                            >


                            <div
                                class="featured-overlay"
                            >

                                <span>
                                    ${
                                        index === 0
                                            ? "Editor's Pick"
                                            : category
                                    }
                                </span>


                                <h3>
                                    ${title}
                                </h3>


                                <a
                                    href="#"
                                    class="featured-read-more"
                                    data-index="${index}"
                                >
                                    Read More
                                </a>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");


    featuredContainer
        .querySelectorAll(
            ".featured-read-more"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        const index =
                            Number(
                                button.dataset.index
                            );


                        const article =
                            featuredArticles[index];


                        if(!article){

                            console.error(
                                "Featured article not found."
                            );

                            return;
                        }


                        localStorage.setItem(
                            "selectedArticle",
                            JSON.stringify(
                                article
                            )
                        );


                        window.location.href =
                            "news-details.html";
                    }
                );
            }
        );
}


// =====================================================
//              ENTERTAINMENT NEWS
// =====================================================

function displayEntertainmentNews(
    articles
){

    if(!entertainmentNews){
        return;
    }


    entertainmentNews.innerHTML =
        "";


    articles.forEach(
        article => {

            entertainmentNews.innerHTML += `

                <article
                    class="entertainment-card"
                >

                    <img
                        src="${
                            article.urlToImage ||
                            "./assets/images/no-image.png"
                        }"
                        alt="${article.title}"
                        loading="lazy"
                    >


                    <div class="sports-content">

                        <span>
                            ${
                                article.source?.name ||
                                "Unknown Source"
                            }
                        </span>


                        <h3>
                            ${article.title}
                        </h3>


                        <p>
                            ${
                                article.description ||
                                "No description available."
                            }
                        </p>


                        <a
                            href="#"
                            class="entertainment-read-more"
                            data-url="${article.url}"
                        >
                            Read Full Story
                        </a>

                    </div>

                </article>
            `;
        }
    );


    entertainmentNews
        .querySelectorAll(
            ".entertainment-read-more"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event){

                        event.preventDefault();


                        const articleUrl =
                            this.dataset.url;


                        const article =
                            articles.find(
                                item =>
                                    item.url ===
                                    articleUrl
                            );


                        if(article){

                            openNewsDetails(
                                article,
                                "entertainment"
                            );
                        }
                    }
                );
            }
        );
}



function displayCelebrityNews(articles){

    if(!celebrityNews){
        return;
    }

    celebrityNews.innerHTML = "";

    if(!articles || articles.length === 0){
        celebrityNews.innerHTML = `
            <p class="no-news">
                No celebrity news available right now.
            </p>
        `;
        return;
    }

    articles.forEach(article => {

        const card =
            document.createElement("article");

        card.className =
            "celebrity-card";

        card.innerHTML = `

            <img
                src="${article.urlToImage || "assets/Images/placeholder.jpg"}"
                alt="${article.title || "Celebrity news"}"
                loading="lazy"
                onerror="this.src='assets/Images/placeholder.jpg'"
            >

            <div class="celebrity-content">

                <span>
                    Celebrity
                </span>

                <h3>
                    ${article.title || "Untitled article"}
                </h3>

            </div>

        `;

        card.addEventListener(
            "click",
            () => {
                openNewsDetails(
                    article,
                    "celebrity"
                );
            }
        );

        celebrityNews.appendChild(card);

    });

}



function displayMusicNews(articles){

    if(!musicNews){
        return;
    }

    musicNews.innerHTML = "";

    if(
        !articles ||
        articles.length === 0
    ){

        musicNews.innerHTML = `
            <p class="no-news">
                No music news available right now.
            </p>
        `;

        return;
    }


    articles.forEach(article => {

        const card =
            document.createElement("article");

        card.className =
            "music-card";


        card.innerHTML = `

            <img
                src="${
                    article.urlToImage ||
                    "assets/Images/placeholder.jpg"
                }"
                alt="${
                    article.title ||
                    "Music news"
                }"
                loading="lazy"
                onerror="
                    this.src='assets/Images/placeholder.jpg'
                "
            >


            <div class="music-content">

                <span>
                    Music
                </span>

                <h3>
                    ${
                        article.title ||
                        "Untitled article"
                    }
                </h3>

            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                openNewsDetails(
                    article,
                    "music"
                );

            }
        );


        musicNews.appendChild(
            card
        );

    });

}


function displayBusinessNews(articles){

    if(!businessNews){
        return;
    }

    businessNews.innerHTML = "";

    if(
        !articles ||
        articles.length === 0
    ){

        businessNews.innerHTML = `
            <p class="no-news">
                No business news available right now.
            </p>
        `;

        return;
    }


    articles.forEach(article => {

        const card =
            document.createElement("article");

        card.className =
            "business-card";


        card.innerHTML = `

            <img
                src="${
                    article.urlToImage ||
                    "assets/Images/placeholder.jpg"
                }"
                alt="${
                    article.title ||
                    "Business news"
                }"
                loading="lazy"
                onerror="
                    this.src='assets/Images/placeholder.jpg'
                "
            >


            <div class="business-content">

                <span>
                    Business
                </span>

                <h3>
                    ${
                        article.title ||
                        "Untitled article"
                    }
                </h3>

            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                openNewsDetails(
                    article,
                    "business"
                );

            }
        );


        businessNews.appendChild(
            card
        );

    });

}


function displayLifestyleNews(articles){

    if(!lifestyleNews){
        return;
    }

    lifestyleNews.innerHTML = "";

    if(
        !articles ||
        articles.length === 0
    ){

        lifestyleNews.innerHTML = `
            <p class="no-news">
                No lifestyle news available right now.
            </p>
        `;

        return;
    }


    articles.forEach(article => {

        const card =
            document.createElement("article");

        card.className =
            "lifestyle-card";


        card.innerHTML = `

            <img
                src="${
                    article.urlToImage ||
                    "assets/Images/placeholder.jpg"
                }"
                alt="${
                    article.title ||
                    "Lifestyle news"
                }"
                loading="lazy"
                onerror="
                    this.src='assets/Images/placeholder.jpg'
                "
            >


            <div class="lifestyle-content">

                <span>
                    Lifestyle
                </span>

                <h3>
                    ${
                        article.title ||
                        "Untitled article"
                    }
                </h3>

            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                openNewsDetails(
                    article,
                    "lifestyle"
                );

            }
        );


        lifestyleNews.appendChild(
            card
        );

    });

}





// ==========================================
//              VIDEO NEWS
// ==========================================

const videoNews =
    document.getElementById("video-news");

if(videoNews){

    showNewsLoading(
        videoNews
    );

    fetchCategoryNews(
        VIDEO_URL,
        displayVideoNews,
        videoNews,
        "video"
    );

}


function displayVideoNews(articles){

    if(!videoNews){
        return;
    }

    videoNews.innerHTML = "";

    if(
        !articles ||
        articles.length === 0
    ){

        videoNews.innerHTML = `
            <p class="no-news">
                No videos available right now.
            </p>
        `;

        return;
    }


    articles.forEach(article => {

        const card =
            document.createElement("article");

        card.className =
            "video-card";


        card.innerHTML = `

            <div class="video-image">

                <img
                    src="${
                        article.urlToImage ||
                        "assets/Images/placeholder.jpg"
                    }"
                    alt="${
                        article.title ||
                        "Video news"
                    }"
                    loading="lazy"
                    onerror="
                        this.src='assets/Images/placeholder.jpg'
                    "
                >

                <div class="video-play">
                    <span>▶</span>
                </div>
                

            </div>


            <div class="video-content">

    <span>
        ▶ YouTube
    </span>

    <h3>
        ${
            article.title ||
            "Untitled video"
        }
    </h3>

    <small>
        ${
            article.publishedAt
                ? new Date(
                    article.publishedAt
                ).toLocaleDateString(
                    "en-US",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                )
                : ""
        }
    </small>

</div>
        `;


        card.addEventListener(
            "click",
            () => {

               openVideoPlayer(article);
            }
        );


        videoNews.appendChild(
            card
        );

    });

}




// ==========================================
//          YOUTUBE VIDEO PLAYER
// ==========================================

function getYouTubeVideoId(url){

    if(!url){
        return "";
    }

    const match =
        url.match(
            /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/]+)/
        );

    return match
        ? match[1]
        : "";

}


function openVideoPlayer(article){

    const videoModal =
        document.getElementById(
            "video-modal"
        );

    const videoIframe =
        document.getElementById(
            "video-iframe"
        );

    const videoTitle =
        document.getElementById(
            "video-modal-title"
        );

    const videoYouTubeLink =
        document.getElementById(
            "video-youtube-link"
        );


    if(
        !videoModal ||
        !videoIframe
    ){
        return;
    }


    const videoId =
        getYouTubeVideoId(
            article.url
        );


    if(!videoId){
        return;
    }


   videoIframe.src =
    `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0`;


    if(videoTitle){

        videoTitle.textContent =
            article.title ||
            "TrendSphere Video";

    }
    if(videoYouTubeLink){

    videoYouTubeLink.href =
        article.url || "#";

    }


    videoModal.classList.add(
        "active"
    );


    videoModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}









// ==========================================
//          CLOSE VIDEO PLAYER
// ==========================================

const videoModal =
    document.getElementById(
        "video-modal"
    );

const videoModalClose =
    document.getElementById(
        "video-modal-close"
    );

const videoModalOverlay =
    document.querySelector(
        ".video-modal-overlay"
    );

const videoIframe =
    document.getElementById(
        "video-iframe"
    );


function closeVideoPlayer(){

    if(!videoModal){
        return;
    }


    videoModal.classList.remove(
        "active"
    );


    videoModal.setAttribute(
        "aria-hidden",
        "true"
    );


    if(videoIframe){

        videoIframe.src = "";

    }


    document.body.style.overflow =
        "";

}


// ==========================================
//          CLOSE BUTTON
// ==========================================

if(videoModalClose){

    videoModalClose.addEventListener(
        "click",
        closeVideoPlayer
    );

}


// ==========================================
//          CLICK OUTSIDE
// ==========================================

if(videoModalOverlay){

    videoModalOverlay.addEventListener(
        "click",
        closeVideoPlayer
    );

}


// ==========================================
//          ESCAPE KEY
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            videoModal &&
            videoModal.classList.contains(
                "active"
            )
        ){

            closeVideoPlayer();

        }

    }
);




// =====================================================
//              INITIAL NEWS LOAD
// =====================================================

fetchTrendingNews();


// =====================================================
//              ADVERTISEMENT SYSTEM
// =====================================================

function initializeAdvertisements(){

    const adContainers =
        document.querySelectorAll(
            "[data-ad-slot]"
        );


    if(!adContainers.length){

        console.log(
            "No advertisement slots found."
        );

        return;
    }


    adContainers.forEach(
        adContainer => {

            const adSlot =
                adContainer.dataset.adSlot;


            console.log(
                "Advertisement slot ready:",
                adSlot
            );


            adContainer.classList.add(
                "ad-slot-ready"
            );


            adContainer.setAttribute(
                "data-ad-status",
                "available"
            );
        }
    );
}


// =====================================================
//          INITIALIZE ADVERTISEMENTS
// =====================================================

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        initializeAdvertisements
    );

}
else{

    initializeAdvertisements();
}

