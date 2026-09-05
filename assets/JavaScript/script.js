//==================================================
//              CURRENT DATE
//==================================================

const currentDate =
    document.getElementById("current-date");


function displayCurrentDate(){

    if(!currentDate){
        return;
    }


    const today =
        new Date();


    const options = {

        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"

    };


    currentDate.textContent =
        today.toLocaleDateString(
            "en-GB",
            options
        );

}


displayCurrentDate();



//==================================================
//          MOBILE / TABLET MENU
//==================================================

const menuBtn =
    document.getElementById("menu-btn");

const navLinks =
    document.getElementById("nav-links");


if(menuBtn && navLinks){

    menuBtn.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "show-menu"
            );

        }
    );


    navLinks
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        navLinks.classList.remove(
                            "show-menu"
                        );

                    }
                );

            }
        );

}



//==================================================
//              STICKY NAVBAR
//==================================================

const header =
    document.getElementById("header");


if(header){

    window.addEventListener(
        "scroll",
        () => {

            header.classList.toggle(
                "sticky",
                window.scrollY > 50
            );

        }
    );

}



//==================================================
//              BACK TO TOP
//==================================================

const scrollTopBtn =
    document.getElementById("scroll-top");


if(scrollTopBtn){

    window.addEventListener(
        "scroll",
        () => {

            if(window.scrollY > 500){

                scrollTopBtn.classList.add(
                    "show"
                );

            }
            else{

                scrollTopBtn.classList.remove(
                    "show"
                );

            }

        }
    );


    scrollTopBtn.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}



//==================================================
//              SCROLL REVEAL
//==================================================

const revealElements =
    document.querySelectorAll(".reveal");


function revealOnScroll(){

    const windowHeight =
        window.innerHeight;


    revealElements.forEach(
        element => {

            const revealTop =
                element.getBoundingClientRect().top;


            const revealPoint =
                100;


            if(
                revealTop <
                windowHeight - revealPoint
            ){

                element.classList.add(
                    "active"
                );

            }

        }
    );

}


window.addEventListener(
    "scroll",
    revealOnScroll
);


window.addEventListener(
    "load",
    revealOnScroll
);



//==================================================
//              ACTIVE NAVIGATION
//==================================================

const sections =
    document.querySelectorAll(
        "section[id]"
    );


const navItems =
    document.querySelectorAll(
        ".nav-links a"
    );


