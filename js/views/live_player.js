import { toggleLoader } from "../components/loader.js";
import {  } from "../api/index.js";
import { Icon } from "../components/icon.js";
import { toast } from "../util.js";

var liveInfo = {
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
var lastParamStore = ""; // 上一次观看的视频id（避免返回时重复请求）

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

const LivePlayerView = {
    onupdate() {
        if (m.route.param("id") == lastParamStore) return;
        else {
            setTimeout(LivePlayerView.oninit, 50);
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

                liveInfo = data_detail;

                // 加载视频
                loadVideoSource(liveInfo.bvid, liveInfo.cid);

                // 加载推荐列表
                toggleLoader(true);
                getVideosRelated(liveInfo.bvid)
                    .then((data_rcmd) => {
                        toggleLoader(false);
                        rcmdList = data_rcmd
                    })
                    .catch((error) => {
                        toggleLoader(false);
                    });

                getVideoReplies(liveInfo.aid)
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
                m(".row-titlebar", " 🎥 " + liveInfo.title),
                m(".row-video", [
                    m("video.video-body", { src: videoSourceInfo.url, controls: true, autoplay: true })
                ])
            ]),
            m(".col", { style: { width: "330px" } }, [
                m(
                    ".row-detail",
                    [
                        m(UserCard, { data: liveInfo.author }),
                        m(".stat", ` ▶️ ${liveInfo.stat.view}  👍 ${liveInfo.stat.like}  🟡 ${liveInfo.stat.coin}  ⭐ ${liveInfo.stat.fav}`),
                        m(".desc", m.trust(liveInfo.desc)),
                        m("br"),

                        rcmdList.map((item) => {
                            return m(VideoCardSlim, { data: item })
                        })
                    ]
                )
            ])
        ]
        );
    }
};

export default LivePlayerView;