document.getElementById('openHomePage').addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('home.html') });
});

chrome.tabs.create({ url: chrome.runtime.getURL('home.html') });