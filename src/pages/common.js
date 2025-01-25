
function romonitorResponseHandler(response) {
    if (response.status === 429) {
        this.createRobloxError("You're sending too many requests to RoMonitor Stats");
        return;
    } else if (response.status === 500) {
        this.createRobloxError('RoMonitor Stats hit an exception, our monitoring tool has logged this');
        return;
    } else if (response.status === 404) {
        this.createRobloxError('The RoMonitor Stats extension endpoint is not available');
        return;
    } else if (response.status === 502) {
        this.createRobloxError('RoMonitor Stats is currently undergoing maintainance');
        return;
    } else if (response.status === 422) {
        this.createRobloxError('Invalid request sent to RoMonitor Stats');
        return;
    }
    return response.json();
}

function romonitorErrorHandler(error) {
    createRobloxError('Unable to contact RoMonitor Stats');
    Promise.reject(error);
}

function createRobloxError(message, icon = 'icon-warning', code = null, placeId = null) {
    const tabContainer = document.getElementsByClassName('col-xs-12 rbx-tabs-horizontal')[0];
    const messageBanner = document.createElement('div');

    messageBanner.classList.add('message-banner');
    messageBanner.innerHTML = `<span class="${icon}"></span> ${message}`;
    messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';

    if (code === 'not-found' && placeId) {
        // Add close button to the banner and append to the end
        const closeButton = document.createElement('button');
        closeButton.classList.add('btn-close');

        // Style the close button to look like a large "X"
        closeButton.textContent = '×'; // Large "X"
        closeButton.style = `
        font-size: 1.5em;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        float: right;
        line-height: 1;
        padding: 0;
    `;

        closeButton.title = 'Don\'t show this message again for this experience.';

        closeButton.onclick = () => messageBanner.remove();
        messageBanner.appendChild(closeButton);

        // Add PlaceID to the list of dismissed PlaceIDs
        let dismissedPlaceIds = JSON.parse(localStorage.getItem(config.storageKeys.dismissedPlaceIds)) || [];
        dismissedPlaceIds.push(placeId);
        localStorage.setItem(config.storageKeys.dismissedPlaceIds, JSON.stringify(dismissedPlaceIds));
    }

    tabContainer.insertBefore(messageBanner, tabContainer.firstChild);
}

let config = {
    apiEndpoint: 'https://romonitorstats.com/api/v1/',
    poweredBy: `Powered by <a href="https://romonitorstats.com/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough" class="text-link">RoMonitor Stats</a>`,
    poweredByText: `Powered by RoMonitor Stats`,
    storageKeys: {
        dismissedPlaceIds: 'RoMonitor.Extension.NotFoundDismissals'
    }
}

function waitForElements(selector, callback) {
    const observer = new MutationObserver((mutationsList, observer) => {
        const elements = document.querySelectorAll(selector);

        if (elements.length > 0) {
            observer.disconnect();
            callback(elements);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

let common;

common = {
    config: config,
    createRobloxError: createRobloxError,
    waitForElements: waitForElements,

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
        return await common.getData(config.apiEndpoint + "extension/experiences-carousel/")

    }
}

export default common;