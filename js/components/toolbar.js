import { getToView, getHistory } from "../api/index.js";
import { Icon } from "./icon.js";
import { toast } from "../util.js";
import { toggleLoader } from "../components/loader.js";
import { VideoCardSlim } from "../components/card.js";
import { showDialog } from "../components/dialog.js";
import { menuCommands, emit } from "../plugin.js";

const whiteList = ['/home', '/dynamic', '/search', '/message', '/mine'];
function isBackBtnNeeded() {
    const currentRoute = m.route.get();
    return !whiteList.includes(currentRoute);
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

var isMenuVisible = false;
function toggleMenu() {
    isMenuVisible = !isMenuVisible;
    m.redraw();
}

var lastRouteStore = "";

const Toolbar = {
    oncreate() {
        document.addEventListener('click', (event) => {
            if (isMenuVisible && !document.querySelector(".AppMenu").contains(event.target) && event.target.title != "更多菜单") {
                toggleMenu();
            }
        });
    },
    onupdate(){
        // 辅助plugin辅助触发清除菜单
        if(m.route.get() != lastRouteStore) {
            emit("routeChange", {
                route: m.route.get(),
                param: m.route.param()
            });
            lastRouteStore = m.route.get();
        }
    },
    view(vnode) {
        return [
            m("header", [
                m(".left", [
                    !isBackBtnNeeded() ? [
                        m("img.AppIcon", { src: "./img/icon_64x64.png" })
                    ] : [
                        m(
                            "button.NavBack",
                            {
                                onclick: () => {
                                    window.history.back();
                                    emit("navigateBack", {
                                        route: m.route.get(),
                                        param: m.route.param()
                                    });
                                }
                            },
                            m(Icon, { name: "arrowleft" })
                        )
                    ],

                    m("p.AppTitle", "BiliScape")
                ]),
                m(".center", [
                    m("input[type='text'].SearchBox", {
                        placeholder: " 🔍 键入以搜索...",
                        onkeyup: (e) => {
                            if (e.key == 'Enter') {
                                e.target.blur();
                                m.route.set("/search/" + encodeURIComponent(e.target.value))
                            }
                        }
                    })
                ]),
                m(".right", [
                    m("button", { title: "稍后再看", onclick: () => showUserWatchLater() }, m(Icon, { name: "max_video" })),
                    m("button", { title: "播放历史", onclick: () => showUserWatchHistory() }, m(Icon, { name: "clock" })),
                    m("button", { title: "更多菜单", onclick: () => toggleMenu() }, m(Icon, { name: "appfolder" })),
                ])
            ]),
            isMenuVisible ? m(".AppMenu", [
                (menuCommands.length != 0) ? menuCommands.map(item => {
                    return m(".item", {
                        onclick: () => {
                            item.callback();
                            toggleMenu();
                        }
                    }, item.name)
                }) : "无菜单项目"
            ]) : ""
        ];
    }
}
export default Toolbar;