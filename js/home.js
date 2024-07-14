var currentTab = "home";
var currentUid = "114514";

function showSearchPage() {
    $("#item_container").html(`
        <div align="center">
            <div style='margin-top:30vh; margin-bottom:35px; display:flex; justify-content:center; align-items:flex-end;'>
                <img src="./img/logo.svg" width="160px">
                <span style="color:#00AEEC;font-size:xx-large">&nbsp;|&nbsp;搜索</span>
            </div>
            <br>
            <div class="app-input-search-box">
                <input class="app-input-text" type="search" size="38" placeholder="回车以搜索">
            </div>
        </div>`);
    $("#dynamic_loader").hide();
    var inputObject = $("#item_container").find("input.app-input-text");

    inputObject.off('keydown');
    inputObject.on('keydown', function (event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            if ($(this).val().trim() !== '') {
                getSearchResult($(this).val());
            }
        }
    });
}
function getSearchResult(wd) {
    if (!wd) { return; }
    $("#item_container").html("");
    $("#dynamic_loader").show();
    $.get("https://api.bilibili.com/x/web-interface/search/all/v2?keyword=" + encodeURI(wd), function (tjlist) {
        var WebList = "<p style='margin:0px 10px 0px 10px;font-size:16px;'><b style='user-select:text;'>" + wd + "</b>的搜索结果：</p>";
        $.each(tjlist.data.result[11].data,function(index,item){
            WebList += `<div class='wide_singlebox'>
                    <a href="#bvid_` + item.bvid + `">
                        <img src='https:` + item.pic + `@412w_232h_1c.webp'><br>
                    </a>
                    <div height="100%">
                        <a href="#aid_` + item.aid + `">
                            <div class="wide_singlebox_vt">` + item.title + `</div>
                        </a>
                        <a href="#uid_` + item.mid + `">
                            <div class="wide_singlebox_un">🔘&nbsp;` + item.author + `</div>
                        </a>
                    </div>
                </div>`;
        });
        $("#item_container").html(WebList);
        $("#dynamic_loader").hide();
    });
}

function getRecommendedVideos() {
    $("#item_container").html("");
    $("#dynamic_loader").show();
    var WebList = "<div class='flex_container'>";
    var requests = [];

    for (let i = 1; i <= 2; i++) {
        let request = $.get("https://api.bilibili.com/x/web-interface/index/top/rcmd?fresh_type=3&version=1&ps=14", function (tjlist) {
            $.each(tjlist.data.item,function(index,item){
                WebList += `<div class='dynamic_singlebox'>
                        <a href="#bvid_` + item.bvid + `">
                            <div class="dynamic_singlebox_imgwrap"><img src='` + item.pic + `@412w_232h_1c.webp'></div>
                            <div class="dynamic_singlebox_vt">` + item.title + `</div>
                        </a>
                        <a href="#uid_` + item.owner.mid + `">
                            <div class="dynamic_singlebox_un">🔘&nbsp;` + item.owner.name + `</div>
                        </a>
                    </div>`;
            });
        });

        requests.push(request);
    }

    $.when.apply($, requests).done(function () {
        $("#item_container").html(WebList + "</div>");
        $("#dynamic_loader").hide();
    });
}


function getHotVideos() {
    $("#item_container").html("");
    $("#dynamic_loader").show();
    $.get("https://api.bilibili.com/x/web-interface/popular?ps=40&pn=1", function (tjlist) {
        var WebList = "";
        $.each(tjlist.data.list,function(index,item){
            var tooltipText = '- 点赞数量: ' + item.stat.like + '\n- 视频简介: ' + (item.desc ? item.desc : "无简介") + (item.rcmd_reason.content ? ("\n- 推荐原因: " + item.rcmd_reason.content) : "");
            WebList += `<div class='wide_singlebox' title='` + tooltipText + `'>
                    <a href="#bvid_` + item.bvid + `">
                        <img src='` + item.pic + `@412w_232h_1c.webp'><br>
                    </a>
                    <div height="100%">
                        <a href="#bvid_` + item.bvid + `">
                            <div class="wide_singlebox_vt">` + item.title + `</div>
                        </a>
                        <a href="#uid_` + item.owner.mid + `">
                            <div class="wide_singlebox_un">🔘&nbsp;` + item.owner.name + `</div>
                        </a>
                    </div>
                </div>`;
        })
        $("#item_container").append("<div class='flex_container'>" + WebList + "</div>");
        $("#dynamic_loader").hide();
    });
}

