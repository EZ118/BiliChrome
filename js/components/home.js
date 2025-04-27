class HomeView {
    constructor() {
        // 初始化内部变量
        this.currentTab = "recommand"; // 默认选中的标签页
        this.currentPage = 1; // 默认初始页码

        // 初始化事件绑定
        $(document).off("click", ".tabbar .tab").on("click", ".tabbar .tab", (event) => {
            const tabData = $(event.currentTarget).attr("tab-data");

            // 移除所有 tab 的 type 属性
            $(".tabbar .tab").attr("type", "");

            // 为当前点击的 tab 设置 type="filled-tonal"
            $(event.currentTarget).attr("type", "filled-tonal");

            // 根据 tab-data 值调用对应方法
            $("#item_container").scrollTop(0); // 滚动到顶部
            $(".tab_container").empty();
            this.currentPage = 1; // 默认初始页码

            if (tabData === "recommand") {
                this.getRecommendedVideos();
            } else if (tabData === "hot") {
                this.getPopularVideos();
            } else if (tabData === "live") {
                this.getLiveRooms();
            }

            // 更新最后选中的标签页
            this.currentTab = tabData;
        });
    }

    display(refresh) {
        if (refresh) {
            $("#item_container").scrollTop(0); // 滚动到顶部
            $(".tab_container").empty();
            this.currentPage = 1; // 重置当前页码

            if (this.currentTab === "recommand") {
                this.getRecommendedVideos();
            } else if (this.currentTab === "hot") {
                this.getPopularVideos();
            } else if (this.currentTab === "live") {
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
            <div class="flex_container tab_container" style="min-height: calc(100vh - 30px); overflow-y: auto; padding: 0px 10px 10px 10px;">
            </div>
        `);

        // 调用显示推荐视频列表
        this.getRecommendedVideos();




        // 将事件绑定到不会被替换的父级元素上，例如 document 或 body
        $('#item_container').on('scroll', () => {
            if (
                $("#item_container").scrollTop() + $("#item_container").height() >=
                $("#item_container")[0].scrollHeight - 10
            ) {
                // 滚动到底部时，加载更多内容
                this.currentPage += 1; // 增加当前页码

                if (this.currentTab === "recommand") {
                    this.getRecommendedVideos();
                } else if (this.currentTab === "hot") {
                    this.getPopularVideos();
                } else if (this.currentTab === "live") {
                    this.getLiveRooms();
                }
            }
        });
    }

    getRecommendedVideos() {
        // 显示加载动画
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
            $(".tab_container").append(WebList);
            $("#dynamic_loader").hide();
        });
    }

    getPopularVideos() {
        console.log(this.currentPage);
        // 显示加载动画
        $("#dynamic_loader").show();

        $.get(`https://api.bilibili.com/x/web-interface/popular?ps=40&pn=${this.currentPage}`, (tjlist) => {
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

            $(".tab_container").append(card.video(vidList));
            $("#dynamic_loader").hide();
        });
    }

    getLiveRooms() {
        // 显示加载动画
        $("#dynamic_loader").show();

        $.get(`https://api.live.bilibili.com/room/v1/Index/getShowList?page=${this.currentPage}&page_size=20&platform=web`, (tjlist) => {
            const vidList = tjlist.data.map((item) => ({
                roomid: item.roomid,
                pic: item.user_cover,
                title: item.title,
                desc: `- 分区: ${item.area_name}/${item.area_v2_name}`,
                author: { uid: item.uid, name: item.uname },
            }));

            $(".tab_container").append(card.live(vidList));
            $("#dynamic_loader").hide();
        });
    }
}