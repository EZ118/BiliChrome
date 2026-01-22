import { getUserInfo, getUserRecentDynamics, getUpDynamics } from "../api/index.js";
import { toggleLoader } from "../components/loader.js";
import { toast, openInNewTab } from "../util.js"
import { LiveCard, VideoCard } from "../components/card.js";

var lastParamStore = 0; // uid
var userInfo = {
    "name": "",
    "uid": 0,
    "face": "./img/loader.svg?",
    "sex": "",
    "sign": "",
    "level": 0,
    "vip": null,
    "liveroom": null,
    "birthday": null,
    "top_photo": "",
    "attestation": null,
    "is_followed": false
};
var dynamicList = [];
var videoList = [];

function loadUserInfo() {
    userInfo.uid = lastParamStore;

    toggleLoader(true);
    getUpDynamics(lastParamStore)
        .then((data) => {
            toggleLoader(false);
            videoList = data;
        })
        .catch((error) => {
            toggleLoader(false);
        });

    toggleLoader(true);
    getUserRecentDynamics(lastParamStore)
        .then((data) => {
            toggleLoader(false);
            dynamicList = data;
        })
        .catch((error) => {
            toggleLoader(false);
        });


    toggleLoader(true);
    getUserInfo(lastParamStore)
        .then((data) => {
            toggleLoader(false);
            if(!data) return;
            console.log(data)
            userInfo = data;
        })
        .catch((error) => {
            toggleLoader(false);
        })
}

const DynamicCard = {
    view(vnode) {
        const item = vnode.attrs.data;
        return m(".details-section", [
            item.title ? [
                m(".header", item.title),
                m("hr")
            ] : "",
            m(".content", [
                item.topic ? m(".topic", item.topic) : "",
                m("div", item.text),

                item.quote.image?.map((item, index) => {
                    return [
                        m(
                            "img.pic",
                            {
                                src: item + "@256w_256h_1e_1c_!web-dynamic.webp",
                                loading: "eager",
                                onclick: () => m.route.set("/image/" + encodeURIComponent(item))
                            }
                        ),
                        (index % 3 == 2) ? m("br") : "",
                    ]
                }),

                item.quote.video ? m(VideoCard, { data: item.quote.video }) : "",
                item.quote.live ? m(LiveCard, { data: item.quote.live }) : "",
                item.quote.dynamic ? m(DynamicCard, { data: item.quote.dynamic }) : ""
            ])
        ])
    }
}; // 不将该组件放在card.js中是因为其样式是space-view独有的，也无法复用

const SpaceView = {
    oninit() {
        if (lastParamStore != m.route.param("uid")) {
            lastParamStore = m.route.param("uid");
            loadUserInfo();
        }
    },
    view(vnode) {
        return m(".container.space-view", [
            m(
                ".user-info", [
                m("h3.detail", [
                    m("img.left-avatar", { src: userInfo.face }),
                    m("div.right-info", [
                        m(".name", userInfo.name),
                        m(".attestation", userInfo.attestation || "UID: " + userInfo.uid),
                        m(".more", `LV${userInfo.level} - 性别${userInfo.sex} ${userInfo.vip ? "- " + userInfo.vip : ""}`)
                    ]),
                ]),
                m(".sign", userInfo.sign),
                m(".subscribe-btn-group", [
                    userInfo.is_followed ? m("button.follow-btn", {
                        onclick: () => {
                            toast("无法使用该功能，请前往 bilibili.com 操作")
                        }
                    }, "已关注") : m("button.follow-btn", {
                        onclick: () => {
                            toast("无法使用该功能，请前往 bilibili.com 操作")
                        }
                    }, "添加关注"),

                    m(
                        "button.gotoweb-btn",
                        { onclick: () => openInNewTab(`https://space.bilibili.com/${userInfo.uid}`) },
                        " 🌐 在 BiliBili 中查看 "
                    )
                ])


            ]),
            m(".details-section", [
                m(".header", " 🎬 近期视频"), m("hr"),
                m(".content", videoList.map(item => m(VideoCard, { data: item })))
            ]),
            m(".details-section", m(".header", " 🎯 最近动态")),

            dynamicList.map(item => m(DynamicCard, { data: item }))
        ]);
    }
}

export default SpaceView;