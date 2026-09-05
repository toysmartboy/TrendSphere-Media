//===============================================
//             SAVED ARTICLES
//             TrendSphere Media
//===============================================


//===============================================
//             DOM ELEMENTS
//===============================================

const savedContainer =
    document.getElementById(
        "saved-articles-container"
    );

const savedEmpty =
    document.getElementById(
        "saved-empty"
    );

const savedSearchInput =
    document.getElementById(
        "saved-search-input"
    );

const clearSavedSearch =
    document.getElementById(
        "clear-saved-search"
    );

const savedSortSelect =
    document.getElementById(
        "saved-sort-select"
    );

const savedCount =
    document.getElementById(
        "saved-count"
    );

const clearAllSaved =
    document.getElementById(
        "clear-all-saved"
    );

const clearConfirmModal =
    document.getElementById(
        "clear-confirm-modal"
    );

const cancelClearSaved =
    document.getElementById(
        "cancel-clear-saved"
    );

const confirmClearSaved =
    document.getElementById(
        "confirm-clear-saved"
    );

const savedFilterButtons =
    document.querySelectorAll(
        ".saved-filter-btn"
    );


//===============================================
//          MANAGE ARTICLE ELEMENTS
//===============================================

const manageSaved =
    document.getElementById(
        "manage-saved"
    );

const manageControls =
    document.getElementById(
        "manage-controls"
    );

const selectAllSaved =
    document.getElementById(
        "select-all-saved"
    );

const deleteSelectedSaved =
    document.getElementById(
        "delete-selected-saved"
    );

const cancelManageSaved =
    document.getElementById(
        "cancel-manage-saved"
    );

const selectedSavedCount =
    document.getElementById(
        "selected-saved-count"
    );

const printSavedBtn =
    document.getElementById(
        "print-saved"
    );

const printSelectedSaved =
    document.getElementById(
        "print-selected-saved"
    );

const copySelectedSaved =
    document.getElementById(
        "copy-selected-saved"
    );

const shareSelectedSaved =
    document.getElementById(
        "share-selected-saved"
    );

const downloadSelectedSaved =
    document.getElementById(
        "download-selected-saved"
    );


//===============================================
//      DELETE SELECTED MODAL ELEMENTS
//===============================================

const deleteSelectedModal =
    document.getElementById(
        "delete-selected-modal"
    );

const deleteSelectedNumber =
    document.getElementById(
        "delete-selected-number"
    );

const cancelDeleteSelected =
    document.getElementById(
        "cancel-delete-selected"
    );

const confirmDeleteSelected =
    document.getElementById(
        "confirm-delete-selected"
    );

const exportSaved =
    document.getElementById(
        "export-saved"
    );


//===============================================
//       SAVED STATISTICS ELEMENTS
//===============================================

const statTotalSaved =
    document.getElementById(
        "stat-total-saved"
    );

const statSelectedSaved =
    document.getElementById(
        "stat-selected-saved"
    );

const statSavedCategories =
    document.getElementById(
        "stat-saved-categories"
    );


//===============================================
//          SAVED VIEW ELEMENTS
//===============================================

const savedGridView =
    document.getElementById(
        "saved-grid-view"
    );

const savedListView =
    document.getElementById(
        "saved-list-view"
    );


//===============================================
//          SAVED NOTE ELEMENTS
//===============================================

const savedNoteModal =
    document.getElementById(
        "saved-note-modal"
    );

const savedNoteInput =
    document.getElementById(
        "saved-note-input"
    );

const savedNoteTitle =
    document.getElementById(
        "saved-note-title"
    );

const closeSavedNote =
    document.getElementById(
        "close-saved-note"
    );

const cancelSavedNote =
    document.getElementById(
        "cancel-saved-note"
    );

const saveSavedNote =
    document.getElementById(
        "save-saved-note"
    );

const deleteSavedNote =
    document.getElementById(
        "delete-saved-note"
    );


//===============================================
//          SAVED TIME FILTER
//===============================================

const savedTimeButtons =
    document.querySelectorAll(
        ".saved-time-btn"
    );


//===============================================
//              STATE
//===============================================

let currentNoteUrl = null;

let manageMode = false;

let selectedSavedUrls =
    new Set();

let savedArticles = [];


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
//          NORMALIZE SAVED ARTICLE
//===============================================

function normalizeSavedArticle(row){

    if(!row){

        return null;
    }


    return {

        id:
            row.id,

        url:
            row.article_url,

        title:
            row.title ||
            "Untitled Article",

        description:
            row.description ||
            "",

        content:
            row.content ||
            "",

        urlToImage:
            row.image_url ||
            "./assets/images/no-image.png",

        source: {

            name:
                row.source_name ||
                "Unknown Source"

        },

        author:
            row.author ||
            null,

        publishedAt:
            row.published_at ||
            null,

        category:
            row.category ||
            "general",

        note:
            row.note ||
            "",

        savedAt:
            row.saved_at
                ? new Date(
                    row.saved_at
                ).getTime()
                : Date.now(),

        createAt:
            row.created_at ||
            null

    };

}


//===============================================
//          LOAD SAVED ARTICLES
//===============================================

