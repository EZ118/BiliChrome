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


/* OPTIONS.JS 页面脚本 */
function showUserCard(uid) {
    getAccount(uid, function (result) {
        if (!result.name) {
            $("#userCard").html(`
                <div slot="image">
                    <img src="https://i0.hdslb.com/bfs/face/member/noface.jpg@80w_80h_1c_1s_!web-avatar-comment.avif">
                </div>
                <div slot="headline">
                    <span class="usrName">未登录</span><br/>
					<a href="https://passport.bilibili.com/login?goto=https://www.bilibili.com/" target="_blank">
						<span class="usrSign">点击按钮登录</span>
					</a>
                </div>
                <div slot="subhead">
                    <a href="https://passport.bilibili.com/login?goto=https://www.bilibili.com/" target="_blank">
                        <s-icon-button type="outlined" title="点此登录">
                            <s-icon slot="start" name="arrow_forward"></s-icon>
                        </s-icon-button>
                    </a>
                </div>
            `);
        } else {
            $("#userCard").html(`
                <div slot="image">
                    <img src="` + result.face + `@256w_256h_1c.webp">
                </div>
                <div slot="headline">
                    <span class="usrName">` + result.name + `</span><br/>
                    <p class="usrSign">` + result.sign + `</p>
                </div>
                <div slot="subhead">
                    <a href="https://space.bilibili.com/` + result.uid + `" target="_blank">
                        <s-icon-button type="outlined" title="空间">
                            <s-icon slot="start">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M240-120q-66 0-113-47T80-280q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm480 0q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm-480-80q33 0 56.5-23.5T320-280q0-33-23.5-56.5T240-360q-33 0-56.5 23.5T160-280q0 33 23.5 56.5T240-200Zm480 0q33 0 56.5-23.5T800-280q0-33-23.5-56.5T720-360q-33 0-56.5 23.5T640-280q0 33 23.5 56.5T720-200ZM480-520q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-680q0-33-23.5-56.5T480-760q-33 0-56.5 23.5T400-680q0 33 23.5 56.5T480-600Zm0-80Zm240 400Zm-480 0Z"></path></svg>
                            </s-icon>
                        </s-icon-button>
                    </a>
                </div>
            `);
        }
    });
}

function showPlayerPref() {
    getStorage("player", function (result) {
        // 如果没有存储的设置，使用默认值
        var defaultResult = { "HD_Quality_As_Default": false, "Advanced_DanMu_As_Default": false, "DanMu_Color": "white", "Notify_Dynamic_Update": false };
        if (!result || !areKeysEqual(result, defaultResult)) {
            result = defaultResult;
            setStorage("player", result);
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

        $("#container_1").html(htmlContent + `<br/><i>* 提示：选项修改后会自动保存，页面刷新后才能应用全部设置。</i>`);

        // 添加事件监听
        for (const key in result) {
            if (typeof result[key] === 'boolean') {
                $(`#${key}`).change(function () {
                    result[key] = this.checked;
                    setStorage("player", result);
                });
            } else if (typeof result[key] === 'string') {
                $(`#${key}`).blur(function () {
                    result[key] = this.value;
                    setStorage("player", result);
                });
            }
        }
    });
}

/* 设置页面操作 */
function optRouteCtrl() {
    $("s-tab-item").click((evt) => {
        const { selectedIndex } = document.querySelector('s-tab');

        var tabsNumber = 3; // tab总数
        for (i = 0; i < tabsNumber; i ++) {
            if (i == selectedIndex) {
                document.getElementById("container_" + i).style.display = "block";
            } else {
                document.getElementById("container_" + i).style.display = "none";
            }
        }
    });
}

$(document).ready(function () {
    if (window.location.href.split("/").slice(-1)[0] === "options.html") {
        optRouteCtrl();
        showPlayerPref();
        showUserCard("auto");

        $("#refreshUserInfo").click(function () {
            $("#refreshUserInfo").hide();
            $("#refreshUserInfo").text("刷新完成!");
            $("#refreshUserInfo").fadeIn(1000);
            resetAccount();
        });
        $("#restorePlayerCfg").click(function () {
            $("#restorePlayerCfg").hide();
            $("#restorePlayerCfg").text("已恢复为默认!");
            $("#restorePlayerCfg").fadeIn(1000);
            removeStorage("player");
            setTimeout(function () {
                showPlayerPref();
            }, 500);
        });

        $("#exportSubscription").click(function () {
            /* 导出订阅（pipepipe格式 -options.js） */
            $("#exportSubscription").hide();

            getAccount("auto", function (usrInfo) {
                showToast("正在获取列表，请等待2s~10s，转换完成后将通过浏览器下载保存");
                saveSubscriptionForPipePipe(usrInfo.uid);

                $("#exportSubscription").text("导出完成!");
                $("#exportSubscription").fadeIn(1000);
            });
        })
    }
});