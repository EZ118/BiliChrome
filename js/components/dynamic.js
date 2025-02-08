async function showSubscribedVideosAll() {
    $(".dialog_content").empty();
    $("#dynamic_loader").show();

    var WebList = "<div class='flex_container'>";

    for (let i = 1; i <= 3; i++) {
        // 构建请求的 URL，包含当前的 offset
        const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=-480&offset=${lastDynamicOffset || ""}&type=video&platform=web&page=${i}`;

        try {
            // 等待请求完成并获取数据
            let response = await $.get(url);
            let tjlist = response;

            vidList = tjlist.data.items.map(item => ({
                bvid: item.modules.module_dynamic.major.archive.bvid,
                aid: item.modules.module_dynamic.major.archive.aid,
                pic: item.modules.module_dynamic.major.archive.cover,
                title: item.modules.module_dynamic.major.archive.title,
                desc: (item.modules.module_dynamic.desc ? ("动态内容: " + item.modules.module_dynamic.desc.text + "\n") : "") + '点赞数量: ' + item.modules.module_stat.like.count + '\n视频简介: ' + item.modules.module_dynamic.major.archive.desc,
                author: { uid: item.modules.module_author.mid, name: item.modules.module_author.name }
            }));
            WebList += card.video(vidList);

            // 更新 lastDynamicOffset
            lastDynamicOffset = tjlist.data.offset;
        } catch (error) {
            console.error("[ERROR] 近期关注UP视频动态获取失败", error);
            break; // 如果请求失败，则退出循环
        }
    }

    // 所有请求完成后更新页面内容
    $(".dialog_content").html(WebList + "</div>");
    $("#dynamic_loader").hide();
}

function showSubscribedVideosSingle(upUid) {
    $(".dialog_content").empty();
    $("#dynamic_loader").show();

    $.get(`https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?offset=&host_mid=${upUid}&timezone_offset=-480&platform=web&type=video`, function (dynamicList) {
        vidList = dynamicList.data.items.map(item => ({
            bvid: item.modules.module_dynamic.major.archive.bvid,
            aid: item.modules.module_dynamic.major.archive.aid,
            pic: item.modules.module_dynamic.major.archive.cover,
            title: item.modules.module_dynamic.major.archive.title,
            desc: (item.modules.module_dynamic.desc ? ("动态内容: " + item.modules.module_dynamic.desc.text + "\n") : "") + '点赞数量: ' + item.modules.module_stat.like.count + '\n视频简介: ' + item.modules.module_dynamic.major.archive.desc,
            author: { uid: item.modules.module_author.mid, name: item.modules.module_author.name }
        }));
        
        $(".dialog_content").html("<div class='flex_container'>" + card.video(vidList) + "</div>");
        $("#dynamic_loader").hide();
    });
}

function showSubscribedUps() {
    /* 获取聊天列表 */
    $(".dynamic_list").html(`
        <s-card class="dynamic_listItem" type="outlined" clickable="true" uid="all_dynamic">
            <svg viewBox="0 0 48 48" fill="#dff6fd" xmlns="http://www.w3.org/2000/svg" stroke="#2dbcef" stroke-width="4" class="avatar">
                <rect width="100%" height="100%" fill="#dff6fd" stroke="#dff6fd"/>
                <path d="M24 23.9917L23.9707 13.9958L23.9415 4L12 14V24L24 23.9917Z" />
                <path d="M24.0083 24L34.0042 23.9707L44 23.9415L34 12L24 12L24.0083 24Z"/>
                <path d="M24 24.0083L24.0293 34.0042L24.0585 44L36 34V24L24 24.0083Z" />
                <path d="M23.9917 24L13.9958 24.0293L4 24.0585L14 36L24 36L23.9917 24Z" />
            </svg>
            <span class="title">全部动态</span>
        </s-card>`);

    $.get("https://api.bilibili.com/x/polymer/web-dynamic/v1/portal?up_list_more=0  ", function (upInfo) {
        $.each(upInfo.data.up_list, function (index, item) {
            $(".dynamic_list").append(`
                <s-card class="dynamic_listItem" type="outlined" clickable="true" uid="${item.mid}">
                    <img class="avatar" src="${item.face}@42w_42h_1c.webp" loading="lazy" />
                    <span class="title">${item.uname}</span>
                    ${item.has_update ? "<s-badge class='badge'></s-badge>" : ""}
                </s-card>
            `);
        });


        $(".dynamic_list").append(`<a href="#mysubscription"><s-button type="text"><s-icon slot="start" type="more_horiz"></s-icon>查看所有</s-button></a><br/><br/>`);
    });
}


function dynamicInit(refresh) {
    $("#item_container").html(`
        <s-drawer id="dynamic_container">
            <s-scroll-view slot="start" class="dynamic_list">
            </s-scroll-view>
            <div class="dialog">
                <div class="dialog_titlebar">
                    <s-icon-button class="dynamic_showListBtn"><s-icon type="menu"></s-icon></s-icon-button>
                    <span class="dialog_title">全部动态</span>
                </div>
                <s-scroll-view class="dialog_content">
                </s-scroll-view>
            </div>
        </s-drawer>
    `);
    $("#dynamic_loader").hide();

    showSubscribedUps();
    showSubscribedVideosAll();

    // 已阅（不知道管不管用）
    $.get("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/nav", (a) => {});
}

$(document).ready(() => {
    /* 列表伸缩按钮 */
    $(document).on("click", ".dynamic_showListBtn", function () {
        document.querySelector('#dynamic_container').toggle();
    });

    /* 私聊用户卡片点击操作 */
    $(document).on("click", ".dynamic_listItem", function (event) {
        let upUid = $(this).attr("uid");
        if (upUid == "all_dynamic") {
            showSubscribedVideosAll();
        } else {
            showSubscribedVideosSingle(upUid);
        }

        $(".dialog_title").text($(this).text());
    });
})