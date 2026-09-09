//===============================================
//              NEWS DETAILS
//              TrendSphere Media
//===============================================


//===============================================
//              SELECTED ARTICLE
//===============================================

const article =
    JSON.parse(
        localStorage.getItem("selectedArticle")
    );


console.log(
    "Selected article:",
    article
);

updateArticleSEO(article);

//===============================================
//          SUPABASE AVAILABILITY
//===============================================

function isSupabaseReady(){

    return (
        typeof supabaseClient !== "undefined" &&
        supabaseClient &&
        supabaseClient.auth
    );

}


//===============================================
//          GET CURRENT USER
//===============================================

async function getCurrentUser(){

    if(!isSupabaseReady()){

        console.error(
            "Supabase client is not available."
        );

        return null;
    }


    try{

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if(error){

            console.error(
                "Unable to get Supabase session:",
                error
            );

            return null;
        }


        return data?.session?.user || null;

    }
    catch(error){

        console.error(
            "Get current user error:",
            error
        );

        return null;
    }

}


//===============================================
//          GET ARTICLE CATEGORY
//===============================================

function getArticleCategory(article){

    if(!article){

        return "general";
    }


    if(article.category){

        return article.category.toLowerCase();
    }


    if(window.currentCategory){

        return window.currentCategory.toLowerCase();
    }


    return "general";

}


//===============================================
//          DISPLAY ARTICLE
//===============================================

if(!article){

    console.error(
        "No article was found."
    );

}
else{

    const detailsImage =
        document.getElementById(
            "details-image"
        );


    const detailsSource =
        document.getElementById(
            "details-source"
        );


    const detailsTitle =
        document.getElementById(
            "details-title"
        );


    const detailsAuthor =
        document.getElementById(
            "details-author"
        );


    const detailsDate =
        document.getElementById(
            "details-date"
        );


    const detailsDescription =
        document.getElementById(
            "details-description"
        );


    const detailsContent =
        document.getElementById(
            "details-content-text"
        );


    const detailsLink =
        document.getElementById(
            "details-link"
        );


    if(detailsImage){

        detailsImage.src =
            article.urlToImage ||
            "./assets/Images/no-image.png";


        detailsImage.onerror =
            () => {

                detailsImage.src =
                    "./assets/Images/no-image.png";

            };

    }


    if(detailsSource){

        detailsSource.textContent =
            article.source?.name ||
            "Unknown Source";

    }


    if(detailsTitle){

        detailsTitle.textContent =
            article.title ||
            "No title available";

    }


    if(detailsAuthor){

        detailsAuthor.textContent =
            `Author: ${
                article.author ||
                "Unknown Author"
            }`;

    }


    if(detailsDate){

        detailsDate.textContent =
            article.publishedAt
                ? new Date(
                    article.publishedAt
                ).toLocaleDateString()
                : "Date Unavailable";

    }


    if(detailsDescription){

        detailsDescription.textContent =
            article.description ||
            "No description available.";

    }


    if(detailsContent){

        detailsContent.textContent =
            article.content ||
            "The full article is available from the original source.";

    }


    if(detailsLink){

        detailsLink.href =
            article.url ||
            "#";

    }

}


//===============================================
//          READING HISTORY SYSTEM
//          LOGGED-IN USERS ONLY
//===============================================

async function addToReadingHistory(article){

    if(
        !article ||
        !article.url
    ){

        return;
    }


    //===========================================
    //          CHECK LOGIN
    //===========================================

    const user =
        await getCurrentUser();


    // Guests do not get reading history
    if(!user){

        return;
    }


    //===========================================
    //          PREPARE ARTICLE
    //===========================================

    const category =
        getArticleCategory(
            article
        );


    const articleData = {

        ...article,

        category:
            category

    };


    try{

        //=======================================
        // REMOVE EXISTING COPY
        //=======================================

        await supabaseClient
            .from("reading_history")
            .delete()
            .eq(
                "user_id",
                user.id
            )
            .eq(
                "article_url",
                article.url
            );


        //=======================================
        // ADD ARTICLE TO TOP OF HISTORY
        //=======================================

        const {
            error
        } =
            await supabaseClient
                .from("reading_history")
                .insert({

                    user_id:
                        user.id,

                    article_url:
                        article.url,

                    article_data:
                        articleData,

                    read_at:
                        new Date().toISOString()

                });


        if(error){

            console.error(
                "Unable to save reading history:",
                error
            );

            return;
        }

    }
    catch(error){

        console.error(
            "Reading history error:",
            error
        );

    }

}


//===============================================
//          RECORD CURRENT ARTICLE
//===============================================

if(article){

    addToReadingHistory(
        article
    );

}


//===============================================
//          OPEN NEWS DETAILS
//===============================================