async function loadSavedArticles(){

    savedArticles = [];

    selectedSavedUrls.clear();


    const user =
        await getCurrentUser();


    //===========================================
    //          GUEST MODE
    //===========================================

    if(!user){

        savedArticles = [];

        displaySavedArticles();

        return;

    }


    //===========================================
    //          LOAD USER DATA
    //===========================================

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "saved_articles"
                )
                .select(`
                    id,
                    article_url,
                    title,
                    description,
                    content,
                    image_url,
                    source_name,
                    author,
                    published_at,
                    category,
                    note,
                    saved_at,
                    created_at
                `)
                .eq(
                    "user_id",
                    user.id
                )
                .order(
                    "saved_at",
                    {
                        ascending: false
                    }
                );


        if(error){

            console.error(
                "Unable to load saved articles:",
                error
            );

            savedArticles = [];

            displaySavedArticles();

            return;

        }


        savedArticles =
            (data || [])
                .map(
                    normalizeSavedArticle
                )
                .filter(
                    article =>
                        article !== null
                );


        cleanInvalidSavedSelections();

        displaySavedArticles();

    }
    catch(error){

        console.error(
            "Load saved articles error:",
            error
        );

        savedArticles = [];

        displaySavedArticles();

    }

}


//===============================================
//          MANAGE MODE
//===============================================

if(manageSaved){

    manageSaved.addEventListener(
        "click",
        () => {

            manageMode = true;

            selectedSavedUrls.clear();

            if(selectAllSaved){

                selectAllSaved.innerHTML = `

                    <i class="bx bx-select-multiple"></i>

                    Select All

                `;

            }


            manageControls?.classList.add(
                "show"
            );


            manageSaved.style.display =
                "none";


            displaySavedArticles();

            updateSelectedSavedCount();

        }
    );

}


//===============================================
//          CANCEL MANAGE MODE
//===============================================

if(cancelManageSaved){

    cancelManageSaved.addEventListener(
        "click",
        () => {

            if(
                selectedSavedUrls.size > 0
            ){

                const shouldCancel =
                    confirm(
                        `You have ${
                            selectedSavedUrls.size
                        } selected ${
                            selectedSavedUrls.size === 1
                                ? "article"
                                : "articles"
                        }.\n\nAre you sure you want to leave Manage Mode?`
                    );


                if(!shouldCancel){

                    return;

                }

            }


            manageMode =
                false;


            selectedSavedUrls.clear();


            manageControls?.classList.remove(
                "show"
            );


            manageSaved.style.display =
                "inline-flex";


            if(selectAllSaved){

                selectAllSaved.innerHTML = `

                    <i class="bx bx-select-multiple"></i>

                    Select All

                `;

            }


            displaySavedArticles();

            updateSelectedSavedCount();

        }
    );

}


//===============================================
//          SELECTED ARTICLE CHECKBOX
//===============================================

document.addEventListener(
    "change",
    event => {

        if(
            !event.target.classList.contains(
                "saved-card-select"
            )
        ){

            return;

        }


        const checkbox =
            event.target;


        const url =
            checkbox.dataset.url;


        if(!url){

            return;

        }


        if(checkbox.checked){

            selectedSavedUrls.add(
                url
            );

        }
        else{

            selectedSavedUrls.delete(
                url
            );

        }


        checkbox
            .closest(".saved-card")
            ?.classList.toggle(
                "selected",
                checkbox.checked
            );


        updateSelectedSavedCount();


        const visibleCheckboxes =
            document.querySelectorAll(
                ".saved-card-select"
            );


        if(
            !selectAllSaved ||
            !visibleCheckboxes.length
        ){

            return;

        }


        const allSelected =
            [...visibleCheckboxes]
                .every(
                    item =>
                        item.checked
                );


        if(allSelected){

            selectAllSaved.innerHTML = `

                <i class="bx bx-checkbox-checked"></i>

                Deselect All

            `;

        }
        else{

            selectAllSaved.innerHTML = `

                <i class="bx bx-select-multiple"></i>

                Select All

            `;

        }

    }
);


//===============================================
//       SELECT / DESELECT ALL SAVED
//===============================================

if(selectAllSaved){

    selectAllSaved.addEventListener(
        "click",
        () => {

            const visibleCheckboxes =
                document.querySelectorAll(
                    ".saved-card-select"
                );


            if(!visibleCheckboxes.length){

                alert(
                    "There are no visible articles to select."
                );

                return;

            }


            const allVisibleSelected =
                [...visibleCheckboxes]
                    .every(
                        checkbox =>
                            checkbox.checked
                    );


            if(allVisibleSelected){

                visibleCheckboxes
                    .forEach(
                        checkbox => {

                            checkbox.checked =
                                false;


                            const url =
                                checkbox.dataset.url;


                            selectedSavedUrls.delete(
                                url
                            );


                            checkbox
                                .closest(
                                    ".saved-card"
                                )
                                ?.classList.remove(
                                    "selected"
                                );

                        }
                    );


                selectAllSaved.innerHTML = `

                    <i class="bx bx-select-multiple"></i>

                    Select All

                `;

            }
            else{

                visibleCheckboxes
                    .forEach(
                        checkbox => {

                            checkbox.checked =
                                true;


                            const url =
                                checkbox.dataset.url;


                            selectedSavedUrls.add(
                                url
                            );


                            checkbox
                                .closest(
                                    ".saved-card"
                                )
                                ?.classList.add(
                                    "selected"
                                );

                        }
                    );


                selectAllSaved.innerHTML = `

                    <i class="bx bx-checkbox-checked"></i>

                    Deselect All

                `;

            }


            updateSelectedSavedCount();

        }
    );

}


//===============================================
//          DELETE SELECTED SAVED
//===============================================

if(deleteSelectedSaved){

    deleteSelectedSaved.addEventListener(
        "click",
        () => {

            if(
                selectedSavedUrls.size === 0
            ){

                return;

            }


            if(deleteSelectedNumber){

                deleteSelectedNumber.textContent =
                    selectedSavedUrls.size;

            }


            deleteSelectedModal?.classList.add(
                "show"
            );

        }
    );

}


//===============================================
//      CONFIRM DELETE SELECTED
//===============================================

