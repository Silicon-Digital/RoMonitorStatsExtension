import common from './common'

let discoverConfig = {
    data: null,
    discoverId: "romonitor-discover-carousel",
    robloxExperienceUri: "https://www.roblox.com/games/",
    leftId: "romonitor-left",
    rightId: "romonitor-right",
    maxCards: 5,
    cardWidth: 208
}

let current = 0;

export default {
    extendCharts: async function () {
        await common.getDiscoverData().then(
            (data) => {
                discoverConfig.data = data;
            }
        );

        common.waitForElements('.games-page-container, .section', () => {
            buildDiscoverSearch();
        });

        const parentElement = document.body;

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach((node) => {
                        if (node instanceof Element && node.classList.contains('filters-container')) {
                            // We can assume here that the user has used the Roblox filters as Roblox destroys the filter container.
                            const carousel = document.getElementById(discoverConfig.discoverId);

                            if (carousel) {
                                carousel.remove();
                            }

                            common.waitForElements('.games-page-container, .section', () => {
                                buildDiscoverSearch();
                            });
                        }
                    });
                }
            }
        });

        observer.observe(parentElement, {
            childList: true,
            subtree: true,
        });
    }
}

function buildDiscoverSearch() {
    let container;

    // Perform a bunch of checks here to make sure the 
    // HTML looks like it is expected, to avoid extension breaking/doing 
    // weird things if webpage is updated in the future. 

    const carouselList = document.getElementById("games-carousel-page").firstChild.firstChild;
    if (!carouselList) {
        return
    }

    carouselList.insertBefore(buildGameListContainer(), carouselList.children.item(4));

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
        observer.observe(carouselList, config);
    }

    const observer = new MutationObserver(callback);
    observer.observe(carouselList, config);
}

function buildGameListContainer() {
    const container = document.createElement("div");
    container.id = discoverConfig.discoverId

    container.setAttribute("data-testid", "game-carousel-games-container");
    container.className = "games-list-container"

    container.appendChild(buildHeader("Top Experiences", "https://romonitorstats.com/leaderboard/active/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough", "Results for all devices and locations"));
    container.appendChild(buildList());

    return container;
}

function buildHeader(title, href, subtitleText = "") {
    const headerContainer = document.createElement("div");
    headerContainer.setAttribute("class", "game-sort-header-container");

    const header = document.createElement("div");
    header.setAttribute("data-testid", "game-lists-game-container-header");
    header.setAttribute("class", "container-header games-filter-changer");


    header.innerHTML = `
        <h2 class="sort-header">${title}</h2>
        <a
            href="${href}"
            target="_blank"
            class="see-all-button games-filter-changer btn-secondary-xs btn-more see-all-link-icon"
            data-testid="game-lists-game-container-header-see-all-button">${common.config.poweredByText}</a>
        `

    headerContainer.appendChild(header);

    const subtitle = document.createElement("div");
    subtitle.setAttribute("class", "sort-subtitle-container");

    subtitle.innerHTML = `<span class="font-sort-subtitle text-default">${subtitleText}</span>`

    headerContainer.appendChild(subtitle);

    return headerContainer;
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
    leftScroll.style = "height: 240px;"

    leftScroll.innerHTML =
        `
        <div class="arrow">
            <span class="icon-games-carousel-left"></span>
        </div>
        <div class="spacer"></div>
    
        `
    leftScroll.addEventListener("click", (e) => {
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
    rightScroll.style = "height: 240px;"

    rightScroll.innerHTML =
        `
        <div class="arrow">
            <span class="icon-games-carousel-right"></span>
        </div>
        <div class="spacer"></div>
    
        `
    rightScroll.addEventListener("click", (e) => {
        changeCurrent(calculateCardsPerScreen());
    });
    return rightScroll;
}

function changeCurrent(delta) {
    current = current + delta;

    if (current < 0) {
        current = 0;
    }
    else if (current > discoverConfig.data.length - 1) {
        current = discoverConfig.data.length - 1;
    }

    let newPx = -current * discoverConfig.cardWidth;

    let carousel = document.getElementById("romonitor-carousel");
    carousel.setAttribute("style", `left: ${newPx}px; height: 270px !important;`);
}

function buildCarousel() {
    const carousel = document.createElement("div");
    carousel.setAttribute("class", "horizontally-scrollable");
    carousel.setAttribute("style", "left: 0px;");
    carousel.setAttribute("id", "romonitor-carousel");
    carousel.style = 'height: 270px !important;'

    const ul = document.createElement("ul");
    ul.setAttribute("class", "hlist games game-cards game-tile-list")
    carousel.appendChild(ul);

    let length = discoverConfig.data.length - 1;

    discoverConfig.data.forEach((game, index) => {
        if (index == 0) {
            ul.appendChild(buildGame(game, " first-tile"));

        }
        else if (index == length) {
            ul.appendChild(buildGame(game, " last-tile"));
        } else {
            ul.appendChild(buildGame(game))
        }
    });

    return carousel;
}

function buildGame(game, extraClass = "") {
    const href = discoverConfig.robloxExperienceUri + game.placeId
    const li = document.createElement("li");
    li.setAttribute("class", "list-item game-card game-tile" + extraClass);
    li.id = game.placeId;
    const liDiv = document.createElement("div");
    li.appendChild(liDiv);


    liDiv.setAttribute("class", "game-card-container");
    liDiv.innerHTML = `
        <a class="game-card-link" href="${href}">
            <div class="game-card-thumb-container">
                <span class="thumbnail-2d-container game-card-thumb">
                    <img class src="${game.icon}" alt=${game.name} title="${game.name}" loading="lazy"></img>
                </span>
            </div>
            <div data-testid="game-tile-game-name" class="game-card-name game-name-title" title="${game.name}">${game.name}</div>
            <div class="game-card-info">
                <div data-testid="game-tile-card-info" class="game-card-info">
                    <span class="info-label icon-votes-gray"></span>
                    <span class="info-label vote-percentage-label">${common.fixPercentage(game.rating)}</span>
                    <span class="info-label icon-playing-counts-gray"></span>
                    <span class="info-label playing-counts-label" title="${game.playing}">${common.fixPlayCount(game.playing)}</span>
                </div>
            </div>
        </a>

        <div>
        </div>
        `

    return li;
}