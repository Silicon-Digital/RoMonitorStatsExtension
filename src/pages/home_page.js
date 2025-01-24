import common from './common';

let config = common.config;
let homeConfig = {
    data: null,
};

export default {
    extendPage: async function () {
        await common.getDiscoverData().then((data) => {
            homeConfig.data = data;
        });

        common.waitForElements('.friend-carousel-container, .game-sort-carousel-wrapper', () => {
            buildHomeSearch();
        });
    },
};

function buildHomeSearch() {
    let container;

    // Perform a bunch of checks here to make sure the
    // HTML looks like it is expected, to avoid extension breaking/doing
    // weird things if webpage is updated in the future.
    {
        let place_list = document.getElementById('place-list');

        if (!place_list) {
            return;
        }

        container = place_list.getElementsByClassName('game-home-page-container');
    }

    if (container.length != 1) {
        return;
    }
    container = container[0].firstElementChild;
    if (container.nodeName != 'DIV') {
        return;
    }

    // Once the search/carousel container is found, add our new search to the page.
    container.insertBefore(buildCarousel(), container.children.item(6));

    // Function puts the title/search in the correct place on the page.
    updateHomePage(container);

    // Add MutationObserver for dynamic updates
    const config = {
        childList: true,
    };

    const callback = function (mutations, observer) {
        const container = document.getElementById('place-list').getElementsByClassName('game-home-page-container')[0].firstElementChild;
        observer.disconnect();
        updateHomePage(container);
        observer.observe(container, config);
    };

    const observer = new MutationObserver(callback);
    observer.observe(container, config);
}

function updateItemsPerRow(container, tileWidth = 150, columnGap = 16) {
    const containerWidth = container.getBoundingClientRect().width;
    const availableWidth = containerWidth - columnGap; // Consider gap

    // Calculate items per row based on available width
    let itemsPerRow = Math.max(3, Math.min(12, Math.floor(availableWidth / (tileWidth + columnGap))));

    container.style.setProperty('--items-per-row', itemsPerRow.toString());
    return itemsPerRow;
}

// Simply refreshes the page with our new element in a consistent location.
function updateHomePage(container) {
    const title = document.getElementById('romonitor-title');
    const search = document.getElementById('romonitor-search');

    // Ensure both elements are removed from their parent, if needed
    if (title && title.parentElement !== container) {
        title.parentElement?.removeChild(title);
    }
    if (search && search.parentElement !== container) {
        search.parentElement?.removeChild(search);
    }

    // Check if the desired position (3rd child) exists
    const insertPosition = container.children.item(4);

    // Re-insert the search element
    if (search) {
        if (insertPosition) {
            container.insertBefore(search, insertPosition);
        } else {
            container.appendChild(search); // Fallback if the position doesn't exist
        }
    }

    // Re-insert the title element
    if (title) {
        if (insertPosition) {
            container.insertBefore(title, insertPosition);
        } else {
            container.appendChild(title); // Fallback if the position doesn't exist
        }
    }

    // Update the items per row dynamically
    updateItemsPerRow(container);
}

function buildCarousel() {
    // Create the outer wrapper for the carousel
    let carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'game-sort-carousel-wrapper';
    carouselWrapper.id = 'romonitor-search';

    // Add the header container
    let headerContainer = document.createElement('div');
    headerContainer.className = 'game-sort-header-container';

    let containerHeader = document.createElement('div');
    containerHeader.className = 'container-header';

    let headerTitle = document.createElement('h2');
    headerTitle.className = 'sort-header';

    let titleLink = document.createElement('a');
    titleLink.href = 'https://romonitorstats.com/leaderboard/active/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough';
    titleLink.target = '_blank';
    titleLink.textContent = 'Top Experiences';

    headerTitle.appendChild(titleLink);

    let seeAllLink = document.createElement('a');
    seeAllLink.className = 'btn-secondary-xs see-all-link-icon btn-more';
    seeAllLink.href = 'https://romonitorstats.com/leaderboard/active/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough';
    seeAllLink.target = '_blank';
    seeAllLink.textContent = 'View on RoMonitor Stats';

    containerHeader.appendChild(headerTitle);
    containerHeader.appendChild(seeAllLink);
    headerContainer.appendChild(containerHeader);
    carouselWrapper.appendChild(headerContainer);

    // Create the game carousel
    let carousel = document.createElement('div');
    carousel.setAttribute('data-testid', 'game-carousel');
    carousel.className = 'game-carousel expand-home-content';
    carouselWrapper.appendChild(carousel);

    // Populate and adjust carousel dynamically
    populateAndAdjustCarousel(carousel);

    // Attach event listener to adjust carousel on resize
    window.addEventListener('resize', () => populateAndAdjustCarousel(carousel));
    

    return carouselWrapper;
}

function populateAndAdjustCarousel(carousel) {
    setTimeout(() => {
        const tileWidth = 150; // Tile width in px
        const columnGap = 16; // Column gap in px
        const itemsPerRow = updateItemsPerRow(carousel, tileWidth, columnGap);

        // const itemsPerRow = Math.max(1, Math.floor(containerWidth / itemWidth));

        carousel.style.setProperty('--items-per-row', itemsPerRow.toString());

        const maxItems = itemsPerRow;

        while (carousel.firstChild) {
            carousel.removeChild(carousel.firstChild);
        }

        const dataAry = homeConfig.data.slice(0, maxItems);
        dataAry.forEach((game) => {
            carousel.appendChild(
                buildGameCard(
                    'https://www.roblox.com/games/' + game.placeId,
                    game.placeId,
                    game.name,
                    common.fixPercentage(game.rating),
                    common.fixPlayCount(game.playing),
                    game.icon
                )
            );
        });
    }, 0);
}

function buildGameCard(href, id, title, votePercentage, playerCount, imgRef) {
    let cardContainer = document.createElement('div');
    cardContainer.className = 'grid-item-container game-card-container';
    cardContainer.setAttribute('data-testid', 'game-tile');

    let anchor = document.createElement('a');
    anchor.className = 'game-card-link';
    anchor.href = href;
    anchor.id = id;
    anchor.tabIndex = '0';
    anchor.ariaHidden = 'false';

    let imgContainer = document.createElement('span');
    imgContainer.className = 'thumbnail-2d-container game-card-thumb-container';

    let img = document.createElement('img');
    img.src = imgRef;
    img.alt = title;
    img.title = title;

    imgContainer.appendChild(img);
    anchor.appendChild(imgContainer);

    let gameName = document.createElement('div');
    gameName.className = 'game-card-name game-name-title';
    gameName.title = title;
    gameName.textContent = title;

    let gameInfo = document.createElement('div');
    gameInfo.className = 'game-card-info';
    gameInfo.setAttribute('data-testid', 'game-tile-stats');

    let voteIcon = document.createElement('span');
    voteIcon.className = 'info-label icon-votes-gray';

    let voteLabel = document.createElement('span');
    voteLabel.className = 'info-label vote-percentage-label';
    voteLabel.textContent = votePercentage;

    let playingIcon = document.createElement('span');
    playingIcon.className = 'info-label icon-playing-counts-gray';

    let playingLabel = document.createElement('span');
    playingLabel.className = 'info-label playing-counts-label';
    playingLabel.textContent = playerCount;

    gameInfo.appendChild(voteIcon);
    gameInfo.appendChild(voteLabel);
    gameInfo.appendChild(playingIcon);
    gameInfo.appendChild(playingLabel);

    anchor.appendChild(gameName);
    anchor.appendChild(gameInfo);
    cardContainer.appendChild(anchor);

    return cardContainer;
}