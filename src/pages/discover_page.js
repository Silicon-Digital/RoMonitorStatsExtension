import common from '../common'

let discoverConfig = {
    data: null,
    discoverId: "romonitor-discover-carousel",
    robloxGameUri: "https://www.roblox.com/games/",
    leftId: "romonitor-left",
    rightId: "romonitor-right",
    maxCards: 50,
    cardWidth: 210
}

let current = 0;

export default {
    extendDiscover: async function () {

        let options = await chrome.storage.sync.get({discoverTopExperiencesDisplayed: true});

        if (options.discoverTopExperiencesDisplayed) {
            await common.getDiscoverData().then(
                (data) => {
                    discoverConfig.data = data;
                }
            );

            buildDiscoverSearch();
        }

    }
}

function buildDiscoverSearch() {
    // Perform a bunch of checks here to make sure the
    // HTML looks like it is expected, to avoid extension breaking/doing 
    // weird things if webpage is updated in the future. 

    const carouselList = document.getElementById("games-carousel-page");
    if (!carouselList) {
        return
    }


    // Once the search/carousel container is found, add our new search to the page. 
    carouselList.insertBefore(buildGameListContainer(), carouselList.children.item(2));

    // Function puts the title/search in the correct place on the page. 
    // updateHomePage(carouselList);

    // Unfortunately since the DOM does not load consistently, sometimes the insertion happens 
    // before the other searches have loaded. To combat this, we add a MutationObserver which 
    // removes and adds the carousel/title every time the children of the container are updated
    // to ensure that our title/carousel is always in the same place. 
    const config = {
        childList: true
    };

    const callback = function (mutations, observer) {
        const carouselList = document.getElementById("games-carousel-page");
        const config = {
            childList: true
        };

        observer.disconnect();
        updateDiscoverPage(carouselList);
        observer.observe(carouselList, config);
    }

    const observer = new MutationObserver(callback);
    observer.observe(carouselList, config);
}

function updateDiscoverPage(carouselList) {
    const title = document.getElementById(discoverConfig.discoverId);
    carouselList.removeChild(title);
    carouselList.insertBefore(buildGameListContainer(), carouselList.children.item(2));
}

function buildGameListContainer() {
    const container = document.createElement("div");
    container.id = discoverConfig.discoverId

    container.setAttribute("data-testid", "game-carousel-games-container");
    container.className = "games-list-container"

    container.appendChild(buildHeader(common.getText("Top_Experiences")));
    container.appendChild(buildList());

    return container;
}

function buildHeader(title) {
    const header = document.createElement("div");
    header.setAttribute("data-testid", "game-lists-game-container-header");
    header.setAttribute("class", "container-header games-filter-changer");

    header.innerHTML = `<h2>
                            ${title} 
                        </h2>
                        <a href="https://romonitorstats.com/leaderboard/active/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough" target="_blank">
                            <div class="btn-secondary-xs see-all-link-icon btn-more">
                                ${common.getText('PoweredBy')} <span class="text-link">RoMonitor Stats</span>
                            </div>
                        </a>`;
    return header;
}

function buildList() {
    const scroller = document.createElement("div");
    scroller.setAttribute("class", "horizontal-scroller games-list large-tiles");

    const container = document.createElement("div");
    container.setAttribute("class", "clearfix horizontal-scroll-window");
    container.setAttribute("data-testid", "game-carousel-carousel-container");
    scroller.appendChild(container);

    container.appendChild(buildCarousel());
    container.appendChild(buildLeftButton())
    container.appendChild(buildRightButton())

    return scroller;
}

function calculateCardsPerScreen() {
    let availableWidth = document.getElementsByClassName("games-list-container")[0].clientWidth;
    let possibleCards = availableWidth / discoverConfig.cardWidth;

    if (possibleCards > discoverConfig.maxCards) {
        return discoverConfig.maxCards;
    }

    return possibleCards;
}

