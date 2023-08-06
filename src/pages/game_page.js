import common from './common'

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

export default {
    extendGame: async function () {
        await getGame();

        buildTabs();
    }
}

// Get the data from API that is relevant the game page we are on. 
async function getGame() {
    gameConfig.activePlaceID = document.querySelector("#game-detail-page").dataset.placeId;
    return await common.postData({ game: gameConfig.activePlaceID }, gameConfig.apiExtension)
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
                common.createRobloxError(data.message, data.icon, data.code);
            }

        });
}

function getTabs() {
    return [
        {
            title: 'Stats',
            id: 'stats',
        },
        {
            title: 'Milestones',
            id: 'milestones',
        },
        {
            title: 'Social Graph',
            id: 'social-graph',
        },
        {
            title: 'Name Changes',
            id: 'name-changes',
        },
        {
            title: 'RoMonitor Stats',
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
                containerHeader.innerHTML = `<h3>${tab.title}</h3><br><div class="text-secondary" style="margin-top: 1em;">${common.config.poweredBy}</div>`;
            firstTabContent.appendChild(containerHeader);
        }

        /** The following are lightweight queries to our servers, so we build these to make the tabs load faster, others are dynamically injected. */
        if (tab.title === 'Milestones') {
            buildMilestonesTab();
        } else if (tab.title === 'Stats') {
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

            common.postData({ game: gameConfig.activePlaceID, tab: tab.id }, gameConfig.apiExtension)
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
                        common.createRobloxError(data.message, data.icon);
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
                                        ">${item.title}</p>`
        flexboxContainer.appendChild(gridEntry);
    });

    statsContainer[0].appendChild(flexboxContainer);
}

function buildMilestonesTab() {
    const milestonesContainer = document.getElementsByClassName('tab-pane milestones');
    const milestonesTable = document.createElement('table');
    milestonesTable.classList.add('table');
    milestonesTable.classList.add('table-striped');
    milestonesTable.innerHTML = '<thead><tr><th class="text-label">Milestone</th><th class="text-label">Achived</th><th class="text-label">Tweets</th></tr></thead><tbody id="milestones-table"></tbody>';

    if (!Object.keys(gameConfig.data.milestones).length) {
        const messageBanner = document.createElement('div');

        messageBanner.classList.add('message-banner');
        messageBanner.innerHTML = `<span class="icon-warning"></span> This game has no tracked milestones`;
        messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
        milestonesContainer[0].appendChild(messageBanner);

        return;
    }

    milestonesContainer[0].appendChild(milestonesTable);

    Object.keys(gameConfig.data.milestones).reverse().forEach((milestoneIndex) => {
        const milestone = gameConfig.data.milestones[milestoneIndex];
        const milestoneEntry = document.createElement('tr');

        const svg = `<a href="${milestone.tweet}" target="_blank"><svg class="romonitor-milestone-social-item" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#1DA1F2" d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a></div>`

        milestoneEntry.innerHTML = `<td>${milestone.value} ${milestone.type}</td><td>${milestone.achieved}</td>`;

        if (milestone.tweet) {
            milestoneEntry.innerHTML += `<td class="romonitor-tableitem">${svg}</td>`;
        } else {
            milestoneEntry.innerHTML += `<td class="romonitor-tableitem"></td>`;
        }

        document.getElementById('milestones-table').appendChild(milestoneEntry);
    });
}

function buildNameChangesTab() {
  document.getElementById('name-changes-loader').remove();
  const nameChangesContainer = document.getElementsByClassName('tab-pane name-changes');
  const nameChangesTable = document.createElement('table');
  nameChangesTable.classList.add('table');
  nameChangesTable.classList.add('table-striped');
  nameChangesTable.innerHTML = '<thead><tr><th class="text-label">Name</th><th class="text-label">Changed</th></tr></thead><tbody id="name-changes-table"></tbody>';

  if (!Object.keys(nameChangesGraphData).length) {
    const messageBanner = document.createElement('div');

    messageBanner.classList.add('message-banner');
    messageBanner.innerHTML = `<span class="icon-warning"></span> This game has no tracked name changes`;
    messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
    nameChangesContainer[0].appendChild(messageBanner);

    return;
  }
  const limitWarning = document.createElement('div');
  limitWarning.classList.add('text-label');
  limitWarning.innerHTML = 'Showing the Last 10 Name Changes';

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
    socialGraphMessageBanner.innerHTML = `<span class="icon-warning"></span> This game has no trackable social graph`;
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
  ">${item.title}</p>`
      flexboxContainer.appendChild(gridEntry);
    });

    socialGraphContainer[0].appendChild(flexboxContainer);
  }
}

