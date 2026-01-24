import { getMyInfo, getUserSubscription } from "../api/index.js";
import { toggleLoader } from "../components/loader.js";
import { toast, openInNewTab } from "../util.js"
import { UserCard, VideoCard } from "../components/card.js";
import { showDialog } from "../components/dialog.js";
import { Icon } from "../components/icon.js";

import SpaceView from "./space.js";

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
    "is_followed": false,
    "follower": 0,
    "following": 0
};
var isInited = false;
var userUid = 0;    // uid
var dynamicList = [];

function loadUserInfo() {
    toggleLoader(true);
    getMyInfo()
        .then((data) => {
            toggleLoader(false);
            userInfo = data;
            userUid = data.uid;
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

function showUserSubscription() {
    getUserSubscription(userUid)
        .then((data) => {
            toggleLoader(false);
            showDialog({
                title: "全部订阅",
                content: data.map(item => m(UserCard, { data: item }))
            })
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

const MineView = {
    oninit() {
        //showUserSubscription();
        if (!isInited) {
            isInited = true;
            loadUserInfo();
        }
    },
    view(vnode) {
        return [
            m(".container.mine-view", [
                m(".user-info", [
                    m(".detail", [
                        m("img.left-avatar", { src: userInfo.face }),
                        m("div.right-info", [
                            m(".name", userInfo.name),
                            m(".attestation", userInfo.attestation || "UID: " + userInfo.uid),
                            m(".more", `LV${userInfo.level} - 性别${userInfo.sex} - ${userInfo.follower}粉丝 ${userInfo.vip ? "- " + userInfo.vip : ""}`)
                        ]),
                    ]),
                    m(".sign", userInfo.sign),
                    m(".subscribe-btn-group", [
                        m(
                            "button.follow-btn",
                            { onclick: () => m.route.set(`/space/${userInfo.uid}`) },
                            " 🌈 我的空间 "
                        ),
                        m(
                            "button.gotoweb-btn",
                            { onclick: () => openInNewTab(`https://space.bilibili.com/${userInfo.uid}`) },
                            " 🌐 在 BiliBili 中查看 "
                        )
                    ])
                ]),

                m(".details-section", [
                    m(".header", " 📌 我的口袋"), m("hr"),
                    m(".content", [
                        m(".functionItem", [
                            m(Icon, { name: "star" }),
                            m("span", "收藏夹")
                        ]),
                        m(".functionItem", [
                            m(Icon, { name: "star" }),
                            m("span", "稍后再看")
                        ]),
                        m(".functionItem", [
                            m(Icon, { name: "star" }),
                            m("span", "历史记录")
                        ]),
                        m(".functionItem", { onclick: () => showUserSubscription() }, [
                            m(Icon, { name: "" }),
                            m("span", "我的关注")
                        ]),
                    ])
                ]),
                m(".details-section", [
                    m(".header", " 📌 更多功能 "), m("hr"),
                    m(".content", [
                        m(".functionItem", [
                            m(Icon, { name: "star" }),
                            m("span", "扩展设置")
                        ]),
                        m(".functionItem", [
                            m(Icon, { name: "star" }),
                            m("span", "插件管理")
                        ]),
                        m(".functionItem", [
                            m(Icon, { name: "star" }),
                            m("span", "备份与恢复")
                        ]),
                    ])
                ]),
            ])
        ]
    }
}

export default MineView;