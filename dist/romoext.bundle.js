/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/common.js":
/*!***********************!*\
  !*** ./src/common.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
let common;

function romonitorResponseHandler(response) {
    if (response.status === 429) {
        this.createRobloxError(common.getMessage(`429Error`));
        return;
    } else if (response.status === 500) {
        this.createRobloxError(common.getMessage(`500Error`));
        return;
    } else if (response.status === 404) {
        this.createRobloxError(common.getMessage(`404Error`));
        return;
    } else if (response.status === 502) {
        this.createRobloxError(common.getMessage(`502Error`));
        return;
    } else if (response.status === 422) {
        this.createRobloxError(common.getMessage('422Error'));
        return;
    }
    return response.json();
}

function romonitorErrorHandler(error) {
    createRobloxError(common.getMessage(`contactError`));
    Promise.reject(error);
}

function createRobloxError(message, icon = 'icon-warning', code = null) {
    const tabContainer = document.getElementsByClassName('col-xs-12 rbx-tabs-horizontal')[0];
    const messageBanner = document.createElement('div');

    messageBanner.classList.add('message-banner');
    messageBanner.innerHTML = `<span class="${icon}"></span> ${message}`;
    messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
    tabContainer.insertBefore(messageBanner, tabContainer.firstChild);
}

let config = {
    apiEndpoint: 'https://romonitorstats.com/api/v1/',
    poweredBy: `${common.getMessage('PoweredBy')} by <a href="https://romonitorstats.com/" class="text-link">RoMonitor Stats</a>`,
    poweredByText: `${common.getMessage('PoweredBy')} RoMonitor Stats`
}

common = {
    config: config,
    createRobloxError: createRobloxError,

    async postData(data = {}, extension) {
        return await fetch(config.apiEndpoint + extension, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => romonitorResponseHandler(response))
            .catch((error) => romonitorErrorHandler(error));
    },

    async getData(uri) {
        return await fetch(uri,).then((response) => romonitorResponseHandler(response)).catch((error) => romonitorErrorHandler(error))
    },

    // Roblox home page has play count with k's, for example 1000 would be 1k. 
    // Use this function to convert from an int to the required string version. 
    fixPlayCount(count) {
        if (count < 1000) {
            return toString(count);
        }
        else if (count < 1000000) {
            return (Math.round(10 * count / 1000) / 10).toString() + "k"
        }
        else {
            return (Math.round(10 * count / 1000000) / 10).toString() + "m"
        }
    },

    // Convert the 0-100 number to a percentage formatted in the same was as on the home page.
    fixPercentage(percentage) {
        return Math.round(percentage).toString() + "%"
    },

    async getDiscoverData() {
        return await common.getData(config.apiEndpoint + "stats/featured-games/get/")
            
    },

    // Used to get the text for display. Use function to add functionality for firefox later. 
    getText(textId) {
        console.log(navigator.languages[0])
        console.log(chrome.i18n.getMessage(textId));
        return chrome.i18n.getMessage(textId);
    },
    findTranslation(str) {
        var replaced = str.split(' ').join('_');
        var translation = chrome.i18n.getMessage(replaced);
      
        if (translation != '') {
          return translation
        } else {
          return str
        }
    }

}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (common);

/***/ }),

/***/ "./src/pages/discover_page.js":
/*!************************************!*\
  !*** ./src/pages/discover_page.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common */ "./src/common.js");


let discoverConfig = {
    data: null,
    discoverId: "romonitor-discover-carousel",
    robloxGameUri: "https://www.roblox.com/games/",
    leftId: "romonitor-left",
    rightId: "romonitor-right",
    maxCards: 5,
    cardWidth: 208

}

let current = 0;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    extendDiscover: async function () {
        await _common__WEBPACK_IMPORTED_MODULE_0__["default"].getDiscoverData().then(
            (data) => {
                discoverConfig.data = data;
            }
        );

        buildDiscoverSearch();
    }
});

