function showRecommendedVideos() {
    $(".tab_container").html("");
    $("#dynamic_loader").show();
    var WebList = "";
    var requests = [];

    for (let i = 1; i <= 2; i++) {
        let request = $.get("https://api.bilibili.com/x/web-interface/index/top/rcmd?fresh_type=3&version=1&ps=14", function (tjlist) {
            $.each(tjlist.data.item, function (index, item) {
                WebList += `
                    <s-card clickable="true" class="common_video_card">
                        <div slot="image" style="overflow:hidden;">
                            <a href="#bvid_` + item.bvid + `">
                                <img src='` + item.pic + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                            </a>
                        </div>
                        <div slot="subhead">
                            <a href="#bvid_` + item.bvid + `">
                                ` + item.title + `
                            </a>
                        </div>
                        <div slot="text">
                            <a href="#uid_` + item.owner.mid + `">
                                ` + item.owner.name + `
                            </a>
                        </div>
                    </s-card>`;
            });
        });

        requests.push(request);
    }

    $.when.apply($, requests).done(function () {
        $(".tab_container").html(WebList);
        $("#dynamic_loader").hide();
    });
}

function showHotVideos() {
    $(".tab_container").html("");
    $("#dynamic_loader").show();
    $.get("https://api.bilibili.com/x/web-interface/popular?ps=40&pn=1", function (tjlist) {
        var WebList = "";
        $.each(tjlist.data.list, function (index, item) {
            var tooltipText = '- 点赞数量: ' + item.stat.like + '\n- 视频简介: ' + (item.desc ? item.desc : "无简介") + (item.rcmd_reason.content ? ("\n- 推荐原因: " + item.rcmd_reason.content) : "");

            WebList += `
                <s-card clickable="true" class="common_video_card" title='` + tooltipText + `'>
                    <div slot="image" style="overflow:hidden;">
                        <a href="#bvid_` + item.bvid + `">
                            <img src='` + item.pic + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#bvid_` + item.bvid + `">
                            ` + item.title + `
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#uid_` + item.owner.mid + `">
                            ` + item.owner.name + `
                        </a>
                    </div>
                </s-card>`;
        })
        $(".tab_container").html(WebList);
        $("#dynamic_loader").hide();
    });
}

function showLiveRooms(){
    $(".tab_container").html("");
    $("#dynamic_loader").show();

    $.get("https://api.live.bilibili.com/xlive/web-interface/v1/second/getUserRecommend?page=1&page_size=30&platform=web", function (tjlist) {
        var WebList = "";
        $.each(tjlist.data.list, function (index, item) {
            var tooltipText = '- 分区: ' + item.parent_name + '/' + item.area_name;

            WebList += `
                <s-card clickable="true" class="common_video_card" title='` + tooltipText + `'>
                    <div slot="image" style="overflow:hidden;">
                        <a href="#roomid_` + item.roomid + `">
                            <img src='` + item.cover + `@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
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
        })
        $(".tab_container").html(WebList);
        $("#dynamic_loader").hide();
    });
}



/* ====== */
var home_tab_last_tab = "recommend";
function homeInit(refresh) {
    if(refresh == true) {
        if (home_tab_last_tab === "recommand") {
            showRecommendedVideos();
        } else if (home_tab_last_tab === "hot") {
            showHotVideos();
        } else if (home_tab_last_tab === "live") {
            showLiveRooms();
        }
        return;
    }
    
    $("#item_container").html(`
        <div class="tabbar">
            <s-chip type="filled-tonal" class="tab" tab-data="recommand">推荐</s-chip>
            <s-chip type="" class="tab" tab-data="hot">热门</s-chip>
            <s-chip type="" class="tab" tab-data="live">直播</s-chip>
        </div>
        <div class="flex_container tab_container">
        </div>
    `);

    showRecommendedVideos();

    $(document).off("click", ".tab").on("click", ".tab", function() {
        // 移除所有 tab 的 type 属性
        $(".tab").attr("type", "");
        
        // 为当前点击的 tab 设置 type="filled-tonal"
        $(this).attr("type", "filled-tonal");
        
        // 获取 tab-data 值并调用对应函数
        const tabData = $(this).attr("tab-data");
        if (tabData === "recommand") {
            showRecommendedVideos();
        } else if (tabData === "hot") {
            showHotVideos();
        } else if (tabData === "live") {
            showLiveRooms();
        }

        home_tab_last_tab = tabData;
    });
}