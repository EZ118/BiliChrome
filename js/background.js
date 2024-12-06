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
    var url = item.pageUrl + "?";
    url = url.split("?")[0];
    var purl = url.split("/");
    if (item.menuItemId == "viewInExt" && purl[3] == "video" && purl[4]) {
        var cmd = 'bvid_' + purl[4];
        chrome.tabs.create({ url: chrome.runtime.getURL('home.html') + "#" + cmd });
        //chrome.windows.create({ url: 'home.html#' + cmd, type: 'popup', width: 1220, height: 620 });
    }
});

/* 单独窗口 */
chrome.action.onClicked.addListener(function (tab) {
    chrome.windows.create({ url: 'home.html', type: 'popup', width: 1000, height: 600 });
});

/* 通知推送 */
async function checkForUpdates() {
    try {
        const response = await fetch("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all/update?type=video&update_baseline=0");
        const data = await response.json();

        // 假设 data.content 是你要检查的新内容
        if (data.code == 0 && data.data.update_num > 0) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: '/img/notifications.svg',
                title: '新内容提醒',
                message: '有 ' + data.data.update_num + ' 条新视频动态'
            });

            console.log('有 ' + data.data.update_num + ' 条新视频动态');
        } else {
            console.log('没有新的动态');
        }
    } catch (error) {
        console.error('查检新动态时无法请求服务器', error);
    }
}

// 初始调用
checkForUpdates();