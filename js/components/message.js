function showMsgReply() {
    $.get("https://api.bilibili.com/x/msgfeed/reply?platform=web&build=0&mobi_app=web&ps=40", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.items, function (index, item) {
            WebList += `<s-ripple class='thinstrip_msgBox'>
                <a href="#uid_${item.user.mid}">
                    <div class='thinstrip_msgBox_headline'>
                        <img src='${item.user.avatar}@45w_45h_1c.webp' loading="lazy" />
                        <span class='thinstrip_msgBox_username'>${item.user.nickname}</span>
                    </div>
                </a>
                <a href="#aid_${item.item.subject_id}">
                    <div class='thinstrip_msgBox_contentline'>
                        <p class='quote'>回复&nbsp;“${item.item.root_reply_content}”</p>
                        <pre class='content'>${item.item.source_content}</pre>
                    </div>
                </a>
            </s-ripple>`;
        });
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>";
        modal.open("回复我的", WebList, "https://message.bilibili.com/#/reply");
    });
}

function showAtMe() {
    $.get("https://api.bilibili.com/x/msgfeed/at?build=0&mobi_app=web", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.items, function (index, item) {
            WebList += `<s-ripple class='thinstrip_msgBox'>
                <div class='thinstrip_msgBox_headline'>
                    <a href="#uid_${item.user.mid}">
                        <img src='${item.user.avatar}@45w_45h_1c.webp' title='${item.user.nickname}' loading="lazy" />
                    </a>
                    <span class='thinstrip_msgBox_username'>在${item.item.business}中@了你</span>
                </div>
                <a href="#aid_${item.item.subject_id}">
                    <div class='thinstrip_msgBox_contentline'>
                        <pre class='content'>${item.item.source_content}</pre>
                        <pre class='quote'>${item.item.title}<br><br>${item.item.image ? "<img src='" + item.item.image + "@412w_232h_1c.webp' style='height:60px;border-radius:6px;'>" : ""}</pre>
                    </div>
                </a>
            </s-ripple>`;
        });
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>";
        modal.open("@我的", WebList, "https://message.bilibili.com/#/at");
    });
}

/* 获取最近点赞 */
function showRecentLikes() {
    $.get("https://api.bilibili.com/x/msgfeed/like?platform=web&build=0&mobi_app=web", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.total.items, function (index, item) {
            //列举点赞者头像
            let UserList = "";
            $.each(item.users, function (ind, user) {
                UserList += `<a href="#uid_${user.mid}">
                        <img src='${user.avatar}@45w_45h_1c.webp' title='${user.nickname}' loading="lazy" />
                    </a>`;
            });

            let itemId = item.item.uri.split("/")[4];

            WebList += `<s-ripple class='thinstrip_msgBox'>
                <div class='thinstrip_msgBox_headline'>
                    ${UserList}
                    <span class='thinstrip_msgBox_username'>点赞了你的${item.item.business}</span>
                </div>
                <a href="#bvid_${itemId}">
                    <div class='thinstrip_msgBox_contentline'>
                        <pre class='quote'>${item.item.title}</pre>
                        <pre class='time'>${item.item.desc}</pre>
                    </div>
                </a>
            </s-ripple>`;
        });
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>";
        modal.open("收到的赞", WebList, "https://message.bilibili.com/#/system");
    });
}

/* 获取系统通知 */
function showSysMsg() {
    $.get("https://message.bilibili.com/x/sys-msg/query_user_notify?page_size=20&build=0&mobi_app=web", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.system_notify_list, function (index, item) {
            WebList += `<s-ripple class='thinstrip_msgBox'>
                <div class='thinstrip_msgBox_headline'>
                    <span class='thinstrip_msgBox_username'>${item.title}</span>
                </div>
                <div class='thinstrip_msgBox_contentline'>
                    <pre class='content'>${item.content}</pre>
                    <pre class='time'>${item.time_at}</pre>
                </div>
            </s-ripple>`;
        });
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>";
        modal.open("系统通知", WebList, "https://message.bilibili.com/#/system");
    });
}

/* 获取未读消息数量（通知角标） */
function getMsgUnread(callback) {
    $.get("https://api.bilibili.com/x/msgfeed/unread", function (msgInfo) {
        callback(msgInfo.data);
    })
}


