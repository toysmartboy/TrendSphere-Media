//==================================================
//              TrendSphere Media
//              RSS NEWS SERVER
//==================================================


//==================================================
//              IMPORT MODULES
//==================================================

const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");
const cheerio = require("cheerio");


//==================================================
//              APP CONFIGURATION
//==================================================

const app = express();

const PORT = 4000;

const parser = new Parser();


//==================================================
//              RSS CONFIGURATION
//==================================================

// Maximum number of articles returned
// from each RSS category.

const MAX_ARTICLES = 30;


// Cache duration
// 5 minutes

const CACHE_TTL =
    5 * 60 * 1000;





//==================================================
//              RSS FEEDS
//==================================================

const feeds = {

    general: {
        url:
            "https://feeds.bbci.co.uk/news/rss.xml",

        name:
            "BBC News"
    },


    technology: {
        url:
            "https://feeds.bbci.co.uk/news/technology/rss.xml",

        name:
            "BBC Technology"
    },


    sports: {
        url:
            "https://feeds.bbci.co.uk/sport/rss.xml",

        name:
            "BBC Sport"
    },


    entertainment: {
        url:
            "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",

        name:
            "BBC Entertainment & Arts"
    },


    celebrity: {
        url:
            "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",

        name:
            "BBC Celebrity"
    },


    music: {
    url:
        "https://feeds.bbci.co.uk/news/topics/cz4pr2gd872t/rss.xml",

    name:
        "BBC Music"
},
business: {
    url:
        "https://feeds.bbci.co.uk/news/business/rss.xml",
    name:
        "BBC Business"
},

lifestyle: {
    url:
        "https://feeds.bbci.co.uk/news/topics/cqeer179r4vt/rss.xml",
    name:
        "BBC Lifestyle"
},
    video: {
        url:
            "https://www.youtube.com/feeds/videos.xml?channel_id=UC16niRr50-MSBwiO3YDb3RA",
        name:
            "BBC News Videos"
    }

};







//==================================================
//              CACHE
//==================================================

const feedCache =
    new Map();


//==================================================
//              MIDDLEWARE
//==================================================

app.use(
    cors()
);

app.use(
    express.json()
);


//==================================================
//              TEST ROUTE
//==================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "TrendSphere RSS Server is running"

        });

    }
);








//==================================================
//              IMAGE EXTRACTION
//==================================================

function getArticleImage(item) {

    //==================================================
    //              DIRECT IMAGE FIELDS
    //==================================================

    if (
        item.enclosure &&
        item.enclosure.url
    ) {

        return item.enclosure.url;

    }


    //==================================================
    //              MEDIA CONTENT
    //==================================================

    if (
        item.media &&
        item.media.content &&
        item.media.content.url
    ) {

        return item.media.content.url;

    }


    //==================================================
    //              MEDIA THUMBNAIL
    //==================================================

    if (
        item.media &&
        item.media.thumbnail &&
        item.media.thumbnail.url
    ) {

        return item.media.thumbnail.url;

    }


    //==================================================
    //              RSS MEDIA FIELDS
    //==================================================

    if (
        item["media:content"] &&
        item["media:content"].url
    ) {

        return item["media:content"].url;

    }


    if (
        item["media:thumbnail"] &&
        item["media:thumbnail"].url
    ) {

        return item["media:thumbnail"].url;

    }


    //==================================================
    //              IMAGE OBJECT
    //==================================================

    if (
        item.image &&
        item.image.url
    ) {

        return item.image.url;

    }


    //==================================================
    //              CONTENT IMAGE
    //==================================================

    const htmlContent =
        item["content:encoded"] ||
        item.content ||
        item.description ||
        "";

    if (htmlContent) {

        try {

            const $ =
                cheerio.load(
                    htmlContent
                );

            const image =
                $("img").first();

            if (
                image.length &&
                image.attr("src")
            ) {

                return image.attr("src");

            }

            if (
                image.length &&
                image.attr("data-src")
            ) {

                return image.attr("data-src");

            }

        }

        catch (error) {

            console.log(
                "Image extraction error:",
                error.message
            );

        }

    }


    //==================================================
    //              NO IMAGE FOUND
    //==================================================

    return "";

}








//==================================================
//              ARTICLE PAGE IMAGE
//==================================================

