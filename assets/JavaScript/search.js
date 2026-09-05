


const searchInput = document.getElementById("search-input");
const openSearch = document.getElementById("open-search");
const closeSearch = document.getElementById("close-search");
const searchModal = document.getElementById("search-modal");
const searchSuggestions = document.getElementById("search-suggestions");
const searchBox = document.querySelector(".search-box");
const clearSearch = document.getElementById("clear-search");

// SEARCH CACHE
const SEARCH_CACHE_TIME = 5 * 60 * 1000;
const searchCache = new Map();

console.log(searchInput);



openSearch.addEventListener("click",() => {
    searchModal.classList.add("show");

    searchInput.focus();
});

closeSearch.addEventListener("click",()=>{
    searchModal.classList.remove("show");
});


//===============================================
//          SHOW SEARCH SUGGESTIONS
//===============================================

async function showSuggestions(keyword){

    if(keyword.length < 2){
        searchSuggestions.innerHTML = "";
        searchSuggestions.classList.remove("show");
        return;
    }

    try{
        const response = await fetch(
            `${SEARCH_URL}${encodeURIComponent(keyword)}&pageSize=10&sortBy=publishedAt&apiKey=${API_KEY}`
        );
        const data = await response.json();

        if(data.status !== "ok"){
            console.error("Suggestion error:", data.message);
            searchSuggestions.innerHTML = "";
            searchSuggestions.classList.remove("show");
            return;
        }

        searchSuggestions.innerHTML = "";
        data.articles.slice(0, 10).forEach((article, index) => {
            const suggestion = document.createElement("div");
            suggestion.className = "suggestion-item";
            suggestion.innerHTML = `<i class="bx bx-search"></i>
            <span>${article.title}</span>`;
            suggestion.addEventListener("click", () =>{
                displaySelectedSearchArticle(article);

                searchSuggestions.classList.remove("show");
            });

            searchSuggestions.appendChild(suggestion);
        });

        if(data.articles.length > 0){
            searchSuggestions.classList.add("show");
        }else{
            searchSuggestions.classList.remove("show");
        }

        // Make suggestions clickable
        document.querySelectorAll(".suggestion-item").forEach(item => {
                item.addEventListener("click", () => {
                    const index = Number(item.dataset.index);
                    const selectedArticle = data.articles[index];

                    if(selectedArticle){
                        searchInput.value = selectedArticle.title;
                        searchSuggestions.classList.remove("show");
                        searchNews(
                            selectedArticle.title
                        );
                    }
                });
            });
    }
    catch(error){
        console.error("Suggestion error:", error);
    }
    console.log("Keyword:", keyword);
    console.log("Articles:", data.articles);
    console.log("Suggestions element:", searchSuggestions);
}

//===============================================
//       DISPLAY SELECTED SEARCH ARTICLE
//===============================================

function displaySelectedSearchArticle(article){

    if(!article){
        return;
    }

    // Close search modal
    searchModal.classList.remove("show");

    // Display the selected article
    displayHeroNews(article);

    // Scroll to the news section
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}
   
   

//===============================================
//              SEARCH NEWS
//===============================================

async function searchNews(keyword){
    const cleanKeyword = keyword.trim();

    if(!cleanKeyword){
        return;
    }
    try{
        const searchUrl =
            `${SEARCH_URL}${encodeURIComponent(cleanKeyword)}&pageSize=20&sortBy=publishedAt&apiKey=${API_KEY}`;
        const data =
            await searchNewsWithCache(searchUrl);
        if(data.status !== "ok"){
            console.error(
                "Search API Error:",
                data.message
            );
            return;
        }

        if(!data.articles || data.articles.length === 0){
            console.log("No articles found.");
            return;
        }

        displayHeroNews(data.articles[0]);
        displayBreakingNews(data.articles);
        displayTrendingNews(data.articles);
        displayLatestNews(data.articles);
    }

    catch(error){
        console.error
        ("Search error:",error);
    }
}


searchInput.addEventListener("input", function(){
    showSuggestions(this.value);
})


//===============================================
//          SEARCH WITH ENTER
//===============================================

searchInput.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
        const keyword =
            searchInput.value.trim();
        if(keyword === ""){
            return;
        }
        searchNews(keyword);
        searchSuggestions.classList.remove("show");
    }
});




// CREATING THE CACHED SEARCH FUNCTION //
//===============================================
//          CACHED SEARCH FUNCTION
//===============================================
async function searchNewsWithCache(url){
    const cached =
        searchCache.get(url);

        if(cached){
        const cacheAge =
            Date.now() - cached.timestamp;

        if(cacheAge < SEARCH_CACHE_TIME){
            console.log(
                "Using cached search:",
                url
            );
            return cached.data;
        }
        searchCache.delete(url);
    }
    const response = await fetch(url);

    if(!response.ok){
        throw new Error(
            `HTTP Error: ${response.status}`
        );
    }

    const data = await response.json();
    if(data.status === "ok"){
        searchCache.set(url, {

            timestamp: Date.now(),
            data: data

        });
    }
    return data;
}


// CLEAR SEARCH BUTTON  //


if(searchInput && clearSearch){
    searchInput.addEventListener("input", () => {
        if(searchInput.value.trim() !== ""){
            clearSearch.classList.add("show");
        }else{
            clearSearch.classList.remove("show");
        }
    });

    clearSearch.addEventListener("click", () => {
        searchInput.value = "";
        clearSearch.classList.remove("show");

        searchSuggestions.innerHTML = "";
        searchSuggestions.classList.remove("show");

        searchInput.focus();
    });

} 

//===============================================
//        INITIAL SEARCH BUTTON STATE
//===============================================

if (searchInput && clearSearch) {
    if (searchInput.value.trim() !== "") {
        clearSearch.classList.add("show");
    } else {
        clearSearch.classList.remove("show");
    }
}




