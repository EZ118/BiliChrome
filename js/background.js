/* 插件安装成功事件 */
chrome.runtime.onInstalled.addListener(function() {
    const version = chrome.runtime.getManifest().version;
    chrome.tabs.create({ 
        url: `https://ez118.github.io/biliweb/installed.html#${version}`
    });
});



/* 注册右键菜单 */
chrome.contextMenus.create({
    title: '在 BiliScape 观看',
    id: 'viewInExt',
    type: 'normal',
    contexts: ['all'],
    documentUrlPatterns: ['*://*.bilibili.com/*']
});

/* 右键菜单触发事件 */
chrome.contextMenus.onClicked.addListener(function (item, tab) {
    let url = item.pageUrl + "?";
    url = url.split("?")[0];
    url = url.replace("/s/", "/");

    if (url.indexOf("?") === -1) { url += "?"; }

    if (item.menuItemId == "viewInExt" && url.includes("bilibili.com/video/")) {
        /* 如果当前页面是视频播放页面,那么取得bvid或aid */
        const vid = url.split("/")[4].replace(url.substring(url.lastIndexOf("?")), "");

        let newOption = "";

        if (vid.includes("av")) { newOption = "aid_" + vid.replace("av", ""); }
        else { newOption = "bvid_" + vid; }

        chrome.tabs.create({ url: chrome.runtime.getURL('home.html') + "#" + newOption });
        // chrome.windows.create({ url: 'home.html#' + newOption, type: 'popup', width: 1220, height: 620 });

    } else if (item.menuItemId == "viewInExt" && url.includes("live.bilibili.com/") && !url.includes("live.bilibili.com/p/")) {
        /* 如果当前页面是直播间页面,那么取得房间号 */
        const vid = url.split("/")[3].replace(url.substring(url.lastIndexOf("?")), "");

        if (vid == null || vid == "") { return; }

        let newOption = "roomid_" + vid;

        chrome.tabs.create({ url: chrome.runtime.getURL('home.html') + "#" + newOption });
    } else if (item.menuItemId == "viewInExt" && url.includes("space.bilibili.com/")) {
        /* 如果当前页面是用户空间页面,那么取得用户UID */
        const vid = url.split("/")[3].replace(url.substring(url.lastIndexOf("?")), "");

        if (vid == null || vid == "") { return; }

        let newOption = "uid_" + vid;

        chrome.tabs.create({ url: chrome.runtime.getURL('home.html') + "#" + newOption });
    }
});


/* 扩展图标点击事件，打开单独窗口 */
chrome.action.onClicked.addListener(function (tab) {
    chrome.windows.create({
        url: 'home.html',
        type: "popup",
        state: "maximized"
    });
});


/* 通知推送 */
function getConfig(item, callback) {
    // 获取扩展设置项（item示例：player.HD_Quality_As_Default）
    const itemFamily = item.split(".")[0];
    const itemKey = item.split(".")[1];
    chrome.storage.local.get([itemFamily], (result) => {
        try {
            if (result[itemFamily] && result[itemFamily][itemKey]) {
                callback(result[itemFamily][itemKey].value);
            } else {
                callback(null);
            }
        } catch {
            callback(null);
        }
    });
}

var lastUpdateNum = 0;
async function checkForUpdates() {
    try {
        const response = await fetch("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all/update?type=video&update_baseline=0");
        const data = await response.json();

        // 假设 data.content 是你要检查的新内容
        if (data.code == 0 && data.data.update_num > 0 && data.data.update_num != lastUpdateNum) {
            console.log('有 ' + data.data.update_num + ' 条新视频动态');

            let myNotificationId = `notification-${Date.now()}`;
            chrome.notifications.create(myNotificationId, {
                type: 'basic',
                iconUrl: chrome.runtime.getURL('/img/notifications.png'),
                title: '新内容提醒',
                message: '有 ' + data.data.update_num + ' 条新视频动态',
                'requireInteraction': true,
                'buttons': [{
                    'title': '前往 BiliScape'
                }]
            });

            chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
                if (buttonIndex === 0 && notificationId == myNotificationId) {
                    chrome.windows.create({ url: 'home.html', type: 'popup', width: 1000, height: 600 });
                }
            });

            lastUpdateNum = data.data.update_num;
        } else {
            console.log('没有新的动态');
        }
    } catch (error) {
        console.error('查检新动态时无法请求服务器', error);
    }
}

/* 获取扩展设置（扩展重新载入时生效） */
getConfig("pref.Notify_Update", (value) => {
    if(value) {
        checkForUpdates();
        setInterval(checkForUpdates, 20 * 60 * 1000);
    }
});