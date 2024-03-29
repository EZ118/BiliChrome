var currentTab = "home";
var currentUid = "114514";

function ajaxGet(url, callback) {
    $.get(url, function (data, status) {
        if (status === "success") {
            callback(data);
        } else {
            callback("Error: " + status);
        }
    });
}

function getSearchResult(wd) {
    if (!wd) { return; }
    $("#item_container").html("");
    $("#dynamic_loader").show();
    ajaxGet("https://api.bilibili.com/x/web-interface/search/all/v2?keyword=" + encodeURI(wd), function (tjlist) {
        var WebList = "<p style='margin:0px 10px 0px 10px;font-size:16px;'><b>" + wd + "</b>的搜索结果：</p><br>";
        for (var i = 0; i < tjlist.data.result[11].data.length; i++) {
            let card = tjlist.data.result[11].data[i];
            WebList += `<div class='wide_singlebox'>
                            <a href="#bvid_` + card.bvid + `">
                                <img src='https:` + card.pic + `@412w_232h_1c.webp'><br>
                            </a>
                            <div height="100%">
                                <a href="#aid_` + card.aid + `">
                                    <div class="wide_singlebox_vt">` + card.title + `</div>
                                </a>
                                <a href="#uid_` + card.mid + `">
                                    <div class="wide_singlebox_un">🔘&nbsp;` + card.author + `</div>
                                </a>
                            </div>
                        </div>`;
        }
        $("#item_container").append(WebList);
        $("#dynamic_loader").hide();
    });
}

function getRecommendedVideos() {
    $("#item_container").html("");
    $("#dynamic_loader").show();
    for (let i = 1; i <= 2; i++) {
        ajaxGet("https://api.bilibili.com/x/web-interface/index/top/rcmd?fresh_type=3&version=1&ps=14", function (tjlist) {
            var WebList = "";
            for (var i = 0; i < tjlist.data.item.length; i++) {
                WebList += `<div class='dynamic_singlebox'>
                                <a href="#bvid_` + tjlist.data.item[i].bvid + `">
                                    <img src='` + tjlist.data.item[i].pic + `@412w_232h_1c.webp'><br>
                                    <div class="dynamic_singlebox_vt">` + tjlist.data.item[i].title + `</div>
                                </a>
                                <a href="#uid_` + tjlist.data.item[i].owner.mid + `">
                                    <div class="dynamic_singlebox_un">🔘&nbsp;` + tjlist.data.item[i].owner.name + `</div>
                                </a>
                            </div>`;
            }
            $("#item_container").append(WebList);
            $("#dynamic_loader").hide();
        });
    }
}

function getHotVideos() {
    $("#item_container").html("");
    $("#dynamic_loader").show();
    ajaxGet("https://api.bilibili.com/x/web-interface/popular?ps=40&pn=1", function (tjlist) {
        var WebList = "";
        for (var i = 0; i < tjlist.data.list.length; i++) {
            WebList += `<div class='wide_singlebox'>
                            <a href="#bvid_` + tjlist.data.list[i].bvid + `">
                                <img src='` + tjlist.data.list[i].pic + `@412w_232h_1c.webp'><br>
                            </a>
                            <div height="100%">
                                <a href="#bvid_` + tjlist.data.list[i].bvid + `">
                                    <div class="wide_singlebox_vt">` + tjlist.data.list[i].title + `</div>
                                </a>
                                <a href="#uid_` + tjlist.data.list[i].owner.mid + `">
                                    <div class="wide_singlebox_un">🔘&nbsp;` + tjlist.data.list[i].owner.name + `</div>
                                </a>
                            </div>
                        </div>`;
        }
        $("#item_container").append(WebList);
        $("#dynamic_loader").hide();
    });
}

