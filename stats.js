let extensionConfiguration = {
  apiEndpoint: 'https://romonitorstats.com/api/v1/extension/',
  activePlaceID: null,
};

let loadingStore = {
  socialGraph: false,
};

let gameData = null;
let socialGraphData = null;
let nameChangesGraphData = null;


window.addEventListener('load', async function () {
  const check = await prefabChecks();

  if (check) {
    buildTabs();
  }
});

async function prefabChecks() {
  /** Check we're on a Roblox games page */
  if (window.location.pathname.match(/\/games\/.*/)) {
    extensionConfiguration.activePlaceID = document.querySelector("#game-detail-page").dataset.placeId;

    return await postData({ game: extensionConfiguration.activePlaceID })
      .then((data) => {
        if (data && data.success) {
          const tabFixCss = '.rbx-tab { width: 25% !important };';
          const styleElement = document.createElement('style');
          document.head.appendChild(styleElement);
          styleElement.type = 'text/css';
          styleElement.appendChild(document.createTextNode(tabFixCss));

          gameData = data;

          return true
        } else if (data && !data.success && data.message && data.code) {
          createRobloxError(data.message, data.icon, data.code);
        }

        return false;
      });
  }

  return false;
}

async function postData(data = {}) {
  return await fetch(extensionConfiguration.apiEndpoint + 'get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.status === 429) {
        this.createRobloxError(chrome.i18n.getMessage('429Error'));
        return;
      } else if (response.status === 500) {
        this.createRobloxError(chrome.i18n.getMessage('500Error'));
        return;
      } else if (response.status === 404) {
        this.createRobloxError(chrome.i18n.getMessage('404Error'));
        return;
      } else if (response.status === 502) {
        this.createRobloxError(chrome.i18n.getMessage('502Error'));
        return;
      } else if (response.status === 422) {
        this.createRobloxError(chrome.i18n.getMessage('422Error'));
        return;
      }

      return response.json();
    })
    .catch((error) => {
      this.createRobloxError(chrome.i18n.getMessage('contactError'));
      Promise.reject(error);
    });
}

function createRobloxError(message, icon = 'icon-warning', code = null) {
  const tabContainer = document.getElementsByClassName('col-xs-12 rbx-tabs-horizontal')[0];
  const messageBanner = document.createElement('div');
  
  messageBanner.classList.add('message-banner');
  messageBanner.innerHTML = `<span class="${icon}"></span> ${message}`;
  messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
  tabContainer.insertBefore(messageBanner, tabContainer.firstChild);
}

function getTabs() {
  return [
    {
      title: chrome.i18n.getMessage('tabStats'),
      id: 'stats',
    },
    {
      title: chrome.i18n.getMessage('tabMilestones'),
      id: 'milestones',
    },
    {
      title: chrome.i18n.getMessage('tabSocialGraph'),
      id: 'social-graph',
    },
    {
      title: chrome.i18n.getMessage('tabNameChanges'),
      id: 'name-changes',
    },
    {
      title: chrome.i18n.getMessage('tabRoMonitor'),
      id: 'go-to-stats',
      href: `https://romonitorstats.com/experience/${extensionConfiguration.activePlaceID}/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough`,
      target: '_blank',
    }
  ];
}