function openNewsDetails(article){

    if(!article){

        return;
    }


    localStorage.setItem(
        "selectedArticle",
        JSON.stringify(article)
    );


    window.location.href =
        "news-details.html";

}


//===============================================
//              SAVE ARTICLE SYSTEM
//              SUPABASE VERSION
//===============================================

const saveArticle =
    document.getElementById(
        "save-article"
    );


//===============================================
//          CHECK IF ARTICLE IS SAVED
//===============================================

async function isArticleSaved(){

    if(
        !article ||
        !article.url ||
        !isSupabaseReady()
    ){

        return false;
    }


    const user =
        await getCurrentUser();


    if(!user){

        return false;
    }


    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from("saved_articles")
                .select("id")
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "article_url",
                    article.url
                )
                .maybeSingle();


        if(error){

            console.error(
                "Check saved article error:",
                error
            );

            return false;
        }


        return !!data;

    }
    catch(error){

        console.error(
            "Saved article check failed:",
            error
        );

        return false;
    }

}


//===============================================
//          UPDATE SAVE BUTTON
//===============================================

async function updateSaveButton(){

    if(
        !saveArticle ||
        !article
    ){

        return;
    }


    if(!isSupabaseReady()){

        return;
    }


    const user =
        await getCurrentUser();


    //===========================================
    //          GUEST USER
    //===========================================

    if(!user){

        saveArticle.classList.remove(
            "saved"
        );


        saveArticle.setAttribute(
            "aria-label",
            "Login to save article"
        );


        saveArticle.innerHTML = `
            <i class="bx bx-bookmark"></i>
            Save Article
        `;


        return;
    }


    //===========================================
    //          CHECK SAVED STATUS
    //===========================================

    const isSaved =
        await isArticleSaved();


    if(isSaved){

        saveArticle.classList.add(
            "saved"
        );


        saveArticle.setAttribute(
            "aria-label",
            "Remove saved article"
        );


        saveArticle.innerHTML = `
            <i class="bx bxs-bookmark"></i>
            Saved
        `;

    }
    else{

        saveArticle.classList.remove(
            "saved"
        );


        saveArticle.setAttribute(
            "aria-label",
            "Save article"
        );


        saveArticle.innerHTML = `
            <i class="bx bx-bookmark"></i>
            Save Article
        `;

    }

}


//===============================================
//          SAVE ARTICLE TO SUPABASE
//===============================================

async function saveArticleToSupabase(){

    if(
        !article ||
        !article.url ||
        !isSupabaseReady()
    ){

        return;
    }


    const user =
        await getCurrentUser();


    if(!user){

        alert(
            "Please log in to save articles to your account."
        );

        return;
    }


    const category =
        getArticleCategory(
            article
        );


    const articleToSave = {

        user_id:
            user.id,

        article_url:
            article.url,

        title:
            article.title ||
            null,

        description:
            article.description ||
            null,

        content:
            article.content ||
            null,

        image_url:
            article.urlToImage ||
            null,

        source_name:
            article.source?.name ||
            null,

        author:
            article.author ||
            null,

        published_at:
            article.publishedAt ||
            null,

        category:
            category,

        saved_at:
            new Date().toISOString()

    };


    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from("saved_articles")
                .insert(
                    articleToSave
                )
                .select()
                .single();


        if(error){

            console.error(
                "Save article error:",
                error
            );


            if(
                error.code ===
                "23505"
            ){

                alert(
                    "This article is already saved."
                );

            }
            else{

                alert(
                    "Unable to save this article. Please try again."
                );

            }


            return;
        }


        console.log(
            "Article saved successfully:",
            data
        );


        await updateSaveButton();

    }
    catch(error){

        console.error(
            "Save article failed:",
            error
        );


        alert(
            "Something went wrong while saving the article."
        );

    }

}


//===============================================
//          REMOVE ARTICLE FROM SUPABASE
//===============================================

async function removeArticleFromSupabase(){

    if(
        !article ||
        !article.url ||
        !isSupabaseReady()
    ){

        return;
    }


    const user =
        await getCurrentUser();


    if(!user){

        return;
    }


    try{

        const {
            error
        } =
            await supabaseClient
                .from("saved_articles")
                .delete()
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "article_url",
                    article.url
                );


        if(error){

            console.error(
                "Remove saved article error:",
                error
            );


            alert(
                "Unable to remove this article."
            );


            return;
        }


        await updateSaveButton();

    }
    catch(error){

        console.error(
            "Remove article failed:",
            error
        );

    }

}


//===============================================
//          SAVE / UNSAVE BUTTON
//===============================================

