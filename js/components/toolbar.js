import { getToView, getHistory } from "../api/index.js";
import { Icon } from "./icon.js";
import { toggleLoader } from "../components/loader.js";
import { VideoCardSlim } from "../components/card.js";
import { showDialog } from "../components/dialog.js";

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


const Toolbar = {
    oninit() {

    },

    view(vnode) {
        return m("header", [
            m(".left", [
                !isBackBtnNeeded() ? [
                    m("img.AppIcon", { src: "./img/icon_64x64.png" })
                ] : [
                    m(
                        "button.nav-back",
                        {
                            onclick: () => window.history.back()
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
                m("button", { title: "插件管理" }, m(Icon, { name: "extension" })),
            ])
        ]);
    }
}
export default Toolbar;