function buildDiscoverSearch() {
    let container;

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

    container.appendChild(buildHeader(_common__WEBPACK_IMPORTED_MODULE_0__["default"].getText("Top_Experiences"),"/"));
    container.appendChild(buildList());
    
    return container;
}

function buildHeader(title, href) {
    const header = document.createElement("div");
    header.setAttribute("data-testid", "game-lists-game-container-header");
    header.setAttribute("class", "container-header games-filter-changer");

    header.innerHTML = `
        <h2>${title}</h2>
        <a
            href="${href}"
            class="see-all-button games-filter-changer btn-secondary-xs btn-more see-all-link-icon"
            data-testid="game-lists-game-container-header-see-all-button">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].config.poweredByText}</a>
        `
    return header
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

    leftScroll.innerHTML = 
        `
        <div class="arrow">
            <span class="icon-games-carousel-left"></span>
        </div>
        <div class="spacer"></div>
    
        `
    leftScroll.addEventListener("click", (e) => {
        changeCurrent(-calculateCardsPerScreen());
        updateCarousel;
    });
    return leftScroll;

}

function buildRightButton() {
    const rightScroll = document.createElement("div");
    rightScroll.setAttribute("class", `scroller next ${discoverConfig.rightId}`);
    rightScroll.setAttribute("data-testid", "game-carousel-scroll-bar");
    rightScroll.setAttribute("role", "button");
    rightScroll.setAttribute("tabindex", "0");

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
    carousel.setAttribute("style", `left: ${newPx}px;`)
}

function buildCarousel() {
    const carousel = document.createElement("div");
    carousel.setAttribute("class", "horizontally-scrollable");
    carousel.setAttribute("style", "left: 0px;");
    carousel.setAttribute("id", "romonitor-carousel");

    const ul = document.createElement("ul");
    ul.setAttribute("class", "hlist games game-cards game-tile-list")
    carousel.appendChild(ul);

    let length = discoverConfig.data.length - 1; 

    discoverConfig.data.forEach((game, index) => {
        if (index == 0) {
            ul.appendChild(buildGame(game, "first-tile"));

        } 
        else if (index == length) {
            ul.appendChild(buildGame(game, "last-tile"));
        } else{
            ul.appendChild(buildGame(game))
        }
    });


    return carousel; 
}

function buildGame(game, extraClass="") {
    const href = discoverConfig.robloxGameUri + game.placeId
    const li = document.createElement("li");
    li.setAttribute("class", "list-item hover-game-tile " + extraClass);
    li.id = game.placeId;
    const liDiv = document.createElement("div");
    li.appendChild(liDiv);


    liDiv.setAttribute("class", "featured-game-container game-card-container");
    liDiv.innerHTML = `
        <a class="game-card-link" href="${href}">
            <div class="featured-game-icon-container">
                <span class="thumbnail-2d-container brief-game-icon">
                    <img class src="${game.icon}" alt=${game.name} title="${game.name}"></img>
                </span>
            </div>
            <div class="info-container">
                <div data-testid="game-tile-game-name" class="game-card-name game-name-title" title="${game.name}">${game.name}</div>
                <div data-testid="game-tile-card-info" class="game-card-info">
                    <span class="info-label icon-votes-gray"></span>
                    <span class="info-label vote-percentage-label" data-testid="game-tile-card-info-vote-label">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].fixPercentage(game.rating)}</span>
                    <span class="info-label icon-playing-counts-gray"></span>
                    <span class="info-label playing-counts-label" title="${game.playing}">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].fixPlayCount(game.playing)}</span>
                </div>
            </div>
        </a>

        <div>
        </div>
        `

    


    // Dynamic card 
    /*
    If a Dynamic card hover wants to be added, a new div should be made here. Currently will be static. 
    */

    return li;
}

/**
 * 
 */

/***/ }),

