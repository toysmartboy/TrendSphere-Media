//===============================================
//              READING HISTORY
//              TrendSphere Media
//===============================================


//===============================================
//          ELEMENTS
//===============================================

const historyContainer =
    document.getElementById(
        "history-container"
    );

const historyEmpty =
    document.getElementById(
        "history-empty"
    );

const historyCount =
    document.getElementById(
        "history-count"
    );

const historySearchInput =
    document.getElementById(
        "history-search-input"
    );

const clearHistorySearch =
    document.getElementById(
        "clear-history-search"
    );

const historySort =
    document.getElementById(
        "history-sort"
    );

const clearHistory =
    document.getElementById(
        "clear-history"
    );

const clearHistoryModal =
    document.getElementById(
        "clear-history-modal"
    );

const closeHistoryModal =
    document.getElementById(
        "close-history-modal"
    );

const cancelClearHistory =
    document.getElementById(
        "cancel-clear-history"
    );

const confirmClearHistory =
    document.getElementById(
        "confirm-clear-history"
    );


//===============================================
//              STATE
//===============================================

let readingHistory = [];


//===============================================
//       SUPABASE AVAILABILITY
//===============================================

function isSupabaseReady(){

    return (
        typeof supabaseClient !==
            "undefined" &&
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
                "Unable to get current user:",
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
            "Get current user error:",
            error
        );

        return null;

    }

}


//===============================================
//          NORMALIZE HISTORY ARTICLE
//===============================================

function normalizeHistoryArticle(row){

    if(!row){

        return null;
    }


    let article = {};


    //===========================================
    //      READ JSON ARTICLE DATA
    //===========================================

    if(row.article_data){

        if(
            typeof row.article_data ===
            "string"
        ){

            try{

                article =
                    JSON.parse(
                        row.article_data
                    );

            }
            catch(error){

                console.error(
                    "Unable to parse article data:",
                    error
                );

                article = {};

            }

        }
        else{

            article =
                row.article_data;

        }

    }


    //===========================================
    //      NORMALIZED ARTICLE
    //===========================================

    return {

        id:
            row.id,

        url:
            row.article_url ||
            article.url ||
            "",

        title:
            article.title ||
            "Untitled Article",

        description:
            article.description ||
            "",

        content:
            article.content ||
            "",

        urlToImage:
            article.urlToImage ||
            "./assets/Images/no-image.png",

        source:
            article.source ||
            {
                name:
                    "Unknown Source"
            },

        author:
            article.author ||
            null,

        publishedAt:
            article.publishedAt ||
            null,

        category:
            article.category ||
            "general",

        readAt:
            row.read_at
                ? new Date(
                    row.read_at
                ).getTime()
                : Date.now()

    };

}


//===============================================
//          LOAD READING HISTORY
//===============================================

async function loadReadingHistory(){

    readingHistory = [];


    //===========================================
    //          GET CURRENT USER
    //===========================================

    const user =
        await getCurrentUser();


    //===========================================
    //          GUEST USER
    //===========================================

    if(!user){

        readingHistory = [];

        displayReadingHistory();

        return;

    }


    //===========================================
    //          LOAD USER HISTORY
    //===========================================

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "reading_history"
                )
                .select(`
                    id,
                    user_id,
                    article_url,
                    article_data,
                    read_at
                `)
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "read_at",
                    {
                        ascending: false
                    }
                );


        if(error){

            console.error(
                "Unable to load reading history:",
                error
            );

            readingHistory = [];

            displayReadingHistory();

            return;

        }


        readingHistory =
            (data || [])
                .map(
                    normalizeHistoryArticle
                )
                .filter(
                    article =>
                        article &&
                        article.url
                );


        displayReadingHistory();

    }
    catch(error){

        console.error(
            "Load reading history error:",
            error
        );


        readingHistory = [];

        displayReadingHistory();

    }

}


//===============================================
//          UPDATE HISTORY COUNT
//===============================================

function updateHistoryCount(){

    if(!historyCount){

        return;

    }


    historyCount.textContent =
        readingHistory.length;

}


//===============================================
//          FORMAT READING TIME
//===============================================