function getSubscribedVideos() {
    $("#item_container").html("");
    $("#dynamic_loader").show();

    $.get("https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?type_list=8,512,4097,4098,4099,4100,4101", function (tjlist) {
        var WebList = "";
        $.each(tjlist.data.cards,function(index,item){
            var card = JSON.parse(item.card);
            var dynamicDesc = card.dynamic ? ("- 动态内容: " + card.dynamic + "\n") : "";
            var tooltipText = dynamicDesc + '- 点赞数量: ' + card.stat.like + '\n- 视频简介: ' + (card.desc ? card.desc : "无简介");
            WebList += `<div class='wide_singlebox' title='` + tooltipText + `'>
                    <a href="#aid_` + card.aid + `">
                        <img src='` + card.pic + `@412w_232h_1c.webp'><br>
                    </a>
                    <div height="100%">
                        <a href="#aid_` + card.aid + `">
                            <div class="wide_singlebox_vt">` + card.title + `</div>
                        </a>
                        <a href="#uid_` + card.owner.mid + `">
                            <div class="wide_singlebox_un">🔘&nbsp;` + card.owner.name + `</div>
                        </a>
                    </div>
                </div>`;
        });
        $("#item_container").html(WebList);
        $("#dynamic_loader").hide();
    });
    /* $.get("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?type=video", function (tjlist) {
        var WebList = "";
        $.each(tjlist.data.items,function(index,item){
            var card = item.modules;
            var dynamicDesc = card.module_dynamic.desc ? ("动态内容: " + card.module_dynamic.desc.text + "\n") : "";
            var tooltipText = dynamicDesc + '点赞数量: ' + card.module_stat.like.count + '\n视频简介: ' + card.module_dynamic.major.archive.desc;
            WebList += `<div class='wide_singlebox' title='` + tooltipText + `'>
                    <a href="#aid_` + card.module_dynamic.major.archive.aid + `">
                        <img src='` + card.module_dynamic.major.archive.cover + `@412w_232h_1c.webp'><br>
                    </a>
                    <div height="100%">
                        <a href="#aid_` + card.module_dynamic.major.archive.aid + `">
                            <div class="wide_singlebox_vt">` + card.module_dynamic.major.archive.title + `</div>
                        </a>
                        <a href="#uid_` + card.module_author.mid + `">
                            <div class="wide_singlebox_un">🔘&nbsp;` + card.module_author.name + `</div>
                        </a>
                    </div>
                </div>`;
        });
        $("#item_container").html(WebList);
        $("#dynamic_loader").hide();
    }); */
}

