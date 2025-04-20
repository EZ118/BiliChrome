class HomeView {
    constructor() {
        // 初始化内部变量
        this.lastSelectedTab = "recommand"; // 默认选中的标签页

        // 初始化事件绑定
        $(document).off("click", ".tab").on("click", ".tab", (event) => {
            const tabData = $(event.currentTarget).attr("tab-data");

            // 移除所有 tab 的 type 属性
            $(".tab").attr("type", "");

            // 为当前点击的 tab 设置 type="filled-tonal"
            $(event.currentTarget).attr("type", "filled-tonal");

            // 根据 tab-data 值调用对应方法
            if (tabData === "recommand") {
                this.getRecommendedVideos();
            } else if (tabData === "hot") {
                this.getPopularVideos();
            } else if (tabData === "live") {
                this.getLiveRooms();
            }

            // 更新最后选中的标签页
            this.lastSelectedTab = tabData;
        });
    }

    display(refresh) {
        if(refresh) {
            if (this.lastSelectedTab === "recommand") {
                this.getRecommendedVideos();
            } else if (this.lastSelectedTab === "hot") {
                this.getPopularVideos();
            } else if (this.lastSelectedTab === "live") {
                this.getLiveRooms();
            }
            return;
        }

        // 显示页面结构
        $("#item_container").html(`
            <div class="tabbar">
                <s-chip type="filled-tonal" class="tab" tab-data="recommand">推荐</s-chip>
                <s-chip type="" class="tab" tab-data="hot">热门</s-chip>
                <s-chip type="" class="tab" tab-data="live">直播</s-chip>
            </div>
            <div class="flex_container tab_container">
            </div>
        `);

        // 调用显示推荐视频列表
        this.getRecommendedVideos();
    }

    getRecommendedVideos() {
        // 清空内容并显示加载动画
        $(".tab_container").html("");
        $("#dynamic_loader").show();

        let WebList = "";
        const requests = [];

        for (let i = 1; i <= 2; i++) {
            const request = $.get(
                "https://api.bilibili.com/x/web-interface/index/top/rcmd?fresh_type=3&version=1&ps=14",
                (tjlist) => {
                    const vidList = tjlist.data.item.map((item) => ({
                        bvid: item.bvid,
                        aid: item.id,
                        pic: item.pic,
                        title: item.title,
                        desc: item.title,
                        author: { uid: item.owner.mid, name: item.owner.name },
                    }));
                    WebList += card.video(vidList);
                }
            );

            requests.push(request);
        }

        $.when.apply($, requests).done(() => {
            $(".tab_container").html(WebList);
            $("#dynamic_loader").hide();
        });
    }

    getPopularVideos() {
        // 清空内容并显示加载动画
        $(".tab_container").html("");
        $("#dynamic_loader").show();

        $.get("https://api.bilibili.com/x/web-interface/popular?ps=40&pn=1", (tjlist) => {
            const vidList = tjlist.data.list.map((item) => ({
                bvid: item.bvid,
                aid: item.aid,
                pic: item.pic,
                title: item.title,
                desc:
                    `- 点赞数量: ${item.stat.like}\n- 视频简介: ${item.desc ? item.desc : "无简介"
                    }` +
                    (item.rcmd_reason.content
                        ? `\n- 推荐原因: ${item.rcmd_reason.content}`
                        : ""),
                author: { uid: item.owner.mid, name: item.owner.name },
            }));

            $(".tab_container").html(card.video(vidList));
            $("#dynamic_loader").hide();
        });
    }

    getLiveRooms() {
        // 清空内容并显示加载动画
        $(".tab_container").html("");
        $("#dynamic_loader").show();

        $.get(
            /* "https://api.live.bilibili.com/xlive/web-interface/v1/second/getUserRecommend?page=1&page_size=30&platform=web", */
            "https://api.live.bilibili.com/room/v1/Index/getShowList?page=1&page_size=30&platform=web",
            (tjlist) => {
                const vidList = tjlist.data.map((item) => ({
                    roomid: item.roomid,
                    pic: item.user_cover,
                    title: item.title,
                    desc: `- 分区: ${item.area_name}/${item.area_v2_name}`,
                    author: { uid: item.uid, name: item.uname },
                }));

                $(".tab_container").html(card.live(vidList));
                $("#dynamic_loader").hide();
            }
        );
    }
}