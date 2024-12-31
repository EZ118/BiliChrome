// background.js

/* 插件安装成功后，跳转到介绍页面 */
chrome.runtime.onInstalled.addListener(function () {
    console.log('BliScape Extension Installed!');
    chrome.tabs.create({ url: "https://ez118.github.io/biliweb/#installed" });
});

/* 为每一次API请求添加Referer请求头（Origin因为权限原因无法修改，目前未能解决） */
chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
        {
            "id": 1,
            "priority": 1,
            "action": {
                "type": 'modifyHeaders',
                "requestHeaders": [
                    {
                        "header": 'Referer',
                        "operation": 'set',
                        "value": 'https://www.bilibili.com/'
                    },
                    {
                        "header": 'Origin',
                        "operation": 'set',
                        "value": 'https://www.bilibili.com/'
                    }
                ]
            },
            "condition": {
                "urlFilter": 'https://*.bilibili.com/*',
                "resourceTypes": ["xmlhttprequest"]
            }
        }
    ]
});



/* 右键菜单 */
chrome.contextMenus.create({
    title: '在 BiliScape 观看',
    id: 'viewInExt',
    type: 'normal',
    contexts: ['all'],
    documentUrlPatterns: ['*://*.bilibili.com/*']
});

chrome.contextMenus.onClicked.addListener(function (item, tab) {
    let url = item.pageUrl + "?";
    url = url.split("?")[0];
    url = url.replace("/s/", "/");

    if (url.indexOf("?") === -1) { url += "?"; }

    if (item.menuItemId == "viewInExt" && url.includes("bilibili.com/video/")) {
        const vid = url.split("/")[4].replace(url.substring(url.lastIndexOf("?")), "");

        let newOption = "";

        if (vid.includes("av")) { newOption = "aid_" + vid.replace("av", ""); }
        else { newOption = "bvid_" + vid; }

        chrome.tabs.create({ url: chrome.runtime.getURL('home.html') + "#" + newOption });
        // chrome.windows.create({ url: 'home.html#' + newOption, type: 'popup', width: 1220, height: 620 });

    } else if (item.menuItemId == "viewInExt" && url.includes("live.bilibili.com/") && !url.includes("live.bilibili.com/p/")) {
        const vid = url.split("/")[3].replace(url.substring(url.lastIndexOf("?")), "");

        if (vid == null || vid == "") { return; }

        let newOption = "roomid_" + vid;

        chrome.tabs.create({ url: chrome.runtime.getURL('home.html') + "#" + newOption });
    }
});

/* 单独窗口 */
chrome.action.onClicked.addListener(function (tab) {
    chrome.windows.create({ url: 'home.html', type: 'popup', width: 1000, height: 600 });
});

/* 通知推送 */
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

// 初始调用
checkForUpdates();
//每过15分钟查检一次动态更新
setInterval(checkForUpdates, 15 * 60 * 1000);