class SpaceView {
    constructor(uid) {
        this.currentUid = uid || currentUid;
        this.isTop = false;

        $(document).on("click", ".common_dynamic_card, .common_video_card", (evt) => {
            if (this.isTop && ($(evt.currentTarget).find('a').attr("href").includes("bvid_") || $(evt.currentTarget.shadowRoot).find('a').attr("href").includes("bvid_"))) {
                modal.toast(`已加载，关闭对话框以查看`);
            }
        });
    }

    display(refresh) {
        $("#item_container").empty();

        getAccount("auto", (usrInfo) => {
            this.currentUid = usrInfo.uid;

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
                                <s-icon slot="start" src="./img/icon/dynamic.svg"></s-icon>
                            </s-icon-button>
                        </a>
                    </div>
                </s-card>
                

                <div class="flex_container">
                    <s-card class="myspace_subSection" type="outlined">
                        <div slot="headline">历史记录</div>
                        <a href="#history_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon name="arrow_forward"></s-icon></s-icon-button></a>
                    </s-card>
                    <s-card class="myspace_subSection" type="outlined">
                        <div slot="headline">收藏/动态/关注</div>
                        <a href="#uid_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon name="arrow_forward"></s-icon></s-icon-button></a>
                    </s-card>
                    <s-card class="myspace_subSection" type="outlined">
                        <div slot="headline">稍后再看</div>
                        <a href="#watchlater_${usrInfo.uid}"><s-icon-button slot="action" type="filled-tonal"><s-icon name="arrow_forward"></s-icon></s-icon-button></a>
                    </s-card>
                    <s-card class="myspace_subSection" type="outlined">
                        <div slot="headline">扩展选项</div>
                        <a href="#options"><s-icon-button slot="action" type="filled-tonal"><s-icon name="arrow_forward"></s-icon></s-icon-button></a>
                    </s-card>
                    <s-card class="myspace_subSection" type="outlined">
                        <div slot="headline">插件管理</div>
                        <a href="#plugins"><s-icon-button slot="action" type="filled-tonal"><s-icon name="arrow_forward"></s-icon></s-icon-button></a>
                    </s-card>
                </div>
                
                <center style="margin-top:calc(40vh - 120px); z-index:-1;">
                    <a href="https://github.com/EZ118/BiliChrome" style="color:#5050F0;" target="_blank">在 GitHub 中查看项目</a><br>
                    <font color="#888">关闭对话框 Ctrl+Q / 老板键 Ctrl+Shift+C</font>
                </center>
            `);
        });
    }

    getUserSpace(uid, isTop) {
        this.isTop = isTop;
        const toggleBtn = `<s-icon-button class="toggleDrawerButton"><s-icon name="menu"></s-icon></s-icon-button>`;
        modal.open(
            `<span title='UID: ${uid}'>用户空间</span>`, `
            <s-drawer class="item_container space_container">
                <s-menu slot="start" id="space_tab" style="margin:0;height:100vh;overflow:hidden auto;">
                    <div slot="label"></div>
                    <s-menu-item data-tab="dynamics">
                        <s-icon slot="start" src="./img/icon/dynamic.svg"></s-icon>
                        最近动态
                    </s-menu-item>
                    <s-menu-item data-tab="videos">
                        <s-icon slot="start" src="./img/cast.svg"></s-icon>
                        视频动态
                    </s-menu-item>
                    <s-menu-item data-tab="collections">
                        <s-icon slot="start" name="favorite"></s-icon>
                        收藏夹
                    </s-menu-item>
                    <s-menu-item data-tab="subscriptions">
                        <s-icon slot="start" src="./img/icon/user.svg"></s-icon>
                        关注列表
                    </s-menu-item>
                </s-menu>
                <s-scroll-view id="space_list"></s-scroll-view>
            </s-drawer>`,
            "https://space.bilibili.com/" + uid,
            isTop,
            true
        );

        $("#space_tab s-menu-item").click((evt) => {
            let currentTab = $(evt.currentTarget).data("tab");
            $("#dynamic_loader").show();
            switch (currentTab) {
                case "dynamics":
                    this.getDynamics(uid, (html) => {
                        $("#space_list").html(toggleBtn+html);
                        $("#dynamic_loader").hide();
                    });
                    break;
                case "videos":
                    this.getVideoDynamics(uid, (html) => {
                        $("#space_list").html(toggleBtn+html);
                        $("#dynamic_loader").hide();
                    });
                    break;
                case "collections":
                    this.getCollectionList(uid, (html) => {
                        $("#space_list").html(toggleBtn+html);
                        $("#dynamic_loader").hide();
                    });
                    break;

                case "subscriptions":
                    this.getSubscriptionList(uid, (html) => {
                        $("#space_list").html(toggleBtn+html);
                        $("#dynamic_loader").hide();
                    });
                    break;
                default:
                    break;
            }
        })

        
        $("#dynamic_loader").show();
        this.getUserCard(uid, (usrInfo) => {
            $("#space_tab div[slot='label']").html(usrInfo.html);
            $("#dynamic_loader").hide();
        });
        this.getDynamics(uid, (html) => {
            $("#space_list").html(toggleBtn+html);
        });
    }

    getUserCard(uid, callback) {
        // 获取用户简略信息卡片
        $.get("https://api.bilibili.com/x/web-interface/card?mid=" + uid, (usrInfo) => {
            const { mid, name, sex, face, sign, level_info, fans, attention } = usrInfo.data.card;

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

            const WebList = `<s-card class="common_user_card_slim" type="filled">
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

    getDynamics(uid, callback) {
        var WebList = "";
        $.get(`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=${uid}&features=itemOpusStyle,listOnlyfans,opusBigCover,onlyfansVote,decorationCard,onlyfansAssetsV2,forwardListHidden,ugcDelete`, (data) => {
            $.each(data.data.items, (index, item) => {
                var ImgUrl = "";
                var VidDesc = "";
                var LinkUrl = "default";
                var user = item.modules.module_author;
                var avatarUrl = user.face;
                var username = user.name;
                var mid = user.mid;
                var dynamicType = item.type;
                var card_json = item;

                if (dynamicType == 'DYNAMIC_TYPE_AV' && card_json.modules.module_dynamic.major) {
                    // 如果动态主要内容是视频
                    var video = card_json.modules.module_dynamic.major.archive;
                    VidDesc = video.title;
                    ImgUrl = `<img class="videopic" src="${video.cover}@530w_300h_1c.webp" loading="eager" />`;
                    LinkUrl = "bvid_" + video.bvid;
                } else if (dynamicType == 'DYNAMIC_TYPE_WORD' || dynamicType == 'DYNAMIC_TYPE_DRAW') {
                    // 如果动态主要内容是文字
                    VidDesc = card_json.modules.module_dynamic.major.opus.summary.text;
                    if (dynamicType == 'DYNAMIC_TYPE_DRAW') {
                        /* 如果动态内容含图片 */
                        $.each(card_json.modules.module_dynamic.major.opus.pics, (index, item) => {
                            ImgUrl += `<a href="#img-${encodeURI(item.url)}"><img class="dailypic" src="${item.url}@256w_256h_1e_1c_!web-dynamic.jpg" loading="eager" /></a>`;
                            if (index % 3 == 2) { ImgUrl += "<br>"; }
                        });
                    }

                    if (card_json.modules.module_dynamic.additional) {
                        const additionalCard = card_json.modules.module_dynamic.additional;
                        if (additionalCard.type == "ADDITIONAL_TYPE_UGC") {
                            ImgUrl += `<br><br>【引用视频】${additionalCard.ugc.title}<br><img class="videopic" src="${additionalCard.ugc.cover}@530w_300h_1c.webp" loading="eager" />`
                            LinkUrl = "aid_" + additionalCard.ugc.id_str;
                        }
                    }
                } else if (dynamicType == 'DYNAMIC_TYPE_FORWARD') {
                    // 如果是转发内容
                    VidDesc = card_json.modules.module_dynamic.desc?.text;

                    const additionalCard = card_json.orig;
                    if (additionalCard.type == "DYNAMIC_TYPE_ARTICLE") { ImgUrl += "<br><br>【转发专栏】<br>内容暂不支持" }
                    else if (additionalCard.type == "DYNAMIC_TYPE_AV") {
                        var video = additionalCard.modules.module_dynamic.major.archive;
                        VidDesc += `<br><br>【引用视频】<br>@${additionalCard.modules.module_author.name}: ${video.title}`;
                        ImgUrl = `<img class="videopic" src="${video.cover}@530w_300h_1c.webp" loading="eager" />`;
                        LinkUrl = "bvid_" + video.bvid;
                    }
                }
                console.log(dynamicType)

                if (!VidDesc) { VidDesc = ""; }
                if (!LinkUrl) { LinkUrl = "default"; }

                if (VidDesc == "" && LinkUrl == "default" && (ImgUrl == null || ImgUrl == "")) { } else {
                    VidDesc = VidDesc.split("\n").join("<br>");
                    WebList += `
                        <s-ripple class='common_dynamic_card' align='left'>
                            <div class="username">
                                <img class="userpic" src='${avatarUrl}@45w_45h_1c.webp' loading="eager" />
                                <span>&nbsp;${username}</span>
                            </div>
                            <a href='#${LinkUrl}'>
                                <div class='title'>${VidDesc}</div>
                                ${ImgUrl}
                            </a>
                        </s-ripple>`;
                }
            });
            callback(`<div class='flex_container' style='flex-direction:column; align-items:center;'>${WebList}</div>`)
        }).fail((err) => {
            callback(null);
        });
    }

    getVideoDynamics(uid, callback) {
        // 获取用户视频动态
        $.get(`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?offset=&host_mid=${uid}&timezone_offset=-480&platform=web&type=video`, (response) => {
            const vidList = response.data.items.map((item) => ({
                bvid: item.modules.module_dynamic.major.archive.bvid,
                aid: item.modules.module_dynamic.major.archive.aid,
                pic: item.modules.module_dynamic.major.archive.cover,
                title: item.modules.module_dynamic.major.archive.title,
                desc:
                    "- 时长: " +
                    item.modules.module_dynamic.major.archive.duration_text +
                    "\n- 点赞: " +
                    item.modules.module_stat.like.count +
                    (item.modules.module_dynamic.desc
                        ? "\n- 动态: " + item.modules.module_dynamic.desc.text
                        : "") +
                    "\n- 简介: " +
                    item.modules.module_dynamic.major.archive.desc,
                author: {
                    uid: item.modules.module_author.mid,
                    name: item.modules.module_author.name,
                },
            }));
            callback(`<div class='flex_container'>${card.video(vidList)}</div>`);
        }).fail((err) => {
            callback(null);
        });
    }

    getUserHistory() {
        // 获取用户播放历史
        $.get("https://api.bilibili.com/x/web-interface/history/cursor?ps=30&type=archive", (tjlist) => {
            var vidList = tjlist.data.list.map(item => ({
                bvid: item.history.bvid,
                aid: item.oid,
                pic: item.cover,
                title: item.title,
                desc: item.title,
                author: { uid: item.author_mid, name: item.author_name }
            }));
            modal.open("观看历史（近30条）", "<div class='flex_container'>" + card.video(vidList) + "</div>", "https://www.bilibili.com/account/history");
        });
    }

    getSubscriptionList(uid, callback) {
        // 获取用户订阅列表（UP主关注列表）
        var requests = [];
        var WebList = "";
        for (let i = 1; i <= 6; i++) {
            let request = $.get(`https://api.bilibili.com/x/relation/followings?vmid=${uid}&pn=${i}&ps=50&order=desc&order_type=attention`, (tjlist) => {
                if (tjlist.code != 0 && i == 1 || tjlist.data.list.length <= 0) { callback("&nbsp;用户隐藏了订阅列表"); return; }

                var usrList = tjlist.data.list.map(item => ({
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
        $.when.apply($, requests).done(() => {
            callback(`<div class='flex_container'>${WebList}</div>`);
        });
    }

    getCollectionList(uid, callback) {
        // 获取当前账号的收藏夹列表
        $.get(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${uid}&ps=999&pn=1`, (tjlist) => {
            if (tjlist.code != 0 || !tjlist.data || tjlist.data.list.length <= 0) { callback("&nbsp;用户隐藏了收藏列表"); return; }

            var WebList = "";
            $.each(tjlist.data.list, (index, item) => {
                WebList += `<a href="#fav_${item.id}_${item.media_count}">
                    <s-card clickable="true" class="common_video_card" type="outlined" style="min-width:160px;">
                        <div slot="subhead">${item.title} </div>
                        <div slot="text">[简介] ${item.intro ?? "暂无"} </div>
                    </s-card>
                </a>`;
            });
            callback(`<div class='flex_container'>${WebList}</div>`);
        }).fail((err) => {
            callback(null);
        });;
    }

    getCollectionById(fid, mediaCount) {
        // 按照ID获取收藏夹内容
        mediaCount = parseInt(mediaCount);
        $.get(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${fid}&ps=${(mediaCount)}&pn=1`, (tjlist) => {
            if (tjlist.code == -400) { modal.toast("该收藏夹未被公开，暂时无法查看"); return; }
            var vidList = tjlist.data.medias.map(item => ({
                bvid: item.bvid,
                aid: item.id,
                pic: item.cover,
                title: item.title,
                desc: item.intro,
                author: { uid: item.upper.mid, name: item.upper.name }
            }));
            modal.open(
                `收藏夹 [FID:${fid}]`,
                `<s-icon-button class='historyBackButton'><s-icon name='arrow_back'></s-icon></s-icon-button><div class='flex_container'>${card.video(vidList)}</div>`,
                `https://space.bilibili.com/${currentUid}/favlist?fid=${fid}&ftype=create`
            );
        });
    }

    getWatchLater() {
        // 获取稍后再看列表
        $.get("https://api.bilibili.com/x/v2/history/toview", (tjlist) => {
            if (tjlist.code == -400) { modal.toast("暂时无法查看"); return; }

            var vidList = tjlist.data.list.map(item => ({
                bvid: item.bvid,
                aid: item.aid,
                pic: item.pic,
                title: item.title,
                desc: item.desc,
                author: { uid: item.owner.mid, name: item.owner.name }
            }));
            modal.open("稍后再看", "<div class='flex_container'>" + card.video(vidList, true) + "</div>", "https://www.bilibili.com/watchlater/#/list");
        });
    }

    getVidPlayingNow() {
        // 获取其他设备正在播放的视频
        $.get(`https://api.bilibili.com/x/web-interface/history/continuation?his_exp=1200`, (vidInfo) => {
            if (vidInfo.data != null) {
                modal.notification(
                    vidInfo.data.title,
                    "其他设备正在播放的视频，点击继续观看",
                    "./img/cast.svg",
                    "继续浏览",
                    () => {
                        if (vidInfo.data.history.bvid) {
                            /* 视频 */
                            player.open({
                                bvid: vidInfo.data.history.bvid
                            });
                        } else if (vidInfo.data.history.business == "live") {
                            /* 直播间 */
                            live_player.open({
                                roomid: vidInfo.data.history.oid
                            });
                        }
                    }
                );
            }
        });
    }
}