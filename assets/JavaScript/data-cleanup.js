//===============================================
//      TRENDSPHERE DATA MIGRATION CLEANUP
//===============================================
//
// Supabase is now the source of truth for:
// - Saved Articles
// - Reading History
// - Notifications
//
// This removes old browser-only data that could
// otherwise conflict with the new Supabase system.
//===============================================

(function(){

    const CLEANUP_VERSION =
        "supabase-migration-v1";


    //===========================================
    //          CHECK CLEANUP STATUS
    //===========================================

    if(
        localStorage.getItem(
            "trendSphereDataCleanup"
        ) === CLEANUP_VERSION
    ){

        return;

    }


    //===========================================
    //          OLD SAVED ARTICLE DATA
    //===========================================

    localStorage.removeItem(
        "savedArticles"
    );


    //===========================================
    //          OLD READING HISTORY
    //===========================================

    localStorage.removeItem(
        "readingHistory"
    );


    //===========================================
    //          OLD SELECTION STATE
    //===========================================

    localStorage.removeItem(
        "selectedSavedArticles"
    );


    //===========================================
    //          OLD NOTIFICATION DATA
    //===========================================

    localStorage.removeItem(
        "notifications"
    );


    localStorage.removeItem(
        "notificationData"
    );


    //===========================================
    //          MARK CLEANUP COMPLETE
    //===========================================

    localStorage.setItem(
        "trendSphereDataCleanup",
        CLEANUP_VERSION
    );


    console.log(
        "TrendSphere: old local data cleaned successfully."
    );

})();