window.addEventListener(
    "scroll",
    () => {

        let currentSection = "";


        sections.forEach(
            section => {

                const sectionTop =
                    section.offsetTop - 150;


                if(
                    window.scrollY >= sectionTop
                ){

                    currentSection =
                        section.getAttribute(
                            "id"
                        );

                }

            }
        );


        navItems.forEach(
            link => {

                link.classList.remove(
                    "active"
                );


                if(
                    link.getAttribute("href") ===
                    "#" + currentSection
                ){

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);



//==================================================
//              LAZY LOAD IMAGES
//==================================================

const images =
    document.querySelectorAll(
        'img[loading="lazy"]'
    );


images.forEach(
    image => {

        if(image.complete){

            image.classList.add(
                "loaded"
            );

        }


        image.addEventListener(
            "load",
            () => {

                image.classList.add(
                    "loaded"
                );

            }
        );

    }
);



//==================================================
//==================================================
//          TRENDSPHERE NAVIGATION BADGES
//          SUPABASE USER COUNTS
//==================================================
//==================================================


//==================================================
//              SUPABASE CHECK
//==================================================

function isNavigationSupabaseReady(){

    return (

        typeof supabaseClient !==
            "undefined" &&

        supabaseClient &&

        supabaseClient.auth

    );

}



//==================================================
//              GET CURRENT USER
//==================================================

async function getNavigationUser(){

    if(
        !isNavigationSupabaseReady()
    ){

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
                "Unable to get navigation user:",
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
            "Navigation user error:",
            error
        );

        return null;

    }

}



//==================================================
//          UPDATE SAVED ARTICLES BADGE
//==================================================

async function updateSavedNavigationCount(){

    const savedNavCount =
        document.getElementById(
            "saved-nav-count"
        );


    if(!savedNavCount){

        return;

    }


    const user =
        await getNavigationUser();


    if(!user){

        savedNavCount.textContent = "0";

        savedNavCount.classList.add(
            "hidden"
        );

        savedNavCount.style.display =
            "none";

        return;

    }


    try{

        const {
            count,
            error
        } =
            await supabaseClient
                .from("saved_articles")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "user_id",
                    user.id
                );


        if(error){

            console.error(
                "Unable to get saved article count:",
                error
            );

            savedNavCount.textContent =
                "0";

            savedNavCount.classList.add(
                "hidden"
            );

            savedNavCount.style.display =
                "none";

            return;

        }


        const total =
            count || 0;


        savedNavCount.textContent =
            total;


        if(total > 0){

            savedNavCount.classList.remove(
                "hidden"
            );

            savedNavCount.style.display =
                "inline-flex";

        }
        else{

            savedNavCount.classList.add(
                "hidden"
            );

            savedNavCount.style.display =
                "none";

        }

    }
    catch(error){

        console.error(
            "Saved navigation count error:",
            error
        );

        savedNavCount.style.display =
            "none";

    }

}



//==================================================
//          UPDATE HISTORY BADGE
//==================================================

async function updateHistoryNavigationCount(){

    const historyNavCount =
        document.getElementById(
            "history-nav-count"
        );


    if(!historyNavCount){

        return;

    }


    const user =
        await getNavigationUser();


    if(!user){

        historyNavCount.textContent =
            "0";

        historyNavCount.classList.add(
            "hidden"
        );

        return;

    }


    try{

        const {
            count,
            error
        } =
            await supabaseClient
                .from("reading_history")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "user_id",
                    user.id
                );


        if(error){

            console.error(
                "Unable to get reading history count:",
                error
            );

            historyNavCount.textContent =
                "0";

            historyNavCount.classList.add(
                "hidden"
            );

            return;

        }


        const total =
            count || 0;


        historyNavCount.textContent =
            total;


        if(total === 0){

            historyNavCount.classList.add(
                "hidden"
            );

        }
        else{

            historyNavCount.classList.remove(
                "hidden"
            );

        }

    }
    catch(error){

        console.error(
            "History navigation count error:",
            error
        );

    }

}



//==================================================
//          UPDATE ALL NAVIGATION BADGES
//==================================================

async function updateAllNavigationBadges(){

    await Promise.all([

        updateSavedNavigationCount(),

        updateHistoryNavigationCount()

    ]);

}


updateAllNavigationBadges();



//==================================================
//              WINDOW FOCUS
//==================================================

window.addEventListener(
    "focus",
    () => {

        updateAllNavigationBadges();

    }
);



//==================================================
//          PAGE VISIBILITY
//==================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if(
            document.visibilityState ===
            "visible"
        ){

            updateAllNavigationBadges();

        }

    }
);



//==================================================
//              AUTH STATE
//==================================================

if(
    isNavigationSupabaseReady()
){

    supabaseClient.auth.onAuthStateChange(
        (
            event,
            session
        ) => {

            setTimeout(
                () => {

                    updateAllNavigationBadges();

                },
                0
            );

        }
    );

}



//==================================================
//              RECENTLY READ
//==================================================

function displayRecentlyRead(){

    const container =
        document.getElementById(
            "recently-read-container"
        );


    const empty =
        document.getElementById(
            "recently-read-empty"
        );


    if(
        !container ||
        !empty
    ){

        return;

    }


    let history =
        JSON.parse(
            localStorage.getItem(
                "readingHistory"
            )
        ) || [];


    history =
        history
            .sort(
                (a, b) =>
                    (b.readAt || 0) -
                    (a.readAt || 0)
            )
            .slice(0, 3);


    container.innerHTML = "";


    if(!history.length){

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    history.forEach(
        article => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "recently-read-card";


            card.innerHTML = `

                <img
                    src="${
                        article.urlToImage ||
                        "assets/Images/no-image.png"
                    }"
                    alt="${
                        article.title ||
                        "News article"
                    }"
                    loading="lazy"
                >

                <div class="recently-read-content">

                    <span
                        class="recently-read-category"
                    >
                        ${
                            article.category ||
                            "News"
                        }
                    </span>

                    <h3>
                        ${
                            article.title ||
                            "Untitled Article"
                        }
                    </h3>

                    <small
                        class="recently-read-time"
                    >
                        Recently read
                    </small>

                    <a
                        href="#"
                        class="recently-read-btn"
                    >
                        <i class="bx bx-book-open"></i>
                        Read Again
                    </a>

                </div>

            `;


            const readButton =
                card.querySelector(
                    ".recently-read-btn"
                );


            if(readButton){

                readButton.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


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


            container.appendChild(
                card
            );

        }
    );

}


displayRecentlyRead();



