//==================================================
//              TRENDSPHERE SEARCH
//              RSS SEARCH SYSTEM
//==================================================


//==================================================
//              SEARCH ELEMENTS
//==================================================

const searchInput =
    document.getElementById("search-input");

const openSearch =
    document.getElementById("open-search");

const closeSearch =
    document.getElementById("close-search");

const searchModal =
    document.getElementById("search-modal");

const searchSuggestions =
    document.getElementById("search-suggestions");

const searchBox =
    document.querySelector(".search-box");

const clearSearch =
    document.getElementById("clear-search");


//==================================================
//              SEARCH CACHE
//==================================================

const SEARCH_CACHE_TIME =
    5 * 60 * 1000;

const searchCache =
    new Map();


//==================================================
//              SEARCH STATE
//==================================================

let allSearchArticles = [];

let searchArticlesLoaded =
    false;

let searchLoadingPromise =
    null;


//==================================================
//          SUGGESTION STATE
//==================================================

const SUGGESTIONS_PER_PAGE =
    10;

let currentSuggestionMatches =
    [];

let suggestionVisibleCount =
    SUGGESTIONS_PER_PAGE;

let currentSuggestionKeyword =
    "";


//==================================================
//              HTML ESCAPE
//==================================================

function escapeSearchHTML(value){

    if(!value){
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


//==================================================
//          LOAD ARTICLES FOR SEARCH
//==================================================

async function loadSearchArticles(){

    if(searchArticlesLoaded){

        return allSearchArticles;

    }


    if(searchLoadingPromise){

        return searchLoadingPromise;

    }


    searchLoadingPromise =
        (async () => {

            try{

                // Use the RSS category configuration
                // already loaded by news-api.js.

                if(
                    typeof RSS_CATEGORIES ===
                    "undefined"
                ){

                    console.error(
                        "RSS_CATEGORIES is not available."
                    );

                    return [];

                }


                const categoryEntries =
                    Object.entries(
                        RSS_CATEGORIES
                    );


                const results =
                    await Promise.all(

                        categoryEntries.map(
                            async ([category, url]) => {

                                try{

                                    let result;


                                    // Use the existing
                                    // RSS cache function
                                    // from news-api.js.

                                    if(
                                        typeof fetchWithCache ===
                                        "function"
                                    ){

                                        result =
                                            await fetchWithCache(
                                                url
                                            );

                                    }
                                    else{

                                        const response =
                                            await fetch(
                                                url
                                            );


                                        if(
                                            !response.ok
                                        ){

                                            throw new Error(
                                                `HTTP ${response.status}`
                                            );

                                        }


                                        result =
                                            await response.json();

                                    }


                                    if(
                                        !result ||
                                        !Array.isArray(
                                            result.articles
                                        )
                                    ){

                                        return [];

                                    }


                                    return result.articles.map(
                                        article => ({

                                            ...article,

                                            category:
                                                article.category ||
                                                category

                                        })
                                    );

                                }
                                catch(error){

                                    console.error(
                                        `Search RSS error (${category}):`,
                                        error
                                    );

                                    return [];

                                }

                            }
                        )

                    );


                allSearchArticles =
                    results.flat();


                // Remove duplicate articles.
                const uniqueArticles =
                    new Map();


                allSearchArticles.forEach(
                    article => {

                        const key =
                            article.url ||
                            article.link ||
                            article.title;


                        if(
                            key &&
                            !uniqueArticles.has(key)
                        ){

                            uniqueArticles.set(
                                key,
                                article
                            );

                        }

                    }
                );


                allSearchArticles =
                    Array.from(
                        uniqueArticles.values()
                    );


                // Sort newest first.
                allSearchArticles.sort(
                    (a, b) => {

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


                searchArticlesLoaded =
                    true;


                console.log(
                    "TrendSphere search articles loaded:",
                    allSearchArticles.length
                );


                return allSearchArticles;

            }
            catch(error){

                console.error(
                    "Unable to load search articles:",
                    error
                );

                return [];

            }
            finally{

                searchLoadingPromise =
                    null;

            }

        })();


    return searchLoadingPromise;

}


//==================================================
//              OPEN SEARCH MODAL
//==================================================

if(
    openSearch &&
    searchModal &&
    searchInput
){

    openSearch.addEventListener(
        "click",
        () => {

            searchModal.classList.add(
                "show"
            );

            searchInput.focus();

        }
    );

}


//==================================================
//              CLOSE SEARCH MODAL
//==================================================

if(
    closeSearch &&
    searchModal
){

    closeSearch.addEventListener(
        "click",
        () => {

            searchModal.classList.remove(
                "show"
            );

        }
    );

}


//==================================================
//          CLOSE WHEN CLICKING OUTSIDE
//==================================================

if(searchModal){

    searchModal.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                searchModal
            ){

                searchModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


//==================================================
//       RENDER SEARCH SUGGESTIONS
//==================================================

function renderSearchSuggestions(){

    if(!searchSuggestions){

        return;

    }


    searchSuggestions.innerHTML =
        "";


    //==============================================
    //              NO RESULTS
    //==============================================

    if(
        currentSuggestionMatches.length === 0
    ){

        searchSuggestions.innerHTML = `
            <div class="suggestion-item no-results">
                <i class="bx bx-search-alt"></i>
                <span>No matching articles found</span>
            </div>
        `;

        searchSuggestions.classList.add(
            "show"
        );

        return;

    }


    //==============================================
    //          GET VISIBLE ARTICLES
    //==============================================

    const visibleArticles =
        currentSuggestionMatches.slice(
            0,
            suggestionVisibleCount
        );


    //==============================================
    //          DISPLAY ARTICLES
    //==============================================

    visibleArticles.forEach(
        article => {

            const suggestion =
                document.createElement(
                    "div"
                );


            suggestion.className =
                "suggestion-item";


            const category =
                article.category ||
                "NEWS";


            suggestion.innerHTML = `
                <i class="bx bx-search"></i>

                <div class="suggestion-content">

                    <span class="suggestion-title">
                        ${escapeSearchHTML(
                            article.title ||
                            "Untitled article"
                        )}
                    </span>

                    <small class="suggestion-category">
                        ${escapeSearchHTML(
                            category
                        )}
                    </small>

                </div>
            `;


            suggestion.addEventListener(
                "click",
                () => {

                    if(searchInput){

                        searchInput.value =
                            article.title ||
                            "";

                    }


                    displaySelectedSearchArticle(
                        article
                    );

                }
            );


            searchSuggestions.appendChild(
                suggestion
            );

        }
    );


    //==============================================
    //              LOAD MORE
    //==============================================

    if(
        currentSuggestionMatches.length >
        suggestionVisibleCount
    ){

        const loadMoreButton =
            document.createElement(
                "button"
            );


        loadMoreButton.type =
            "button";


        loadMoreButton.className =
            "load-more-suggestions";


        const remaining =
            currentSuggestionMatches.length -
            suggestionVisibleCount;


        const amountToLoad =
            Math.min(
                SUGGESTIONS_PER_PAGE,
                remaining
            );


        loadMoreButton.innerHTML = `
            <i class="bx bx-plus"></i>
            <span>Load more</span>
        `;


        loadMoreButton.title =
            `Load ${amountToLoad} more suggestions`;


        loadMoreButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                suggestionVisibleCount +=
                    SUGGESTIONS_PER_PAGE;


                renderSearchSuggestions();

            }
        );


        searchSuggestions.appendChild(
            loadMoreButton
        );

    }


    searchSuggestions.classList.add(
        "show"
    );

}


//==================================================
//          SHOW SEARCH SUGGESTIONS
//==================================================

async function showSuggestions(
    keyword
){

    if(
        !searchSuggestions
    ){

        return;

    }


    const cleanKeyword =
        keyword.trim().toLowerCase();


    //==============================================
    //              RESET STATE
    //==============================================

    currentSuggestionKeyword =
        cleanKeyword;

    suggestionVisibleCount =
        SUGGESTIONS_PER_PAGE;

    currentSuggestionMatches =
        [];


    //==============================================
    //              EMPTY SEARCH
    //==============================================

    if(
        cleanKeyword.length < 2
    ){

        searchSuggestions.innerHTML =
            "";

        searchSuggestions.classList.remove(
            "show"
        );

        return;

    }


    //==============================================
    //              LOADING
    //==============================================

    searchSuggestions.innerHTML = `
        <div class="suggestion-item">
            <i class="bx bx-loader-alt bx-spin"></i>
            <span>Searching...</span>
        </div>
    `;

    searchSuggestions.classList.add(
        "show"
    );


    try{

        const articles =
            await loadSearchArticles();


        //==========================================
        //          PREVENT OLD SEARCH
        //==========================================

        if(
            cleanKeyword !==
            currentSuggestionKeyword
        ){

            return;

        }


        //==========================================
        //              FIND MATCHES
        //==========================================

        currentSuggestionMatches =
            articles.filter(
                article => {

                    const title =
                        (
                            article.title ||
                            ""
                        ).toLowerCase();


                    const description =
                        (
                            article.description ||
                            ""
                        ).toLowerCase();


                    const source =
                        (
                            article.source?.name ||
                            article.source ||
                            ""
                        ).toLowerCase();


                    const category =
                        (
                            article.category ||
                            ""
                        ).toLowerCase();


                    return (
                        title.includes(
                            cleanKeyword
                        ) ||

                        description.includes(
                            cleanKeyword
                        ) ||

                        source.includes(
                            cleanKeyword
                        ) ||

                        category.includes(
                            cleanKeyword
                        )
                    );

                }
            );


        console.log(
            "Suggestion keyword:",
            cleanKeyword
        );


        console.log(
            "Suggestion matches:",
            currentSuggestionMatches.length
        );


        //==========================================
        //          RENDER SUGGESTIONS
        //==========================================

        renderSearchSuggestions();

    }
    catch(error){

        console.error(
            "Suggestion error:",
            error
        );


        searchSuggestions.innerHTML =
            "";

        searchSuggestions.classList.remove(
            "show"
        );

    }

}


//==================================================
//       DISPLAY SELECTED SEARCH ARTICLE
//==================================================

function displaySelectedSearchArticle(
    article
){

    if(!article){

        return;

    }


    // Close search modal.
    if(searchModal){

        searchModal.classList.remove(
            "show"
        );

    }


    // Hide suggestions.
    if(searchSuggestions){

        searchSuggestions.classList.remove(
            "show"
        );

    }


    // Display selected article.
    if(
        typeof displayHeroNews ===
        "function"
    ){

        displayHeroNews(
            article
        );

    }


    // Store selected article.
    localStorage.setItem(
        "selectedArticle",
        JSON.stringify(article)
    );


    // Scroll to the top.
    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


//==================================================
//              SEARCH NEWS
//==================================================

async function searchNews(
    keyword
){

    const cleanKeyword =
        keyword.trim();


    if(!cleanKeyword){

        return;

    }


    try{

        // Close suggestions.
        if(searchSuggestions){

            searchSuggestions.classList.remove(
                "show"
            );

        }


        const articles =
            await loadSearchArticles();


        const searchTerm =
            cleanKeyword.toLowerCase();


        const results =
            articles
                .filter(article => {

                    const title =
                        (
                            article.title ||
                            ""
                        ).toLowerCase();


                    const description =
                        (
                            article.description ||
                            ""
                        ).toLowerCase();


                    const source =
                        (
                            article.source?.name ||
                            article.source ||
                            ""
                        ).toLowerCase();


                    const category =
                        (
                            article.category ||
                            ""
                        ).toLowerCase();


                    return (
                        title.includes(searchTerm) ||
                        description.includes(searchTerm) ||
                        source.includes(searchTerm) ||
                        category.includes(searchTerm)
                    );

                });


        console.log(
            "Search keyword:",
            cleanKeyword
        );


        console.log(
            "Search results:",
            results.length
        );


        //===========================================
        //              NO RESULTS
        //===========================================

        if(
            results.length === 0
        ){

            console.log(
                "No articles found for:",
                cleanKeyword
            );


            if(
                typeof displayHeroNews ===
                "function"
            ){

                displayHeroNews({

                    title:
                        `No results found for "${cleanKeyword}"`,

                    description:
                        "Try another search term to find more stories on TrendSphere Media.",

                    urlToImage:
                        "assets/Images/no-image.png"

                });

            }


            return;

        }


        //===========================================
        //              DISPLAY RESULTS
        //===========================================

        if(
            typeof displayHeroNews ===
            "function"
        ){

            displayHeroNews(
                results[0]
            );

        }


        if(
            typeof displayBreakingNews ===
            "function"
        ){

            displayBreakingNews(
                results
            );

        }


        if(
            typeof displayTrendingNews ===
            "function"
        ){

            displayTrendingNews(
                results
            );

        }


        if(
            typeof displayLatestNews ===
            "function"
        ){

            displayLatestNews(
                results
            );

        }


        // Close modal.
        if(searchModal){

            searchModal.classList.remove(
                "show"
            );

        }


        // Scroll to the news area.
        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


    }
    catch(error){

        console.error(
            "Search error:",
            error
        );

    }

}


//==================================================
//              SEARCH INPUT
//==================================================

if(searchInput){

    searchInput.addEventListener(
        "input",
        function(){

            const keyword =
                this.value;


            showSuggestions(
                keyword
            );


            // Clear button.
            if(clearSearch){

                if(
                    keyword.trim() !== ""
                ){

                    clearSearch.classList.add(
                        "show"
                    );

                }
                else{

                    clearSearch.classList.remove(
                        "show"
                    );

                }

            }

        }
    );


}


//==================================================
//              SEARCH WITH ENTER
//==================================================

if(searchInput){

    searchInput.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                event.preventDefault();


                const keyword =
                    searchInput.value.trim();


                if(!keyword){

                    return;

                }


                searchNews(
                    keyword
                );

            }

        }
    );

}


//==================================================
//              CLEAR SEARCH
//==================================================

if(
    searchInput &&
    clearSearch
){

    clearSearch.addEventListener(
        "click",
        () => {

            searchInput.value =
                "";

            clearSearch.classList.remove(
                "show"
            );


            currentSuggestionMatches =
                [];

            suggestionVisibleCount =
                SUGGESTIONS_PER_PAGE;

            currentSuggestionKeyword =
                "";


            if(searchSuggestions){

                searchSuggestions.innerHTML =
                    "";

                searchSuggestions.classList.remove(
                    "show"
                );

            }


            searchInput.focus();

        }
    );

}


//==================================================
//        INITIAL CLEAR BUTTON STATE
//==================================================

if(
    searchInput &&
    clearSearch
){

    if(
        searchInput.value.trim() !== ""
    ){

        clearSearch.classList.add(
            "show"
        );

    }
    else{

        clearSearch.classList.remove(
            "show"
        );

    }

}


//==================================================
//              ESCAPE KEY
//==================================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            searchModal
        ){

            searchModal.classList.remove(
                "show"
            );


            if(searchSuggestions){

                searchSuggestions.classList.remove(
                    "show"
                );

            }

        }

    }
);