if(confirmDeleteSelected){

    confirmDeleteSelected.addEventListener(
        "click",
        async () => {

            const urls =
                [...selectedSavedUrls];


            if(!urls.length){

                return;

            }


            const user =
                await getCurrentUser();


            if(!user){

                alert(
                    "Please log in to manage your saved articles."
                );

                return;

            }


            try{

                for(
                    const url of urls
                ){

                    const {
                        error
                    } =
                        await supabaseClient
                            .from(
                                "saved_articles"
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
                            "Delete selected article error:",
                            error
                        );

                    }

                }


                selectedSavedUrls.clear();

                manageMode =
                    false;


                deleteSelectedModal?.classList.remove(
                    "show"
                );


                manageControls?.classList.remove(
                    "show"
                );


                if(manageSaved){

                    manageSaved.style.display =
                        "inline-flex";

                }


                if(selectAllSaved){

                    selectAllSaved.innerHTML = `

                        <i class="bx bx-select-multiple"></i>

                        Select All

                    `;

                }


                await loadSavedArticles();

            }
            catch(error){

                console.error(
                    "Delete selected articles failed:",
                    error
                );


                alert(
                    "Unable to delete the selected articles."
                );

            }

        }
    );

}


//===============================================
//      CANCEL DELETE SELECTED
//===============================================

if(cancelDeleteSelected){

    cancelDeleteSelected.addEventListener(
        "click",
        () => {

            deleteSelectedModal?.classList.remove(
                "show"
            );

        }
    );

}


//===============================================
//     ESCAPE DELETE SELECTED MODAL
//===============================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            deleteSelectedModal &&
            deleteSelectedModal.classList.contains(
                "show"
            )
        ){

            deleteSelectedModal.classList.remove(
                "show"
            );

        }

    }
);


//===============================================
//          UPDATE SAVED COUNT
//===============================================

function updateSavedCount(){

    if(!savedCount){

        return;

    }


    const count =
        savedArticles.length;


    savedCount.textContent =
        count;


    savedCount.style.display =
        count === 0
            ? "none"
            : "inline-flex";

}


//===============================================
//          SAVED TIME FORMATTER
//===============================================

