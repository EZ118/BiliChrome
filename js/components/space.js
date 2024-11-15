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