function buildTabs() {
  lastAddedTab = null;

  getTabs().forEach((tab) => {
    var gameNavigationTabs = document.getElementById("horizontal-tabs");
    var newTab = gameNavigationTabs.lastChild.cloneNode(true);
    var tabTitle = newTab.getElementsByClassName('text-lead')[0];

    tabTitle.textContent = tab.title;
    newTab.classList.remove("tab-game-instances");
    newTab.classList.add(`tab-${tab.id}`);
    newTab.id = `tab-${tab.id}`;
    newTab.firstChild.href = tab.href ? tab.href : `#${tab.id}`;

    if (tab.target) {
      newTab.firstChild.target = tab.target;
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
      containerHeader.innerHTML = `<h3>${tab.title}</h3><br><div class="text-secondary" style="margin-top: 1em;">${chrome.i18n.getMessage('PoweredBy')} <a href="https://romonitorstats.com/" class="text-link">RoMonitor Stats</a></div>`;
      firstTabContent.appendChild(containerHeader);
    }

    /** The following are lightweight queries to our servers, so we build these to make the tabs load faster, others are dynamically injected. */
    if (tab.title === chrome.i18n.getMessage('tabMilestones')) {
      buildMilestonesTab();
    } else if (tab.title === chrome.i18n.getMessage('tabStats')) {
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

      postData({ game: extensionConfiguration.activePlaceID, tab: tab.id })
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
            createRobloxError(data.message, data.icon);
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

function findTranslation(str) {
  var replaced = str.split(' ').join('_');
  var translation = chrome.i18n.getMessage(replaced);

  if (translation != '') {
    return translation
  } else {
    return str
  }
}

function buildStatsTab() {
  const statsContainer = document.getElementsByClassName('tab-pane stats');
  const flexboxContainer = document.createElement('div');
  flexboxContainer.style = 'display: flex; flex-wrap: wrap;';

  /** Set Rating Card -- We use the data already on the games page for this */
  const upVotes = Number(document.getElementsByClassName('count-left')[0].firstElementChild.title)
  const downVotes = Number(document.getElementsByClassName('count-right')[0].firstElementChild.title)
  gameData.stats.items.push({
    title: chrome.i18n.getMessage('Rating'),
    copy: `${(upVotes / (upVotes + downVotes) * 100).toFixed(2)}%`,
  });

  gameData.stats.items.forEach((item) => {
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

  statsContainer[0].appendChild(flexboxContainer);
}

function buildMilestonesTab() {
  const milestonesContainer = document.getElementsByClassName('tab-pane milestones');
  const milestonesTable = document.createElement('table');
  milestonesTable.classList.add('table');
  milestonesTable.classList.add('table-striped');
  milestonesTable.innerHTML = `<thead><tr><th class="text-label">${chrome.i18n.getMessage('tableM_Milestone')}</th><th class="text-label">${chrome.i18n.getMessage('tableM_Achived')}</th></tr></thead><tbody id="milestones-table"></tbody>`;

  if (!Object.keys(gameData.milestones).length) {
    const messageBanner = document.createElement('div');

    messageBanner.classList.add('message-banner');
    messageBanner.innerHTML = `<span class="icon-warning"></span> ${chrome.i18n.getMessage('M_NotFound')}`;
    messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
    milestonesContainer[0].appendChild(messageBanner);

    return;
  }
  milestonesContainer[0].appendChild(milestonesTable);

  Object.keys(gameData.milestones).reverse().forEach((milestoneIndex) => {
    const milestone = gameData.milestones[milestoneIndex];
    const milestoneEntry = document.createElement('tr');
    milestoneEntry.innerHTML = `<td>${milestone.value} ${findTranslation(milestone.type)}</td><td>${milestone.achieved}</td>`;

    document.getElementById('milestones-table').appendChild(milestoneEntry);
  });
}

function buildNameChangesTab() {
  document.getElementById('name-changes-loader').remove();
  const nameChangesContainer = document.getElementsByClassName('tab-pane name-changes');
  const nameChangesTable = document.createElement('table');
  nameChangesTable.classList.add('table');
  nameChangesTable.classList.add('table-striped');
  nameChangesTable.innerHTML = `<thead><tr><th class="text-label">${chrome.i18n.getMessage('tableNC_Name')}</th><th class="text-label">${chrome.i18n.getMessage('tableNC_Changed')}</th></tr></thead><tbody id="name-changes-table"></tbody>`;

  if (!Object.keys(nameChangesGraphData).length) {
    const messageBanner = document.createElement('div');

    messageBanner.classList.add('message-banner');
    messageBanner.innerHTML = `<span class="icon-warning"></span> ${chrome.i18n.getMessage('NC_NotFound')}`;
    messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
    nameChangesContainer[0].appendChild(messageBanner);

    return;
  }
  const limitWarning = document.createElement('div');
  limitWarning.classList.add('text-label');
  limitWarning.innerHTML = chrome.i18n.getMessage('NC_LimitNote');

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
    socialGraphMessageBanner.innerHTML = `<span class="icon-warning"></span> ${chrome.i18n.getMessage('socials_NotFound')}`;
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