if(
    saveArticle &&
    article
){

    updateSaveButton();


    saveArticle.addEventListener(
        "click",
        async () => {

            if(
                saveArticle.disabled
            ){

                return;
            }


            saveArticle.disabled =
                true;


            try{

                const user =
                    await getCurrentUser();


                //=================================
                //          GUEST
                //=================================

                if(!user){

                    alert(
                        "Please log in to save articles to your account."
                    );


                    window.location.href =
                        "login.html";


                    return;
                }


                //=================================
                //          CHECK STATUS
                //=================================

                const isSaved =
                    await isArticleSaved();


                if(isSaved){

                    await removeArticleFromSupabase();

                }
                else{

                    await saveArticleToSupabase();

                }

            }
            catch(error){

                console.error(
                    "Save button error:",
                    error
                );

            }
            finally{

                saveArticle.disabled =
                    false;

            }

        }
    );

}


//===============================================
//          AUTH STATE LISTENER
//===============================================

if(
    isSupabaseReady()
){

    supabaseClient.auth.onAuthStateChange(
        (
            event,
            session
        ) => {

            console.log(
                "Supabase auth state:",
                event
            );


            setTimeout(
                () => {

                    updateSaveButton();

                },
                0
            );

        }
    );

}






//===============================================
//              RELATED NEWS
//              TrendSphere Media
//              RSS VERSION
//===============================================


//===============================================
//          RELATED NEWS ELEMENTS
//===============================================

const relatedContainer =
    document.getElementById(
        "related-news-container"
    );


const loadMoreRelated =
    document.getElementById(
        "load-more-related"
    );


//===============================================
//          RELATED NEWS SETTINGS
//===============================================

const RELATED_PER_LOAD = 6;

let relatedArticles = [];

let relatedDisplayed = 0;


//===============================================
//          RSS SERVER
//===============================================

const RELATED_RSS_SERVER =
    "https://trendsphere-rss.onrender.com";


//===============================================
//          RSS CATEGORY URLS
//===============================================

const RELATED_RSS_CATEGORIES = {

    general:
        `${RELATED_RSS_SERVER}/rss/general`,

    technology:
        `${RELATED_RSS_SERVER}/rss/technology`,

    business:
        `${RELATED_RSS_SERVER}/rss/business`,

    sports:
        `${RELATED_RSS_SERVER}/rss/sports`,

    entertainment:
        `${RELATED_RSS_SERVER}/rss/entertainment`,

    celebrity:
        `${RELATED_RSS_SERVER}/rss/celebrity`,

    music:
        `${RELATED_RSS_SERVER}/rss/music`,

    lifestyle:
        `${RELATED_RSS_SERVER}/rss/lifestyle`,

    video:
        `${RELATED_RSS_SERVER}/rss/video`

};


//===============================================
//          RELATED NEWS CACHE
//===============================================

const RELATED_CACHE_TIME =
    5 * 60 * 1000;


const relatedCache =
    new Map();


//===============================================
//          FETCH RSS DATA
//===============================================