/***/ "./src/pages/game_page.js":
/*!********************************!*\
  !*** ./src/pages/game_page.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common */ "./src/common.js");



let gameConfig = {
    activePlaceID: null,
    data: null,
    apiExtension: "extension/get/",
}

let loadingStore = {
    socialGraph: false,
};

let lastAddedTab = null;
let socialGraphData = null;
let nameChangesGraphData = null;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    extendGame: async function () {
        await getGame();

        buildTabs();
    }
});

// Get the data from API that is relevant the game page we are on. 
async function getGame() {
    gameConfig.activePlaceID = document.querySelector("#game-detail-page").dataset.placeId;
    return await _common__WEBPACK_IMPORTED_MODULE_0__["default"].postData({ game: gameConfig.activePlaceID }, gameConfig.apiExtension)
        .then((data) => {
            if (data && data.success) {
                const tabFixCss = '.rbx-tab { width: 25% !important };';
                const styleElement = document.createElement('style');
                document.head.appendChild(styleElement);
                styleElement.type = 'text/css';
                styleElement.appendChild(document.createTextNode(tabFixCss));

                gameConfig.data = data;

            }
            else if (data && data.success && data.message && data.code) {
                _common__WEBPACK_IMPORTED_MODULE_0__["default"].createRobloxError(data.message, data.icon, data.code);
            }

        });
}

function getTabs() {
    return [
        {
            title: _common__WEBPACK_IMPORTED_MODULE_0__["default"].getText("tabStats"),
            id: 'stats',
        },
        {
            title: _common__WEBPACK_IMPORTED_MODULE_0__["default"].getText('tabMilestones'),
            id: 'milestones',
        },
        {
            title: _common__WEBPACK_IMPORTED_MODULE_0__["default"].getText('tabSocialGraph'),
            id: 'social-graph',
        },
        {
            title: _common__WEBPACK_IMPORTED_MODULE_0__["default"].getText('tabNameChanges'),
            id: 'name-changes',
        },
        {
            title: _common__WEBPACK_IMPORTED_MODULE_0__["default"].getText('tabRoMonitor'),
            id: 'go-to-stats',
            href: `https://romonitorstats.com/experience/${gameConfig.activePlaceID}/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough`,
            target: '_blank',
        }
    ];
}

function buildTabs() {
    lastAddedTab = null;

    getTabs().forEach((tab) => {
        var gameNavigationTabs = document.getElementById("horizontal-tabs");
        var newTab = gameNavigationTabs.lastElementChild.cloneNode(true);
        var tabTitle = newTab.getElementsByClassName('text-lead')[0];

        tabTitle.textContent = tab.title;
        newTab.classList.remove("tab-game-instances");
        newTab.classList.add(`tab-${tab.id}`);
        newTab.id = `tab-${tab.id}`;
        newTab.firstElementChild.href = tab.href ? tab.href : `#${tab.id}`;

        if (tab.target) {
            newTab.firstElementChild.target = tab.target;
        }

        gameNavigationTabs.appendChild(newTab);

        if (lastAddedTab) {
            newTab.classList.remove(`tab-${lastAddedTab}`);
        }

        lastAddedTab = tab.id;

        if (!tab.href) {
            var firstTabContent = document.getElementById('about').cloneNode(true);
            firstTabContent.id = tab.id;
            firstTabContent.classList.add(tab.id);
            firstTabContent.innerHTML = '';

            document.getElementsByClassName("rbx-tab-content")[0].appendChild(firstTabContent);
            firstTabContent.classList.remove("active");

            const containerHeader = document.createElement('div');
            containerHeader.classList.add('container-header');
            const poweredByHtml =
                containerHeader.innerHTML = `<h3>${tab.title}</h3><br><div class="text-secondary" style="margin-top: 1em;">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].poweredBy}</div>`;
            firstTabContent.appendChild(containerHeader);
        }

        /** The following are lightweight queries to our servers, so we build these to make the tabs load faster, others are dynamically injected. */
        if (tab.title === _common__WEBPACK_IMPORTED_MODULE_0__["default"].getText('Milestones')) {
            buildMilestonesTab();
        } else if (tab.title === _common__WEBPACK_IMPORTED_MODULE_0__["default"].getText('Stats')) {
            buildStatsTab();
        }

        if (!tab.href) {
            addTabListener(newTab, firstTabContent)
        }
    });

    /** Adds event listeners to the default Roblox tabs */
    const baseRobloxTabs = ['about', 'store', 'game-instances'];
    baseRobloxTabs.forEach((tab) => {
        const tabElement = document.getElementById(`tab-${tab}`);

        addTabListener(tabElement, document.getElementById(tab));
    });
}

