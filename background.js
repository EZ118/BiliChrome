// background.js

chrome.runtime.onInstalled.addListener(function () {
    console.log('Bili WebApp Extension Installed!');
    chrome.tabs.create({ url: "https://ez118.github.io/biliweb/#installed"});
});