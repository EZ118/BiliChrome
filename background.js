// background.js

chrome.runtime.onInstalled.addListener(function () {
    console.log('Bili WebApp Extension Installed!');
    chrome.tabs.create({ url: "https://ez118.github.io/biliweb/#installed" });
});

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
// chrome.contextMenus.create({
//     title: 'BiliChrome',
//     id: 'search',
//     type: 'normal',
//     contexts: ['all'],
// });
// chrome.contextMenus.create({
//     title: '在 BiliChrome 中观看',
//     // parentId: 'search',
//     id: 'viewInExt',
//     type: 'normal',
//     contexts: ['all'],
// });

chrome.contextMenus.create({
    title: '在 BiliChrome 中观看',
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
    }
});

