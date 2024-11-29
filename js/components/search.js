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
    $("#dynamic_loader").hide();
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
function getSearchResult(wd) {
    if (!wd) { return; }
    $("#item_container").html("");
    $("#dynamic_loader").show();
    $.get("https://api.bilibili.com/x/web-interface/search/all/v2?keyword=" + encodeURI(wd), function (tjlist) {
        var WebList = "<p style='margin:0px 10px 0px 10px;font-size:16px;'><b style='user-select:text;'>" + wd + "</b>的搜索结果：</p>";
        $.each(tjlist.data.result[11].data, function (index, item) {
            WebList += `
                <s-card clickable="true" class="common_video_card">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#aid_` + item.aid + `">
                            <img src='https:` + item.pic + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#aid_` + item.aid + `">
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
        $("#item_container").html(WebList);
        $("#dynamic_loader").hide();
    });
}

function searchInit() {
    showSearchPage();
}