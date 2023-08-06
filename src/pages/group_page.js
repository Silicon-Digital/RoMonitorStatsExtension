import common from './common'

let groupConfig = {
    activeGroupID: null,
    apiExtension: 'extension/is-group-tracked/',
}

let lastAddedTab = null;

export default {
    extendGroup: async function () {
        groupConfig.activeGroupID = common.extractID(window.location.href);

        await checkIfTracked();
    }
}

async function checkIfTracked() {
    return await common.postData({ group: groupConfig.activeGroupID }, groupConfig.apiExtension, false)
    .then(async (data) => {
        if (data && data.success) {
            const tabFixCss = '.rbx-tab { width: 25% !important };';
            const styleElement = document.createElement('style');
            document.head.appendChild(styleElement);
            styleElement.type = 'text/css';
            styleElement.appendChild(document.createTextNode(tabFixCss));

            await buildTabs();
        }
    });
}

function getTabs() {
    return [
        {
            title: 'RoMonitor Stats',
            id: 'go-to-stats',
            href: `https://romonitorstats.com/group/${groupConfig.activeGroupID}/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough`,
            target: '_blank',
        }
    ];
}

async function buildTabs() {
    lastAddedTab = null;

    await common.waitForElement('horizontal-tabs').then(() => {
        getTabs().forEach((tab) => {
            var gameNavigationTabs = document.getElementById("horizontal-tabs");
            console.log(gameNavigationTabs);
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
        });
    });
}