function getUserSpace(uid) {
    var WebList = "";
    $.get("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=" + uid, function (data) {
        $.each(data.data.items,function(index,item){
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
                    <div class='space_singlebox' align='left'>
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
                    </div>`;
            }
        });

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
            <br>
            <table class="myspace_topInfoBox" cellpadding="0" cellspacing="0">
                <tr>
                    <td><img src="` + usrInfo.face + `@256w_256h_1c.webp"></td>
                    <td width="10px"></td>
                    <td>
                        <b class="usrName">` + usrInfo.name + `</b>&nbsp;&nbsp;<i>` + usrInfo.sex + `</i><br>
                        LEVEL:&nbsp;<i>` + usrInfo.level + `</i><br>
                        <i>` + usrInfo.sign + `</i>
                    </td>
                    <td style="width: calc(98vw - 100px - 320px)"></td>
                    <td align="center">
                        <b class="usrNums">` + usrInfo.coins + `</b><br>
                        <i>硬币</i>
                    </td>
                    <td align="center" width="30px">|</td>
                    <td align="center">
                        <b class="usrNums">` + usrInfo.fans + `</b><br>
                        <i>粉丝</i>
                    </td>
                    <td width="30px"></td>
                </tr>
            </table>
            <br>
            <div style="width:100%;display:flex; flex-wrap: wrap;">
                <div class="myspace_subSection">
                    <p align="left">我的收藏</p>
                    <p align="right"><a href="#myfav_` + usrInfo.uid + `">查看<i class='icons10-angle-right'></i></a></p>
                </div>
                <div class="myspace_subSection">
                    <p align="left">我的关注</p>
                    <p align="right"><a href="#mysubscription_` + usrInfo.uid + `">查看<i class='icons10-angle-right'></i></a></p>
                </div>
                <div class="myspace_subSection">
                    <p align="left">历史记录</p>
                    <p align="right"><a href="#history_` + usrInfo.uid + `">查看<i class='icons10-angle-right'></i></a></p>
                </div>
                <div class="myspace_subSection">
                    <p align="left">最近动态</p>
                    <p align="right"><a href="#uid_` + usrInfo.uid + `">查看<i class='icons10-angle-right'></i></a></p>
                </div>
                <div class="myspace_subSection">
                    <p align="left">稍后再看</p>
                    <p align="right"><a href="#watchlater_` + usrInfo.uid + `">查看<i class='icons10-angle-right'></i></a></p>
                </div>
                <div class="myspace_subSection">
                    <p align="left">评论回复</p>
                    <p align="right"><a href="#replymsg_` + usrInfo.uid + `">查看<i class='icons10-angle-right'></i></a></p>
                </div>
                <div class="myspace_subSection">
                    <p align="left">扩展选项</p>
                    <p align="right"><a href="#options">查看<i class='icons10-angle-right'></i></a></p>
                </div>
                <div class="myspace_subSection">
                    <p align="left">将订阅导出到PipePipe</p>
                    <p align="right"><a href="#export_subscription">查看<i class='icons10-angle-right'></i></a></p>
                </div>
            </div>
            
            <center style="margin-top:calc(88vh - 370px); z-index: -1;">
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
        $.each(tjlist.data.list,function(index,item){
            WebList += `<div class='dynamic_singlebox'>
                        <a href="#bvid_` + item.history.bvid + `">
                            <img src='` + item.cover + `@412w_232h_1c.webp'><br>
                            <div class="dynamic_singlebox_vt">` + item.title + `</div>
                        </a>
                        <a href="#uid_` + item.author_mid + `">
                            <div class="dynamic_singlebox_un">🔘&nbsp;` + item.author_name + `</div>
                        </a>
                    </div>
                `;
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

            $.each(tjlist.data.list,function(index,item){
                WebList += `<a href="#uid_` + item.mid + `">
                        <div class='dynamic_singlebox' style='height:90px;'>
                            <div class="dynamic_singlebox_vt" style='height:35px; line-height:30px; display:flex; flex-direction:row; vertical-align:middle;'>
                                <img style='height:30px;width:30px;border-radius:25px;' src='` + item.face + `@45w_45h_1c.webp'>
                                &nbsp;
                                <b>` + item.uname + `</b>
                            </div>
                            <div class="dynamic_singlebox_un">[简介]&nbsp; ` + (item.sign || "<i>无</i>") + `</div>
                        </div>
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
        $.each(tjlist.data.list,function(index,item){
            let favIntro = item.intro ?? "暂无简介";
            WebList += `<a href="#fav_` + item.id + `_` + item.media_count + `">
                    <div class='dynamic_singlebox' style='height:60px;'>
                        <div class="dynamic_singlebox_vt" style='height:30px'>
                            <i class='icons10-folder' style="font-size:20px;"></i>
                            &nbsp;
                            ` + item.title + `
                        </div>
                        <div class="dynamic_singlebox_un">*&nbsp;` + favIntro + `</div>
                    </div>
                </a>`;
        });
        openDlg("所有收藏夹", "<div class='flex_container'>" + WebList + "</div>", "https://space.bilibili.com/" + currentUid + "/favlist");
    });
}

function getCollectionById(fid, mediaCount) {
    mediaCount = parseInt(mediaCount);
    $.get("https://api.bilibili.com/x/v3/fav/resource/list?media_id=" + fid + "&ps=" + (mediaCount) + "&pn=1", function (tjlist) {
        if (tjlist.code == -400) { showToast("该收藏夹未被公开，暂时无法查看"); return; }
        var WebList = "<a href='#myfav'>&nbsp;<i class='icons10-arrow-left' style='font-size:25px;'></i></a><br><div class='flex_container'>";
        $.each(tjlist.data.medias,function(index,item){
            WebList += `<div class='dynamic_singlebox'>
                        <a href="#bvid_` + item.bvid + `">
                            <img src='` + item.cover + `@412w_232h_1c.webp'><br>
                            <div class="dynamic_singlebox_vt">` + item.title + `</div>
                        </a>
                        <a href="#uid_` + item.upper.mid + `">
                            <div class="dynamic_singlebox_un">🔘&nbsp;` + item.upper.name + `</div>
                        </a>
                    </div>
                `;
        });
        openDlg("收藏夹 [FID:" + fid + "]", WebList + "</div>", "https://space.bilibili.com/" + currentUid + "/favlist?fid=" + fid + "&ftype=create");
    });
}

function getWatchLater() {
    $.get("https://api.bilibili.com/x/v2/history/toview", function (tjlist) {
        if (tjlist.code == -400) { showToast("暂时无法查看"); return; }
        var WebList = "";
        $.each(tjlist.data.list,function(index,item){
            WebList += `<div class='dynamic_singlebox'>
                        <a href="#bvid_` + item.bvid + `_watchlater">
                            <img src='` + item.pic + `@412w_232h_1c.webp'><br>
                            <div class="dynamic_singlebox_vt">` + item.title + `</div>
                        </a>
                        <a href="#uid_` + item.owner.mid + `">
                            <div class="dynamic_singlebox_un">🔘&nbsp;` + item.owner.name + `</div>
                        </a>
                    </div>
                `;
        });
        openDlg("稍后再看", "<div class='flex_container'>" + WebList + "</div>", "https://www.bilibili.com/watchlater/#/list");
    });
}

function getMsgReply() {
    $.get("https://api.bilibili.com/x/msgfeed/reply?platform=web&build=0&mobi_app=web&ps=40", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.items,function(index,item){
            WebList += `<div class='thinstrip_msgBox'>
                <a href="#uid_` + item.user.mid + `">
                    <div class='thinstrip_msgBox_headline'>
                        <img src='` + item.user.avatar + `@45w_45h_1c.webp'>
                        <span class='thinstrip_msgBox_username'>` + item.user.nickname + `</span>
                    </div>
                </a>
                <a href="#aid_` + item.item.subject_id + `">
                    <div class='thinstrip_msgBox_contentline'>
                        <p class='quote'>回复&nbsp;“` + item.item.root_reply_content + `”</p>
                        <pre class='content'>` + item.item.source_content + `</pre>
                    </div>
                </a>
            </div>`;
        });
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>"
        openDlg("评论回复", WebList, "https://message.bilibili.com/#/reply");
    });
}

