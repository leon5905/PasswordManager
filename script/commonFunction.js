
//This file just serve as a reference without any real usage

//Get Tabinfo
function getTabsInfo(callback){
    var getting = browser.windows.getCurrent({populate: true});
    getting.then(callback, null);
}

//Get URL
function getURL(){
    getTabsInfo(function(windowInfo){
        tabInfo = windowInfo.tabs;
        for (var i = 0; i < windowInfo.tabs.length; i++) {
            if(!tabInfo[i].active) continue;
            return currentPageURL = tabInfo[i].url;
            break;
        }
    })
}

