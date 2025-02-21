var keywordSearchingNow = "";
var search_currentPage = 1;
var search_currentType = "video";

function showSearchPage() {
    /* 显示搜素页 */

    /* 处理搜素历史 */
    let WebList = '';
    let searchHistory = localStorage.getItem("searchHistory");
    if (searchHistory) {
        let searchHistoryArray = JSON.parse(searchHistory);
        $.each(searchHistoryArray, function (index, item) {
            WebList += `<s-chip type="elevated" class="search_histroyItem">${item}</s-chip>`;
        });
    }

    /* 变量初始化 */
    search_currentPage = 1;
    search_currentType = "video";

    /* 显示搜索界面 */
    $("#item_container").html(`
        <div align="center">
            <div style='margin-top:30vh; margin-bottom:35px; display:flex; justify-content:center; align-items:flex-end;'>
                <img src="./img/logo.svg" width="160px">
                <span style="color:#00AEEC;font-size:xx-large">&nbsp;|&nbsp;搜索</span>
            </div>
            <br>
            <s-search style="width:300px;" placeholder="搜索关键字" class="app-input-text">
                <s-icon name="search" slot="start"></s-icon>
                <s-icon-button slot="end">
                    <s-icon name="close"></s-icon>
                </s-icon-button>
            </s-search>

            <br>
            <div style="width:350px; margin-top:20px;" title="搜素历史" class="search_history">
                ${WebList}
                <br><br>
                <s-chip title="清空搜素历史" id="search_clearHistory" type="elevated"><s-icon name="close"></s-icon></s-chip>
            </div>
        </div>`);

    var inputObject = $("#item_container").find(".app-input-text");

    inputObject.off('keydown');
    $("#item_container .search_history .search_histroyItem").off();
    $("#item_container .search_history #search_clearHistory").off();

    inputObject.on('keydown', function (event) {
        /* 回车开始搜素 */
        if (event.key === 'Enter' || event.keyCode === 13) {
            if ($(this).val().trim() !== '') {
                let searchWd = $(this).val();
                getSearchResult(searchWd);

                /* 记录搜索历史 */
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
    $("#item_container .search_history .search_histroyItem").on('click', function (event) {
        /* 从历史记录搜素 */
        let searchWd = $(event.target).text();
        getSearchResult(searchWd);
    });
    $("#item_container .search_history #search_clearHistory").on('click', function (event) {
        /* 清除历史 */
        localStorage.removeItem("searchHistory");
        showToast("已清空搜索历史")
        showSearchPage();
    });
}
function getSearchResult(keyword, page, type) {
    if (!keyword) { return; }
    if (!page) { page = 1; }
    if (!type) { type = "video"; }

    $("#item_container").html("");
    $("#dynamic_loader").show();
    $.get("https://api.bilibili.com/x/web-interface/wbi/search/type?search_type=" + type + "&keyword=" + encodeURI(keyword) + "&page=" + page, function (tjlist) {
        keywordSearchingNow = keyword;
        search_currentPage = page;

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
        
        if(!tjlist.data.result || tjlist.data.result.length == 0) {
            WebList += "</div><br/><i>无搜索结果</i>";

            $("#item_container").html(WebList);
            $("#dynamic_loader").hide();

            $('s-tab-item[value="' + type + '"]').prop("selected", true);
            return;
        }

        switch (type) {
            case "video":
                vidList = tjlist.data.result.map(item => ({
                    bvid: item.bvid,
                    aid: item.aid,
                    pic: item.pic.includes("://") ? item.pic : "https:" + item.pic,
                    title: item.title,
                    desc: item.description,
                    author: { uid: item.mid, name: item.author }
                }));
                WebList += card.video(vidList);
                break;
            case "bili_user":
                usrList = tjlist.data.result.map(item => ({
                    uid: item.mid,
                    name: item.uname,
                    pic: item.upic.includes("://") ? item.upic : "https:" + item.upic,
                    desc: item.usign,
                    sign: item.usign
                }));
                WebList += card.user(usrList);
                break;
            case "live_room":
                vidList = tjlist.data.result.map(item => ({
                    roomid: item.roomid,
                    pic: item.pic.includes("://") ? item.pic : "https:" + item.pic,
                    title: item.title,
                    desc: '- 开始时间: ' + item.live_time,
                    author: { uid: item.uid, name: item.uname }
                }));
                WebList += card.live(vidList);
                break;
            default:
                showToast("不支持的搜索类型");
                break;
        }


        WebList += `
            </div>
            <br/>
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

function searchInit(refresh) {
    if (refresh) {
        getSearchResult(keywordSearchingNow);
        return;
    }

    showSearchPage();
}

$(document).ready(function () {
    $(document).on("click", ".search_backBtn", function () {
        showSearchPage();
    });
    $(document).on("click", "#search_prevPageBtn", function () {
        if (search_currentPage > 1) {
            search_currentPage -= 1;
            getSearchResult(keywordSearchingNow, search_currentPage, search_currentType);
        } else {
            showToast("已经是第一页了~");
        }
    });
    $(document).on("click", "#search_nextPageBtn", function () {
        search_currentPage += 1;
        getSearchResult(keywordSearchingNow, search_currentPage, search_currentType);
    });

    $(document).on("click", ".search_typeTab s-tab-item", function (event) {
        search_currentType = $(event.currentTarget).attr("value");
        getSearchResult(keywordSearchingNow, 1, search_currentType);
    });
});