function buildLeftButton() {
    const leftScroll = document.createElement("div");
    leftScroll.setAttribute("class", `scroller prev disabled ${discoverConfig.leftId}`);
    leftScroll.setAttribute("data-testid", "game-carousel-scroll-bar");
    leftScroll.setAttribute("role", "button");
    leftScroll.setAttribute("tabindex", "0");
    leftScroll.setAttribute("style", "height: 240px !important;")

    leftScroll.innerHTML =
        `
        <div class="arrow">
            <span class="icon-games-carousel-left"></span>
        </div>
        <div class="spacer"></div>
    
        `
    leftScroll.addEventListener("click", () => {
        changeCurrent(-calculateCardsPerScreen());
    });
    return leftScroll;

}

function buildRightButton() {
    const rightScroll = document.createElement("div");
    rightScroll.setAttribute("class", `scroller next ${discoverConfig.rightId}`);
    rightScroll.setAttribute("data-testid", "game-carousel-scroll-bar");
    rightScroll.setAttribute("role", "button");
    rightScroll.setAttribute("tabindex", "0");
    rightScroll.setAttribute("style", "height: 240px !important;")

    rightScroll.innerHTML =
        `
        <div class="arrow">
            <span class="icon-games-carousel-right"></span>
        </div>
        <div class="spacer"></div>
    
        `
    rightScroll.addEventListener("click", () => {
        changeCurrent(calculateCardsPerScreen());
    });
    return rightScroll;
}

function changeCurrent(delta) {
    current = current + delta;

    if (current < 0) {
        current = 0;
    } else if (current > discoverConfig.data.length - 1) {
        current = discoverConfig.data.length - 1;
    }

    let newPx = -current * discoverConfig.cardWidth * 0.9;

    let carousel = document.getElementById("romonitor-carousel");
    carousel.setAttribute("style", `left: ${newPx}px;`)
}

function buildCarousel() {
    const carousel = document.createElement("div");
    carousel.setAttribute("class", "horizontally-scrollable");
    carousel.setAttribute("style", "left: 0px;");
    carousel.setAttribute("style", "height: 270px;");
    carousel.setAttribute("id", "romonitor-carousel");

    const ul = document.createElement("ul");
    ul.setAttribute("class", "hlist games game-cards game-tile-list")
    carousel.appendChild(ul);

    let length = discoverConfig.data.length - 1;

    discoverConfig.data.forEach((game, index) => {
        if (index === 0) {
            ul.appendChild(buildGame(game, "first-tile"));

        } else if (index === length) {
            ul.appendChild(buildGame(game, "last-tile"));
        } else {
            ul.appendChild(buildGame(game))
        }
    });


    return carousel;
}

function buildGame(game, extraClass = "") {
    const href = discoverConfig.robloxGameUri + game.placeId
    const li = document.createElement("li");
    li.setAttribute("class", "list-item game-tile " + extraClass);
    li.id = game.placeId;
    const liDiv = document.createElement("div");
    li.appendChild(liDiv);


    liDiv.setAttribute("class", "featured-game-container game-card-container image-container");
    liDiv.innerHTML = `
        <a class="game-card-link" href="${href}">
            <div class="featured-game-icon-container">
                <span class="romonitor-image-container thumbnail-2d-container brief-game-icon">
                    <img class="romonitor-image" src="${game.icon}" alt=${game.name} title="${game.name}" loading="lazy">
                </span>
            </div>
            <div class="info-container">
                <div data-testid="game-tile-game-name" class="game-card-name game-name-title" title="${game.name}">${game.name}</div>
                <div data-testid="game-tile-card-info" class="game-card-info">
                    <span class="info-label icon-votes-gray"></span>
                    <span class="info-label vote-percentage-label" data-testid="game-tile-card-info-vote-label">${common.fixPercentage(game.rating)}</span>
                    <span class="info-label icon-playing-counts-gray"></span>
                    <span class="info-label playing-counts-label" style="" title="${game.playing}">${common.fixPlayCount(game.playing)}</span>
                </div>
            </div>
        </a>

        <div>
        </div>
        `


    // Dynamic card 
    /*
    If a Dynamic card hover wants to be added, a new div should be made here. Currently, will be static.
    */

    return li;
}

/**
 *
 */