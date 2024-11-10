
function uri2bvid(uri){
    return uri.split("?")[0].split("/").slice(-1)[0];
}

function showMsgReply() {
    $.get("https://api.bilibili.com/x/msgfeed/reply?platform=web&build=0&mobi_app=web&ps=40", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.items, function (index, item) {
            WebList += `<s-ripple class='thinstrip_msgBox'>
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
            </s-ripple>`;
        });
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>"
        openDlg("评论回复", WebList, "https://message.bilibili.com/#/reply");
    });
}

function showAtMe() {
    $.get("https://api.bilibili.com/x/msgfeed/at?build=0&mobi_app=web", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.items, function (index, item) {
            WebList += `<s-ripple class='thinstrip_msgBox'>
                <div class='thinstrip_msgBox_headline'>
                    <a href="#uid_${item.user.mid}">
                        <img src='${item.user.avatar}@45w_45h_1c.webp' title='${item.user.nickname}'>
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
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>"
        openDlg("@我的", WebList, "https://message.bilibili.com/#/at");
    });
}

function showRecentLikes() {
    $.get("https://api.bilibili.com/x/msgfeed/like?platform=web&build=0&mobi_app=web", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.total.items, function (index, item) {
            //列举点赞者头像
            let UserList = "";
            $.each(item.users, function (ind, user){
                UserList += `<a href="#uid_${user.mid}">
                        <img src='${user.avatar}@45w_45h_1c.webp' title='${user.nickname}'>
                    </a>`;
            });

            WebList += `<s-ripple class='thinstrip_msgBox'>
                <div class='thinstrip_msgBox_headline'>
                    ${UserList}
                    <span class='thinstrip_msgBox_username'>点赞了你的${item.item.business}</span>
                </div>
                <a href="#aid_${item.item.item_id}">
                    <div class='thinstrip_msgBox_contentline'>
                        <pre class='quote'>${item.item.title}</pre>
                        <pre class='time'>${item.item.desc}</pre>
                    </div>
                </a>
            </s-ripple>`;
        });
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>"
        openDlg("最近收到的赞", WebList, "https://message.bilibili.com/#/system");
    });
}
function showSysMsg() {
    //$.get("https://message.bilibili.com/x/sys-msg/query_unified_notify?page_size=30&build=0&mobi_app=web", function (msgInfo) {
    $.get("https://message.bilibili.com/x/sys-msg/query_user_notify?page_size=30&build=0&mobi_app=web", function (msgInfo) {
        var WebList = "";
        $.each(msgInfo.data.system_notify_list, function (index, item) {
            WebList += `<s-ripple class='thinstrip_msgBox'>
                <div class='thinstrip_msgBox_headline'>
                    <span class='thinstrip_msgBox_username'>` + item.title + `</span>
                </div>
                <div class='thinstrip_msgBox_contentline'>
                    <pre class='content'>` + item.content + `</pre>
                    <pre class='time'>` + item.time_at + `</pre>
                </div>
            </s-ripple>`;
        });
        WebList += "<p align='center'>点击“在新标签页打开”以查看更多</p>"
        openDlg("系统通知", WebList, "https://message.bilibili.com/#/system");
    });
}

function getMsgUnread(callback){
    $.get("https://api.bilibili.com/x/msgfeed/unread", function (msgInfo) {
        callback(msgInfo.data);
    })
}

function messageInit(mode) {
    $("#item_container").html(`
        <div class="tabbar">
            <s-chip type="" class="tab" tab-data="reply">回复我的</s-chip>
            <s-chip type="" class="tab" tab-data="atme">@我的</s-chip>
            <s-chip type="" class="tab" tab-data="likes">收到的赞</s-chip>
            <s-chip type="" class="tab" tab-data="system">系统通知</s-chip>
        </div>
        <div class="tab_container">
            <hr><br>
            <i style="opacity:0.8;">此页仍在开发中...<br>(此处显示私聊)</i>
        </div>
    `);
    $("#dynamic_loader").hide();

    // 为对应的图标添加badge
    getMsgUnread(function(data){
        if(data.reply > 0){
            $(".tab[tab-data='reply']").append(`<s-badge slot="start">${data.reply}</s-badge>`);
        }
        if(data.like > 0){
            $(".tab[tab-data='likes']").append(`<s-badge slot="start">${data.like}</s-badge>`);
        }
        if(data.at > 0){
            $(".tab[tab-data='atme']").append(`<s-badge slot="start">${data.at}</s-badge>`);
        }
        if(data.sys_msg > 0){
            $(".tab[tab-data='system']").append(`<s-badge slot="start">${data.sys_msg}</s-badge>`);
        }
    })

    $(document).off("click", ".tab").on("click", ".tab", function() {
        // // 移除所有 tab 的 type 属性
        // $(".tab").attr("type", "");
        
        // // 为当前点击的 tab 设置 type="filled-tonal"
        // $(this).attr("type", "filled-tonal");
        
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