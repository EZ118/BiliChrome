var player = null; // 播放器实例
var live_player = null; // 直播间实例
var modal = null; // 模态实例
var plugin = null; // 插件实例

var search = null; // 搜索实例
var dynamic = null; // 动态实例
var home = null; // 首页实例

var currentTab = "home";
var currentUid = null;
var biliJctData = "";
var lastDynamicOffset = null;

function getVidPlayingNow() {
    // 获取其他设备正在播放的视频
    $.get(`https://api.bilibili.com/x/web-interface/history/continuation?his_exp=1200`, (vidInfo) => {
        if (vidInfo.data != null) {
            modal.notification(
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
        player.open({
            bvid: data.split("_")[1],
            refreshOnly: data.includes("refreshonly") ? "watch_later" : null,
            videoList: data.includes("watchlater") ? "watch_later" : null
        });
    } else if (data.includes("aid")) {
        /* 视频播放aid */
        player.open({
            aid: data.split("_")[1],
            refreshOnly: data.includes("refreshonly") ? "watch_later" : null,
            videoList: data.includes("watchlater") ? "watch_later" : null
        });
    } else if (data.includes("roomid")) {
        /* 直播roomid */
        live_player.open({
            roomid: data.split("_")[1]
        });
    } else if (data.includes("uid")) {
        /* 用户空间 */
        getUserSpace(data.split("_")[1], isTop = data.includes("_top"));

    } else if (data.includes("img-")) {
        /* 图片查看 */
        let imgVewerHtml = `<img src="${data.split("-")[1]}" width="100%" />`;
        if (!data.includes("-top")) { imgVewerHtml = `<s-icon-button class="historyBackButton"><s-icon name="arrow_back"></s-icon></s-icon-button>` + imgVewerHtml; }
        modal.open("浏览图片", imgVewerHtml, data.split("-")[1], isTop = data.includes("-top"));

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
        modal.open("扩展选项", "<iframe src='./options.html' class='options_frame'></iframe>", "#options");

    } else if (data.includes("plugins")) {
        /* 显示插件管理器对话框 */
        plugin.manager();

    } else if (data == "default") {
        /* 不做任何事情 */
    } else {
        // modal.toast("链接错误，点击边栏按钮以重载页面");
        // home.display();
    }

    if (isOnload == true) {
        home.display();
    }
}

$(document).ready(() => {
    // 初始化组件
    player = new VideoPlayer();
    live_player = new LivePlayer();
    modal = new Modal();
    plugin = new JsPlugin();

    // 初始化页面
    search = new SearchView();
    dynamic = new DynamicView();
    home = new HomeView();

    // 获取用户信息
    getAccount("auto", (usrInfo) => {
        currentUid = usrInfo.uid;
        if (!usrInfo.uid) { modal.toast("您未登录，请在bilibili.com登录后再使用", 8000) }
    });

    // 获取登录token
    getJctToken((token) => biliJctData = token);

    // 初始动作
    getVidPlayingNow();
    routeCtrl(isOnload = true);
    plugin.run();

    // 控制路由
    window.addEventListener('popstate', (event) => routeCtrl());

    /* 侧边主菜单 */
    $("s-navigation-item").click((evt) => {
        const link = $(evt.currentTarget).attr("href");

        currentTab = link.substring(5);

        if (currentTab == "home") {
            home.display();
        } else if (currentTab == "message") {
            messageInit();
        } else if (currentTab == "subscriptions") {
            dynamic.display();
        } else if (currentTab == "space") {
            spaceInit();
        } else if (currentTab == "search") {
            search.display();
        }
    });

    /* 侧栏彩蛋 */
    var eggBtnCnt = 0;
    $("#eggBtn").click(() => {
        eggBtnCnt++;
        if (eggBtnCnt == 16) {
            modal.toast("这不是彩蛋...");
        } else if (eggBtnCnt == 32) {
            modal.toast("真不是彩蛋...");
        } else if (eggBtnCnt >= 64) {
            eggBtnCnt = 0;
            modal.toast("你疯了吧！");
        }
    });

    $(document).on("click", ".historyBackButton", () => {
        // 全局返回按钮
        window.history.back();
    });
});

$("#RefreshBtn").click(() => {
    /* 刷新 */
    if (currentTab == "home") {
        home.display(refresh = true);
    } else if (currentTab == "message") {
        messageInit(refresh = true);
    } else if (currentTab == "search") {
        search.search(search.keyword, search.page, search.type);
    } else if (currentTab == "subscriptions") {
        dynamic.display(refresh = true);
    } else if (currentTab == "space") {
        spaceInit(refresh = true);
    }
});