async function fetchRelatedRSS(url){

    if(!url){

        return {
            articles: []
        };

    }


    const cached =
        relatedCache.get(url);


    if(
        cached &&
        Date.now() - cached.time <
        RELATED_CACHE_TIME
    ){

        return cached.data;

    }


    try{

        const response =
            await fetch(url);


        if(!response.ok){

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        relatedCache.set(
            url,
            {
                time:
                    Date.now(),

                data:
                    data
            }
        );


        return data;

    }
    catch(error){

        console.error(
            "Related RSS fetch error:",
            error
        );


        return {
            articles: []
        };

    }

}


//===============================================
//          NORMALIZE ARTICLE
//===============================================

function normalizeRelatedArticle(
    article,
    category
){

    if(!article){

        return null;

    }


    return {

        ...article,

        category:
            article.category ||
            category,

        url:
            article.url ||
            article.link ||
            "",

        urlToImage:
            article.urlToImage ||
            article.image ||
            article.image_url ||
            "",

        publishedAt:
            article.publishedAt ||
            article.pubDate ||
            article.published ||
            "",

        source:
            article.source ||
            {
                name:
                    article.source_name ||
                    category
            }

    };

}


//===============================================
//          GET CURRENT CATEGORY
//===============================================

function getRelatedCategory(){

    if(!article){

        return "general";

    }


    const category =
        (
            article.category ||
            "general"
        )
        .toString()
        .toLowerCase()
        .trim();


    if(
        RELATED_RSS_CATEGORIES[
            category
        ]
    ){

        return category;

    }


    return "general";

}


//===============================================
//          ARTICLE KEYWORDS
//===============================================

function getArticleKeywords(article){

    if(!article){

        return [];

    }


    const text = `

        ${article.title || ""}

        ${article.description || ""}

    `;


    const stopWords = new Set([

        "the",
        "and",
        "for",
        "with",
        "that",
        "this",
        "from",
        "have",
        "has",
        "will",
        "are",
        "was",
        "were",
        "been",
        "into",
        "about",
        "after",
        "before",
        "over",
        "under",
        "than",
        "their",
        "they",
        "them",
        "your",
        "you",
        "its",
        "his",
        "her",
        "how",
        "what",
        "when",
        "where",
        "who",
        "why",
        "news",
        "latest"

    ]);


    return text
        .toLowerCase()
        .replace(
            /[^a-z0-9\s]/g,
            " "
        )
        .split(/\s+/)
        .filter(
            word =>
                word.length >= 4 &&
                !stopWords.has(word)
        );

}


//===============================================
//          RELATED ARTICLE SCORE
//===============================================

function calculateRelatedScore(
    item,
    currentArticle,
    currentCategory,
    keywords
){

    let score = 0;


    const itemCategory =
        (
            item.category ||
            ""
        )
        .toString()
        .toLowerCase();


    // Same category
    if(
        itemCategory ===
        currentCategory
    ){

        score += 50;

    }


    const itemText = `

        ${item.title || ""}

        ${item.description || ""}

    `
        .toLowerCase();


    // Keyword matching
    keywords.forEach(
        keyword => {

            if(
                itemText.includes(
                    keyword
                )
            ){

                score += 5;

            }

        }
    );


    // Same source
    const currentSource =
        (
            currentArticle
                ?.source
                ?.name ||
            currentArticle
                ?.source ||
            ""
        )
        .toString()
        .toLowerCase();


    const itemSource =
        (
            item
                ?.source
                ?.name ||
            item
                ?.source ||
            ""
        )
        .toString()
        .toLowerCase();


    if(
        currentSource &&
        itemSource &&
        currentSource ===
        itemSource
    ){

        score += 10;

    }


    // Newer articles get a small boost
    const publishedTime =
        new Date(
            item.publishedAt ||
            item.pubDate ||
            0
        ).getTime();


    if(
        !Number.isNaN(
            publishedTime
        )
    ){

        const age =
            Date.now() -
            publishedTime;


        const day =
            24 * 60 * 60 * 1000;


        if(age < day){

            score += 5;

        }

    }


    return score;

}


//===============================================
//          FETCH RELATED NEWS
//===============================================

async function fetchRelatedNews(){

    if(!article){

        console.warn(
            "No selected article found for related news."
        );

        return;

    }


    if(!relatedContainer){

        return;

    }


    //===========================================
    //          LOADING STATE
    //===========================================

    relatedContainer.innerHTML = `

        <div class="related-loading">

            <i class="bx bx-loader-alt bx-spin"></i>

            <span>
                Loading related news...
            </span>

        </div>

    `;


    if(loadMoreRelated){

        loadMoreRelated.style.display =
            "none";

    }


    try{

        const currentCategory =
            getRelatedCategory();


        const currentUrl =
            article.url ||
            article.link ||
            "";


        const keywords =
            getArticleKeywords(
                article
            );


        //=======================================
        //          FETCH ALL RSS CATEGORIES
        //=======================================

        const categoryEntries =
            Object.entries(
                RELATED_RSS_CATEGORIES
            );


        const results =
            await Promise.all(

                categoryEntries.map(
                    async ([category, url]) => {

                        const data =
                            await fetchRelatedRSS(
                                url
                            );


                        if(
                            !data ||
                            !Array.isArray(
                                data.articles
                            )
                        ){

                            return [];

                        }


                        return data.articles.map(
                            item =>
                                normalizeRelatedArticle(
                                    item,
                                    category
                                )
                        );

                    }
                )

            );


        //=======================================
        //          COMBINE ARTICLES
        //=======================================

        let allArticles =
            results
                .flat()
                .filter(
                    item =>
                        item &&
                        item.url
                );


        //=======================================
        //          REMOVE CURRENT ARTICLE
        //=======================================

        allArticles =
            allArticles.filter(
                item =>
                    item.url !==
                    currentUrl
            );


        //=======================================
        //          REMOVE DUPLICATES
        //=======================================

        const uniqueArticles =
            new Map();


        allArticles.forEach(
            item => {

                const key =
                    item.url ||
                    item.title;


                if(
                    key &&
                    !uniqueArticles.has(
                        key
                    )
                ){

                    uniqueArticles.set(
                        key,
                        item
                    );

                }

            }
        );


        allArticles =
            Array.from(
                uniqueArticles.values()
            );


        //=======================================
        //          SCORE ARTICLES
        //=======================================

        allArticles =
            allArticles.map(
                item => ({

                    ...item,

                    relatedScore:
                        calculateRelatedScore(
                            item,
                            article,
                            currentCategory,
                            keywords
                        )

                })
            );


        //=======================================
        //          SORT RELATED NEWS
        //=======================================

        allArticles.sort(
            (a, b) => {

                if(
                    b.relatedScore !==
                    a.relatedScore
                ){

                    return (
                        b.relatedScore -
                        a.relatedScore
                    );

                }


                const dateA =
                    new Date(
                        a.publishedAt ||
                        a.pubDate ||
                        0
                    ).getTime();


                const dateB =
                    new Date(
                        b.publishedAt ||
                        b.pubDate ||
                        0
                    ).getTime();


                return dateB - dateA;

            }
        );


        //=======================================
        //          SAVE RESULTS
        //=======================================

        relatedArticles =
            allArticles;


        relatedDisplayed =
            0;


        //=======================================
        //          NO RESULTS
        //=======================================

        if(
            relatedArticles.length === 0
        ){

            relatedContainer.innerHTML = `

                <div class="related-empty">

                    <i class="bx bx-news"></i>

                    <p>
                        No related news available.
                    </p>

                    <span>
                        Check back later for more stories.
                    </span>

                </div>

            `;


            return;

        }


        //=======================================
        //          DISPLAY FIRST 6
        //=======================================

        displayMoreRelatedNews();

    }
    catch(error){

        console.error(
            "Fetch Related News Error:",
            error
        );


        relatedContainer.innerHTML = `

            <div class="related-empty">

                <i class="bx bx-error-circle"></i>

                <p>
                    Unable to load related news.
                </p>

                <span>
                    Please try again later.
                </span>

            </div>

        `;

    }

}


//===============================================
//          DISPLAY MORE RELATED NEWS
//===============================================

function displayMoreRelatedNews(){

    if(!relatedContainer){

        return;

    }


    const nextArticles =
        relatedArticles.slice(

            relatedDisplayed,

            relatedDisplayed +
            RELATED_PER_LOAD

        );


    if(
        nextArticles.length === 0
    ){

        if(loadMoreRelated){

            loadMoreRelated.style.display =
                "none";

        }

        return;

    }


    //===========================================
    //          CREATE ARTICLE CARDS
    //===========================================

    nextArticles.forEach(
        item => {

            const articleIndex =
                relatedArticles.indexOf(
                    item
                );


            const image =
                item.urlToImage ||
                "./assets/Images/no-image.png";


            const source =
                item.source?.name ||
                item.source ||
                "News";


            const title =
                item.title ||
                "Untitled Article";


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "related-card";


            card.innerHTML = `

                <img
                    src="${image}"
                    alt="${title}"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='./assets/Images/no-image.png';
                    "
                >

                <div class="related-content">

                    <span>
                        ${source}
                    </span>

                    <h3>
                        ${title}
                    </h3>

                    <a
                        href="#"
                        class="related-read-more"
                        data-index="${articleIndex}"
                    >
                        Read More
                    </a>

                </div>

            `;


            relatedContainer.appendChild(
                card
            );

        }
    );


    relatedDisplayed +=
        nextArticles.length;


    //===========================================
    //          READ MORE BUTTONS
    //===========================================

    relatedContainer
        .querySelectorAll(
            ".related-read-more"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event){

                        event.preventDefault();


                        const index =
                            Number(
                                this.dataset.index
                            );


                        const selectedArticle =
                            relatedArticles[
                                index
                            ];


                        if(!selectedArticle){

                            return;

                        }


                        openNewsDetails(
                            selectedArticle
                        );

                    }
                );

            }
        );


    //===========================================
    //          UPDATE LOAD MORE
    //===========================================

    if(!loadMoreRelated){

        return;

    }


    if(
        relatedDisplayed >=
        relatedArticles.length
    ){

        loadMoreRelated.style.display =
            "none";

    }
    else{

        loadMoreRelated.style.display =
            "block";

    }

}


