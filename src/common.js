let common;

function romonitorResponseHandler(response) {
    if (response.status === 429) {
        this.createRobloxError(common.getMessage(`429Error`));
        return;
    } else if (response.status === 500) {
        this.createRobloxError(common.getMessage(`500Error`));
        return;
    } else if (response.status === 404) {
        this.createRobloxError(common.getMessage(`404Error`));
        return;
    } else if (response.status === 502) {
        this.createRobloxError(common.getMessage(`502Error`));
        return;
    } else if (response.status === 422) {
        this.createRobloxError(common.getMessage('422Error'));
        return;
    }
    return response.json();
}

function romonitorErrorHandler(error) {
    createRobloxError(common.getMessage(`contactError`));
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

let config = {
    apiEndpoint: 'https://romonitorstats.com/api/v1/',
    poweredBy: `${common.getMessage('PoweredBy')} by <a href="https://romonitorstats.com/" class="text-link">RoMonitor Stats</a>`,
    poweredByText: `${common.getMessage('PoweredBy')} RoMonitor Stats`
}

common = {
    config: config,
    createRobloxError: createRobloxError,

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
        return await common.getData(config.apiEndpoint + "stats/featured-games/get/")
            
    },

    // Used to get the text for display. Use function to add functionality for firefox later. 
    getText(textId) {
        console.log(navigator.languages[0])
        console.log(chrome.i18n.getMessage(textId));
        return chrome.i18n.getMessage(textId);
    },
    findTranslation(str) {
        var replaced = str.split(' ').join('_');
        var translation = chrome.i18n.getMessage(replaced);
      
        if (translation != '') {
          return translation
        } else {
          return str
        }
    }

}


export default common;