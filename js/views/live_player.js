import { toggleLoader } from "../components/loader.js";
import { getLiveroomDetail, getLiveStreamSource, getLiveChatHistory } from "../api/index.js";
import { Icon } from "../components/icon.js";
import { toast } from "../util.js";
import { ChatBubble } from "../components/card.js";

var liveInfo = {
    "title": "",
    "pic": "",
    "desc": "",
    "catagory": "",
    "tags": "",
    "time": "",
    "roomid": "",
    "author": {
        "name": null,
        "uid": null,
        "face": null
    },
    "stat": {
        "online": 0
    }
}; // 视频基本信息存储
var liveStreamInfo = {
    code: 0,
    url: "",
    length: 0,
    backup_url: `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=0&cid=0`,
    roomid: 0
}; // 视频播放链接存储
var lastParamStore = ""; // 上一次观看的roomid（避免返回时重复请求）
var chatHistory = [];

function loadLiveStreamSource(roomid) {
    // 加载视频源
    toggleLoader(true);
    getLiveStreamSource(roomid, 2)
        .then((data_source) => {
            liveStreamInfo = data_source;
            toggleLoader(false);
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

function loadChatHistory(roomid) {
    getLiveChatHistory(roomid)
        .then((data) => {
            chatHistory = data;
        })
}

const LivePlayerView = {
    oninit() {
        // 如果已经加载过，则不再加载
        if (m.route.param("id") == lastParamStore) return;

        lastParamStore = m.route.param("id");

        // 获取视频详情
        toggleLoader(true);
        getLiveroomDetail(lastParamStore)
            .then((data_detail) => {
                toggleLoader(false);

                if (data_detail.aid == 0 && data_detail.cid == 0) {
                    toast("加载错误：" + data_detail.desc, 5000);
                    liveStreamInfo.url = "";
                    liveStreamInfo.backup_url = "";
                    m.redraw();
                }

                liveInfo = data_detail;

                // 加载视频
                loadLiveStreamSource(liveInfo.roomid);

                // 加载视频弹幕
                loadChatHistory(liveInfo.roomid);
            })
            .catch((error) => {
                toggleLoader(false);
            });
    },
    view(vnode) {
        return m(".container.liveplayer-view", [
            m(".col", { style: { flex: 1 } }, [
                m(".row-titlebar", " 🎥 " + liveInfo.title),
                m(".row-video", [
                    // 视频播放区域
                    (liveStreamInfo.code == 0) ? [
                        // 欸，我发现现代浏览器直接插入m3u8链接也可以播放嘛，那目前就不用hls-js了
                        m("video.video-body", { src: liveStreamInfo.url, controls: false, autoplay: true })
                    ] : [
                        m("iframe.video-body", { src: liveStreamInfo.backup_url })
                    ]
                ])
            ]),
            m(".col", { style: { width: "330px" } }, [
                m(
                    ".row-detail",
                    [
                        m(".stat", ` ⏰ ${liveInfo.time}  👨‍👨‍👦‍👦 ${liveInfo.stat.online} `),
                        m(".desc", ` 🎯 分区: ${liveInfo.catagory}`),
                        m(".desc", ` 🏷️ 标签: ${liveInfo.tags || "-"}`),
                        m("br"),

                        chatHistory.map(item => m(ChatBubble, { data: item, align: "left" }))
                    ]
                )
            ])
        ]
        );
    }
};

export default LivePlayerView;