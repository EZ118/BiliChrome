
/*
    native.js
    对接原生的API接口
    若后续有编写桌面软件的需求，可修改此文件，快速对接
*/

const native = {
    requestGet: function (url) {
        return fetch(url, {
            method: "GET",
            credentials: "include", // 必须携带 Cookie
            mode: "cors"
        })
            .then(function (response) {
                return response.text();
            })
            .then(function (data) {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    return data;
                }
            })
            .catch(function (error) {
                console.error('Fetch error:', error);
                throw error;
            });
    },

    storageGet(key, callback) {
        // 获取本地存储项
        chrome.storage.local.get([key], (result) => {
            if (result[key]) {
                callback(result[key]);
            } else {
                callback(null);
            }
        });
    },

    storageSet(key, value) {
        // 设置本地存储项
        chrome.storage.local.set({ [key]: value });
    },

    storageRemove(key, callback) {
        // 移除本地存储项
        chrome.storage.local.remove(key, () => {
            if (callback) {
                callback();
            }
        });
    }
}

export default native;