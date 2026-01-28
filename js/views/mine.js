import { getMyInfo, getUserSubscription, getCollectionList, getCollectionById, getToView, getHistory } from "../api/index.js";
import { toggleLoader } from "../components/loader.js";
import { toast, openInNewTab } from "../util.js"
import { UserCard, VideoCardSlim, CollectionCard } from "../components/card.js";
import { showDialog } from "../components/dialog.js";
import { Icon } from "../components/icon.js";
import { managePlugin } from "../plugin.js";

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

function showUserCollection() {
    // 收藏夹
    toggleLoader(true);
    getCollectionList(userUid)
        .then((data_list) => {
            toggleLoader(false);
            showDialog({
                title: `收藏夹列表`,
                content: data_list.map(collection => m(CollectionCard, {
                    data: collection,
                    onclick: () => {
                        toggleLoader(true);
                        getCollectionById(collection.fid, collection.size)
                            .then((data_fav) => {
                                toggleLoader(false);
                                showDialog({
                                    title: "收藏夹：" + collection.title,
                                    content: data_fav.map(item => m(VideoCardSlim, { data: item }))
                                })
                            })
                            .catch((error) => {
                                toggleLoader(false);
                            });
                    }
                }))
            })
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

function showUserWatchLater() {
    toggleLoader(true);
    getToView()
        .then((data) => {
            toggleLoader(false);
            showDialog({
                title: "稍后再看",
                content: data.map(item => m(VideoCardSlim, { data: item }))
            })
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

function showUserWatchHistory() {
    toggleLoader(true);
    getHistory()
        .then((data) => {
            toggleLoader(false);
            showDialog({
                title: "观看历史（近30条）",
                content: data.map(item => m(VideoCardSlim, { data: item }))
            })
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

function showUserSubscription() {
    // 我的关注
    toggleLoader(true);
    getUserSubscription(userUid)
        .then((data) => {
            toggleLoader(false);
            showDialog({
                title: `全部订阅（${data.length}）`,
                content: data.map(item => m(UserCard, { data: item }))
            })
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

function showExtentionSettings() {
    toast("设置")
}

function showPluginManager() {
    managePlugin();
}

function showBackupRestore() {
    toast("备份与恢复")
}

const MineView = {
    oninit() {
        //showUserSubscription();
        if (!isInited) {
            isInited = true;

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
                        m(".functionItem", { onclick: () => showUserCollection() }, [
                            m(Icon, { name: "star" }),
                            m("span", "收藏夹")
                        ]),
                        m(".functionItem", { onclick: () => showUserWatchLater() }, [
                            m(Icon, { name: "max_video" }),
                            m("span", "稍后再看")
                        ]),
                        m(".functionItem", { onclick: () => showUserWatchHistory() }, [
                            m(Icon, { name: "clock" }),
                            m("span", "历史记录")
                        ]),
                        m(".functionItem", { onclick: () => showUserSubscription() }, [
                            m(Icon, { name: "grouplist" }),
                            m("span", "我的关注")
                        ]),
                    ])
                ]),
                m(".details-section", [
                    m(".header", " 📌 更多功能 "), m("hr"),
                    m(".content", [
                        m(".functionItem", { onclick: () => showExtentionSettings() }, [
                            m(Icon, { name: "settings" }),
                            m("span", "扩展设置")
                        ]),
                        m(".functionItem", { onclick: () => showPluginManager() }, [
                            m(Icon, { name: "extension" }),
                            m("span", "插件管理")
                        ]),
                        m(".functionItem", { onclick: () => showBackupRestore() }, [
                            m(Icon, { name: "database" }),
                            m("span", "备份/恢复")
                        ]),
                    ])
                ]),
            ])
        ]
    }
}

export default MineView;