function addTabListener(tab, aboutContent) {
    tab.addEventListener('click', function () {
        removeAllTabActiveStates();

        if (tab.id === 'tab-social-graph' || tab.id === 'tab-name-changes') {
            if (tab.id === 'tab-social-graph' && socialGraphData) {
                if (socialGraphData) {
                    return;
                } else {
                    loadingStore.socialGraph = true;
                }
            }

            if (tab.id === 'tab-name-changes' && nameChangesGraphData) {
                if (nameChangesGraphData) {
                    return;
                } else {
                    loadingStore.nameChangesGraph = true;
                }
            }

            const socialGraphContainer = document.getElementsByClassName(`tab-pane ${tab.id.replace('tab-', '')}`)[0];
            const loaderElement = document.createElement('span');
            loaderElement.id = `${tab.id.replace('tab-', '')}-loader`;
            loaderElement.classList.add('spinner');
            loaderElement.classList.add('spinner-default');

            socialGraphContainer.appendChild(loaderElement);

            if (tab.id === 'tab-social-graph') {
                tab.id = 'socialGraph';
            } else if (tab.id === 'tab-name-changes') {
                tab.id = 'nameChanges';
            }

            _common__WEBPACK_IMPORTED_MODULE_0__["default"].postData({ game: gameConfig.activePlaceID, tab: tab.id }, gameConfig.apiExtension)
                .then((data) => {
                    if (data.success) {
                        if (tab.id === 'socialGraph') {
                            socialGraphData = data['data'];
                            buildSocialGraphTab();
                            loadingStore.socialGraph = false;
                        } else if (tab.id === 'nameChanges') {
                            nameChangesGraphData = data['data'];
                            buildNameChangesTab();
                            loadingStore.nameChangesGraphData = false;
                        }
                    } else if (data && !data.success && data.message) {
                        _common__WEBPACK_IMPORTED_MODULE_0__["default"].createRobloxError(data.message, data.icon);
                    }
                });
        }

        aboutContent.style.display = "block";
        tab.classList.add('active');
    }, false);
}

function removeAllTabActiveStates() {
    NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
    HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
    for (const tab of document.getElementById('horizontal-tabs').children) {
        tab.classList.remove('active');
    }

    for (const tabContainer of document.getElementsByClassName("tab-pane")) {
        tabContainer.style.removeProperty('display');
        tabContainer.classList.remove('active');
    }
}

function buildStatsTab() {
    const statsContainer = document.getElementsByClassName('tab-pane stats');
    const flexboxContainer = document.createElement('div');
    flexboxContainer.style = 'display: flex; flex-wrap: wrap;';

    /** Set Rating Card -- We use the data already on the games page for this */
    const upVotes = Number(document.getElementsByClassName('count-left')[0].firstElementChild.title)
    const downVotes = Number(document.getElementsByClassName('count-right')[0].firstElementChild.title)

    gameConfig.data.stats.items.push({
        title: 'Rating',
        copy: `${(upVotes / (upVotes + downVotes) * 100).toFixed(2)}%`,
    });

    gameConfig.data.stats.items.forEach((item) => {
        const gridEntry = document.createElement('div');
        gridEntry.classList.add('romonitor-grid-item');
        gridEntry.innerHTML =  `<h2 style="
                                    text-align: center;
                                    ">${item.copy}</h2>
                                    <p style="
                                       text-align: center;
                                        ">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].findTranslation(item.title)}</p>`
        flexboxContainer.appendChild(gridEntry);
    });

    statsContainer[0].appendChild(flexboxContainer);
}

