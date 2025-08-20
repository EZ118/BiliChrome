var player = null; // 播放器实例
var live_player = null; // 直播间实例
var modal = null; // 模态实例
var plugin = null; // 插件实例

var search = null; // 搜索实例
var dynamic = null; // 动态实例
var home = null; // 首页实例
var message = null; // 消息实例
var space = null; // 空间实例

var currentNav = "home";
var currentUid = null;
var biliJctData = "";
var lastDynamicOffset = null;
var userPrefSettings = {};

function routeCtrl(isOnload, hash) {
    var data = null;
    if (hash) {
        data = hash.substring(1);
        alert("发现了一处狗屎代码，快提issue")
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
        space.getUserSpace(data.split("_")[1], isTop = data.includes("_top"));

    } else if (data.includes("img-")) {
        /* 图片查看 */
        let imgVewerHtml = `<img src="${data.split("-")[1]}" width="100%" />`;
        if (!data.includes("-top")) { imgVewerHtml = `<s-icon-button class="historyBackButton"><s-icon name="arrow_back"></s-icon></s-icon-button>` + imgVewerHtml; }
        modal.open("浏览图片", imgVewerHtml, data.split("-")[1], isTop = data.includes("-top"));

    } else if (data.includes("myfav")) {
        /* 收藏夹列表 */
        space.getMyCollectionList();

    } else if (data.includes("mysubscription")) {
        /* 订阅up主列表 */
        if (isOnload) { setTimeout(function () { space.getUserSubscription(currentUid); }, 300); }
        else { space.getUserSubscription(currentUid); }

    } else if (data.includes("fav_")) {
        /* 收藏夹 */
        space.getCollectionById(data.split("_")[1], data.split("_")[2]);

    } else if (data.includes("history")) {
        /* 观看历史 */
        space.getUserHistory();

    } else if (data.includes("watchlater")) {
        /* 稍后再看 */
        space.getWatchLater();

    } else if (data.includes("options")) {
        /* 显示扩展选项对话框 */
        modal.open("扩展选项", "<iframe src='./options.html' class='options_frame'></iframe>", "./options.html");

    } else if (data.includes("plugins")) {
        /* 显示插件管理器对话框 */
        plugin.manager();

    } else if (data == "default") {
        /* 不做任何事情 */
    }

    if (isOnload == true) {
        home.display();
    }
}

$(document).ready(async () => {
    // 获取用户偏好设置（同步执行）
    await (async () => {
        const result = await new Promise((resolve, reject) => {
            getStorage("pref", resolve); // 假设 getStorage 是 callback 风格
        });
        for (let key in result) {
            userPrefSettings[key] = result[key].value;
        }
    })();
    
    // 获取登录token
    getJctToken((token) => biliJctData = token);
    
    // 获取用户信息
    getAccount("auto", (usrInfo) => {
        currentUid = usrInfo.uid;
        if (!usrInfo.uid) { modal.toast("您未登录，请在bilibili.com登录后使用", 8000) }
    });
    
    // 初始化组件
    player = new VideoPlayer();
    live_player = new LivePlayer();
    modal = new Modal();
    plugin = new JsPlugin();

    // 初始化页面
    search = new SearchView();
    dynamic = new DynamicView();
    home = new HomeView();
    message = new MessageView();
    space = new SpaceView();

    // 初始动作
    routeCtrl(isOnload = true);
    space.getVidPlayingNow();
    plugin.run();

    // 控制路由
    window.addEventListener('popstate', (event) => routeCtrl());

    // 侧边主菜单
    $("s-navigation-item").click((evt) => {
        const link = $(evt.currentTarget).attr("href");
        currentNav = link.substring(5);

        switch (currentNav) {
			case "home":
				home.display();
				break;
			case "message":
				message.display();
				break;
			case "subscriptions":
				dynamic.display();
				break;
			case "space":
				space.display();
				break;
			case "search":
				search.display();
				break;
			default:
				break;
		}
    });    

    // 右下角刷新按钮
    $("#RefreshBtn").click(() => {
        switch (currentNav) {
            case "home":
                home.display(true);
                break;
            case "message":
                message.display(true);
                break;
            case "search":
                search.search(search.keyword, search.page, search.type);
                break;
            case "subscriptions":
                dynamic.display(true);
                break;
            case "space":
                space.display(true);
                break;
            default:
                break;
        }
    });

    // 全局返回按钮
    $(document).on("click", ".historyBackButton", () => {
        window.history.back();
    });
    
    // 全局老板键（ctrl + shift + x 或 ctrl + shift + c 触发），触发时，浏览器最小化、视频暂停
    $(window).keydown((evt) => {
        if ((evt.ctrlKey && evt.shiftKey && evt.key === 'C') || (evt.ctrlKey && evt.shiftKey && evt.key === 'X')) {
            evt.preventDefault();
            player.ele_videoContainer.trigger('pause');
            player.ele_videoContainer_backup.attr("src", "");
            minimizeWindow();
        }
    });
});

// 侧栏彩蛋
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