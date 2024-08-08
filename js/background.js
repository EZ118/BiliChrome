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
chrome.action.onClicked.addListener(function(tab) {
    chrome.windows.create({ url: 'home.html', type: 'popup', width: 950, height: 600 });
});