//===============================================
//          LOAD MORE RELATED NEWS BUTTON
//===============================================

if(loadMoreRelated){

    loadMoreRelated.addEventListener(
        "click",
        () => {

            displayMoreRelatedNews();

        }
    );

}


//===============================================
//          START RELATED NEWS
//===============================================

fetchRelatedNews();
















//===============================================
//              SHARE MENU
//===============================================

const shareArticle =
    document.getElementById(
        "share-article"
    );


const shareMenu =
    document.getElementById(
        "share-menu"
    );


if(
    shareArticle &&
    shareMenu
){

    shareArticle.addEventListener(
        "click",
        () => {

            shareMenu.classList.toggle(
                "show"
            );

        }
    );

}


//===============================================
//              READING TIME
//===============================================

function calculateReadingTime(article){

    const readingTime =
        document.getElementById(
            "reading-time"
        );


    if(
        !readingTime ||
        !article
    ){

        return;
    }


    const text = `

        ${article.title || ""}

        ${article.description || ""}

        ${article.content || ""}

    `;


    const words =
        text.trim()
            .split(/\s+/)
            .length;


    const wordsPerMinute =
        200;


    const minutes =
        Math.max(
            1,
            Math.ceil(
                words /
                wordsPerMinute
            )
        );


    readingTime.innerHTML = `

        <i class="bx bx-time-five"></i>

        <span>
            ${minutes} min read
        </span>

    `;

}


