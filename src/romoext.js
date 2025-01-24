import gamePage from './pages/game_page'
import homePage from './pages/home_page'
import charts_page from './pages/charts_page'


let pageEnum = {
    noPage: 0, // For when a page does not match any of the ones that the extension is interested in. 
    game: 1,
    home: 2,
    charts: 3
}

window.addEventListener('load', async function () {
    // Result of prefab check indicates which type of page we are on. 
    const check_id = checkPage();

    if (check_id == pageEnum.game) {
        gamePage.extendGame();
    } else if (check_id == pageEnum.home) {
        homePage.extendPage();
    } else if (check_id == pageEnum.charts) {
        charts_page.extendCharts();
    }
});

function checkPage() {
    const path = window.location.pathname;

    if (path.match(/\/games\/.*/)) {
        return pageEnum.game;
    } else if (path.match(/\/home/)) {
        return pageEnum.home;
    } else if (path.match(/\/charts/)) {
        return pageEnum.charts;
    }

    return pageEnum.noPage;
}




