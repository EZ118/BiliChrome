function showRecommendedVideos() {
    $(".tab_container").html("");
    $("#dynamic_loader").show();
    var WebList = "";
    var requests = [];

    for (let i = 1; i <= 2; i++) {
        let request = $.get("https://api.bilibili.com/x/web-interface/index/top/rcmd?fresh_type=3&version=1&ps=14", function (tjlist) {
            vidList = tjlist.data.item.map(item => ({
                bvid: item.bvid,
                aid: item.id,
                pic: item.pic,
                title: item.title,
                desc: item.title,
                author: { uid: item.owner.mid, name: item.owner.name }
            }));
            WebList += card.video(vidList);
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
        vidList = tjlist.data.list.map(item => ({
            bvid: item.bvid,
            aid: item.aid,
            pic: item.pic,
            title: item.title,
            desc: '- 点赞数量: ' + item.stat.like + '\n- 视频简介: ' + (item.desc ? item.desc : "无简介") + (item.rcmd_reason.content ? ("\n- 推荐原因: " + item.rcmd_reason.content) : ""),
            author: { uid: item.owner.mid, name: item.owner.name }
        }));

        $(".tab_container").html(card.video(vidList));
        $("#dynamic_loader").hide();
    });
}

function showLiveRooms(){
    $(".tab_container").html("");
    $("#dynamic_loader").show();

    $.get("https://api.live.bilibili.com/xlive/web-interface/v1/second/getUserRecommend?page=1&page_size=30&platform=web", function (tjlist) {
        vidList = tjlist.data.list.map(item => ({
            roomid: item.roomid,
            pic: item.cover,
            title: item.title,
            desc: '- 分区: ' + item.parent_name + '/' + item.area_name,
            author: { uid: item.uid, name: item.uname }
        }));
        $(".tab_container").html(card.live(vidList));
        $("#dynamic_loader").hide();
    });
}



/* ====== */
var home_tab_last_tab = "recommand";
function homeInit(refresh) {
    if(refresh) {
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