calculateReadingTime(
    article
);


//===============================================
//              WHATSAPP SHARE
//===============================================

const shareWhatsapp =
    document.getElementById(
        "share-whatsapp"
    );


if(shareWhatsapp){

    shareWhatsapp.addEventListener(
        "click",
        () => {

            const article =
                JSON.parse(
                    localStorage.getItem(
                        "selectedArticle"
                    )
                );


            if(!article){

                return;
            }


            const title =
                article.title ||
                "TrendSphere Media";


            const url =
                window.location.href;


            const message =
                `${title}\n\nRead more on TrendSphere Media:\n${url}`;


            const whatsappUrl =
                `https://wa.me/?text=${encodeURIComponent(message)}`;


            window.open(
                whatsappUrl,
                "_blank"
            );

        }
    );

}


//===============================================
//              FACEBOOK SHARE
//===============================================

const shareFacebook =
    document.getElementById(
        "share-facebook"
    );


if(shareFacebook){

    shareFacebook.addEventListener(
        "click",
        () => {

            const article =
                JSON.parse(
                    localStorage.getItem(
                        "selectedArticle"
                    )
                );


            if(!article){

                return;
            }


            const articleUrl =
                encodeURIComponent(
                    window.location.href
                );


            const facebookUrl =
                `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`;


            window.open(
                facebookUrl,
                "_blank",
                "width=600,height=500"
            );

        }
    );

}


//===============================================
//              X SHARE
//===============================================

const shareX =
    document.getElementById(
        "share-x"
    );


if(shareX){

    shareX.addEventListener(
        "click",
        () => {

            const article =
                JSON.parse(
                    localStorage.getItem(
                        "selectedArticle"
                    )
                );


            if(!article){

                return;
            }


            const title =
                article.title ||
                "TrendSphere Media";


            const articleUrl =
                encodeURIComponent(
                    window.location.href
                );


            const text =
                encodeURIComponent(
                    `${title} - Read more on TrendSphere Media`
                );


            const xUrl =
                `https://twitter.com/intent/tweet?text=${text}&url=${articleUrl}`;


            window.open(
                xUrl,
                "_blank",
                "width=600,height=500"
            );

        }
    );

}


//===============================================
//              TELEGRAM SHARE
//===============================================

const shareTelegram =
    document.getElementById(
        "share-telegram"
    );


if(shareTelegram){

    shareTelegram.addEventListener(
        "click",
        () => {

            const article =
                JSON.parse(
                    localStorage.getItem(
                        "selectedArticle"
                    )
                );


            if(!article){

                return;
            }


            const title =
                article.title ||
                "TrendSphere Media";


            const articleUrl =
                encodeURIComponent(
                    window.location.href
                );


            const text =
                encodeURIComponent(
                    `${title}\n\nRead more on TrendSphere Media`
                );


            const telegramUrl =
                `https://t.me/share/url?url=${articleUrl}&text=${text}`;


            window.open(
                telegramUrl,
                "_blank"
            );

        }
    );

}


//===============================================
//              INSTAGRAM SHARE
//===============================================

const shareInstagram =
    document.getElementById(
        "share-instagram"
    );


if(shareInstagram){

    shareInstagram.addEventListener(
        "click",
        async () => {

            const article =
                JSON.parse(
                    localStorage.getItem(
                        "selectedArticle"
                    )
                );


            if(!article){

                return;
            }


            const articleUrl =
                window.location.href;


            const title =
                article.title ||
                "TrendSphere Media";


            if(navigator.share){

                try{

                    await navigator.share({

                        title:
                            title,

                        text:
                            "Read this article on TrendSphere Media",

                        url:
                            articleUrl

                    });

                }
                catch(error){

                    if(
                        error.name !==
                        "AbortError"
                    ){

                        console.error(
                            "Instagram share error:",
                            error
                        );

                    }

                }

            }
            else{

                try{

                    await navigator.clipboard.writeText(
                        articleUrl
                    );


                    alert(
                        "Article link copied. You can paste it into Instagram."
                    );

                }
                catch(error){

                    console.error(
                        "Unable to copy article link:",
                        error
                    );

                }

            }

        }
    );

}









//===============================================
//          DYNAMIC ARTICLE SEO
//===============================================

