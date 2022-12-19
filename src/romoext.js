import gamePage from './pages/game_page'
import homePage from './pages/home_page'
import discover_page from './pages/discover_page'


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
        gamePage.extendGame();
    } else if (check_id == pageEnum.home) {
        homePage.extendPage();
    } else if (check_id == pageEnum.discover) {
        discover_page.extendDiscover();
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




