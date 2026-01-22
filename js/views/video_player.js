import { toggleLoader } from "../components/loader.js";
import { getVideoDetail, getVideoSource, getVideosRelated, getVideoReplies } from "../api/index.js";
import { Icon } from "../components/icon.js";
import { UserCard, VideoCardSlim, ReplyCard } from "../components/card.js";
import { toast } from "../util.js";

var videoInfo = {
    "title": "",
    "pic": "",
    "desc": "-",
    "aid": 0,
    "bvid": "",
    "cid": 0,
    "pages": [
        {
            "cid": 0,
            "page": 1,
            "part": "默认",
            "duration": 100
        }
    ],
    "author": {
        "name": "UP",
        "uid": 0,
        "face": ""
    },
    "stat": {
        "like": 1,
        "coin": 2,
        "view": 3,
        "fav": 4
    }
}; // 视频基本信息存储
var videoSourceInfo = {
    code: 0,
    url: "",
    length: 0,
    backup_url: `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=0&cid=0`,
    cid: 0,
    bvid: 0
}; // 视频播放链接存储
var rcmdList = []; // 推荐视频列表
var replyList = []; // 评论列表
var danmuList = []; // 弹幕列表
var danmuCnt = 0; // 弹幕计数器
var currentTab = "detail"; // 侧栏当前选项
var lastParamStore = ""; // 上一次观看的视频id（避免返回时重复请求）

function switchTab(tabData) {
    currentTab = tabData;
    m.redraw();
}

function loadVideoSource(bvid, cid) {
    // 加载视频源
    toggleLoader(true);
    getVideoSource(bvid, cid, 64)
        .then((data_source) => {
            videoSourceInfo = data_source;
            toggleLoader(false);
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

const VideoPlayerView = {
    onupdate() {
        if (m.route.param("id") == lastParamStore) return;
        else {
            setTimeout(VideoPlayerView.oninit, 50);
        }
    },
    oninit() {
        // 如果已经加载过，则不再加载
        if (m.route.param("id") == lastParamStore) return;

        lastParamStore = m.route.param("id");

        // 处理aid还是bvid
        let option = { bvid: null, aid: null };
        if (lastParamStore.includes("BV")) {
            option.bvid = lastParamStore;
        } else if (lastParamStore.includes("av")) {
            option.aid = lastParamStore.replace("av", "");
        }

        // 获取视频详情
        toggleLoader(true);
        getVideoDetail(option.bvid, option.aid)
            .then((data_detail) => {
                toggleLoader(false);

                if (data_detail.aid == 0 && data_detail.cid == 0) {
                    toast("加载错误：" + data_detail.desc, 5000);
                    videoSourceInfo.url = "";
                    videoSourceInfo.backup_url = "";
                    m.redraw();
                }

                videoInfo = data_detail;

                // 加载视频
                loadVideoSource(videoInfo.bvid, videoInfo.cid);

                // 加载推荐列表
                toggleLoader(true);
                getVideosRelated(videoInfo.bvid)
                    .then((data_rcmd) => {
                        toggleLoader(false);
                        rcmdList = data_rcmd
                    })
                    .catch((error) => {
                        toggleLoader(false);
                    });
                
                getVideoReplies(videoInfo.aid)
                    .then((data_reply) => {
                        toggleLoader(false);
                        replyList = data_reply;
                    })
                    .catch((error) => {
                        toggleLoader(false);
                    });

            })
            .catch((error) => {
                toggleLoader(false);
            });
    },
    view(vnode) {
        return m(".container.player-view", [
            m(".col", { style: { flex: 1 } }, [
                m(".row-titlebar", " 🎬 " + videoInfo.title),
                m(".row-video", [
                    // 视频播放区域
                    (videoSourceInfo.code == 0) ? [
                        m("video.video-body", { src: videoSourceInfo.url, controls: true, autoplay: true })
                    ] : [
                        m("iframe.video-body", { src: videoSourceInfo.backup_url })
                    ]
                ])
            ]),
            m(".col", { style: { width: "330px" } }, [
                m(".row-tabbar", [
                    // TAB
                    m(".tab", { class: (currentTab == "detail") ? "selected" : null, onclick: () => switchTab("detail") }, "详情"),
                    m(".tab", { class: (currentTab == "replies") ? "selected" : null, onclick: () => switchTab("replies") }, "评论")
                ]),

                m(
                    ".row-detail",
                    (currentTab == "detail") ? [
                        // 详情
                        m(UserCard, { data: videoInfo.author }),
                        m(".stat", ` ▶️ ${videoInfo.stat.view}  👍 ${videoInfo.stat.like}  🟡 ${videoInfo.stat.coin}  ⭐ ${videoInfo.stat.fav}`),
                        m(".desc", m.trust(videoInfo.desc)),
                        m("br"),

                        // 分P视频
                        (videoInfo.pages.length) > 1 ? [
                            m(".pages-list", [
                                m("span", "视频选集"),
                                videoInfo.pages.map((item) => {
                                    return m(
                                        ".page-item",
                                        {
                                            onclick: (e) => loadVideoSource(videoInfo.bvid, item.cid)
                                        },
                                        `${(videoSourceInfo.cid == item.cid) ? " ▶ " : " "} ${item.page}. ${item.part}`
                                    )
                                })
                            ]),
                            m("br")
                        ] : "",

                        // 视频推荐
                        m("span", "推荐视频"),
                        rcmdList.map((item) => {
                            return m(VideoCardSlim, { data: item })
                        })
                    ] : [
                        // 评论
                        replyList.map((item) => {
                            return m(ReplyCard, { data: item })
                        })
                    ]
                )
            ])
        ]
        );
    }
};

export default VideoPlayerView;