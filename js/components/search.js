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
            <s-search style="width:300px;">
                <s-icon type="search" slot="start"></s-icon>
                <input type="text" class="app-input-text" placeholder="回车以搜索">
            </s-search>
            <br>
            <div style="width:350px; margin-top:20px;" title="搜素历史" class="search_history">
                ${WebList}
                <br><br>
                <s-chip title="清空搜素历史" id="search_clearHistory" type="elevated"><s-icon type="close"></s-icon></s-chip>
            </div>
        </div>`);
    
    var inputObject = $("#item_container").find("input.app-input-text");

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

        var WebList = `
            <div class="search_titlebar">
                <s-icon-button class="search_backBtn" title="返回"><s-icon type="arrow_back"></s-icon></s-icon-button>
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
            </s-tab>`;

        switch (type) {
            case "video":
                $.each(tjlist.data.result, function (index, item) {
                    WebList += `
                        <s-card clickable="true" class="common_video_card">
                            <div slot="image" style="overflow:hidden;">
                                <a href="#bvid_` + item.bvid + `">
                                    <img src='https:` + item.pic + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;' loading="lazy" />
                                </a>
                            </div>
                            <div slot="subhead">
                                <a href="#bvid_` + item.bvid + `">
                                    ` + item.title + `
                                </a>
                            </div>
                            <div slot="text">
                                <a href="#uid_` + item.mid + `">
                                    ` + item.author + `
                                </a>
                            </div>
                        </s-card>`;
                });
                break;
            case "bili_user":
                $.each(tjlist.data.result, function (index, item) {
                    WebList += `
                        <a href="#uid_` + item.mid + `">
                            <s-card clickable="true" class="common_video_card">
                                <div slot="image" style="height:30px;overflow:hidden;">
                                    <img style='height:30px;width:30px;border-radius:10px 0 0 0' src='https:` + item.upic + `@45w_45h_1c.webp' loading="lazy" />
                                </div>
                                <div slot="subhead">
                                    ` + item.uname + `
                                </div>
                                <div slot="text">
                                    [简介] ` + (item.usign || "<i>无</i>") + `
                                </div>
                            </s-card>
                        </a>`;
                });
                break;
            case "live_room":
                $.each(tjlist.data.result, function (index, item) {
                    WebList += `
                        <s-card clickable="true" class="common_video_card">
                            <div slot="image" style="overflow:hidden;">
                                <a href="#roomid_` + item.roomid + `">
                                    <img src='https:` + item.pic + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;' loading="lazy" />
                                </a>
                            </div>
                            <div slot="subhead">
                                <a href="#roomid_` + item.roomid + `">
                                    ` + item.title + `
                                </a>
                            </div>
                            <div slot="text">
                                <a href="#uid_` + item.uid + `">
                                    ` + item.uname + `
                                </a>
                            </div>
                        </s-card>`;
                });
                break;
            default:
                showToast("不支持的搜索类型");
                break;
        }


        WebList += `
            <br/>
            <s-segmented-button class="search_pageSwitcher">
                <s-segmented-button-item selectable="false" id="search_prevPageBtn">
                    <s-icon type="chevron_left"></s-icon>
                </s-segmented-button-item>
                <s-segmented-button-item selected="true"> ${tjlist.data.page}/${tjlist.data.numPages} </s-segmented-button-item>
                <s-segmented-button-item selectable="false" id="search_nextPageBtn">
                    <s-icon type="chevron_right"></s-icon>
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
        getSearchResult(keywordSearchingNow, search_currentPage, search_currentType);
    });
});