function buildMilestonesTab() {
    const milestonesContainer = document.getElementsByClassName('tab-pane milestones');
    const milestonesTable = document.createElement('table');
    milestonesTable.classList.add('table');
    milestonesTable.classList.add('table-striped');
    milestonesTable.innerHTML = `<thead><tr><th class="text-label">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].getText(`tableM_Milestone`)}</th><th class="text-label">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].getText("tableM_Achived")}</th><th class="text-label">Tweets</th></tr></thead><tbody id="milestones-table"></tbody>`;

    if (!Object.keys(gameConfig.data.milestones).length) {
        const messageBanner = document.createElement('div');

        messageBanner.classList.add('message-banner');
        messageBanner.innerHTML = `<span class="icon-warning"></span> ${_common__WEBPACK_IMPORTED_MODULE_0__["default"].getText(`M_NotFound`)}`;
        messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
        milestonesContainer[0].appendChild(messageBanner);

        return;
    }

    milestonesContainer[0].appendChild(milestonesTable);

    Object.keys(gameConfig.data.milestones).reverse().forEach((milestoneIndex) => {
        const milestone = gameConfig.data.milestones[milestoneIndex];
        const milestoneEntry = document.createElement('tr');

        const svg = `<a href="${milestone.tweet}" target="_blank"><svg class="romonitor-milestone-social-item" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#1DA1F2" d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a></div>`

        milestoneEntry.innerHTML = `<td>${milestone.value} ${_common__WEBPACK_IMPORTED_MODULE_0__["default"].findTranslation(milestone.type)}</td><td>${milestone.achieved}</td><td class="romonitor-tableitem">${svg}</td>`;

        document.getElementById('milestones-table').appendChild(milestoneEntry);
    });
}

function buildNameChangesTab() {
  document.getElementById('name-changes-loader').remove();
  const nameChangesContainer = document.getElementsByClassName('tab-pane name-changes');
  const nameChangesTable = document.createElement('table');
  nameChangesTable.classList.add('table');
  nameChangesTable.classList.add('table-striped');
  nameChangesTable.innerHTML = `<thead><tr><th class="text-label">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].getText(`tableNC_Name`)}</th><th class="text-label">${_common__WEBPACK_IMPORTED_MODULE_0__["default"].getText(`tableNC_Changed`)}</th></tr></thead><tbody id="name-changes-table"></tbody>`;

  if (!Object.keys(nameChangesGraphData).length) {
    const messageBanner = document.createElement('div');

    messageBanner.classList.add('message-banner');
    messageBanner.innerHTML = `<span class="icon-warning"></span> ${_common__WEBPACK_IMPORTED_MODULE_0__["default"].getText(`NC_NotFound`)}`;
    messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
    nameChangesContainer[0].appendChild(messageBanner);

    return;
  }
  const limitWarning = document.createElement('div');
  limitWarning.classList.add('text-label');
  limitWarning.innerHTML = _common__WEBPACK_IMPORTED_MODULE_0__["default"].getText(`NC_LimitNote`);

  nameChangesContainer[0].appendChild(limitWarning);
  nameChangesContainer[0].appendChild(nameChangesTable);

  Object.keys(nameChangesGraphData).reverse().forEach((changeIndex) => {
    const nameChange = nameChangesGraphData[changeIndex];
    const changeEntry = document.createElement('tr');
    changeEntry.innerHTML = `<td>${nameChange.name}</td><td>${nameChange.changed}</td>`;

    document.getElementById('name-changes-table').appendChild(changeEntry);
  });
}

