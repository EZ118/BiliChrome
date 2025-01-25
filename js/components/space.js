
var currentUid = "114514";

function getUserCard(uid, callback) {
    $.get("https://api.bilibili.com/x/web-interface/card?mid=" + uid, function (usrInfo) {
        const {mid, name, sex, face, sign, level_info, fans, attention } = usrInfo.data.card;

        const newData = {
            uid: mid,
            name: name,
            sex: sex,
            face: face,
            sign: sign,
            level: level_info.current_level,
            fans: fans,
            subscribe_sum: attention
        }

        const WebList = `<s-card class="common_user_card_slim" type="outlined">
                <img src="${newData.face}@48w_48h_1c.webp" class="avatar" />
                <div class="right">
                    <span class="name">
                        ${newData.name}
                        <span class="level">LV${newData.level}</span>
                        <span class="level">粉丝：${newData.fans}</span>
                    </span>
                    <span class="sign">${newData.sign}</span>
                </div>
            </s-card>`;
        callback({
            data: newData,
            html: WebList
        });
    });
}

function getUserSpace(uid, isTop) {
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
                ImgUrl = '<img class="videopic" src="' + video.cover + '@530w_300h_1c.webp" onerror="this.remove()" loading="lazy" />';
                LinkUrl = "bvid_" + video.bvid;
            } else if (dynamicType === 'DYNAMIC_TYPE_WORD' || dynamicType === 'DYNAMIC_TYPE_DRAW') {
                /* 如果动态内容是文字 */
                VidDesc = card_json.modules.module_dynamic.desc.text;
                if (dynamicType === 'DYNAMIC_TYPE_DRAW' && card_json.modules.module_dynamic.major) {
                    /* 如果动态内容含图片 */
                    $.each(card_json.modules.module_dynamic.major.draw.items, function (index, item) {
                        ImgUrl += `<a href="#img-${encodeURI(item.src)}"><img class="dailypic" src="${item.src}@256w_256h_1e_1c_!web-dynamic.jpg" loading="lazy" /></a>`;
                        if(index % 3 == 2) {
                            ImgUrl += "<br>";
                        }
                    });
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

        getUserCard(uid, function (usrInfo) {
            WebList = "<div class='flex_container' style='flex-direction:column; align-items:center;'>" + usrInfo.html + WebList + "</div>";
            openDlg("用户动态 [UID:" + uid + "]", WebList, "https://space.bilibili.com/" + uid, isTop);
        });
    }).fail(function () {
        console.log("Error fetching data.");
        showToast("用户空间加载失败")
    });
}

function getUserHistory() {
    $.get("https://api.bilibili.com/x/web-interface/history/cursor?ps=30&type=archive", function (tjlist) {
        vidList = tjlist.data.list.map(item => ({
            bvid: item.history.bvid,
            aid: item.oid,
            pic: item.cover,
            title: item.title,
            desc: item.title,
            author: { uid: item.author_mid, name: item.author_name }
        }));
        openDlg("观看历史（近30条）", "<div class='flex_container'>" + card.video(vidList) + "</div>", "https://www.bilibili.com/account/history");
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
            usrList = tjlist.data.list.map(item => ({
                uid: item.mid,
                name: item.uname,
                pic: item.face,
                desc: item.sign,
                sign: item.sign
            }));
            WebList += card.user(usrList);
        });
        requests.push(request);
    }
    $.when.apply($, requests).done(function () {
        setTimeout(function () {
            $("#item_container").html("<div class='search_titlebar'><s-icon-button class='subscription_backBtn' title='返回'><s-icon type='arrow_back'></s-icon></s-icon-button><span class='search_title'>关注列表</span></div><div class='flex_container'>" + WebList + "</div>");
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
        vidList = tjlist.data.medias.map(item => ({
            bvid: item.bvid,
            aid: item.id,
            pic: item.cover,
            title: item.title,
            desc: item.intro,
            author: { uid: item.upper.mid, name: item.upper.name }
        }));
        openDlg(
            "收藏夹 [FID:" + fid + "]",
            "<a href='#myfav'><s-icon-button><s-icon type='arrow_back'></s-icon></s-icon-button></a><div class='flex_container'>" + card.video(vidList) + "</div>",
            "https://space.bilibili.com/" + currentUid + "/favlist?fid=" + fid + "&ftype=create"
        );
    });
}

function getWatchLater() {
    $.get("https://api.bilibili.com/x/v2/history/toview", function (tjlist) {
        if (tjlist.code == -400) { showToast("暂时无法查看"); return; }

        vidList = tjlist.data.list.map(item => ({
            bvid: item.bvid,
            aid: item.aid,
            pic: item.pic,
            title: item.title,
            desc: item.desc,
            author: { uid: item.owner.mid, name: item.owner.name }
        }));
        openDlg("稍后再看", "<div class='flex_container'>" + card.video(vidList) + "</div>", "https://www.bilibili.com/watchlater/#/list");
    });
}

function spaceInit(refresh) {
    $("#item_container").html("");
    getAccount("auto", function (usrInfo) {
        currentUid = usrInfo.uid;

        $("#item_container").html(`
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
                    <div slot="headline">扩展选项</div>
                    <a href="#options"><s-icon-button slot="action" type="filled-tonal"><s-icon type="arrow_forward"></s-icon></s-icon-button></a>
                </s-card>
            </div>
            
            <center style="margin-top:calc(40vh - 120px); z-index: -1;">
                <a href="https://github.com/EZ118/BiliChrome" style="color:#5050F0;" target="_blank">前往Github查看项目</a><br>
                <font color="#888">提示：Ctrl+Q可快速关闭视频等窗口</font>
            </center>
        `);
    });
}

$(document).ready(function () {
    $(document).on("click", ".subscription_backBtn", function () {
        if(currentTab == "space") {
            spaceInit();
        } else if (currentTab == "subscriptions") {
            dynamicInit();
        } else {
            homeInit();
        }
    });
});