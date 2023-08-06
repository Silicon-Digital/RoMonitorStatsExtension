import common from './common'

let config = common.config;
let homeConfig = {
    data: null
}


export default {
    extendPage: async function () {
        await common.getDiscoverData().then(
            (data) => {
                homeConfig.data = data;
            }
        );

        buildHomeSearch();
    }
}


function buildHomeSearch() {
    let container;

    // Perform a bunch of checks here to make sure the 
    // HTML looks like it is expected, to avoid extension breaking/doing 
    // weird things if webpage is updated in the future. 
    {
        let place_list = document.getElementById("place-list");

        if (!place_list) {
            return;
        }

        container = place_list.getElementsByClassName("game-home-page-container");
    }

    if (container.length != 1) {
        return;
    }
    container = container[0]
    if (container.nodeName != "DIV") {
        return;
    }

    // Once the search/carousel container is found, add our new search to the page. 
    container.insertBefore(buildCarousel(), container.children.item(2));
    container.insertBefore(buildHomePageTitle("Top Experiences", "https://romonitorstats.com/leaderboard/active/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough"), container.children.item(2));

    // Function puts the title/search in the correct place on the page. 
    updateHomePage(container);

    // Unfortunately since the DOM does not load consistently, sometimes the insertion happens 
    // before the other searches have loaded. To combat this, we add a MutationObserver which 
    // removes and adds the carousel/title every time the children of the container are updated
    // to ensure that our title/carousel is always in the same place. 
    const config = {
        childList: true
    };

    const callback = function (mutations, observer) {
        const container = document.getElementById("place-list").getElementsByClassName("game-home-page-container")[0];
        const config = {
            childList: true
        };

        observer.disconnect();
        updateHomePage(container);
        observer.observe(container, config);
    }

    const observer = new MutationObserver(callback);
    observer.observe(container, config);
}

// Simply refreshes the page with our new element in a consistent location. 
function updateHomePage(container) {
    const title = document.getElementById("romonitor-title");
    const search = document.getElementById("romonitor-search");

    if (title) {
        container.removeChild(title);
    }
    if (search) {
        container.removeChild(search)
    }
    if (search) {
        container.insertBefore(search, container.children.item(2));
    }
    if (title) {
        container.insertBefore(title, container.children.item(2));
    }


}

function buildHomePageTitle(title, href) {
    let newTitle = document.createElement("div");
    newTitle.className = 'container-header';
    newTitle.innerHTML = `<h2>
                            ${title} 
                          <br><div class="text-secondary">Ranked by CCUs - ${common.config.poweredBy}</div>
                        </h2>
                        <a class="btn-secondary-xs see-all-link-icon btn-more"
                            href="${href}"
                            target="_blank"
                        >
                          See All
                        </a>`;
    newTitle.id = "romonitor-title";
    return newTitle;
}

function buildCarousel() {
    let newCarousel = document.createElement("div");
    newCarousel.setAttribute("class", "game-carousel")
    newCarousel.setAttribute("data-testid", "game-game-carousel")
    newCarousel.id = "romonitor-search"

    // We loop just to make sure that the API has actually given us data
    const dataAry = [];
    let i = 0;
    while (homeConfig.data.length > i && i < 6) {
        dataAry.push(homeConfig.data[i]);
        i++;
    }

    dataAry.forEach((game) => {
        newCarousel.appendChild(buildGameCard(
            "https://www.roblox.com/games/" + game.placeId, game.placeId, game.name, common.fixPercentage(game.rating), common.fixPlayCount(game.playing), game.icon
        ));
    });


    return newCarousel;
}

function buildGameCard(href, id, title, votePercentage, playerCount, imgRef) {
    // Build the card up from elements that reflect the HTMl on the home page. 
    // Class attributes are used for consistency with the home page. 
    let cardContainer = document.createElement("div");
    cardContainer.setAttribute("class", "grid-item-container game-card-container");
    cardContainer.setAttribute("data-testid", "game-title");

    let anchor = document.createElement("a");
    cardContainer.appendChild(anchor);

    anchor.setAttribute("class", "game-card-link");
    anchor.setAttribute("href", `${href}`)
    anchor.setAttribute("id", `${id}`)

    let anchorChildren = [
        document.createElement("span"), // Image Holder
        document.createElement("div"), // Game Title
        document.createElement("div") // stats stuff
    ]
    anchorChildren.forEach((child) => anchor.appendChild(child));

    // Add the child image tag for the span. 
    const img = document.createElement("img");
    img.setAttribute("src", imgRef);
    img.setAttribute("alt", title);
    img.setAttribute("title", title);
    anchorChildren[0].appendChild(img);

    anchorChildren[0].setAttribute("class", "thumbnail-2d-container shimmer game-card-thumb-container");
    anchorChildren[1].setAttribute("class", "game-card-name game-name-title");
    anchorChildren[1].setAttribute("title", `${title}`);
    anchorChildren[1].innerHTML = title;
    anchorChildren[2].setAttribute("class", "game-card-info");
    anchorChildren[2].setAttribute("data-testid", "game-tile-stats");

    let cardInfoChildren = [
        document.createElement("span"), // votePercentageIcon 
        document.createElement("span"), // votePercentage 
        document.createElement("span"), // playCountIcon 
        document.createElement("span")  // playCount 
    ]
    cardInfoChildren.forEach((child) => anchorChildren[2].appendChild(child));

    cardInfoChildren[0].setAttribute("class", "info-label icon-votes-gray");
    cardInfoChildren[1].setAttribute("class", "info-label vote-percentage-label");
    cardInfoChildren[1].innerHTML = votePercentage;
    cardInfoChildren[2].setAttribute("class", "info-label icon-playing-counts-gray");
    cardInfoChildren[3].setAttribute("class", "info-label playing-counts-label");
    cardInfoChildren[3].innerHTML = playerCount;


    return cardContainer;
}