function getVidPlayingNow() {
    $.get("https://api.bilibili.com/x/web-interface/history/continuation?his_exp=1200", function (vidInfo) {
        if (vidInfo.data != null) {
            container = document.createElement("a");
            container.href = "#bvid_" + vidInfo.data.history.bvid;
            container.innerHTML = `<div class="continuation_alertBox">
                    <img src="` + vidInfo.data.cover + `@240w_135h_1c.jpg">
                    <p class="continuation_alertBox_vt">` + vidInfo.data.title + `</p>
                    <p class="continuation_alertBox_un">🔘&nbsp;` + vidInfo.data.author_name + `</p>
                    <p align="right" style="font-size:10px;">（其他设备观看了该视频，4秒后关闭）</p>
                </div>`;
            document.body.appendChild(container);
            setTimeout(function () {
                $(container).fadeOut(700);
            }, 3500);
        }
    });
}

function routeCtrl(isOnload) {
    var data = window.location.hash.substring(1);
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
        getMsgReply();

    } else if (data.includes("options")) {
        /* 显示扩展选项对话框 */
        openDlg("扩展选项", "<iframe src='./options.html' class='options_frame'></iframe>", "#options")

    } else if (data.includes("export_subscription")) {
        /* 导出订阅（pipepipe格式 -options.js） */
        getAccount("auto", function (usrInfo) {
            alert("【将订阅导出到PipePipe】\n该功能将会获取您的订阅列表，并导出为PipePipe兼容格式。订阅列表的获取需要5s~20s的时间，转换完成后将通过浏览器下载保存。");
            saveSubscriptionForPipePipe(usrInfo.uid);
        });

    } else if (data[0] == "n") {
        /* 导航栏 */
        let tab = data.split("_")[1];
        if (tab == "home") { getRecommendedVideos(); } else if (tab == "hot") { getHotVideos(); } else if (tab == "subscriptions") { getSubscribedVideos(); } else if (tab == "space") { getMySpace(); } else if (tab == "search") { showSearchPage(); }
        currentTab = tab;

    } else {
        getRecommendedVideos();
    }

    if (isOnload == true && data[0] != "n") {
        getRecommendedVideos();
    }
}

$(document).ready(function () {
    document.referrer = "https://www.bilibili.com/";

    getAccount("auto", function (usrInfo) {
        /* 载入用户信息 */
        currentUid = usrInfo.uid;
        if (!usrInfo.uid) { showToast("您未登录，建议登录后使用") }
    });

    getVidPlayingNow();
    routeCtrl(isOnload = true);

    window.addEventListener('popstate', function (event) {
        routeCtrl();
    });
});

$("#RefreshBtn").click(function () {
    /* 刷新 */
    if (currentTab == "home") { getRecommendedVideos(); } else if (currentTab == "hot") { getHotVideos(); } else if (currentTab == "subscriptions") { getSubscribedVideos(); } else if (currentTab == "space") { getMySpace(); }
});
