import gamePage from './pages/game_page'
import homePage from './pages/home_page'
import groupPage from './pages/group_page'
import discover_page from './pages/discover_page'


let pageEnum = {
    noPage: 0, // For when a page does not match any of the ones that the extension is interested in. 
    game: 1,
    home: 2,
    discover: 3,
    group: 4
}

window.addEventListener('load', async function () {
    // Result of prefab check indicates which type of page we are on. 
    const check_id = checkPage();


    if (check_id == pageEnum.game) {
        gamePage.extendGame();
    } else if (check_id == pageEnum.home) {
        homePage.extendPage();
    } else if (check_id == pageEnum.discover) {
        discover_page.extendDiscover();
    } else if (check_id == pageEnum.group) {
        groupPage.extendGroup();
    }
});

window.addEventListener('hashchange', async function (hash) {
    /**
     * The Roblox discover page uses what's called a "hash" history page routing system. This logic handles this case
     * and adds the RoMonitor custom carousel to the page when the user navigates to the discover home page, and destroys
     * the instance if they visit a different carousel in "show all".
     */
    const check_id = checkPage();
    const hashChange = hash.newURL.split('#')[1];

    if (check_id == pageEnum.discover && hashChange !== '/') {
        discover_page.destroyDiscover();
    } else if (check_id == pageEnum.discover && hashChange === '/') {
        discover_page.extendDiscover();
    };
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
    } else if (path.match(/\/groups\/.*/)) {
        return pageEnum.group;
    }

    return pageEnum.noPage;
}