function updateArticleSEO(article){

    if(!article){

        return;

    }


    const title =
        article.title ||
        "TrendSphere Media";


    const description =
        article.description ||
        "Read the latest news and stories on TrendSphere Media.";


    const image =
        article.urlToImage ||
        "assets/Images/Logos/TrendSphere Media Logo logo.png";


    //===========================================
    //          ARTICLE URL
    //===========================================

    const articleUrl =
        window.location.href;


    //===========================================
    //          BROWSER TITLE
    //===========================================

    document.title =
        `${title} | TrendSphere Media`;


    //===========================================
    //          DESCRIPTION
    //===========================================

    const descriptionTag =
        document.getElementById(
            "seo-description"
        );


    if(descriptionTag){

        descriptionTag.setAttribute(
            "content",
            description
        );

    }


    //===========================================
    //          CANONICAL URL
    //===========================================

    const canonical =
        document.getElementById(
            "seo-canonical"
        );


    if(canonical){

        canonical.setAttribute(
            "href",
            articleUrl
        );

    }


    //===========================================
    //          OPEN GRAPH
    //===========================================

    const ogTitle =
        document.getElementById(
            "og-title"
        );

    const ogDescription =
        document.getElementById(
            "og-description"
        );

    const ogImage =
        document.getElementById(
            "og-image"
        );

    const ogUrl =
        document.getElementById(
            "og-url"
        );


    if(ogTitle){

        ogTitle.setAttribute(
            "content",
            title
        );

    }


    if(ogDescription){

        ogDescription.setAttribute(
            "content",
            description
        );

    }


    if(ogImage){

        ogImage.setAttribute(
            "content",
            image
        );

    }


    if(ogUrl){

        ogUrl.setAttribute(
            "content",
            articleUrl
        );

    }


    //===========================================
    //          TWITTER / X
    //===========================================

    const twitterTitle =
        document.getElementById(
            "twitter-title"
        );

    const twitterDescription =
        document.getElementById(
            "twitter-description"
        );

    const twitterImage =
        document.getElementById(
            "twitter-image"
        );


    if(twitterTitle){

        twitterTitle.setAttribute(
            "content",
            title
        );

    }


    if(twitterDescription){

        twitterDescription.setAttribute(
            "content",
            description
        );

    }


    if(twitterImage){

        twitterImage.setAttribute(
            "content",
            image
        );

    }


    //===========================================
    //          STRUCTURED DATA
    //===========================================

    const oldSchema =
        document.getElementById(
            "article-schema"
        );


    if(oldSchema){

        oldSchema.remove();

    }


    const schema =
        document.createElement(
            "script"
        );


    schema.type =
        "application/ld+json";


    schema.id =
        "article-schema";


    schema.textContent =
        JSON.stringify({

            "@context":
                "https://schema.org",

            "@type":
                "NewsArticle",

            "headline":
                title,

            "description":
                description,

            "image":
                [image],

            "url":
                articleUrl,

            "datePublished":
                article.publishedAt ||
                "",

            "author": {

                "@type":
                    "Person",

                "name":
                    article.author ||
                    "TrendSphere Media"

            },

            "publisher": {

                "@type":
                    "Organization",

                "name":
                    "TrendSphere Media"

            }

        });


    document.head.appendChild(
        schema
    );

}








//===============================================
//              COPY ARTICLE LINK
//===============================================

const copyArticleLink =
    document.getElementById(
        "copy-article-link"
    );


const copyToast =
    document.getElementById(
        "copy-toast"
    );


if(copyArticleLink){

    copyArticleLink.addEventListener(
        "click",
        async () => {

            try{

                await navigator.clipboard.writeText(
                    window.location.href
                );


                if(copyToast){

                    copyToast.classList.add(
                        "show"
                    );


                    setTimeout(
                        () => {

                            copyToast.classList.remove(
                                "show"
                            );

                        },
                        2500
                    );

                }

            }
            catch(error){

                console.error(
                    "Unable to copy link:",
                    error
                );

            }

        }
    );

}


//===============================================
//              DARK MODE
//===============================================

const savedTheme =
    localStorage.getItem(
        "theme"
    );


if(
    savedTheme ===
    "dark"
){

    document.body.classList.add(
        "dark-mode"
    );

}




































//==================================================
//              ARTICLE COMMENTS
//              TrendSphere Media
//==================================================


//==================================================
//              COMMENT ELEMENTS
//==================================================

const commentNameInput =
    document.getElementById("comment-name");

const commentTextInput =
    document.getElementById("comment-text");

const submitCommentButton =
    document.getElementById("submit-comment");

const commentMessage =
    document.getElementById("comment-message");

const commentsContainer =
    document.getElementById("comments-container");

const commentsCount =
    document.getElementById("comments-count");

const commentsEmpty =
    document.getElementById("comments-empty");


//==================================================
//              LOAD COMMENTS
//==================================================

