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
