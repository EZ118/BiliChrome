class SearchView {
    constructor() {
        this.keyword = "";
        this.page = 1;
        this.type = "video";

        $(document).on("click", ".search_backBtn", () => {
            // 返回按钮
            this.display();
            this.keyword = "";
        });
        $(document).on("click", "#search_prevPageBtn", () => {
            // 上一页按钮
            if (this.page > 1) {
                this.page -= 1;
                this.search(this.keyword, this.page, this.type);
            } else {
                modal.toast("已经是第一页了~");
            }
        });
        $(document).on("click", "#search_nextPageBtn", () => {
            // 下一页按钮
            this.page += 1;
            this.search(this.keyword, this.page, this.type);
        });

        $(document).on("click", ".search_typeTab s-tab-item", (event) => {
            this.type = $(event.currentTarget).attr("value");
            this.search(this.keyword, 1, this.type);
        });

        this.display();
    }

    display() {
        // 显示搜索页

        // 处理搜素历史
        let WebList = '';
        let searchHistory = localStorage.getItem("searchHistory");
        if (searchHistory) {
            WebList = JSON.parse(searchHistory).map(item => `<s-chip class="search_historyItem">${item}</s-chip>`).join('');
        }

        // 变量初始化
        this.page = 1;
        this.type = "video";

        // 显示搜索界面
        $("#item_container").html(`
            <div align="center">
                <div style='margin-top:30vh; margin-bottom:35px; display:flex; justify-content:center; align-items:flex-end;'>
                    <img src="./img/logo.svg" width="160px">
                    <span style="color:#00AEEC;font-size:xx-large">&nbsp;|&nbsp;搜索</span>
                </div>
                <br>
                <s-search style="width:300px;" placeholder="回车以搜索" class="app-input-text">
                    <s-icon name="search" slot="start"></s-icon>
                    <s-icon-button slot="end">
                        <s-icon name="close"></s-icon>
                    </s-icon-button>
                </s-search>

                <br>
                <div style="width:350px; margin-top:20px;" title="搜索历史" class="search_history">
                    ${WebList}
                    <br><br>
                    <s-icon-button id="search_clearHistory" title="清空搜索历史" type="filled-tonal"><s-icon name="close"></s-icon></s-icon-button>
                </div>
            </div>`);

        var inputObject = $("#item_container").find(".app-input-text");

        inputObject.off('keydown');
        $("#item_container .search_history .search_historyItem").off();
        $("#item_container .search_history #search_clearHistory").off();

        inputObject.on('keydown', (event) => {
            // 回车开始搜素
            if (event.key === 'Enter' || event.keyCode === 13) {
                if ($(event.target).val().trim() !== '') {
                    let searchWd = $(event.target).val();
                    this.search(searchWd); // this 指向类的实例

                    // 记录搜索历史
                    if (!searchHistory) {
                        localStorage.setItem("searchHistory", '["' + searchWd + '"]');
                    } else {
                        let searchHistoryArray = JSON.parse(searchHistory);
                        if (searchHistoryArray.indexOf(searchWd) === -1) {
                            searchHistoryArray.push(searchWd);
                            localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArray));
                        }
                    }
                }
            }
        });
        $("#item_container .search_history .search_historyItem").on('click', (event) => {
            // 从历史记录搜索
            this.search($(event.target).text());
        });
        $("#item_container .search_history #search_clearHistory").on('click', (event) => {
            // 清除历史
            localStorage.removeItem("searchHistory");
            modal.toast("已清空搜索历史")
            this.display();
        });
    }

    search(keyword, page = 1, type = "video") {
        // 显示搜索结果
        // $("#item_container").html(`<div style="display: flex; align-items:center; flex-wrap:wrap; margin:12px;">
        //     ${Array(16).fill('<s-skeleton class="common_video_card_skeleton"></s-skeleton>').join('')}
        // </div>`);

        $("#item_container").empty();
        $("#dynamic_loader").show();
        $.get(`https://api.bilibili.com/x/web-interface/wbi/search/type?search_type=${type}&keyword=${encodeURI(keyword)}&page=${page}`, (tjlist) => {
            this.keyword = keyword;
            this.page = page;

            var WebList = `
                <div class="search_titlebar">
                    <s-icon-button class="search_backBtn" title="返回"><s-icon name="arrow_back"></s-icon></s-icon-button>
                    <span class="search_title">${keyword}</span>
                </div>
                <s-tab class="search_typeTab">
                    <s-tab-item value="video">
                        <div slot="text">视频</div>
                    </s-tab-item>
                    <s-tab-item value="bili_user">
                        <div slot="text">用户</div>
                    </s-tab-item>
                    <s-tab-item value="live_room">
                        <div slot="text">直播</div>
                    </s-tab-item>
                </s-tab>
                <div class="flex_container">`;

            if (!tjlist.data.result || tjlist.data.result.length == 0) {
                WebList += "</div><br/><i>&nbsp;&nbsp;&nbsp;无搜索结果</i>";
                modal.toast("未找到相关结果");

                $("#item_container").html(WebList);
                $("#dynamic_loader").hide();

                $('s-tab-item[value="' + type + '"]').prop("selected", true);
                return;
            }

            let cardList = [];
            switch (type) {
                case "video":
                    WebList += card.video(
                        tjlist.data.result.map(item => ({
                            bvid: item.bvid,
                            aid: item.aid,
                            pic: item.pic.includes("://") ? item.pic : "https:" + item.pic,
                            title: item.title,
                            desc: item.description,
                            author: { uid: item.mid, name: item.author }
                        }))
                    );
                    break;
                case "bili_user":
                    WebList += card.user(
                        tjlist.data.result.map(item => ({
                            uid: item.mid,
                            name: item.uname,
                            pic: item.upic.includes("://") ? item.upic : "https:" + item.upic,
                            desc: item.usign,
                            sign: item.usign
                        }))
                    );
                    break;
                case "live_room":
                    WebList += card.live(
                        tjlist.data.result.map(item => ({
                            roomid: item.roomid,
                            pic: item.pic.includes("://") ? item.pic : "https:" + item.pic,
                            title: item.title,
                            desc: '- 开始时间: ' + item.live_time,
                            author: { uid: item.uid, name: item.uname }
                        }))
                    );
                    break;
                default:
                    modal.toast("不支持的搜索类型");
                    break;
            }


            WebList += `
                </div><br/>
                <s-segmented-button class="search_pageSwitcher">
                    <s-segmented-button-item selectable="false" id="search_prevPageBtn">
                        <s-icon name="chevron_left"></s-icon>
                    </s-segmented-button-item>
                    <s-segmented-button-item selected="true"> ${tjlist.data.page}/${tjlist.data.numPages} </s-segmented-button-item>
                    <s-segmented-button-item selectable="false" id="search_nextPageBtn">
                        <s-icon name="chevron_right"></s-icon>
                    </s-segmented-button-item>
                </s-segmented-button>
            `;

            $("#item_container").html(WebList);
            $("#dynamic_loader").hide();

            $('s-tab-item[value="' + type + '"]').prop("selected", true);
        });
    }
}