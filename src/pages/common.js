
function romonitorResponseHandler(response, showErrors = true) {
    if (!showErrors) {
        return response.json();
    }

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

function createRobloxError(message, icon = 'icon-warning', code = null) {
    const tabContainer = document.getElementsByClassName('col-xs-12 rbx-tabs-horizontal')[0];
    const messageBanner = document.createElement('div');

    messageBanner.classList.add('message-banner');
    messageBanner.innerHTML = `<span class="${icon}"></span> ${message}`;
    messageBanner.style = 'margin-bottom: 1em; margin-top: 1em;';
    tabContainer.insertBefore(messageBanner, tabContainer.firstChild);
}

function waitForElement(id) {
    return new Promise(resolve => {
        if (document.getElementById(id)) {
            return resolve(document.getElementById(id));
        }

        const observer = new MutationObserver(mutations => {
            if (document.getElementById(id)) {
                resolve(document.getElementById(id));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function extractID(url) {
    const parts = url.split('/');
    for (let i = parts.length - 1; i >= 0; i--) {
      if (!isNaN(parts[i])) {
        return parts[i];
      }
    }

    return null; // return null if no numeric ID found
}

let config = {
    apiEndpoint: 'https://romonitorstats.com/api/v1/',
    poweredBy: `Powered by <a href="https://romonitorstats.com/?utm_source=roblox&utm_medium=extension&utm_campaign=extension_leadthrough" class="text-link">RoMonitor Stats</a>`,
    poweredByText: `Powered by RoMonitor Stats`
}

let common;

common = {
    config: config,
    createRobloxError: createRobloxError,
    waitForElement: waitForElement,
    extractID: extractID,

    async postData(data = {}, extension, showErrors = true) {
        return await fetch(config.apiEndpoint + extension, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((response) => romonitorResponseHandler(response, showErrors))
            .catch((error) => {
                if (showErrors) {
                    romonitorErrorHandler(error);
                }
            });
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
            return (Math.round(10 * count / 1000) / 10).toString() + "K"
        }
        else {
            return (Math.round(10 * count / 1000000) / 10).toString() + "M"
        }
    },

    // Convert the 0-100 number to a percentage formatted in the same was as on the home page.
    fixPercentage(percentage) {
        return Math.round(percentage).toString() + "%"
    },

    async getDiscoverData() {
        return await common.getData(config.apiEndpoint + "stats/featured-games/get/")
            
    }

}


export default common;