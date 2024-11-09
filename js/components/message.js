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

function messageInit(mode) {
    $("#item_container").html(`
        <div class="tabbar">
            <s-chip type="filled-tonal" class="tab" tab-data="reply">回复我的</s-chip>
            <s-chip type="" class="tab" tab-data="chat">私聊</s-chip>
            <s-chip type="" class="tab" tab-data="atme">@我的</s-chip>
            <s-chip type="" class="tab" tab-data="likes">收到的赞</s-chip>
        </div>
        <div class="tab_container">
            <br><br>
            <b>此页还在施工...</b>
        </div>
    `);
    $("#dynamic_loader").hide();

    $(document).off("click", ".tab").on("click", ".tab", function() {
        // 移除所有 tab 的 type 属性
        $(".tab").attr("type", "");
        
        // 为当前点击的 tab 设置 type="filled-tonal"
        $(this).attr("type", "filled-tonal");
        
        // 获取 tab-data 值并调用对应函数
        const tabData = $(this).attr("tab-data");
        if (tabData === "reply") {
            // 回复我的
            showMsgReply();
        } else if (tabData === "atme") {
            // @我的
        } else if (tabData === "likes") {
            // 收到的赞
        } else if (tabData === "chat") {
            // 私聊
        }

        home_tab_last_tab = tabData;
    });
}