async function loadArticleComments(){

    if(!article || !article.url){

        console.warn(
            "⚠️ Cannot load comments: article URL is missing."
        );

        return;
    }

    try{

        const { data, error } =
            await supabaseClient
                .from("article_comments")
                .select("*")
                .eq("article_url", article.url)
                .order("created_at", {
                    ascending: false
                });

        if(error){

            console.error(
                "❌ Unable to load comments:",
                error
            );

            return;
        }

        displayArticleComments(data || []);

    }
    catch(error){

        console.error(
            "❌ Comments loading error:",
            error
        );

    }

}


//==================================================
//          DISPLAY ARTICLE COMMENTS
//==================================================

function displayArticleComments(comments){

    if(!commentsContainer){

        return;
    }


    commentsContainer.innerHTML = "";


    if(commentsCount){

        commentsCount.textContent =
            comments.length;

    }


    if(comments.length === 0){

        if(commentsEmpty){

            commentsEmpty.style.display = "block";

        }

        return;

    }


    if(commentsEmpty){

        commentsEmpty.style.display = "none";

    }


    comments.forEach(comment => {

        const commentElement =
            document.createElement("div");

        commentElement.className =
            "comment-item";


        const date =
            new Date(
                comment.created_at
            );


        const formattedDate =
            date.toLocaleString();


        commentElement.innerHTML = `

            <div class="comment-header">

                <strong>
                    ${escapeCommentHTML(
                        comment.author_name
                    )}
                </strong>

                <span>
                    ${formattedDate}
                </span>

            </div>


            <div class="comment-body">

                ${escapeCommentHTML(
                    comment.comment_text
                )}

            </div>

        `;


        commentsContainer.appendChild(
            commentElement
        );

    });

}


//==================================================
//          POST NEW COMMENT
//==================================================

async function postArticleComment(){

    if(!article || !article.url){

        showCommentMessage(
            "Unable to identify this article.",
            "error"
        );

        return;
    }


    const name =
        commentNameInput.value.trim();

    const text =
        commentTextInput.value.trim();


    // CHECK NAME

    if(name.length < 2){

        showCommentMessage(
            "Please enter your name.",
            "error"
        );

        return;
    }


    // CHECK COMMENT

    if(text.length < 1){

        showCommentMessage(
            "Please write a comment.",
            "error"
        );

        return;
    }


    if(text.length > 1000){

        showCommentMessage(
            "Your comment is too long.",
            "error"
        );

        return;
    }


    // DISABLE BUTTON

    submitCommentButton.disabled = true;

    submitCommentButton.innerHTML =
        `<i class="bx bx-loader-alt bx-spin"></i>
         Posting...`;


    try{

        let userId = null;


        // TRY TO GET LOGGED-IN USER

        if(isSupabaseReady()){

            const user =
                await getCurrentUser();

            if(user){

                userId = user.id;

            }

        }


        // INSERT COMMENT

        const { error } =
            await supabaseClient
                .from("article_comments")
                .insert({

                    article_url:
                        article.url,

                    user_id:
                        userId,

                    author_name:
                        name,

                    comment_text:
                        text

                });


        if(error){

            console.error(
                "❌ Unable to post comment:",
                error
            );

            showCommentMessage(
                "Unable to post your comment. Please try again.",
                "error"
            );

            return;
        }


        // CLEAR COMMENT

        commentTextInput.value = "";


        showCommentMessage(
            "Comment posted successfully!",
            "success"
        );


        // RELOAD COMMENTS

        await loadArticleComments();

    }
    catch(error){

        console.error(
            "❌ Comment posting error:",
            error
        );

        showCommentMessage(
            "Something went wrong. Please try again.",
            "error"
        );

    }
    finally{

        submitCommentButton.disabled = false;

        submitCommentButton.innerHTML =
            `<i class="bx bx-send"></i>
             Post Comment`;

    }

}


//==================================================
//          COMMENT MESSAGE
//==================================================

function showCommentMessage(message, type){

    if(!commentMessage){

        return;
    }


    commentMessage.textContent =
        message;


    commentMessage.className =
        "comment-message " + type;


    setTimeout(() => {

        commentMessage.textContent = "";

        commentMessage.className =
            "comment-message";

    }, 4000);

}


//==================================================
//          PROTECT COMMENT HTML
//==================================================

function escapeCommentHTML(text){

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


//==================================================
//          COMMENT BUTTON
//==================================================

if(submitCommentButton){

    submitCommentButton.addEventListener(
        "click",
        postArticleComment
    );

}


//==================================================
//          LOAD COMMENTS ON PAGE LOAD
//==================================================

if(
    typeof supabaseClient !== "undefined" &&
    article &&
    article.url
){

    loadArticleComments();

}