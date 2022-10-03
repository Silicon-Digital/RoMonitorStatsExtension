
function show(pageName) {

    const pageList = [
        "general-settings-page",
        "homepage-settings-page",
        "discover-settings-page",
        "game-page-settings-page"
    ]

    document.getElementById(pageName).style.display = 'block'

    pageList.forEach((page) => {
        if (pageName !== page) {
            console.log(`page: ${page}`);
            document.getElementById(page).style.display = 'none'

            console.log(document);
        }
    })
}

// Saves options to chrome.storage
function save_options() {
    let checkboxesElements = checkboxes.map((checkbox) => {
        return [
            checkbox, document.getElementById(checkbox).checked
        ]
    })
    checkboxesElements = Object.fromEntries(checkboxesElements)
    debugger;
    chrome.storage.sync.set(checkboxesElements, function() {
        // Update status to let user know options were saved.
        // var status = document.getElementById('status');
        // status.textContent = 'Options saved.';
        // setTimeout(function() {
        //     status.textContent = '';
        // }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        gameStatsDisplayed: true,
        gameMilestonesDisplayed: true,
        gameSocialGraphDisplayed: true,
        gameRoMonitorStatsDisplayed: true,
        gameNameChangesDisplayed: true,
        homeTopExperiencesDisplayed: true,
        discoverTopExperiencesDisplayed: true
    }, function(items) {
        Object.keys(items).forEach(key =>{
            document.getElementById(key).checked = items[key]
        })
        // document.getElementById('like').checked = items.likesColor;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);

// document.getElementById('save').addEventListener('click',
//     save_options);

document.getElementById('btn-home-page-settings').addEventListener('click', ()=>show('homepage-settings-page'))
document.getElementById('btn-discover-page-settings').addEventListener('click', ()=>show('discover-settings-page'))
document.getElementById('btn-game-page-settings').addEventListener('click', ()=>show('game-page-settings-page'))

let buttonAry = [].slice.call(document.getElementsByClassName('back-button'))

buttonAry.forEach((button) => {
    button.addEventListener('click', () => {
        show('general-settings-page')
    })
})

var checkboxes = [
    'gameStatsDisplayed',
    'gameMilestonesDisplayed',
    'gameSocialGraphDisplayed',
    'gameNameChangesDisplayed',
    'gameRoMonitorStatsDisplayed',
    'homeTopExperiencesDisplayed',
    'discoverTopExperiencesDisplayed'
]

checkboxes.forEach((checkbox) => {
    document.getElementById(checkbox).addEventListener('click', () => save_options())
})