function getSubscribedVideos() {
    $("#item_container").html("");
    $("#dynamic_loader").show();
    ajaxGet("https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?type_list=8,512,4097,4098,4099,4100,4101", function (tjlist) {
        var WebList = "";
        for (var i = 0; i < tjlist.data.cards.length; i++) {
            let card = JSON.parse(tjlist.data.cards[i].card);
            WebList += `<div class='wide_singlebox'>
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
        }
        $("#item_container").html(WebList);
        $("#dynamic_loader").hide();
    });
}

function getUserSpace(uid) {
    var WebList = "";
    ajaxGet("https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=" + uid, function (FeedJson) {
        for (var i = 0; i < FeedJson.data.cards.length; i++) {
            itm = FeedJson.data.cards[i];

            var ImgUrl = "";
            var VidDesc = "";
            var LinkUrl = "default";
            var card_json = JSON.parse(itm.card);
            try { VidDesc = card_json.item.content; } catch (e) { }
            try {
                VidDesc = card_json.title;
                if (card_json.pic) {
                    ImgUrl = '<img class="videopic" src="' + card_json.pic + '@240w_135h_1c.jpg" onerror="this.remove()">';
                }
                if (card_json.aid) { LinkUrl = "aid_" + card_json.aid; }

            } catch (e) { }

            try {
                if (card_json.item.pictures_count != null) {
                    VidDesc = card_json.item.description;
                    for (var j = 0; j < card_json.item.pictures.length; j++) {
                        d = card_json.item.pictures[j];
                        ImgUrl += `
                            <a href="#img-` + encodeURI(d.img_src) + `">
                                <img class="dailypic" src="` + d.img_src + `@256w_256h_1e_1c_!web-dynamic.jpg">
                            </a>`;
                        if (j % 3 == 2) { ImgUrl += "<br/>"; }
                    }
                }
            } catch (e) { }

            if (VidDesc == null) { VidDesc = ""; }
            if (LinkUrl == null) { LinkUrl = "default"; }

            if (VidDesc == "" && LinkUrl == "default" && (ImgUrl == null || ImgUrl == "")) { } else {
                VidDesc = VidDesc.split("\n").join("<br>")
                WebList += `
                    <div class='space_singlebox' align='left'>
                        <a>
                            <div class="space_singlebox_un">
                                <img class="userpic" src='` + itm.desc.user_profile.info.face + `'>
                                <label>&nbsp;` + itm.desc.user_profile.info.uname + `</label>
                            </div>
                        </a>
                        <a href='#` + LinkUrl + `'>
                            <div class='space_singlebox_vt'>` + VidDesc + `</div>
                            ` + ImgUrl + `
                        </a>
                </div>`;
            }
        }
        openDlg("用户空间 (" + uid + ")", WebList, "https://space.bilibili.com/" + uid);
    });
}

function getMySpace() {
    $("#item_container").html("");
    $("#dynamic_loader").show();
    ajaxGet("https://api.bilibili.com/x/space/v2/myinfo?", function (usrInfo) {
        var uid = usrInfo.data.profile.mid;
        currentUid = uid;
        var WebList = `
            <br>
            <table class="myspace_topInfoBox" cellpadding="0" cellspacing="0">
                <tr>
                    <td><img src="` + usrInfo.data.profile.face + `@256w_256h_1c.webp"></td>
                    <td width="10px"></td>
                    <td>
                        <b class="usrName">` + usrInfo.data.profile.name + `</b>&nbsp;&nbsp;<i>` + usrInfo.data.profile.sex + `</i><br>
                        LEVEL:&nbsp;<i>` + usrInfo.data.profile.level + `</i><br>
                        <i>` + usrInfo.data.profile.sign + `</i>
                    </td>
                    <td style="width: calc(98vw - 100px - 480px)"></td>
                    <td align="center">
                        <b class="usrNums">` + usrInfo.data.coins + `</b><br>
                        <i>硬币</i>
                    </td>
                    <td width="30px"></td>
                    <td align="center">
                        <b class="usrNums">` + usrInfo.data.follower + `</b><br>
                        <i>粉丝</i>
                    </td>
                </tr>
            </table>
            <br>
            <div style="width:100%;display:flex; flex-wrap: wrap;">
                <div class="myspace_dynamicSection">
                    <p align="left">我的收藏</p>
                    <p align="right"><a href="#myfav_` + uid + `">[查看]</a></p>
                </div>
                <div class="myspace_historySection">
                    <p align="left">历史记录</p>
                    <p align="right"><a href="#history_` + uid + `">[查看]</a></p>
                </div>
                <div class="myspace_dynamicSection">
                    <p align="left">最近动态</p>
                    <p align="right"><a href="#uid_` + uid + `">[查看]</a></p>
                </div>
                <div class="myspace_historySection">
                    <p align="left">稍后再看</p>
                    <p align="right"><a href="#watchlater_` + uid + `">[查看]</a></p>
                </div>
            </div>
			
			<center style="margin-top:calc(90vh - 330px); z-index: -1;">
				<a href="https://github.com/EZ118/BiliChrome" style="color:#5050F0;">前往Github查看项目</a><br>
				<font color="#888">提示：ctrl+Q可快速关闭视频等窗口</font>
			</center>
        `;
        $("#item_container").html(WebList);
        $("#dynamic_loader").hide();
    });
}

function getUserHistory() {
    ajaxGet("https://api.bilibili.com/x/web-interface/history/cursor?ps=30&type=archive", function (tjlist) {
        var WebList = "";
        for (var i = 0; i < tjlist.data.list.length; i++) {
            let item = tjlist.data.list[i];
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
        }
        openDlg("观看历史（近30条）", WebList, "https://www.bilibili.com/account/history");
    });
}

function getMyCollectionList() {
    ajaxGet("https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=" + currentUid + "&ps=999&pn=1", function (tjlist) {
        var WebList = "";
        for (var i = 0; i < tjlist.data.list.length; i++) {
            let item = tjlist.data.list[i];
            let favIntro = item.intro ?? "暂无简介";
            WebList += `<a href="#fav_` + item.id + `_` + item.media_count + `">
                    <div class='dynamic_singlebox' style='height:70px;'>
                        <div class="dynamic_singlebox_vt" style='height:55px'>
                            <i class='material-icons'>collections_bookmark_rounded</i><br/>
                            ` + item.title + `
                        </div>
                        <div class="dynamic_singlebox_un">*&nbsp;` + favIntro + `</div>
                    </div>
                </a>`;
        }
        openDlg("所有收藏夹", WebList, "https://space.bilibili.com/" + currentUid + "/favlist");
    });
}

function getCollectionById(fid, mediaCount) {
    mediaCount = parseInt(mediaCount);
    ajaxGet("https://api.bilibili.com/x/v3/fav/resource/list?media_id=" + fid + "&ps=" + (mediaCount) + "&pn=1", function (tjlist) {
        if (tjlist.code == -400) { showToast("该收藏夹未被公开，暂时无法查看"); return; }
        var WebList = "<a href='#myfav'>&nbsp;<i class='material-icons'>arrow_back_rounded</i></a><br>";
        for (var i = 0; i < tjlist.data.medias.length; i++) {
            let item = tjlist.data.medias[i];
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
        }
        openDlg("收藏夹 [FID:" + fid + "]", WebList, "https://space.bilibili.com/" + currentUid + "/favlist?fid=" + fid + "&ftype=create");
    });
}

function getWatchLater() {
    ajaxGet("https://api.bilibili.com/x/v2/history/toview", function (tjlist) {
        if (tjlist.code == -400) { showToast("该收藏夹未被公开，暂时无法查看"); return; }
        var WebList = "";
        for (var i = 0; i < tjlist.data.list.length; i++) {
            let item = tjlist.data.list[i];
            WebList += `<div class='dynamic_singlebox'>
                        <a href="#bvid_` + item.bvid + `">
                            <img src='` + item.pic + `@412w_232h_1c.webp'><br>
                            <div class="dynamic_singlebox_vt">` + item.title + `</div>
                        </a>
                        <a href="#uid_` + item.owner.mid + `">
                            <div class="dynamic_singlebox_un">🔘&nbsp;` + item.owner.name + `</div>
                        </a>
                    </div>
                `;
        }
        openDlg("稍后再看", WebList, "https://www.bilibili.com/watchlater/#/list");
    });
}

function getVidPlayingNow() {
    ajaxGet("https://api.bilibili.com/x/web-interface/history/continuation?his_exp=1200", function (vidInfo) {
        if (vidInfo.data != null) {
            container = document.createElement("a");
            container.href = "#bvid_" + vidInfo.data.history.bvid;
            container.innerHTML = `<div class="continuation_alertBox">
                    <img src="` + vidInfo.data.cover + `@240w_135h_1c.jpg">
                    <b>` + vidInfo.data.title + `</b><br>
                    <p>🔘&nbsp;` + vidInfo.data.author_name + `</p>
                    <i>（4秒后自动关闭）</i>
                </div>`;
            document.body.appendChild(container);
            setTimeout(function () {
                $(container).fadeOut(700);
            }, 3500);
        }
    });
}

function routeCtrl() {
    var baseUrl = window.location.href + "#";
    var data = baseUrl.split("#")[1];
    if (data[0] == "b" || data[0] == "a") {
        openPlayer(data.split("_")[1]);
    } else if (data[0] == "u") {
        getUserSpace(data.split("_")[1]);
    } else if (data[0] == "i") {
        openDlg("浏览图片", `<img src="` + data.split("-")[1] + `" width="100%">`, data.split("-")[1])
    } else if (data.includes("myfav")) {
        getMyCollectionList();
    } else if (data[0] == "f") {
        getCollectionById(data.split("_")[1], data.split("_")[2]);
    } else if (data.includes("history")) {
        getUserHistory();
    } else if (data.includes("watchlater")) {
        getWatchLater();
    } else if (data[0] == "n") {
        let tab = data.split("_")[1];
        if (tab == "home") { getRecommendedVideos(); } else if (tab == "hot") { getHotVideos(); } else if (tab == "subscriptions") { getSubscribedVideos(); } else if (tab == "space") { getMySpace(); } else if (tab == "search") { getSearchResult(prompt("[搜索] 输入关键字搜索")); }
        currentTab = tab;
    }
}

window.onload = function () {
    document.referrer = "https://www.bilibili.com/";
    getRecommendedVideos();
    getVidPlayingNow();
    routeCtrl();

    window.addEventListener('popstate', function (event) {
        routeCtrl();
    });
}

$("#RefreshBtn").click(function () {
    if (currentTab == "home") { getRecommendedVideos(); } else if (currentTab == "hot") { getHotVideos(); } else if (currentTab == "subscriptions") { getSubscribedVideos(); } else if (currentTab == "space") { getMySpace(); }
});