/* 私聊 */
function showMsgSessionDetail(uid) {
    /* 获取聊天信息 */
    $.get("https://api.vc.bilibili.com/svr_sync/v1/svr_sync/fetch_session_msgs?talker_id=" + uid + "&session_type=1&size=60", function (msgInfo) {
        $(".dialog_content").html("");

        var WebList = "";
        $.each(msgInfo.data.messages, function (index, item) {
            let msgCard = JSON.parse(item.content);
            let msgContent = msgCard.content || ("<a href='#aid_" + msgCard.id + "'>【视频】 " + msgCard.title + "</a>");
            if(item.sender_uid == currentUid) {
                WebList = `<div class="dialog_msgBubble_me">${msgContent}</div>` + WebList;
            } else {
                WebList = `<div class="dialog_msgBubble">${msgContent}</div>` + WebList;
            }
        });
        $(".dialog_content").html(WebList + "<font size=1 color=gray>&nbsp;没有最新的咯~</font>");
        $('.dialog_content').scrollTop($('.dialog_content').prop("scrollHeight"));
    });
}

function getUsersInfo(uids, callback) {
    /* 通过Uid列表，集中获取多个用户的简单信息 */
    var uidstr = "";
    $.each(uids, (index, item) => uidstr += item + ",");
    $.get("https://api.bilibili.com/x/polymer/pc-electron/v1/user/cards?uids=" + uidstr.slice(0, -1) + "&mobi_app=web", function (sessionInfo) {
        callback(sessionInfo.data);
    });
}

function showMsgSessions() {
    /* 获取聊天列表 */
    $.get("https://api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions?session_type=1&group_fold=1&unfollow_fold=0&sort_rule=2&mobi_app=web", function (sessionInfo) {
        var uidList = [];
        $.each(sessionInfo.data.session_list, function (index, item) {
            uidList.push(item.talker_id);
        });
        getUsersInfo(uidList, function (userInfo) {
            $.each(sessionInfo.data.session_list, function (index, item) {
                if (!userInfo[item.talker_id]) { return; }
                $(".chat_list").append(`
                    <s-card class="chat_listItem" type="outlined" clickable="true" talker-uid="${item.talker_id}">
                        <img class="avatar" src="${userInfo[item.talker_id].face}@42w_42h_1c.webp" loading="lazy" />
                        <span class="title">${userInfo[item.talker_id].name}</span>
                    </s-card>
                `)
            })
        })

    });
}


function messageInit(refresh) {
    $("#item_container").html(`
        <div class="tabbar">
            <s-chip type="" class="tab" tab-data="reply">回复我的</s-chip>
            <s-chip type="" class="tab" tab-data="atme">@我的</s-chip>
            <s-chip type="" class="tab" tab-data="likes">收到的赞</s-chip>
            <s-chip type="" class="tab" tab-data="system">系统通知</s-chip>
        </div>
        <s-drawer id="chat_container">
            <s-scroll-view slot="start" class="chat_list">
                <!-- 最近消息 -->
            </s-scroll-view>
            <div class="dialog">
                <div class="dialog_titlebar">
                    <s-icon-button class="chat_showListBtn"><s-icon name="menu"></s-icon></s-icon-button>
                    <span class="dialog_title">点击左侧列表项查看对话历史</span>
                </div>
                <s-scroll-view class="dialog_content">
                </s-scroll-view>
            </div>
        </s-drawer>
    `);
    $("#dynamic_loader").hide();

    // 为对应的图标添加badge
    getMsgUnread(function (data) {
        if (data.reply > 0) { $(".tab[tab-data='reply']").append(`<s-badge slot="start">${data.reply}</s-badge>`); }
        if (data.like > 0) { $(".tab[tab-data='likes']").append(`<s-badge slot="start">${data.like}</s-badge>`); }
        if (data.at > 0) { $(".tab[tab-data='atme']").append(`<s-badge slot="start">${data.at}</s-badge>`); }
        if (data.sys_msg > 0) { $(".tab[tab-data='system']").append(`<s-badge slot="start">${data.sys_msg}</s-badge>`); }
    });

    showMsgSessions();

    $(document).off("click", ".tab").on("click", ".tab", function () {
        // 获取 tab-data 值并调用对应函数
        const tabData = $(this).attr("tab-data");
        if (tabData === "reply") {
            // 回复我的
            showMsgReply();
        } else if (tabData === "atme") {
            // @我的
            showAtMe();
        } else if (tabData === "likes") {
            // 收到的赞
            showRecentLikes();
        } else if (tabData === "system") {
            // 系统通知
            showSysMsg();
        }

        home_tab_last_tab = tabData;
    });
}

$(document).ready(() => {
    /* 列表伸缩按钮 */
    $(document).on("click", ".chat_showListBtn", function () {
        document.querySelector('#chat_container').toggle();
    });

    /* 私聊用户卡片点击操作 */
    $(document).on("click", ".chat_listItem", function (event) {
        let talkerUid = $(this).attr("talker-uid");
        showMsgSessionDetail(talkerUid);

        $(".dialog_title").text($(this).text());
    });
})