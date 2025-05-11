function limitConsecutiveChars(str) {
    // 只允许字符串中连续出现n个相同字符
    const maxConsecutive = 10;
    return str.replace(new RegExp(`(.)\\1{${maxConsecutive - 1},}`, 'g'), (match, p1) => p1.repeat(maxConsecutive));
}

function hash(str) {
    // 计算字符串的哈希值（返回字符串）
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString();
}

function downloadFile(fileName, text) {
    // 下载文件
    const url = window.URL || window.webkitURL || window;
    const blob = new Blob([text]);
    const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    saveLink.href = url.createObjectURL(blob);
    // 设置 download 属性
    saveLink.download = fileName;
    saveLink.click();
}

function getStorage(key, callback) {
    // 获取本地存储项
    chrome.storage.local.get([key], (result) => {
        if (result[key]) {
            callback(result[key]);
        } else {
            callback(null);
        }
    });
}

function setStorage(key, value) {
    // 设置本地存储项
    chrome.storage.local.set({ [key]: value });
}

function removeStorage(key, callback) {
    // 移除本地存储项
    chrome.storage.local.remove(key, () => {
        if (callback) {
            callback();
        }
    });
}

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

function areKeysEqual(dict1, dict2) {
    // 比较两个对象的键是否相同
    const keys1 = Object.keys(dict1);
    const keys2 = Object.keys(dict2);

    if (keys1.length !== keys2.length) {
        return false;
    }
    const keySet1 = new Set(keys1);
    for (const key of keys2) {
        if (!keySet1.has(key)) {
            return false;
        }
    }
    return true;
}
