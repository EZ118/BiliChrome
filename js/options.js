function areKeysEqual(dict1, dict2) {
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

/* 本地存储接口 */
function getStorage(key, callback) {
    chrome.storage.sync.get([key], (result) => {
        if (result[key]) {
            callback(result[key]);
        } else {
            callback(null);
        }
    });
}
function setStorage(key, value) {
    chrome.storage.sync.set({ [key]: value });
}
function removeStorage(key, callback) {
    chrome.storage.sync.remove(key, () => {
        if (callback) {
            callback();
        }
    });
}

function getConfig(item, callback) {
    var checkList = { "account": "account", "player": "player_cfg" };
    chrome.storage.sync.get(checkList[item], function (result) {
        if (result[item]) {
            callback(result[item]);
        } else {
            callback(null);
        }
    });
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
function downloadFile(fileName, text) {
    const url = window.URL || window.webkitURL || window;
    const blob = new Blob([text]);
    const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    saveLink.href = url.createObjectURL(blob);
    // 设置 download 属性
    saveLink.download = fileName;
    saveLink.click();
}
function saveSubscriptionForPipePipe(uid) {
    var requests = [];
    var finalList = [];

    for (let i = 1; i <= 6; i++) {
        let request = $.get("https://api.bilibili.com/x/relation/followings?vmid=" + uid + "&pn=" + i + "&ps=50&order=desc&order_type=attention", function (tjlist) {
            if (tjlist.data.list.length <= 0) { return; }
            $.each(tjlist.data.list,function(index,item){
                finalList.push({ "service_id": 5, "url": "https://space.bilibili.com/" + item.mid, "name": item.uname });
            });
        });

        requests.push(request);
    }

    $.when.apply($, requests).done(function () {
        finalList = {"app_version":"3.4.3","app_version_int":105100,"subscriptions":finalList};
        downloadFile("pipepipe_subscriptions_" + uid + ".json", JSON.stringify(finalList));
    });
}


/* OPTIONS.JS 页面脚本 */
function showUserCard(uid) {
    getAccount(uid, function (result) {
        if (!result.name) {
            $("#userCard").html(`
                <tr>
                    
                    <td align="left" width="80px"><img src="https://i0.hdslb.com/bfs/face/member/noface.jpg@80w_80h_1c_1s_!web-avatar-comment.avif"></td>
                    <td align="left" width="5px"></td>
                    <td align="left">
                        <a href="https://passport.bilibili.com/login?goto=https://www.bilibili.com/" target="_blank">
                            <b class="usrName">未登录</b><br>
                            <i>点此登录</i>
                        </a>
                    </td>
                    <td align="right" width="50px">
                        <a href="https://passport.bilibili.com/login?goto=https://www.bilibili.com/" target="_blank">
                            <b class="usrNums icons10-angle-right">&nbsp;&nbsp;</b><br>
                        </a>
                    </td>
                </tr>
            `);
        } else {
            $("#userCard").html(`
                <tr>
                    <td align="left" width="80px"><img src="` + result.face + `@256w_256h_1c.webp"></td>
                    <td align="left" width="5px"></td>
                    <td align="left">
                        <b class="usrName">` + result.name + `</b>
                        <i>` + result.sex + `</i><br>
                        LEVEL:&nbsp;<i>` + result.level + `</i><br>
                        <i>` + result.sign + `</i>
                    </td>
                    <td align="right" width="50px">
                        <b class="usrNums">` + result.fans + `</b><br>
                        <i>粉丝</i>
                    </td>
                </tr>
            `);
        }
    });
}

function showPlayerPref() {
    getStorage("player_cfg", function (result) {
        // 如果没有存储的设置，使用默认值
        var defaultResult = { "AutoPlay": true, "DanMu": true, "DanMuColor": "#FFFFFF" };
        if (!result || !areKeysEqual(result, defaultResult)) {
            result = defaultResult;
            setStorage("player_cfg", result);
        }

        // 生成HTML内容
        let htmlContent = '';
        for (var key in result) {
            const value = result[key];
            if (typeof value === 'boolean') {
                htmlContent += `
                    <p class="pref_label">
                        <input type="checkbox" id="${key}" ${value ? 'checked' : ''}> ${key}
                    </p>
                `;
            } else if (typeof value === 'string') {
                htmlContent += `
                    <p class="pref_label">
                        ${key}: <input type="text" id="${key}" value="${value}">
                    </p>
                `;
            }
        }

        $("#player_container").html(htmlContent);

        // 添加事件监听
        for (const key in result) {
            if (typeof result[key] === 'boolean') {
                $(`#${key}`).change(function () {
                    result[key] = this.checked;
                    setStorage("player_cfg", result);
                });
            } else if (typeof result[key] === 'string') {
                $(`#${key}`).blur(function () {
                    result[key] = this.value;
                    setStorage("player_cfg", result);
                });
            }
        }
    });
}

/* 设置页面操作 */
function optRouteCtrl() {
    var baseUrl = window.location.href + "#";
    var data = baseUrl.split("#")[1];
    if (data.includes("common") || !data) {
        $("#common_container").show();
        $("#player_container").hide();
        $("#more_container").hide();
    } else if (data.includes("player")) {
        $("#common_container").hide();
        $("#player_container").show();
        $("#more_container").hide();
    } else if (data.includes("more")) {
        $("#common_container").hide();
        $("#player_container").hide();
        $("#more_container").show();
    }
}
$(document).ready(function () {
    if (window.location.href.split("/").slice(-1)[0] === "options.html") {
        optRouteCtrl();
        showPlayerPref();
        showUserCard("auto");

        window.addEventListener('popstate', function (event) {
            optRouteCtrl();
        });
        $("#refreshUserInfo").click(function () {
            $("#refreshUserInfo").hide();
            $("#refreshUserInfo").html("刷新完成!");
            $("#refreshUserInfo").fadeIn(1000);
            resetAccount();
        });
        $("#restorePlayerCfg").click(function () {
            $("#restorePlayerCfg").hide();
            $("#restorePlayerCfg").html("已恢复为默认!");
            $("#restorePlayerCfg").fadeIn(1000);
            removeStorage("player_cfg");
            setTimeout(function () {
                showPlayerPref();
            }, 500);
        });
    }
});