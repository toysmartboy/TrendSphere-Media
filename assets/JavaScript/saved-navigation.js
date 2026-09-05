//===============================================
//          SAVED NAVIGATION COUNT
//===============================================

function updateSavedNavigationCount(){

    const savedNavCount =
        document.getElementById(
            "saved-nav-count"
        );


    if(!savedNavCount){

        return;

    }


    const savedArticles =
        JSON.parse(
            localStorage.getItem(
                "savedArticles"
            )
        ) || [];


    const count =
        savedArticles.length;


    if(count > 0){

        savedNavCount.textContent =
            count;

        savedNavCount.style.display =
            "inline-flex";

    }
    else{

        savedNavCount.textContent =
            "";

        savedNavCount.style.display =
            "none";

    }

}


//===============================================
//          INITIAL UPDATE
//===============================================

updateSavedNavigationCount();


//===============================================
//          STORAGE CHANGE
//===============================================

window.addEventListener(
    "storage",
    event => {

        if(
            event.key ===
            "savedArticles"
        ){

            updateSavedNavigationCount();

        }

    }
);


//===============================================
//          PAGE RETURN
//===============================================

window.addEventListener(
    "pageshow",
    () => {

        updateSavedNavigationCount();

    }
);


//===============================================
//          TAB VISIBILITY
//===============================================

document.addEventListener(
    "visibilitychange",
    () => {

        if(
            document.visibilityState ===
            "visible"
        ){

            updateSavedNavigationCount();

        }

    }
);