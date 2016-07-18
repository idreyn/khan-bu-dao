/* 
 * --------------------------------------------------
 * Keep list of tabs outside of request callback
 * --------------------------------------------------
 */
var tabs = {};

// Get all existing tabs
chrome.tabs.query({}, function(results) {
    results.forEach(function(tab) {
        tabs[tab.id] = tab;
    });
});

// Create tab event listeners
function onUpdatedListener(tabId, changeInfo, tab) {
    tabs[tab.id] = tab;
}
function onRemovedListener(tabId) {
    delete tabs[tabId];
}

// Subscribe to tab events
chrome.tabs.onUpdated.addListener(onUpdatedListener);
chrome.tabs.onRemoved.addListener(onRemovedListener);

/* 
 * --------------------------------------------------
 * Request callback
 * --------------------------------------------------
 */
// Create request event listener
function onBeforeRequestListener(details) {
    // *** Remember that tabId can be set to -1 ***
    var tab = tabs[details.tabId];

    // Respond to tab information
}