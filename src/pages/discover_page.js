import common from './common'

let discoverConfig = {
    data: null,
    discoverId: "romonitor-discover-carousel"
}

export default {
    extendDiscover: async function () {
        await common.getDiscoverData().then(
            (data) => {
                discoverConfig.data = data;
            }
        );

        buildDiscoverSearch();
    }
}

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
    carouselList.insertBefore(buildGameListContainer(), container.children.item(2));

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
        const carouselList = document.getElementById("games-carousel-page")
        const config = {
            childList: true
        };

        observer.disconnect();
        updateDiscoverPage(carouselList);
        observer.observe(container, config);
    }

    const observer = new MutationObserver(callback);
    observer.observe(carouselList, config);
}

function updateDiscoverPage(carouselList) {
    const title = document.getElementById(discoverConfig.discoverId);

    carouselList.removeChild(title);
    carouselList.insertBefore(buildGameListcontainer(), container.children.item(2));
}

function buildGameListContainer() {
    const temp = document.createElement("h1");
    temp.innerHTML = "TEST THING"

    
    return temp;
}