function getSavedTime(savedAt){

    if(!savedAt){

        return "";

    }


    const timestamp =
        typeof savedAt === "number"
            ? savedAt
            : new Date(
                savedAt
            ).getTime();


    if(
        Number.isNaN(timestamp)
    ){

        return "";

    }


    const seconds =
        Math.floor(
            (
                Date.now() -
                timestamp
            ) / 1000
        );


    if(seconds < 60){

        return "Saved just now";

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if(minutes < 60){

        return `Saved ${minutes} ${
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

        return `Saved ${hours} ${
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

        return `Saved ${days} ${
            days === 1
                ? "day"
                : "days"
        } ago`;

    }


    const months =
        Math.floor(
            days / 30
        );


    return `Saved ${months} ${
        months === 1
            ? "month"
            : "months"
    } ago`;

}


//===============================================
//          SORT SAVED ARTICLES
//===============================================

function getSortedSavedArticles(
    articles
){

    const sortedArticles =
        [...articles];


    sortedArticles.sort(
        (a, b) => {

            const dateA =
                a.savedAt || 0;


            const dateB =
                b.savedAt || 0;


            if(
                savedSortSelect &&
                savedSortSelect.value ===
                    "oldest"
            ){

                return (
                    new Date(dateA) -
                    new Date(dateB)
                );

            }


            return (
                new Date(dateB) -
                new Date(dateA)
            );

        }
    );


    return sortedArticles;

}


//===============================================
//          UPDATE SELECTED COUNT
//===============================================

function updateSelectedSavedCount(){

    const count =
        selectedSavedUrls.size;


    if(selectedSavedCount){

        selectedSavedCount.textContent =
            count;

    }


    if(deleteSelectedSaved){

        deleteSelectedSaved.disabled =
            count === 0;

    }


    if(printSelectedSaved){

        printSelectedSaved.disabled =
            count === 0;

    }


    if(copySelectedSaved){

        copySelectedSaved.disabled =
            count === 0;

    }


    if(shareSelectedSaved){

        shareSelectedSaved.disabled =
            count === 0;

    }


    if(downloadSelectedSaved){

        downloadSelectedSaved.disabled =
            count === 0;

    }


    updateSavedStatistics();

}


//===============================================
//          UPDATE SAVED STATISTICS
//===============================================

function updateSavedStatistics(){

    if(statTotalSaved){

        statTotalSaved.textContent =
            savedArticles.length;

    }


    if(statSelectedSaved){

        statSelectedSaved.textContent =
            selectedSavedUrls.size;

    }


    if(statSavedCategories){

        const categories =
            new Set();


        savedArticles.forEach(
            article => {

                if(article.category){

                    categories.add(
                        article.category
                            .toLowerCase()
                    );

                }

            }
        );


        statSavedCategories.textContent =
            categories.size;

    }

}


//===============================================
//       CLEAN INVALID SELECTIONS
//===============================================

function cleanInvalidSavedSelections(){

    const savedUrls =
        new Set(
            savedArticles.map(
                article =>
                    article.url
            )
        );


    selectedSavedUrls.forEach(
        url => {

            if(
                !savedUrls.has(url)
            ){

                selectedSavedUrls.delete(
                    url
                );

            }

        }
    );


    updateSelectedSavedCount();

}


//===============================================
//          HIGHLIGHT SEARCH TEXT
//===============================================

function highlightSavedText(
    text,
    searchTerm
){

    if(!text){

        return "";

    }


    if(!searchTerm){

        return text;

    }


    const escapedTerm =
        searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const regex =
        new RegExp(
            `(${escapedTerm})`,
            "gi"
        );


    return text.replace(
        regex,
        `<mark class="saved-highlight">$1</mark>`
    );

}


//===============================================
//          DISPLAY SAVED ARTICLES
//===============================================

function displaySavedArticles(
    articles = savedArticles
){

    updateSavedCount();

    updateSavedStatistics();

    cleanInvalidSavedSelections();


    if(savedContainer){

        savedContainer.innerHTML =
            "";

    }


    //===========================================
    //              EMPTY STATE
    //===========================================

    if(!articles.length){

        if(savedEmpty){

            savedEmpty.style.display =
                "block";


            const searchTerm =
                savedSearchInput
                    ? savedSearchInput.value.trim()
                    : "";


            if(searchTerm){

                savedEmpty.innerHTML = `

                    <i class="bx bx-search-alt"></i>

                    <h2>
                        No Matching Articles Found
                    </h2>

                    <p>
                        We couldn't find any saved
                        articles matching
                        "<strong>${searchTerm}</strong>".
                    </p>

                `;

            }
            else{

                savedEmpty.innerHTML = `

                    <i class="bx bx-bookmark"></i>

                    <h2>
                        No Saved Articles
                    </h2>

                    <p>
                        You haven't saved any
                        articles yet.
                    </p>

                    <button
                        type="button"
                        id="browse-news-btn"
                        class="browse-news-btn"
                    >

                        <i class="bx bx-news"></i>

                        Browse News

                    </button>

                `;

            }

        }


        updateSelectedSavedCount();

        return;

    }


    if(savedEmpty){

        savedEmpty.style.display =
            "none";

    }


    //===========================================
    //          CREATE SAVED CARDS
    //===========================================

    if(!savedContainer){

        return;

    }


    articles.forEach(
        article => {

            const isSelected =
                selectedSavedUrls.has(
                    article.url
                );


            savedContainer.innerHTML += `

                <article
                    class="saved-card ${
                        isSelected
                            ? "selected"
                            : ""
                    }"
                >

                    ${
                        manageMode
                            ? `

                                <input
                                    type="checkbox"
                                    class="saved-card-select"
                                    data-url="${article.url}"
                                    ${
                                        isSelected
                                            ? "checked"
                                            : ""
                                    }
                                >

                              `
                            : ""
                    }


                    <img
                        src="${
                            article.urlToImage ||
                            "./assets/images/no-image.png"
                        }"
                        alt="${article.title}"
                        loading="lazy"
                        onerror="
                            this.onerror=null;
                            this.src='./assets/images/no-image.png';
                        "
                    >


                    <div
                        class="saved-content"
                    >


                        <span>

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


                        ${
                            article.savedAt
                                ? `

                                    <small
                                        class="saved-time"
                                    >

                                        ${getSavedTime(
                                            article.savedAt
                                        )}

                                    </small>

                                  `
                                : ""
                        }


                        <h2>

                            ${highlightSavedText(
                                article.title,
                                savedSearchInput
                                    ? savedSearchInput.value.trim()
                                    : ""
                            )}

                        </h2>


                        ${
                            article.note
                                ? `

                                    <div
                                        class="saved-note-preview"
                                    >

                                        <i class="bx bx-note"></i>

                                        <div>

                                            <strong>
                                                My Note
                                            </strong>

                                            <p>

                                                ${highlightSavedText(
                                                    article.note,
                                                    savedSearchInput
                                                        ? savedSearchInput.value.trim()
                                                        : ""
                                                )}

                                            </p>

                                        </div>

                                    </div>

                                  `
                                : ""
                        }


                        ${
                            article.note
                                ? `

                                    <span
                                        class="saved-note-indicator"
                                        title="This article has a note"
                                    >

                                        <i class="bx bx-note"></i>

                                        Note added

                                    </span>

                                  `
                                : ""
                        }


                        <p
                            class="saved-description"
                        >

                            ${highlightSavedText(
                                article.description || "",
                                savedSearchInput
                                    ? savedSearchInput.value.trim()
                                    : ""
                            )}

                        </p>


                        <div
                            class="saved-actions"
                        >

                            <button
                                type="button"
                                class="open-saved"
                                data-url="${article.url}"
                            >

                                Read Article

                            </button>


                            <button
                                type="button"
                                class="note-saved"
                                data-url="${article.url}"
                                aria-label="${
                                    article.note
                                        ? "Edit note"
                                        : "Add note"
                                }"
                                title="${
                                    article.note
                                        ? "Edit note"
                                        : "Add note"
                                }"
                            >

                                <i class="bx ${
                                    article.note
                                        ? "bx-edit"
                                        : "bx-note"
                                }"></i>

                            </button>


                            <button
                                type="button"
                                class="share-saved"
                                data-url="${article.url}"
                                data-title="${article.title}"
                                aria-label="Share article"
                            >

                                <i
                                    class="bx bx-share-alt"
                                ></i>

                            </button>


                            <button
                                type="button"
                                class="remove-saved"
                                data-url="${article.url}"
                                aria-label="Remove article"
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


    attachSavedEvents();

    updateSelectedSavedCount();


    const visibleCheckboxes =
        document.querySelectorAll(
            ".saved-card-select"
        );


    if(
        selectAllSaved &&
        visibleCheckboxes.length
    ){

        const allVisibleSelected =
            [...visibleCheckboxes]
                .every(
                    checkbox =>
                        checkbox.checked
                );


        selectAllSaved.innerHTML =
            allVisibleSelected
                ? `
                    <i class="bx bx-checkbox-checked"></i>
                    Deselect All
                  `
                : `
                    <i class="bx bx-select-multiple"></i>
                    Select All
                  `;

    }
    else if(selectAllSaved){

        selectAllSaved.innerHTML = `

            <i class="bx bx-select-multiple"></i>

            Select All

        `;

    }

}


//===============================================
//          FILTER SAVED ARTICLES
//===============================================

function filterSavedArticles(){

    const searchTerm =
        savedSearchInput
            ? savedSearchInput.value
                .trim()
                .toLowerCase()
            : "";


    const activeFilter =
        document.querySelector(
            ".saved-filter-btn.active"
        );


    const selectedCategory =
        activeFilter
            ? activeFilter.dataset.category
            : "all";


    const timeLimit =
        getSavedTimeLimit();


    let filteredArticles =
        savedArticles.filter(
            article => {

                const categoryMatch =
                    selectedCategory === "all" ||
                    selectedCategory === "recent" ||
                    (
                        article.category &&
                        article.category
                            .toLowerCase() ===
                        selectedCategory
                    );


                const title =
                    article.title
                        ? article.title.toLowerCase()
                        : "";


                const description =
                    article.description
                        ? article.description.toLowerCase()
                        : "";


                const note =
                    article.note
                        ? article.note.toLowerCase()
                        : "";


                const searchMatch =
                    !searchTerm ||
                    title.includes(searchTerm) ||
                    description.includes(searchTerm) ||
                    note.includes(searchTerm);


                const timestamp =
                    article.savedAt
                        ? new Date(
                            article.savedAt
                        ).getTime()
                        : 0;


                const timeMatch =
                    !timeLimit ||
                    timestamp >= timeLimit;


                return (
                    categoryMatch &&
                    searchMatch &&
                    timeMatch
                );

            }
        );


    if(
        selectedCategory ===
        "recent"
    ){

        filteredArticles =
            [...filteredArticles]
                .sort(
                    (a, b) =>
                        (
                            new Date(
                                b.savedAt
                            ).getTime()
                        ) -
                        (
                            new Date(
                                a.savedAt
                            ).getTime()
                        )
                )
                .slice(
                    0,
                    5
                );

    }


    const sortedArticles =
        getSortedSavedArticles(
            filteredArticles
        );


    displaySavedArticles(
        sortedArticles
    );

}


//===============================================
//          SAVED ARTICLE EVENTS
//===============================================

function attachSavedEvents(){


    //===========================================
    //          OPEN ARTICLE
    //===========================================

    document
        .querySelectorAll(
            ".open-saved"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const url =
                            button.dataset.url;


                        const saved =
                            savedArticles.find(
                                item =>
                                    item.url ===
                                    url
                            );


                        if(!saved){

                            return;

                        }


                        const article = {

                            title:
                                saved.title,

                            description:
                                saved.description,

                            content:
                                saved.content,

                            url:
                                saved.url,

                            urlToImage:
                                saved.urlToImage,

                            author:
                                saved.author,

                            publishedAt:
                                saved.publishedAt,

                            source:
                                saved.source,

                            category:
                                saved.category

                        };


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
    //          SHARE ARTICLE
    //===========================================

    document
        .querySelectorAll(
            ".share-saved"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const url =
                            button.dataset.url;


                        const title =
                            button.dataset.title ||
                            "TrendSphere Media Article";


                        if(!url){

                            return;

                        }


                        if(
                            navigator.share
                        ){

                            try{

                                await navigator.share({

                                    title:
                                        title,

                                    text:
                                        `Check out this article: ${title}`,

                                    url:
                                        url

                                });

                            }
                            catch(error){

                                if(
                                    error.name !==
                                    "AbortError"
                                ){

                                    console.error(
                                        "Share error:",
                                        error
                                    );

                                }

                            }

                            return;

                        }


                        try{

                            await navigator.clipboard
                                .writeText(
                                    url
                                );


                            alert(
                                "Article link copied!"
                            );

                        }
                        catch(error){

                            console.error(
                                "Unable to share article:",
                                error
                            );

                        }

                    }
                );

            }
        );


    //===========================================
    //          REMOVE ARTICLE
    //===========================================

    document
        .querySelectorAll(
            ".remove-saved"
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

                            alert(
                                "Please log in to manage your saved articles."
                            );

                            return;

                        }


                        try{

                            const {
                                error
                            } =
                                await supabaseClient
                                    .from(
                                        "saved_articles"
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
                                    "Remove saved article error:",
                                    error
                                );


                                alert(
                                    "Unable to remove this article."
                                );

                                return;

                            }


                            selectedSavedUrls.delete(
                                url
                            );


                            await loadSavedArticles();

                        }
                        catch(error){

                            console.error(
                                "Remove saved article failed:",
                                error
                            );

                        }

                    }
                );

            }
        );


    //===========================================
    //          NOTE BUTTON
    //===========================================

    document
        .querySelectorAll(
            ".note-saved"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const url =
                            button.dataset.url;


                        const saved =
                            savedArticles.find(
                                item =>
                                    item.url ===
                                    url
                            );


                        if(!saved){

                            return;

                        }


                        currentNoteUrl =
                            url;


                        if(savedNoteTitle){

                            savedNoteTitle.textContent =
                                saved.title;

                        }


                        if(savedNoteInput){

                            savedNoteInput.value =
                                saved.note || "";

                        }


                        if(deleteSavedNote){

                            deleteSavedNote.style.display =
                                saved.note
                                    ? "inline-flex"
                                    : "none";

                        }


                        savedNoteModal?.classList.add(
                            "show"
                        );


                        savedNoteInput?.focus();

                    }
                );

            }
        );

}


//===============================================
//          SAVED ARTICLE NOTES
//===============================================

if(saveSavedNote){

    saveSavedNote.addEventListener(
        "click",
        async () => {

            if(!currentNoteUrl){

                return;

            }


            const user =
                await getCurrentUser();


            if(!user){

                alert(
                    "Please log in to manage your notes."
                );

                return;

            }


            const note =
                savedNoteInput
                    ? savedNoteInput.value.trim()
                    : "";


            try{

                const {
                    error
                } =
                    await supabaseClient
                        .from(
                            "saved_articles"
                        )
                        .update({

                            note:
                                note || null

                        })
                        .eq(
                            "user_id",
                            user.id
                        )
                        .eq(
                            "article_url",
                            currentNoteUrl
                        );


                if(error){

                    console.error(
                        "Save note error:",
                        error
                    );


                    alert(
                        "Unable to save the note."
                    );

                    return;

                }


                savedNoteModal?.classList.remove(
                    "show"
                );


                currentNoteUrl =
                    null;


                await loadSavedArticles();

            }
            catch(error){

                console.error(
                    "Save note failed:",
                    error
                );

            }

        }
    );

}


//===============================================
//          DELETE ARTICLE NOTE
//===============================================

if(deleteSavedNote){

    deleteSavedNote.addEventListener(
        "click",
        async () => {

            if(!currentNoteUrl){

                return;

            }


            const confirmDelete =
                confirm(
                    "Delete this note?"
                );


            if(!confirmDelete){

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
                            "saved_articles"
                        )
                        .update({

                            note:
                                null

                        })
                        .eq(
                            "user_id",
                            user.id
                        )
                        .eq(
                            "article_url",
                            currentNoteUrl
                        );


                if(error){

                    console.error(
                        "Delete note error:",
                        error
                    );

                    return;

                }


                savedNoteModal?.classList.remove(
                    "show"
                );


                currentNoteUrl =
                    null;


                await loadSavedArticles();

            }
            catch(error){

                console.error(
                    "Delete note failed:",
                    error
                );

            }

        }
    );

}


//===============================================
//          CLOSE SAVED NOTE MODAL
//===============================================

function closeSavedNoteModal(){

    savedNoteModal?.classList.remove(
        "show"
    );


    currentNoteUrl =
        null;

}


if(closeSavedNote){

    closeSavedNote.addEventListener(
        "click",
        closeSavedNoteModal
    );

}


if(cancelSavedNote){

    cancelSavedNote.addEventListener(
        "click",
        closeSavedNoteModal
    );

}


if(savedNoteModal){

    savedNoteModal.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                savedNoteModal
            ){

                closeSavedNoteModal();

            }

        }
    );

}


//===============================================
//          SEARCH INPUT
//===============================================

if(savedSearchInput){

    savedSearchInput.addEventListener(
        "input",
        () => {

            filterSavedArticles();


            if(
                clearSavedSearch &&
                savedSearchInput.value.trim()
            ){

                clearSavedSearch.classList.add(
                    "show"
                );

            }
            else if(clearSavedSearch){

                clearSavedSearch.classList.remove(
                    "show"
                );

            }

        }
    );

}


//===============================================
//          CLEAR SEARCH
//===============================================

if(clearSavedSearch){

    clearSavedSearch.addEventListener(
        "click",
        () => {

            if(savedSearchInput){

                savedSearchInput.value =
                    "";

            }


            clearSavedSearch.classList.remove(
                "show"
            );


            filterSavedArticles();


            savedSearchInput?.focus();

        }
    );

}


//===============================================
//          SORT ARTICLES
//===============================================

if(savedSortSelect){

    savedSortSelect.addEventListener(
        "change",
        () => {

            filterSavedArticles();

        }
    );

}


//===============================================
//          CATEGORY FILTER
//===============================================

savedFilterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                savedFilterButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                filterSavedArticles();

            }
        );

    }
);


//===============================================
//          BROWSE NEWS BUTTON
//===============================================

document.addEventListener(
    "click",
    event => {

        const browseButton =
            event.target.closest(
                "#browse-news-btn"
            );


        if(!browseButton){

            return;

        }


        window.location.href =
            "index.html";

    }
);


//===============================================
//          CLEAR ALL CONFIRMATION
//===============================================

if(
    clearAllSaved &&
    clearConfirmModal
){

    clearAllSaved.addEventListener(
        "click",
        () => {

            if(
                !savedArticles.length
            ){

                return;

            }


            clearConfirmModal.classList.add(
                "show"
            );

        }
    );

}


//===============================================
//          CANCEL CLEAR ALL
//===============================================

if(
    cancelClearSaved &&
    clearConfirmModal
){

    cancelClearSaved.addEventListener(
        "click",
        () => {

            clearConfirmModal.classList.remove(
                "show"
            );

        }
    );

}


//===============================================
//          CONFIRM CLEAR ALL
//===============================================

if(
    confirmClearSaved &&
    clearConfirmModal
){

    confirmClearSaved.addEventListener(
        "click",
        async () => {

            const user =
                await getCurrentUser();


            if(!user){

                alert(
                    "Please log in to manage your saved articles."
                );

                return;

            }


            try{

                const {
                    error
                } =
                    await supabaseClient
                        .from(
                            "saved_articles"
                        )
                        .delete()
                        .eq(
                            "user_id",
                            user.id
                        );


                if(error){

                    console.error(
                        "Clear all saved articles error:",
                        error
                    );


                    alert(
                        "Unable to clear your saved articles."
                    );

                    return;

                }


                selectedSavedUrls.clear();


                manageMode =
                    false;


                clearConfirmModal.classList.remove(
                    "show"
                );


                manageControls?.classList.remove(
                    "show"
                );


                if(manageSaved){

                    manageSaved.style.display =
                        "inline-flex";

                }


                await loadSavedArticles();

            }
            catch(error){

                console.error(
                    "Clear all saved articles failed:",
                    error
                );

            }

        }
    );

}


//===============================================
//       CLOSE MODAL OUTSIDE CLICK
//===============================================

if(clearConfirmModal){

    clearConfirmModal.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                clearConfirmModal
            ){

                clearConfirmModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


//===============================================
//       CLOSE MODAL WITH ESCAPE
//===============================================

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            clearConfirmModal &&
            clearConfirmModal.classList.contains(
                "show"
            )
        ){

            clearConfirmModal.classList.remove(
                "show"
            );

        }

    }
);


//===============================================
//          EXPORT SAVED ARTICLES
//===============================================

if(exportSaved){

    exportSaved.addEventListener(
        "click",
        () => {

            if(
                !savedArticles.length
            ){

                alert(
                    "No saved articles to export."
                );

                return;

            }


            let content =
                "TrendSphere Media - Saved Articles\n\n";


            savedArticles.forEach(
                (article, index) => {

                    content +=
                        `${index + 1}. ${
                            article.title
                        }\n`;

                    content +=
                        `Category: ${
                            article.category ||
                            "News"
                        }\n`;

                    content +=
                        `URL: ${
                            article.url
                        }\n\n`;

                }
            );


            const blob =
                new Blob(
                    [content],
                    {
                        type:
                            "text/plain;charset=utf-8"
                    }
                );


            const link =
                document.createElement(
                    "a"
                );


            const downloadUrl =
                URL.createObjectURL(
                    blob
                );


            link.href =
                downloadUrl;


            link.download =
                "saved-articles.txt";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                downloadUrl
            );

        }
    );

}


//===============================================
//              PRINT SAVED ARTICLES
//===============================================

if(printSavedBtn){

    printSavedBtn.addEventListener(
        "click",
        () => {

            const originalTitle =
                document.title;


            document.title =
                "TrendSphere Media - Saved Articles";


            window.print();


            setTimeout(
                () => {

                    document.title =
                        originalTitle;

                },
                1000
            );

        }
    );

}


//===============================================
//       PRINT SELECTED SAVED ARTICLES
//===============================================

if(printSelectedSaved){

    printSelectedSaved.addEventListener(
        "click",
        () => {

            if(
                selectedSavedUrls.size === 0
            ){

                alert(
                    "Please select at least one article to print."
                );

                return;

            }


            const selectedArticles =
                savedArticles.filter(
                    article =>
                        selectedSavedUrls.has(
                            article.url
                        )
                );


            if(
                !selectedArticles.length
            ){

                return;

            }


            const originalArticles =
                savedArticles;


            savedArticles =
                selectedArticles;


            displaySavedArticles(
                selectedArticles
            );


            setTimeout(
                () => {

                    window.print();

                },
                100
            );


            setTimeout(
                () => {

                    savedArticles =
                        originalArticles;


                    displaySavedArticles();

                },
                500
            );

        }
    );

}


//===============================================
//          COPY SELECTED ARTICLE LINKS
//===============================================

if(copySelectedSaved){

    copySelectedSaved.addEventListener(
        "click",
        async () => {

            if(
                selectedSavedUrls.size === 0
            ){

                alert(
                    "Please select at least one article."
                );

                return;

            }


            const selectedArticles =
                savedArticles.filter(
                    article =>
                        selectedSavedUrls.has(
                            article.url
                        )
                );


            if(
                !selectedArticles.length
            ){

                return;

            }


            const links =
                selectedArticles
                    .map(
                        article =>
                            article.url
                    )
                    .join("\n");


            try{

                await navigator.clipboard.writeText(
                    links
                );


                alert(
                    `${selectedArticles.length} article ${
                        selectedArticles.length === 1
                            ? "link"
                            : "links"
                    } copied successfully!`
                );

            }
            catch(error){

                console.error(
                    "Unable to copy article links:",
                    error
                );


                alert(
                    "Unable to copy the article links."
                );

            }

        }
    );

}


//===============================================
//          SHARE SELECTED ARTICLES
//===============================================

if(shareSelectedSaved){

    shareSelectedSaved.addEventListener(
        "click",
        async () => {

            if(
                selectedSavedUrls.size === 0
            ){

                alert(
                    "Please select at least one article."
                );

                return;

            }


            const selectedArticles =
                savedArticles.filter(
                    article =>
                        selectedSavedUrls.has(
                            article.url
                        )
                );


            if(
                !selectedArticles.length
            ){

                return;

            }


            const shareText =
                selectedArticles
                    .map(
                        (article, index) =>
                            `${index + 1}. ${
                                article.title
                            }\n${
                                article.url
                            }`
                    )
                    .join(
                        "\n\n"
                    );


            if(
                navigator.share
            ){

                try{

                    await navigator.share({

                        title:
                            "TrendSphere Media - Selected Articles",

                        text:
                            shareText

                    });

                }
                catch(error){

                    if(
                        error.name !==
                        "AbortError"
                    ){

                        console.error(
                            "Share selected articles error:",
                            error
                        );

                    }

                }

                return;

            }


            try{

                await navigator.clipboard.writeText(
                    shareText
                );


                alert(
                    "Selected articles copied. You can now paste and share them."
                );

            }
            catch(error){

                console.error(
                    "Unable to share selected articles:",
                    error
                );


                alert(
                    "Unable to share the selected articles."
                );

            }

        }
    );

}


//===============================================
//       DOWNLOAD SELECTED ARTICLES
//===============================================

if(downloadSelectedSaved){

    downloadSelectedSaved.addEventListener(
        "click",
        () => {

            if(
                selectedSavedUrls.size === 0
            ){

                alert(
                    "Please select at least one article."
                );

                return;

            }


            const selectedArticles =
                savedArticles.filter(
                    article =>
                        selectedSavedUrls.has(
                            article.url
                        )
                );


            if(
                !selectedArticles.length
            ){

                return;

            }


            let content =
                "TrendSphere Media\n" +
                "Selected Saved Articles\n" +
                "================================\n\n";


            selectedArticles.forEach(
                (article, index) => {

                    content +=
                        `${index + 1}. ${
                            article.title ||
                            "Untitled Article"
                        }\n`;

                    content +=
                        `Category: ${
                            article.category ||
                            "News"
                        }\n`;

                    content +=
                        `Description: ${
                            article.description ||
                            "No description available."
                        }\n`;

                    content +=
                        `URL: ${
                            article.url ||
                            "No URL available."
                        }\n`;

                    content +=
                        "--------------------------------\n\n";

                }
            );


            const blob =
                new Blob(
                    [content],
                    {
                        type:
                            "text/plain;charset=utf-8"
                    }
                );


            const downloadUrl =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                downloadUrl;


            link.download =
                "selected-saved-articles.txt";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                downloadUrl
            );


            alert(
                `${selectedArticles.length} ${
                    selectedArticles.length === 1
                        ? "article"
                        : "articles"
                } downloaded successfully.`
            );

        }
    );

}


//===============================================
//       LIVE SAVED TIME UPDATES
//===============================================

function updateSavedTimes(){

    document
        .querySelectorAll(
            ".saved-card"
        )
        .forEach(
            card => {

                const timeElement =
                    card.querySelector(
                        ".saved-time"
                    );


                if(!timeElement){

                    return;

                }


                const titleElement =
                    card.querySelector(
                        "h2"
                    );


                if(!titleElement){

                    return;

                }


                const title =
                    titleElement.textContent
                        .trim();


                const article =
                    savedArticles.find(
                        item =>
                            item.title ===
                            title
                    );


                if(
                    !article ||
                    !article.savedAt
                ){

                    return;

                }


                timeElement.textContent =
                    getSavedTime(
                        article.savedAt
                    );

            }
        );

}


setInterval(
    updateSavedTimes,
    60000
);


//===============================================
//          SAVED VIEW SWITCHER
//===============================================

const savedArticlesGrid =
    document.querySelector(
        ".saved-articles-grid"
    );


//===============================================
//          SET SAVED VIEW
//===============================================

function setSavedView(
    view
){

    if(!savedArticlesGrid){

        return;

    }


    if(view === "list"){

        savedArticlesGrid.classList.add(
            "list-view"
        );


        savedListView?.classList.add(
            "active"
        );


        savedGridView?.classList.remove(
            "active"
        );

    }
    else{

        savedArticlesGrid.classList.remove(
            "list-view"
        );


        savedGridView?.classList.add(
            "active"
        );


        savedListView?.classList.remove(
            "active"
        );

    }


    localStorage.setItem(
        "savedArticlesView",
        view
    );

}


//===============================================
//             GRID VIEW
//===============================================

if(savedGridView){

    savedGridView.addEventListener(
        "click",
        () => {

            setSavedView(
                "grid"
            );

        }
    );

}


//===============================================
//             LIST VIEW
//===============================================

if(savedListView){

    savedListView.addEventListener(
        "click",
        () => {

            setSavedView(
                "list"
            );

        }
    );

}


//===============================================
//          RESTORE SAVED VIEW
//===============================================

const savedArticlesView =
    localStorage.getItem(
        "savedArticlesView"
    ) ||
    "grid";


setSavedView(
    savedArticlesView
);


//===============================================
//          GET TIME FILTER
//===============================================

function getSavedTimeLimit(){

    const activeButton =
        document.querySelector(
            ".saved-time-btn.active"
        );


    const selectedTime =
        activeButton
            ? activeButton.dataset.time
            : "all";


    if(
        selectedTime ===
        "all"
    ){

        return 0;

    }


    if(
        selectedTime ===
        "24h"
    ){

        return (
            Date.now() -
            24 * 60 * 60 * 1000
        );

    }


    if(
        selectedTime ===
        "7d"
    ){

        return (
            Date.now() -
            7 * 24 * 60 * 60 * 1000
        );

    }


    if(
        selectedTime ===
        "30d"
    ){

        return (
            Date.now() -
            30 * 24 * 60 * 60 * 1000
        );

    }


    return 0;

}


//===============================================
//          SAVED TIME BUTTONS
//===============================================

savedTimeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                savedTimeButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                localStorage.setItem(
                    "savedTimeFilter",
                    button.dataset.time
                );


                filterSavedArticles();

            }
        );

    }
);


//===============================================
//       RESTORE SAVED TIME FILTER
//===============================================

const savedTimeFilter =
    localStorage.getItem(
        "savedTimeFilter"
    );


if(savedTimeFilter){

    const savedTimeButton =
        document.querySelector(
            `.saved-time-btn[data-time="${savedTimeFilter}"]`
        );


    if(savedTimeButton){

        savedTimeButtons.forEach(
            btn => {

                btn.classList.remove(
                    "active"
                );

            }
        );


        savedTimeButton.classList.add(
            "active"
        );

    }

}


//===============================================
//          AUTH STATE LISTENER
//===============================================

if(isSupabaseReady()){

    supabaseClient.auth.onAuthStateChange(
        (
            event,
            session
        ) => {

            // Reload saved articles whenever
            // login/logout state changes.

            setTimeout(
                () => {

                    if(!session){

                        savedArticles = [];

                        selectedSavedUrls.clear();

                    }


                    loadSavedArticles();

                },
                0
            );

        }
    );

}


//===============================================
//          INITIAL LOAD
//===============================================

loadSavedArticles();