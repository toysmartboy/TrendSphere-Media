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
//===============================================

const relatedContainer =
    document.getElementById(
        "related-news-container"
    );


const API_KEY =
    "3c5da73095254cbcb55c6edeae277eae";


async function fetchRelatedNews(){

    if(!article){

        return;
    }


    try{

        const response =
            await fetch(
                `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${API_KEY}`
            );


        const data =
            await response.json();


        if(data.status !== "ok"){

            console.error(
                "Related News Error:",
                data.code,
                data.message
            );

            return;
        }


        const related =
            data.articles.filter(
                item =>
                    item.url !== article.url
            );


        displayRelatedNews(
            related
        );

    }
    catch(error){

        console.error(
            "Fetch Related News Error:",
            error
        );

    }

}


fetchRelatedNews();


//===============================================
//          DISPLAY RELATED NEWS
//===============================================

let relatedArticles = [];

let relatedDisplayed = 0;

const RELATED_PER_LOAD = 6;


const loadMoreRelated =
    document.getElementById(
        "load-more-related"
    );


function displayRelatedNews(news){

    relatedArticles =
        news;

    relatedDisplayed =
        0;


    if(relatedContainer){

        relatedContainer.innerHTML =
            "";

        displayMoreRelatedNews();

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


    nextArticles.forEach(
        item => {

            const articleIndex =
                relatedArticles.indexOf(
                    item
                );


            relatedContainer.innerHTML +=

            `<article class="related-card">

                <img
                    src="${
                        item.urlToImage ||
                        "./assets/Images/no-image.png"
                    }"
                    alt="${
                        item.title ||
                        "News"
                    }"
                    loading="lazy"
                    onerror="
                        this.onerror=null;
                        this.src='./assets/Images/no-image.png';
                    "
                >

                <div class="related-content">

                    <span>
                        ${
                            item.source?.name ||
                            "News"
                        }
                    </span>

                    <h3>
                        ${
                            item.title ||
                            "Untitled Article"
                        }
                    </h3>

                    <a
                        href="#"
                        class="related-read-more"
                        data-index="${articleIndex}"
                    >
                        Read More
                    </a>

                </div>

            </article>`;

        }
    );


    relatedDisplayed +=
        nextArticles.length;


    //===========================================
    //          READ MORE BUTTONS
    //===========================================

    document
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
    //          LOAD MORE BUTTON
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
//          LOAD MORE RELATED NEWS
//===============================================

if(loadMoreRelated){

    loadMoreRelated.addEventListener(
        "click",
        displayMoreRelatedNews
    );

}


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