async function getArticlePageImage(url) {

    if (!url) {
        return "";
    }


    // ==========================================
    //          YOUTUBE THUMBNAIL
    // ==========================================

    const youtubeMatch =
        url.match(
            /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/]+)/
        );


    if (youtubeMatch) {

        const videoId =
            youtubeMatch[1];

        return `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;

    }


    // ==========================================
    //          NORMAL ARTICLE IMAGE
    // ==========================================

    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            console.log(
                `Article page request failed: ${response.status}`
            );

            return "";

        }


        console.log(
            "Article page status:",
            response.status,
            url
        );


        const html =
            await response.text();


        const $ =
            cheerio.load(html);


        const ogImage =
            $('meta[property="og:image"]')
                .attr("content");


        console.log(
            "OG image:",
            ogImage
        );


        if (ogImage) {
            return ogImage;
        }


        const twitterImage =
            $('meta[name="twitter:image"]')
                .attr("content");


        if (twitterImage) {
            return twitterImage;
        }


        const articleImage =
            $("article img")
                .first()
                .attr("src");


        if (articleImage) {
            return articleImage;
        }

    }
    catch (error) {

        console.log(
            "Article image extraction error:",
            error.message
        );

    }


    return "";

}




//==================================================
//              RSS ROUTE
//==================================================

app.get(
    "/rss/:category",
    async (req, res) => {

        const category =
            req.params.category
                .toLowerCase();


        //==================================================
        //          CHECK CATEGORY
        //==================================================

        const feedConfig =
            feeds[category];


        if (!feedConfig) {

            return res.status(404).json({

                success: false,

                message:
                    "Invalid RSS category",

                availableCategories:
                    Object.keys(feeds)

            });

        }


        //==================================================
        //          CHECK CACHE
        //==================================================

        const cached =
            feedCache.get(
                category
            );


        if (

            cached &&

            Date.now() -
            cached.timestamp <
            CACHE_TTL

        ) {

            console.log(

                `Using cached ${category} feed`

            );


            return res.json({

                ...cached.data,

                cached: true

            });

        }


        //==================================================
        //          FETCH RSS FEED
        //==================================================

        try {

            console.log(

                `Fetching fresh ${category} RSS feed...`

            );


            const feed =
    await parser.parseURL(
        feedConfig.url
    );

console.log(
    JSON.stringify(
        feed.items[0],
        null,
        2
    )
);

const items =
    feed.items.slice(
        0,
        MAX_ARTICLES
    );

console.log(
    `${items.length} ${category} articles selected`
);       









            //==================================================
//          PROCESS ARTICLES
//==================================================

const articles =
    await Promise.all(

        items.map(
            async item => {

                let image =
                    getArticleImage(item);


                //==================================================
                //      FETCH IMAGE FROM ARTICLE PAGE
                //==================================================

                if (
                    !image &&
                    item.link
                ) {

                    image =
                        await getArticlePageImage(
                            item.link
                        );

                }


                return {

                    title:
                        item.title ||
                        "",


                    description:
                        item.contentSnippet ||
                        item.content ||
                        "",


                    url:
                        item.link ||
                        "",


                    urlToImage:
                        image ||
                        "",


                    source: {

                        name:
                            feedConfig.name

                    },


                    publishedAt:
                        item.isoDate ||

                        item.pubDate ||

                        "",


                    category:
                        category

                };

            }

        )

    );



            //==================================================
            //          REMOVE FAILED ARTICLES
            //==================================================

            const validArticles =
                articles.filter(
                    article =>
                        article !== null
                );


            //==================================================
            //          RESPONSE DATA
            //==================================================

            const responseData = {

                success: true,

                source:
                    feedConfig.name,

                category:
                    category,

                count:
                    validArticles.length,

                articles:
                    validArticles

            };


            //==================================================
            //          SAVE TO CACHE
            //==================================================

            feedCache.set(

                category,

                {

                    timestamp:
                        Date.now(),

                    data:
                        responseData

                }

            );


            //==================================================
            //          SEND RESPONSE
            //==================================================

            res.json({

                ...responseData,

                cached:
                    false

            });

        }


        catch (error) {

            console.error(

                `RSS error (${category}):`,

                error.message

            );


            //==================================================
            //          STALE CACHE FALLBACK
            //==================================================

            if (cached) {

                console.log(

                    `Using stale ${category} cache`

                );


                return res.json({

                    ...cached.data,

                    cached: true,

                    stale: true

                });

            }


            //==================================================
            //          ERROR RESPONSE
            //==================================================

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch RSS feed",

                error:
                    error.message

            });

        }

    }

);


//==================================================
//              START SERVER
//==================================================

app.listen(

    PORT,

    () => {

        console.log(
            "=========================================="
        );

        console.log(
            "      TrendSphere RSS Server"
        );

        console.log(
            "=========================================="
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Maximum articles per category: ${MAX_ARTICLES}`
        );

        console.log(
            `Cache duration: ${CACHE_TTL / 60000} minutes`
        );

        console.log(
            "=========================================="
        );

    }

);