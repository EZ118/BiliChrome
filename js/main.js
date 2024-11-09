var currentTab = "home";
var currentUid = "114514";
var lastDynamicOffset = null;

function showSearchPage() {
    /* 显示搜素页 */

    /* 处理搜素历史 */
    let WebList = '';
    let searchHistory = localStorage.getItem("searchHistory");
    if (searchHistory) {
        let searchHistoryArray = JSON.parse(searchHistory);
        $.each(searchHistoryArray, function (index, item) {
            WebList += `<s-chip type="elevated" class="search_histroyItem">${item}</s-chip>`;
        });
    }

    $("#item_container").html(`
        <div align="center">
            <div style='margin-top:30vh; margin-bottom:35px; display:flex; justify-content:center; align-items:flex-end;'>
                <img src="./img/logo.svg" width="160px">
                <span style="color:#00AEEC;font-size:xx-large">&nbsp;|&nbsp;搜索</span>
            </div>
            <br>
            <s-search style="width:300px;">
                <s-icon type="search" slot="start"></s-icon>
                <input type="text" class="app-input-text" placeholder="回车以搜索">
            </s-search>
            <br>
            <div style="width:350px; margin-top:20px;" title="搜素历史" class="search_history">
                ${WebList}
                <br><br>
                <s-chip title="清空搜素历史" id="search_clearHistory" type="elevated"><s-icon type="close"></s-icon></s-chip>
            </div>
        </div>`);
    $("#dynamic_loader").hide();
    var inputObject = $("#item_container").find("input.app-input-text");

    inputObject.off('keydown');
    $("#item_container .search_history .search_histroyItem").off();
    $("#item_container .search_history #search_clearHistory").off();

    inputObject.on('keydown', function (event) {
        /* 回车开始搜素 */
        if (event.key === 'Enter' || event.keyCode === 13) {
            if ($(this).val().trim() !== '') {
                let searchWd = $(this).val();
                getSearchResult(searchWd);

                /* 记录搜索历史 */
                if (!searchHistory) {
                    localStorage.setItem("searchHistory", '["' + searchWd + '"]');
                } else {
                    let searchHistoryArray = JSON.parse(searchHistory);
                    if (searchHistoryArray.indexOf(searchWd) === -1) {
                        searchHistoryArray.push(searchWd);
                        localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArray));
                    }
                }
            }
        }
    });
    $("#item_container .search_history .search_histroyItem").on('click', function (event) {
        /* 从历史记录搜素 */
        let searchWd = $(event.target).text();
        getSearchResult(searchWd);
    });
    $("#item_container .search_history #search_clearHistory").on('click', function (event) {
        /* 清除历史 */
        localStorage.removeItem("searchHistory");
        showToast("已清空搜索历史")
        showSearchPage();
    });
}
function getSearchResult(wd) {
    if (!wd) { return; }
    $("#item_container").html("");
    $("#dynamic_loader").show();
    $.get("https://api.bilibili.com/x/web-interface/search/all/v2?keyword=" + encodeURI(wd), function (tjlist) {
        var WebList = "<p style='margin:0px 10px 0px 10px;font-size:16px;'><b style='user-select:text;'>" + wd + "</b>的搜索结果：</p>";
        $.each(tjlist.data.result[11].data, function (index, item) {
            WebList += `
                <s-card clickable="true" class="common_video_card">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#aid_` + item.aid + `">
                            <img src='https:` + item.pic + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#aid_` + item.aid + `">
                            ` + item.title + `
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#uid_` + item.mid + `">
                            ` + item.author + `
                        </a>
                    </div>
                </s-card>`;
        });
        $("#item_container").html(WebList);
        $("#dynamic_loader").hide();
    });
}


async function getSubscribedVideos() {
    $("#item_container").html("");
    $("#dynamic_loader").show();

    var WebList = "<div class='flex_container'>";

    for (let i = 1; i <= 3; i++) {
        // 构建请求的 URL，包含当前的 offset
        const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=-480&offset=${lastDynamicOffset || ""}&type=video&platform=web&page=${i}`;

        try {
            // 等待请求完成并获取数据
            let response = await $.get(url);
            let tjlist = response;

            // 处理获取到的数据
            $.each(tjlist.data.items, function (index, item) {
                var card = item.modules;
                var dynamicDesc = card.module_dynamic.desc ? ("动态内容: " + card.module_dynamic.desc.text + "\n") : "";
                var tooltipText = dynamicDesc + '点赞数量: ' + card.module_stat.like.count + '\n视频简介: ' + card.module_dynamic.major.archive.desc;

                WebList += `
                    <s-card clickable="true" class="common_video_card" title='` + tooltipText + `'>
                        <div slot="image" style="overflow:hidden;">
                            <a href="#aid_` + card.module_dynamic.major.archive.aid + `">
                                <img src='` + card.module_dynamic.major.archive.cover + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                            </a>
                        </div>
                        <div slot="subhead">
                            <a href="#aid_` + card.module_dynamic.major.archive.aid + `">
                                ` + card.module_dynamic.major.archive.title + `
                            </a>
                        </div>
                        <div slot="text">
                            <a href="#uid_` + card.module_author.mid + `">
                                ` + card.module_author.name + `
                            </a>
                        </div>
                    </s-card>`;
            });

            // 更新 lastDynamicOffset
            lastDynamicOffset = tjlist.data.offset;
        } catch (error) {
            console.error("[ERROR] 近期关注UP视频动态获取失败", error);
            break; // 如果请求失败，则退出循环
        }
    }

    // 所有请求完成后更新页面内容
    $("#item_container").html(WebList + "</div>");
    $("#dynamic_loader").hide();
}

function getUserSpace(uid) {
    var WebList = "";
    $.get("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=" + uid, function (data) {
        $.each(data.data.items, function (index, item) {
            var ImgUrl = "";
            var VidDesc = "";
            var LinkUrl = "default";
            var user = item.modules.module_author;
            var avatarUrl = user.face;
            var username = user.name;
            var mid = user.mid;
            var dynamicType = item.type;
            var card_json = item;

            if (dynamicType === 'DYNAMIC_TYPE_AV' && card_json.modules.module_dynamic.major) {
                /* 如果动态内容是视频 */
                var video = card_json.modules.module_dynamic.major.archive;
                VidDesc = video.title;
                ImgUrl = '<img class="videopic" src="' + video.cover + '@530w_300h_1c.webp" onerror="this.remove()">';
                LinkUrl = "bvid_" + video.bvid;
            } else if (dynamicType === 'DYNAMIC_TYPE_WORD' || dynamicType === 'DYNAMIC_TYPE_DRAW') {
                /* 如果动态内容是文字 */
                VidDesc = card_json.modules.module_dynamic.desc.text;
                if (dynamicType === 'DYNAMIC_TYPE_DRAW' && card_json.modules.module_dynamic.major) {
                    /* 如果动态内容含图片 */
                    var imageUrl = card_json.modules.module_dynamic.major.draw.items[0].src;
                    ImgUrl = `<a href="#img-` + encodeURI(imageUrl) + `"><img class="dailypic" src="` + imageUrl + `@256w_256h_1e_1c_!web-dynamic.jpg"></a>`;
                }
            }

            if (VidDesc == null) { VidDesc = ""; }
            if (LinkUrl == null) { LinkUrl = "default"; }

            if (VidDesc == "" && LinkUrl == "default" && (ImgUrl == null || ImgUrl == "")) { } else {
                VidDesc = VidDesc.split("\n").join("<br>");
                WebList += `
                    <s-ripple class='space_singlebox' align='left'>
                        <a>
                            <div class="space_singlebox_un">
                                <img class="userpic" src='${avatarUrl}@45w_45h_1c.webp'>
                                <label>&nbsp;${username}</label>
                            </div>
                        </a>
                        <a href='#${LinkUrl}'>
                            <div class='space_singlebox_vt'>${VidDesc}</div>
                            ${ImgUrl}
                        </a>
                    </s-ripple>`;
            }
        });

        WebList = "<div class='flex_container' style='flex-direction:column; align-items:center;'>" + WebList + "</div>";
        openDlg("用户空间 [UID:" + uid + "]", WebList, "https://space.bilibili.com/" + uid);
    }).fail(function () {
        console.log("Error fetching data.");
        showToast("个人空间加载失败")
    });
}

function getMySpace() {
    $("#item_container").html("");
    $("#dynamic_loader").show();
    getAccount("auto", function (usrInfo) {
        currentUid = usrInfo.uid;

        var WebHtml = `
            <s-card class="myspace_topInfoBox" type="outlined">
                <div slot="image">
                    <img src="${usrInfo.face}@256w_256h_1c.webp">
                </div>
                <div slot="headline">
                    <span class="usrName">${usrInfo.name}</span><br/>
                    <p class="usrSign">${usrInfo.sign}</p>

                    <s-chip type="elevated">LV${usrInfo.level}</s-chip>
                    <s-chip type="elevated">${usrInfo.sex}</s-chip>
                    <s-chip type="elevated">${usrInfo.coins}币</s-chip>
                    <s-chip type="elevated">${usrInfo.fans}粉丝</s-chip>
                </div>
                <div slot="subhead">
                    <a href="https://space.bilibili.com/${usrInfo.uid}" target="_blank">
                        <s-icon-button type="outlined" title="空间">
                            <s-icon slot="start">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M240-120q-66 0-113-47T80-280q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm480 0q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm-480-80q33 0 56.5-23.5T320-280q0-33-23.5-56.5T240-360q-33 0-56.5 23.5T160-280q0 33 23.5 56.5T240-200Zm480 0q33 0 56.5-23.5T800-280q0-33-23.5-56.5T720-360q-33 0-56.5 23.5T640-280q0 33 23.5 56.5T720-200ZM480-520q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T560-680q0-33-23.5-56.5T480-760q-33 0-56.5 23.5T400-680q0 33 23.5 56.5T480-600Zm0-80Zm240 400Zm-480 0Z"></path></svg>
                            </s-icon>
                        </s-icon-button>
                    </a>
                </div>
            </s-card>
            

            <div class="flex_container">
                <s-card class="myspace_subSection" type="outlined">
                    <div slot="headline">
                        我的收藏
                    </div>
                    <a href="#myfav_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon type="arrow_forward"></s-icon></s-icon-button></a>
                </s-card>
                <s-card class="myspace_subSection" type="outlined">
                    <div slot="headline">我的关注</div>
                    <a href="#mysubscription_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon type="arrow_forward"></s-icon></s-icon-button></a>
                </s-card>
                <s-card class="myspace_subSection" type="outlined">
                    <div slot="headline">历史记录</div>
                    <a href="#history_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon type="arrow_forward"></s-icon></s-icon-button></a>
                </s-card>
                <s-card class="myspace_subSection" type="outlined">
                    <div slot="headline">最近动态</div>
                    <a href="#uid_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon type="arrow_forward"></s-icon></s-icon-button></a>
                </s-card>
                <s-card class="myspace_subSection" type="outlined">
                    <div slot="headline">稍后再看</div>
                    <a href="#watchlater_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon type="arrow_forward"></s-icon></s-icon-button></a>
                </s-card>
                <s-card class="myspace_subSection" type="outlined">
                    <div slot="headline">评论回复</div>
                    <a href="#replymsg_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon type="arrow_forward"></s-icon></s-icon-button></a>
                </s-card>
                <s-card class="myspace_subSection" type="outlined">
                    <div slot="headline">扩展选项</div>
                    <a href="#options"><s-icon-button slot="action" type="filled-tonal"><s-icon type="arrow_forward"></s-icon></s-icon-button></a>
                </s-card>
            </div>
            
            <center style="margin-top:calc(40vh - 120px); z-index: -1;">
                <a href="https://github.com/EZ118/BiliChrome" style="color:#5050F0;">前往Github查看项目</a><br>
                <font color="#888">提示：ctrl+Q可快速关闭视频等窗口</font>
            </center>
        `;
        setTimeout(function () {
            $("#item_container").html(WebHtml);
            $("#dynamic_loader").hide();
        }, 200);
    });
}

function getUserHistory() {
    $.get("https://api.bilibili.com/x/web-interface/history/cursor?ps=30&type=archive", function (tjlist) {
        var WebList = "";
        $.each(tjlist.data.list, function (index, item) {
            WebList += `
                <s-card clickable="true" class="common_video_card">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#bvid_` + item.history.bvid + `">
                            <img src='` + item.cover + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#bvid_` + item.history.bvid + `">
                            ` + item.title + `
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#uid_` + item.author_mid + `">
                            ` + item.author_name + `
                        </a>
                    </div>
                </s-card>`;
        });
        openDlg("观看历史（近30条）", "<div class='flex_container'>" + WebList + "</div>", "https://www.bilibili.com/account/history");
    });
}

function getUserSubscription(uid) {
    $("#item_container").html("");
    $("#dynamic_loader").show();
    var requests = [];
    var WebList = "";
    for (let i = 1; i <= 6; i++) {
        let request = $.get("https://api.bilibili.com/x/relation/followings?vmid=" + uid + "&pn=" + i + "&ps=50&order=desc&order_type=attention", function (tjlist) {
            if (tjlist.data.list.length <= 0) { return; }

            $.each(tjlist.data.list, function (index, item) {
                WebList += `<a href="#uid_` + item.mid + `">
                        <s-card clickable="true" class="common_video_card">
                            <div slot="image" style="height:30px;overflow:hidden;">
                                <img style='height:30px;width:30px;border-radius:10px 0 0 0' src='` + item.face + `@45w_45h_1c.webp'>
                            </div>
                            <div slot="subhead">
                                ` + item.uname + `
                            </div>
                            <div slot="text">
                                [简介] ` + (item.sign || "<i>无</i>") + `
                            </div>
                        </s-card>
                    </a>`;
            });
        });
        requests.push(request);
    }
    $.when.apply($, requests).done(function () {
        setTimeout(function () {
            $("#item_container").html("<p style='margin:0px 10px 0px 10px;font-size:16px;'>关注列表：</p><div class='flex_container'>" + WebList + "</div>");
            $("#dynamic_loader").hide();
        }, 400);
    });
}

function getMyCollectionList() {
    $.get("https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=" + currentUid + "&ps=999&pn=1", function (tjlist) {
        var WebList = "";
        $.each(tjlist.data.list, function (index, item) {
            let favIntro = item.intro ?? "暂无";
            WebList += `<a href="#fav_` + item.id + `_` + item.media_count + `">
                    <s-card clickable="true" class="common_video_card" type="outlined" style="min-width:160px;">
                        <div slot="subhead">
                            ` + item.title + `
                        </div>
                        <div slot="text">
                            [简介] ` + favIntro + `
                        </div>
                    </s-card>
                </a>`;
        });
        openDlg("所有收藏夹", "<div class='flex_container'>" + WebList + "</div>", "https://space.bilibili.com/" + currentUid + "/favlist");
    });
}

function getCollectionById(fid, mediaCount) {
    mediaCount = parseInt(mediaCount);
    $.get("https://api.bilibili.com/x/v3/fav/resource/list?media_id=" + fid + "&ps=" + (mediaCount) + "&pn=1", function (tjlist) {
        if (tjlist.code == -400) { showToast("该收藏夹未被公开，暂时无法查看"); return; }
        var WebList = "<a href='#myfav'><s-icon-button><s-icon type='arrow_back'></s-icon></s-icon-button></a><div class='flex_container'>";
        $.each(tjlist.data.medias, function (index, item) {
            WebList += `
                <s-card clickable="true" class="common_video_card">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#bvid_` + item.bvid + `">
                            <img src='` + item.cover + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#bvid_` + item.bvid + `">
                            ` + item.title + `
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#uid_` + item.upper.mid + `">
                            ` + item.upper.name + `
                        </a>
                    </div>
                </s-card>`;
        });
        openDlg("收藏夹 [FID:" + fid + "]", WebList + "</div>", "https://space.bilibili.com/" + currentUid + "/favlist?fid=" + fid + "&ftype=create");
    });
}

function getWatchLater() {
    $.get("https://api.bilibili.com/x/v2/history/toview", function (tjlist) {
        if (tjlist.code == -400) { showToast("暂时无法查看"); return; }
        var WebList = "";
        $.each(tjlist.data.list, function (index, item) {
            WebList += `
                <s-card clickable="true" class="common_video_card">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#bvid_` + item.bvid + `_watchlater">
                            <img src='` + item.pic + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#bvid_` + item.bvid + `_watchlater">
                            ` + item.title + `
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#uid_` + item.owner.mid + `">
                            ` + item.owner.name + `
                        </a>
                    </div>
                </s-card>`;
        });
        openDlg("稍后再看", "<div class='flex_container'>" + WebList + "</div>", "https://www.bilibili.com/watchlater/#/list");
    });
}


function getVidPlayingNow() {
    $.get("https://api.bilibili.com/x/web-interface/history/continuation?his_exp=1200", function (vidInfo) {
        if (vidInfo.data != null) {
            var container = $('<div>', {
                class: 'continuation_alertBox'
            });

            // 设置 innerHTML 内容
            container.html(`
                <s-card clickable="true" class="common_video_card" type="outlined" title="该视频正在其他设备中播放">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#bvid_${vidInfo.data.history.bvid}">
                            <img src='${vidInfo.data.cover}@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#bvid_${vidInfo.data.history.bvid}_watchlater">
                            ${vidInfo.data.title}
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#uid_${vidInfo.data.author_mid}">
                            ${vidInfo.data.author_name}
                        </a>
                    </div>
                </s-card>
            `);

            // 将创建的元素添加到 body 中
            container.appendTo('body');

            setTimeout(function () {
                container.fadeOut(700);
            }, 3500);
        }
    });
}

function routeCtrl(isOnload, hash) {
    var data = null;
    if (hash) {
        data = hash.substring(1);
    } else {
        data = window.location.hash.substring(1);
    }

    if (data.includes("bvid")) {
        /* 视频播放bvid */
        openPlayer({
            bvid: data.split("_")[1],
            refreshOnly: data.includes("refreshonly") ? "watch_later" : null,
            videoList: data.includes("watchlater") ? "watch_later" : null
        });
    } else if (data.includes("aid")) {
        /* 视频播放aid */
        openPlayer({
            aid: data.split("_")[1],
            refreshOnly: data.includes("refreshonly") ? "watch_later" : null,
            videoList: data.includes("watchlater") ? "watch_later" : null
        });
    } else if (data.includes("uid")) {
        /* 用户空间 */
        getUserSpace(data.split("_")[1]);

    } else if (data.includes("img-")) {
        /* 图片查看 */
        openDlg("浏览图片", `<img src="` + data.split("-")[1] + `" width="100%">`, data.split("-")[1]);

    } else if (data.includes("myfav")) {
        /* 收藏夹列表 */
        getMyCollectionList();

    } else if (data.includes("mysubscription")) {
        /* 订阅up主列表 */
        if (isOnload) { setTimeout(function () { getUserSubscription(currentUid); }, 300); }
        else { getUserSubscription(currentUid); }

    } else if (data.includes("fav_")) {
        /* 收藏夹 */
        getCollectionById(data.split("_")[1], data.split("_")[2]);

    } else if (data.includes("history")) {
        /* 观看历史 */
        getUserHistory();

    } else if (data.includes("watchlater")) {
        /* 稍后再看 */
        getWatchLater();
        getUserHistory();

    } else if (data.includes("replymsg")) {
        /* 消息中心 - 评论回复列表 */
        showMsgReply();

    } else if (data.includes("options")) {
        /* 显示扩展选项对话框 */
        openDlg("扩展选项", "<iframe src='./options.html' class='options_frame'></iframe>", "#options")

    } else if (data[0] == "n") {
        /* 导航栏 */
        let tab = data.split("_")[1];
        if (tab == "home") { homeInit(); } else if (tab == "message") { messageInit(); } else if (tab == "subscriptions") { getSubscribedVideos(); } else if (tab == "space") { getMySpace(); } else if (tab == "search") { showSearchPage(); }
        currentTab = tab;

    } else if (data == "default") {
        /* 不做任何事情 */
    } else {
        homeInit();
    }

    if (isOnload == true && data[0] != "n") {
        homeInit();
    }
}

$(document).ready(function () {
    document.referrer = "https://www.bilibili.com/";

    getAccount("auto", function (usrInfo) {
        /* 载入用户信息 */
        currentUid = usrInfo.uid;
        if (!usrInfo.uid) { showToast("您未登录，请在bilibili.com登录后再使用", 8000) }
    });

    getVidPlayingNow();
    routeCtrl(isOnload = true);

    window.addEventListener('popstate', function (event) {
        routeCtrl();
    });

    /* 侧边主菜单 */
    $("s-navigation-item").click((evt) => {
        const link = $(evt.target).attr("href");
        //routeCtrl(hash = link)
        window.location.hash = link;
    });

    /* 侧栏彩蛋 */
    var eggBtnCnt = 0;
    $("#eggBtn").click(() => {
        eggBtnCnt++;
        if (eggBtnCnt == 16) {
            showToast("这不是彩蛋...");
        } else if (eggBtnCnt == 32) {
            showToast("真不是彩蛋...");
        } else if (eggBtnCnt >= 64) {
            eggBtnCnt = 0;
            showToast("你疯了吧！");
        }
    });
});

$("#RefreshBtn").click(function () {
    /* 刷新 */
    if (currentTab == "home") { homeInit('refresh'); } else if (currentTab == "message") { messageInit(); } else if (currentTab == "subscriptions") { getSubscribedVideos(); } else if (currentTab == "space") { getMySpace(); }
});
