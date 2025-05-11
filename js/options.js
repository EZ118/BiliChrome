/* 自定义Toast */
function showToast(message, duration) {
    sober.Snackbar.builder(message);
}

function getAccount(uid, callback) {
    getStorage("account", function (detail) {
        if (detail) {
            callback(detail);
        } else if (!detail && uid && uid != "auto") {
            $.get("https://api.bilibili.com/x/web-interface/card?mid=" + uid, function (data, status) {
                var result = {
                    "name": data.data.card.name,
                    "uid": data.data.card.mid,
                    "face": data.data.card.face,
                    "sex": data.data.card.sex,
                    "fans": data.data.card.fans,
                    "sign": data.data.card.sign,
                    "level": data.data.card.level_info.current_level,
                    "coins": null
                };
                setStorage("account", result);
                callback(result);
            });
        } else if (!detail && uid == "auto") {
            $.get("https://api.bilibili.com/x/space/v2/myinfo?", function (data, status) {
                if (data.code == -101) {
                    callback({ "name": null, "uid": null, "face": null, "sign": "未登录" });
                    console.log("未登录");
                }
                var result = {
                    "name": data.data.profile.name,
                    "uid": data.data.profile.mid,
                    "face": data.data.profile.face,
                    "sex": data.data.profile.sex,
                    "fans": data.data.follower,
                    "sign": data.data.profile.sign,
                    "level": data.data.profile.level,
                    "coins": data.data.coins
                };
                setStorage("account", result);
                callback(result);
            })
        }
    })
}

function resetAccount() {
    removeStorage("account", function () {
        getAccount("auto", function (result) {
            console.log(result);
        })
    })
}

function getJctToken(callback) {
    /* 获取B站账号登录凭据（用于接口请求时的身份验证） */
    chrome.cookies.getAll({ url: "https://www.bilibili.com/" }, function (cookies) {
        var finalVal = "";
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i]["name"] == "bili_jct") {
                finalVal = cookies[i]["value"];
                break;
            }
        }
        callback(finalVal);
    });
}

function saveSubscriptionForPipePipe(uid) {
    var requests = [];
    var finalList = [];

    for (let i = 1; i <= 6; i++) {
        let request = $.get("https://api.bilibili.com/x/relation/followings?vmid=" + uid + "&pn=" + i + "&ps=50&order=desc&order_type=attention", function (tjlist) {
            if (tjlist.data.list.length <= 0) { return; }
            $.each(tjlist.data.list, function (index, item) {
                finalList.push({ "service_id": 5, "url": "https://space.bilibili.com/" + item.mid, "name": item.uname });
            });
        });

        requests.push(request);
    }

    $.when.apply($, requests).done(function () {
        finalList = { "app_version": "3.4.3", "app_version_int": 105100, "subscriptions": finalList };
        downloadFile("pipepipe_subscriptions_" + uid + ".json", JSON.stringify(finalList));
    });
}

/* OPTIONS.HTML */
$(document).ready(() => {
    // 初始化页面

    // 默认设置
    const defaultSettings = {
        HD_Quality: {
            value: true,
            desc: "默认启用1080P画质",
            type: 'boolean'
        },
        Advanced_DanMu: {
            value: false,
            desc: "默认启用滚动弹幕",
            type: 'boolean'
        },
        DanMu_Color: {
            value: "#FFFFFF",
            desc: "设置滚动弹幕颜色（HEX）",
            type: 'string'
        },
        Notify_Update: {
            value: false,
            desc: "后台收取动态更新通知（20分钟/次）",
            type: 'boolean'
        }
    };


    if (window.location.href.split("/").slice(-1)[0] === "options.html") {
        PetiteVue.createApp({
            currentTab: "common",

            // 设置项
            settings: PetiteVue.reactive(JSON.parse(JSON.stringify(defaultSettings))),
            updateBoolean(event, key) {
                // 更新布尔值
                this.settings[key].value = event.target.checked;
            },
            updateString(event, key) {
                // 更新字符串值
                this.settings[key].value = event.target.value;
            },
            saveSettings() {
                // 保存设置
                showToast("当前设置已保存！");
                console.log('保存的设置:', this.settings);
                setStorage("pref", this.settings);
            },
            getSettings() {
                // 显示已保存的设置
                getStorage("pref", (result) => {
                    if (result) {
                        for (let k in result) {
                            if (this.settings[k]) {
                                this.settings[k].value = result[k].value;
                            }
                        }
                    } else {
                        for (let k in defaultSettings) {
                            this.settings[k].value = defaultSettings[k].value;
                        }
                    }
                });
            },

            userInfo: {
                name: "未登录",
                uid: null,
                face: "https://i0.hdslb.com/bfs/face/member/noface.jpg",
                sign: "点击箭头按钮登录"
            },
            showUserCard() {
                // 显示用户信息
                getAccount("auto", (result) => {
                    this.userInfo = result;
                });
            },
            openUserSpace() {
                // 打开用户空间
                if(!this.userInfo.uid) {
                    showToast("请在登录后刷新该页面");
                    window.open("https://passport.bilibili.com/login?goto=https://www.bilibili.com/");
                } else {
                    window.open("https://space.bilibili.com/" + this.userInfo.uid);
                }
            },


            refreshUserInfo() {
                // 刷新用户信息
                resetAccount();
                setTimeout(() => {
                    this.showUserCard();
                }, 400);
                showToast("用户信息已刷新");
            },
            exportSubscription() {
                // 导出订阅
                getAccount("auto", (usrInfo) => {
                    showToast("正在获取列表，请等待2s~10s，转换完成后将通过浏览器下载保存");
                    saveSubscriptionForPipePipe(usrInfo.uid);
                });
            },
            restoreUserPref() {
                // 恢复个性化设置
                removeStorage("pref");
                setTimeout(() => {
                    this.getSettings();
                }, 400);
                showToast("个性化设置已恢复默认");
            },


            init() {
                // 初始化设置
                
                // 移除加载界面
                document.getElementsByClassName("container")[0].setAttribute("style", "");
                document.getElementById("splashScreen").style.opacity = "0";
                setTimeout(() => {
                    document.getElementById("splashScreen").remove();
                }, 300);

                // 显示用户信息
                this.getSettings();
                this.showUserCard();
            }
        }).mount("#app");

    } else {
        // 如果不是options.html，则初始化存储
        getStorage("pref", (result) => {
            if (!result) {
                setStorage("pref", defaultSettings);
            }
        });
    }
});