function getHistoryTime(timestamp){

    if(!timestamp){

        return "";

    }


    const time =
        typeof timestamp === "number"
            ? timestamp
            : new Date(
                timestamp
            ).getTime();


    if(
        Number.isNaN(time)
    ){

        return "";

    }


    const seconds =
        Math.floor(
            (
                Date.now() -
                time
            ) / 1000
        );


    if(seconds < 60){

        return "Read just now";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if(minutes < 60){

        return `Read ${minutes} ${
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

        return `Read ${hours} ${
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

        return `Read ${days} ${
            days === 1
                ? "day"
                : "days"
        } ago`;

    }


    const months =
        Math.floor(
            days / 30
        );


    return `Read ${months} ${
        months === 1
            ? "month"
            : "months"
    } ago`;

}


//===============================================
//          SORT HISTORY
//===============================================

function getSortedHistory(
    articles
){

    const sorted =
        [...articles];


    sorted.sort(
        (a, b) => {

            const dateA =
                a.readAt || 0;


            const dateB =
                b.readAt || 0;


            if(
                historySort &&
                historySort.value ===
                    "oldest"
            ){

                return dateA - dateB;

            }


            return dateB - dateA;

        }
    );


    return sorted;

}


//===============================================
//          DISPLAY HISTORY
//===============================================

function displayReadingHistory(
    articles = readingHistory
){

    if(!historyContainer){

        return;

    }


    updateHistoryCount();


    historyContainer.innerHTML =
        "";


    //===========================================
    //          EMPTY STATE
    //===========================================

    if(!articles.length){

        if(historyEmpty){

            historyEmpty.style.display =
                "block";


            const searchTerm =
                historySearchInput
                    ? historySearchInput.value.trim()
                    : "";


            if(searchTerm){

                historyEmpty.innerHTML = `

                    <i class="bx bx-search-alt"></i>

                    <h2>
                        No Matching Articles
                    </h2>

                    <p>
                        No reading history matches
                        "<strong>${searchTerm}</strong>".
                    </p>

                `;

            }
            else{

                historyEmpty.innerHTML = `

                    <i class="bx bx-history"></i>

                    <h2>
                        No Reading History
                    </h2>

                    <p>
                        Articles you read while logged
                        in will appear here.
                    </p>

                    <a
                        href="index.html"
                        class="browse-history-news"
                    >

                        <i class="bx bx-news"></i>

                        Browse News

                    </a>

                `;

            }

        }


        return;

    }


    if(historyEmpty){

        historyEmpty.style.display =
            "none";

    }


    //===========================================
    //          CREATE HISTORY CARDS
    //===========================================

    articles.forEach(
        article => {

            historyContainer.innerHTML += `

                <article class="history-card">

                    <img
                        src="${
                            article.urlToImage ||
                            "./assets/Images/no-image.png"
                        }"
                        alt="${
                            article.title ||
                            "News article"
                        }"
                        loading="lazy"
                        onerror="
                            this.onerror=null;
                            this.src='./assets/Images/no-image.png';
                        "
                    >


                    <div
                        class="history-content"
                    >

                        <span
                            class="history-category"
                        >

                            ${
                                article.category
                                    ? article.category
                                        .charAt(0)
                                        .toUpperCase() +
                                      article.category
                                        .slice(1)
                                    : "News"
                            }

                        </span>


                        <h2>
                            ${
                                article.title ||
                                "Untitled Article"
                            }
                        </h2>


                        <small
                            class="history-time"
                        >

                            ${getHistoryTime(
                                article.readAt
                            )}

                        </small>


                        <div
                            class="history-actions"
                        >

                            <button
                                type="button"
                                class="open-history"
                                data-url="${article.url}"
                            >

                                <i
                                    class="bx bx-book-open"
                                ></i>

                                Read Again

                            </button>


                            <button
                                type="button"
                                class="history-remove"
                                data-url="${article.url}"
                                aria-label="Remove from history"
                                title="Remove from history"
                            >

                                <i
                                    class="bx bx-trash"
                                ></i>

                            </button>

                        </div>

                    </div>

                </article>

            `;

        }
    );


    attachHistoryEvents();

}


//===============================================
//          ATTACH HISTORY EVENTS
//===============================================

function attachHistoryEvents(){


    //===========================================
    //          READ AGAIN
    //===========================================

    document
        .querySelectorAll(
            ".open-history"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const url =
                            button.dataset.url;


                        const article =
                            readingHistory.find(
                                item =>
                                    item.url ===
                                    url
                            );


                        if(!article){

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


    //===========================================
    //          REMOVE HISTORY ITEM
    //===========================================

    document
        .querySelectorAll(
            ".history-remove"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const url =
                            button.dataset.url;


                        if(!url){

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
                                    .from(
                                        "reading_history"
                                    )
                                    .delete()
                                    .eq(
                                        "user_id",
                                        user.id
                                    )
                                    .eq(
                                        "article_url",
                                        url
                                    );


                            if(error){

                                console.error(
                                    "Remove history error:",
                                    error
                                );

                                return;

                            }


                            await loadReadingHistory();

                        }
                        catch(error){

                            console.error(
                                "Remove history failed:",
                                error
                            );

                        }

                    }
                );

            }
        );

}


//===============================================
//          FILTER HISTORY
//===============================================

function filterReadingHistory(){

    const searchTerm =
        historySearchInput
            ? historySearchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        readingHistory.filter(
            article => {

                const title =
                    article.title
                        ? article.title.toLowerCase()
                        : "";


                const description =
                    article.description
                        ? article.description.toLowerCase()
                        : "";


                return (
                    !searchTerm ||
                    title.includes(
                        searchTerm
                    ) ||
                    description.includes(
                        searchTerm
                    )
                );

            }
        );


    const sorted =
        getSortedHistory(
            filtered
        );


    displayReadingHistory(
        sorted
    );

}


//===============================================
//          SEARCH HISTORY
//===============================================

if(historySearchInput){

    historySearchInput.addEventListener(
        "input",
        () => {

            filterReadingHistory();


            if(
                clearHistorySearch &&
                historySearchInput.value.trim()
            ){

                clearHistorySearch.classList.add(
                    "show"
                );

            }
            else if(clearHistorySearch){

                clearHistorySearch.classList.remove(
                    "show"
                );

            }

        }
    );

}


//===============================================
//          CLEAR SEARCH
//===============================================

if(clearHistorySearch){

    clearHistorySearch.addEventListener(
        "click",
        () => {

            if(historySearchInput){

                historySearchInput.value =
                    "";

            }


            clearHistorySearch.classList.remove(
                "show"
            );


            filterReadingHistory();


            historySearchInput?.focus();

        }
    );

}


//===============================================
//          SORT HISTORY
//===============================================

if(historySort){

    historySort.addEventListener(
        "change",
        () => {

            filterReadingHistory();

        }
    );

}


//===============================================
//          CLEAR HISTORY
//===============================================

if(clearHistory){

    clearHistory.addEventListener(
        "click",
        () => {

            if(
                !readingHistory.length
            ){

                return;

            }


            clearHistoryModal?.classList.add(
                "show"
            );

        }
    );

}


//===============================================
//          CLOSE HISTORY MODAL
//===============================================

function closeHistoryClearModal(){

    clearHistoryModal?.classList.remove(
        "show"
    );

}


//===============================================
//          CLOSE MODAL BUTTON
//===============================================

if(closeHistoryModal){

    closeHistoryModal.addEventListener(
        "click",
        closeHistoryClearModal
    );

}


//===============================================
//          CANCEL CLEAR HISTORY
//===============================================

if(cancelClearHistory){

    cancelClearHistory.addEventListener(
        "click",
        closeHistoryClearModal
    );

}


//===============================================
//          CONFIRM CLEAR HISTORY
//===============================================

if(confirmClearHistory){

    confirmClearHistory.addEventListener(
        "click",
        async () => {

            const user =
                await getCurrentUser();


            if(!user){

                closeHistoryClearModal();

                return;

            }


            try{

                const {
                    error
                } =
                    await supabaseClient
                        .from(
                            "reading_history"
                        )
                        .delete()
                        .eq(
                            "user_id",
                            user.id
                        );


                if(error){

                    console.error(
                        "Clear reading history error:",
                        error
                    );


                    alert(
                        "Unable to clear your reading history."
                    );


                    return;

                }


                readingHistory = [];


                closeHistoryClearModal();


                displayReadingHistory();

            }
            catch(error){

                console.error(
                    "Clear reading history failed:",
                    error
                );

            }

        }
    );

}


//===============================================
//          OUTSIDE MODAL CLICK
//===============================================

if(clearHistoryModal){

    clearHistoryModal.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                clearHistoryModal
            ){

                closeHistoryClearModal();

            }

        }
    );

}


//===============================================
//          ESCAPE KEY
//===============================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            clearHistoryModal &&
            clearHistoryModal.classList.contains(
                "show"
            )
        ){

            closeHistoryClearModal();

        }

    }
);


//===============================================
//          AUTH STATE LISTENER
//===============================================

if(isSupabaseReady()){

    supabaseClient.auth.onAuthStateChange(
        (
            event,
            session
        ) => {

            setTimeout(
                () => {

                    if(!session){

                        readingHistory = [];

                        displayReadingHistory();

                        return;

                    }


                    loadReadingHistory();

                },
                0
            );

        }
    );

}


//===============================================
//          INITIAL LOAD
//===============================================

loadReadingHistory();