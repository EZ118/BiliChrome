import { Icon } from "./icon.js";

const whiteList = ['/home', '/dynamic', '/search', '/message', '/mine'];
function isBackBtnNeeded() {
    const currentRoute = m.route.get();
    return !whiteList.includes(currentRoute);
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
                m("input[type='text'].SearchBox", { placeholder: " 🔍 键入以搜索..." })
            ]),
            m(".right", [
                m("button", { title: "稍后再看" }, m(Icon, { name: "max_video" })),
                m("button", { title: "播放历史" }, m(Icon, { name: "clock" })),
                m("button", { title: "插件管理" }, m(Icon, { name: "extension" })),
            ])
        ]);
    }
}
export default Toolbar;