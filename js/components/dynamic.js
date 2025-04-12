class DynamicView {
    constructor() {
        // 初始化
        this.lastDynamicOffset = null; // 用于存储动态分页偏移量
		
        
        $(document).on("click", ".dynamic_showListBtn", () => {
            document.querySelector('#dynamic_container').toggle();
        });

        $(document).on("click", ".dynamic_listItem", (event) => {
            const upUid = $(event.currentTarget).attr("uid");
            if (upUid === "all_dynamic") {
                this.getAllDynamics();
            } else {
                this.getUserDynamics(upUid);
            }

            $(".dialog_title").text($(event.currentTarget).find(".title").text());
        });
    }

    display() {
        // 显示界面
        $("#item_container").html(`
            <s-drawer id="dynamic_container">
                <s-scroll-view slot="start" class="dynamic_list">
                </s-scroll-view>
                <div class="dialog">
                    <div class="dialog_titlebar">
                        <s-icon-button class="dynamic_showListBtn"><s-icon name="menu"></s-icon></s-icon-button>
                        <span class="dialog_title">全部动态</span>
                    </div>
                    <s-scroll-view class="dialog_content">
                    </s-scroll-view>
                </div>
            </s-drawer>
        `);

        $("#dynamic_loader").hide();

        this.getFollowList(); // 获取关注UP主列表
        this.getAllDynamics(); // 获取全部动态
    }

    async getFollowList() {
        // UP主列表
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
            </s-card>
        `);

        try {
            const response = await $.get("https://api.bilibili.com/x/polymer/web-dynamic/v1/portal?up_list_more=0");
            response.data.up_list.forEach(item => {
                $(".dynamic_list").append(`
                    <s-card class="dynamic_listItem" type="outlined" clickable="true" uid="${item.mid}">
                        <img class="avatar" src="${item.face}@42w_42h_1c.webp" loading="eager" />
                        <span class="title">${item.uname}</span>
                        ${item.has_update ? "<s-badge class='badge'></s-badge>" : ""}
                    </s-card>
                `);
            });

            $(".dynamic_list").append(`<a href="#mysubscription"><s-button type="text"><s-icon slot="start" name="more_horiz"></s-icon>查看所有</s-button></a><br/><br/>`);
        } catch (error) {
            console.error("[ERROR] 获取关注UP主列表失败", error);
        }
    }

    async getAllDynamics() {
        // 全部动态
        $(".dialog_content").empty();
        $("#dynamic_loader").show();

        let WebList = "<div class='flex_container'>";

        for (let i = 1; i <= 3; i++) {
            const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?timezone_offset=-480&offset=${this.lastDynamicOffset || ""}&type=video&platform=web&page=${i}`;

            try {
                const response = await $.get(url);
                const vidList = response.data.items.map(item => ({
                    bvid: item.modules.module_dynamic.major.archive.bvid,
                    aid: item.modules.module_dynamic.major.archive.aid,
                    pic: item.modules.module_dynamic.major.archive.cover,
                    title: item.modules.module_dynamic.major.archive.title,
                    desc: (item.modules.module_dynamic.desc ? ("动态内容: " + item.modules.module_dynamic.desc.text + "\n") : "") +
                          '点赞数量: ' + item.modules.module_stat.like.count + '\n视频简介: ' +
                          item.modules.module_dynamic.major.archive.desc,
                    author: { uid: item.modules.module_author.mid, name: item.modules.module_author.name }
                }));

                WebList += card.video(vidList);
                this.lastDynamicOffset = response.data.offset;
            } catch (error) {
                console.error("[ERROR] 获取全部动态失败", error);
                break;
            }
        }
		
		this.lastDynamicOffset = null;

        $(".dialog_content").html(WebList + "</div>");
        $("#dynamic_loader").hide();
    }

    getUserDynamics(upUid) {
        // 单人动态
        $(".dialog_content").empty();
        $("#dynamic_loader").show();

        const url = `https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?offset=&host_mid=${upUid}&timezone_offset=-480&platform=web&type=video`;

        $.get(url, (response) => {
            const vidList = response.data.items.map(item => ({
                bvid: item.modules.module_dynamic.major.archive.bvid,
                aid: item.modules.module_dynamic.major.archive.aid,
                pic: item.modules.module_dynamic.major.archive.cover,
                title: item.modules.module_dynamic.major.archive.title,
                desc: (item.modules.module_dynamic.desc ? ("动态内容: " + item.modules.module_dynamic.desc.text + "\n") : "") +
                      '点赞数量: ' + item.modules.module_stat.like.count + '\n视频简介: ' +
                      item.modules.module_dynamic.major.archive.desc,
                author: { uid: item.modules.module_author.mid, name: item.modules.module_author.name }
            }));

            $(".dialog_content").html("<div class='flex_container'>" + card.video(vidList) + "</div>");
            $("#dynamic_loader").hide();
        }).fail(error => {
            console.error("[ERROR] 获取单人动态失败", error);
            $("#dynamic_loader").hide();
        });
    }
}