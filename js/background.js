/* 插件安装成功 */
chrome.runtime.onInstalled.addListener(function () {
    const version = chrome.runtime.getManifest().version;
    chrome.tabs.create({
        url: `./installed.html#${version}`
    });
});

/* 扩展图标点击事件，打开单独窗口 */
chrome.action.onClicked.addListener((tab) => {
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        chrome.tabs.create({
            url: 'index.html'
        });
    } else {
        chrome.windows.create({
            url: 'index.html',
            type: "popup",
            state: "maximized"
        });
    }
});

/* 注册右键菜单 */
chrome.contextMenus.create({
    title: '在 BiliScape 观看',
    id: 'viewInExt',
    type: 'normal',
    contexts: ['all'],
    documentUrlPatterns: ['*://*.bilibili.com/*']
});

/* 注册右键菜单 */
chrome.contextMenus.onClicked.addListener(function (item, tab) {
    let url = item.pageUrl + "?";
    url = url.split("?")[0];
    url = url.replace("/s/", "/");

    if (url.indexOf("?") === -1) { url += "?"; }

    if (item.menuItemId == "viewInExt" && url.includes("bilibili.com/video/")) {
        /* 如果当前页面是视频播放页面,那么取得bvid或aid */
        const vid = url.split("/")[4].replace(url.substring(url.lastIndexOf("?")), "");

        chrome.tabs.create({ url: `${chrome.runtime.getURL('index.html')}#!/video/${vid}` });

    } else if (item.menuItemId == "viewInExt" && url.includes("live.bilibili.com/") && !url.includes("live.bilibili.com/p/")) {
        /* 如果当前页面是直播间页面,那么取得房间号 */
        const vid = url.split("/")[3].replace(url.substring(url.lastIndexOf("?")), "");

        if (vid == null || vid == "") { return; }

        chrome.tabs.create({ url: `${chrome.runtime.getURL('index.html')}#!/live/${vid}` });
    } else if (item.menuItemId == "viewInExt" && url.includes("space.bilibili.com/")) {
        /* 如果当前页面是用户空间页面,那么取得用户UID */
        const vid = url.split("/")[3].replace(url.substring(url.lastIndexOf("?")), "");

        if (vid == null || vid == "") { return; }

        chrome.tabs.create({ url: `${chrome.runtime.getURL('index.html')}#!/space/${vid}` });
    }
});

/* 获取设置项 */
function getConfig(item, callback) {
    const itemFamily = item.split(".")[0];
    const itemKey = item.split(".")[1];
    chrome.storage.local.get([itemFamily], function (result) {
        try {
            if (result[itemFamily] && result[itemFamily][itemKey]) {
                callback(result[itemFamily][itemKey]);
            } else {
                callback(null);
            }
        } catch {
            callback(null);
        }
    });
}