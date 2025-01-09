var currentTab = "home";
var lastDynamicOffset = null;

function getVidPlayingNow() {
    $.get("https://api.bilibili.com/x/web-interface/history/continuation?his_exp=1200", function (vidInfo) {
        if (vidInfo.data != null) {
            showNotification(
                vidInfo.data.title,
                "其他设备正在播放的视频，点击继续观看",
                "./img/cast.svg",
                "继续浏览",
                () => { window.location.hash = `#bvid_` + vidInfo.data.history.bvid; }
            );
        }
    });
}

function routeCtrl(isOnload, hash) {
    var data = null;
    if (hash) {
        data = hash.substring(1);
    } else {
        data = window.location.hash.substring(1);
    }

    if (data.includes("bvid")) {
        /* 视频播放bvid */
        openPlayer({
            bvid: data.split("_")[1],
            refreshOnly: data.includes("refreshonly") ? "watch_later" : null,
            videoList: data.includes("watchlater") ? "watch_later" : null
        });
    } else if (data.includes("aid")) {
        /* 视频播放aid */
        openPlayer({
            aid: data.split("_")[1],
            refreshOnly: data.includes("refreshonly") ? "watch_later" : null,
            videoList: data.includes("watchlater") ? "watch_later" : null
        });
    } else if (data.includes("roomid")) {
        /* 直播roomid */
        openLivePlayer({
            roomid: data.split("_")[1]
        });
    } else if (data.includes("uid")) {
        /* 用户空间 */
        getUserSpace(data.split("_")[1], isTop = data.includes("_top"));

    } else if (data.includes("img-")) {
        /* 图片查看 */
        openDlg("浏览图片", `<s-icon-button class="historyBackButton"><s-icon type="arrow_back"></s-icon></s-icon-button><img src="` + data.split("-")[1] + `" width="100%" />`, data.split("-")[1]);

    } else if (data.includes("myfav")) {
        /* 收藏夹列表 */
        getMyCollectionList();

    } else if (data.includes("mysubscription")) {
        /* 订阅up主列表 */
        if (isOnload) { setTimeout(function () { getUserSubscription(currentUid); }, 300); }
        else { getUserSubscription(currentUid); }

    } else if (data.includes("fav_")) {
        /* 收藏夹 */
        getCollectionById(data.split("_")[1], data.split("_")[2]);

    } else if (data.includes("history")) {
        /* 观看历史 */
        getUserHistory();

    } else if (data.includes("watchlater")) {
        /* 稍后再看 */
        getWatchLater();

    } else if (data.includes("options")) {
        /* 显示扩展选项对话框 */
        openDlg("扩展选项", "<iframe src='./options.html' class='options_frame'></iframe>", "#options")

    } else if (data == "default") {
        /* 不做任何事情 */
    } else {
        //showToast("链接错误，点击边栏按钮以重载页面");
        //homeInit();
    }

    if (isOnload == true) {
        homeInit();
    }
}

$(document).ready(function () {
    document.referrer = "https://www.bilibili.com/";

    getAccount("auto", function (usrInfo) {
        /* 载入用户信息 */
        currentUid = usrInfo.uid;
        if (!usrInfo.uid) { showToast("您未登录，请在bilibili.com登录后再使用", 8000) }
    });

    getVidPlayingNow();
    routeCtrl(isOnload = true);

    window.addEventListener('popstate', function (event) {
        routeCtrl();
    });

    /* 侧边主菜单 */
    $("s-navigation-item").click((evt) => {
        const link = $(evt.target).attr("href");
        // window.location.hash = link;

        currentTab = link.substring(5);

        if (currentTab == "home") {
            homeInit();
        } else if (currentTab == "message") {
            messageInit();
        } else if (currentTab == "subscriptions") {
            dynamicInit();
        } else if (currentTab == "space") {
            spaceInit();
        } else if (currentTab == "search") {
            searchInit();
        }
    });

    /* 侧栏彩蛋 */
    var eggBtnCnt = 0;
    $("#eggBtn").click(() => {
        eggBtnCnt++;
        if (eggBtnCnt == 16) {
            showToast("这不是彩蛋...");
        } else if (eggBtnCnt == 32) {
            showToast("真不是彩蛋...");
        } else if (eggBtnCnt >= 64) {
            eggBtnCnt = 0;
            showToast("你疯了吧！");
        }
    });

    $(document).on("click", ".historyBackButton", function () {
        window.history.back();
    });
});

$("#RefreshBtn").click(function () {
    /* 刷新 */
    if (currentTab == "home") {
        homeInit(refresh = true);
    } else if (currentTab == "message") {
        messageInit(refresh = true);
    } else if (currentTab == "search") {
        searchInit(refresh = true);
    } else if (currentTab == "subscriptions") {
        dynamicInit(refresh = true);
    } else if (currentTab == "space") {
        spaceInit(refresh = true);
    }
});
