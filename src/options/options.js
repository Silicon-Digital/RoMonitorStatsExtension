
function show(pageName) {
    const pageList = [
        "general-settings-page",
        "homepage-settings-page",
        "discover-settings-page",
        "game-page-settings-page"
    ]

    document.getElementById(pageName).style.display = 'flex'

    pageList.forEach((page) => {
        if (pageName !== page) {
            document.getElementById(page).style.display = 'none'
        }
    })
    restore_options();
}

const checkboxes = [
    'gameStatsDisplayed',
    'gameMilestonesDisplayed',
    'gameSocialGraphDisplayed',
    'gameNameChangesDisplayed',
    'gameRoMonitorStatsDisplayed',
    'homeTopExperiencesDisplayed',
    'discoverTopExperiencesDisplayed'
];

// Saves options to chrome.storage
function save_options() {
    let checkboxesElements = checkboxes.filter(
        (checkbox) => {
            return document.getElementById(checkbox);
        }).map((checkbox) => {
        return [
            checkbox, document.getElementById(checkbox).checked
        ]
    })
    checkboxesElements = Object.fromEntries(checkboxesElements)

    getBrowser().storage.sync.set(checkboxesElements);
}

// Restores select box and checkbox state using the preferences
function getBrowser() {
    return chrome;
}

// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    getBrowser().storage.sync.get({
        gameStatsDisplayed: true,
        gameMilestonesDisplayed: true,
        gameSocialGraphDisplayed: true,
        gameRoMonitorStatsDisplayed: true,
        gameNameChangesDisplayed: true,
        homeTopExperiencesDisplayed: true,
        discoverTopExperiencesDisplayed: true
    }, function(items) {
        console.log(items);
        Object.keys(items).forEach(key =>{
            let checkbox = document.getElementById(key);
            if (checkbox) checkbox.checked = items[key];
        })
        // document.getElementById('like').checked = items.likesColor;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('btn-home-page-settings').addEventListener('click', ()=>show('homepage-settings-page'))
document.getElementById('btn-discover-page-settings').addEventListener('click', ()=>show('discover-settings-page'))
document.getElementById('btn-game-page-settings').addEventListener('click', ()=>show('game-page-settings-page'))

let buttonAry = [].slice.call(document.getElementsByClassName('back-button'))

buttonAry.forEach((button) => {
    button.addEventListener('click', () => {
        show('general-settings-page')
    })
})


checkboxes.forEach((checkbox) => {
    let domCheckbox = document.getElementById(checkbox);

    if (domCheckbox) {
        domCheckbox.addEventListener('click', () => save_options())
    }
})