function buildSocialGraphTab() {
  document.getElementById('social-graph-loader').remove();
  const socialGraphContainer = document.getElementsByClassName('tab-pane social-graph');

  if (!socialGraphData.items) {
    const socialGraphMessageBanner = document.createElement('div');

    socialGraphMessageBanner.classList.add('message-banner');
    socialGraphMessageBanner.innerHTML = `<span class="icon-warning"></span> ${socials_NotFound}`;
    socialGraphMessageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
    socialGraphContainer[0].appendChild(socialGraphMessageBanner);
  } else {
    const flexboxContainer = document.createElement('div');

    flexboxContainer.style = 'display: flex; flex-wrap: wrap;';
    socialGraphData.items.forEach((item) => {
      const gridEntry = document.createElement('div');
      gridEntry.classList.add('romonitor-grid-item');
      gridEntry.innerHTML = `<h2 style="
      text-align: center;
  ">${item.copy}</h2>
      <p style="
      text-align: center;
  ">${findTranslation(item.title)}</p>`
      flexboxContainer.appendChild(gridEntry);
    });

    socialGraphContainer[0].appendChild(flexboxContainer);
  }
}



/***/ }),

/***/ "./src/pages/home_page.js":
/*!********************************!*\
  !*** ./src/pages/home_page.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common */ "./src/common.js");


let config = _common__WEBPACK_IMPORTED_MODULE_0__["default"].config;
let homeConfig = {
    data: null
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    extendPage: async function () {
        await _common__WEBPACK_IMPORTED_MODULE_0__["default"].getDiscoverData().then(
            (data) => {
                homeConfig.data = data;
            }
        );

        buildHomeSearch();
    }
});


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
    container.insertBefore(buildHomePageTitle(_common__WEBPACK_IMPORTED_MODULE_0__["default"].getText('Top_Experiences'), "https://romonitorstats.com/"), container.children.item(2));

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
                          <a href="${href}">
                            ${title} 
                          </a>
                        </h2>
                        <div class="btn-secondary-xs see-all-link-icon btn-more">
                          ${config.poweredBy}
                        </div>`;
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
            "https://www.roblox.com/games/" + game.placeId, game.placeId, game.name, _common__WEBPACK_IMPORTED_MODULE_0__["default"].fixPercentage(game.rating), _common__WEBPACK_IMPORTED_MODULE_0__["default"].fixPlayCount(game.playing), game.icon
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




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/romoext.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _pages_game_page__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./pages/game_page */ "./src/pages/game_page.js");
/* harmony import */ var _pages_home_page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./pages/home_page */ "./src/pages/home_page.js");
/* harmony import */ var _pages_discover_page__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pages/discover_page */ "./src/pages/discover_page.js");





let pageEnum = {
    noPage: 0, // For when a page does not match any of the ones that the extension is interested in. 
    game: 1,
    home: 2,
    discover: 3
}

window.addEventListener('load', async function () {
    // Result of prefab check indicates which type of page we are on. 
    const check_id = checkPage();


    if (check_id == pageEnum.game) {
        _pages_game_page__WEBPACK_IMPORTED_MODULE_0__["default"].extendGame();
    } else if (check_id == pageEnum.home) {
        _pages_home_page__WEBPACK_IMPORTED_MODULE_1__["default"].extendPage();
    } else if (check_id == pageEnum.discover) {
        _pages_discover_page__WEBPACK_IMPORTED_MODULE_2__["default"].extendDiscover();
    }
});

function checkPage() {
    const path = window.location.pathname;
    /** Check we're on a Roblox games page */
    if (path.match(/\/games\/.*/)) {
        return pageEnum.game;
    } else if (path.match(/\/home/)) {
        return pageEnum.home;
    } else if (path.match(/\/discover/)) {
        return pageEnum.discover;
    }
    return pageEnum.noPage;
}





})();

/******/ })()
;
//# sourceMappingURL=romoext.bundle.js.map