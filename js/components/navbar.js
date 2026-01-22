import { Icon } from "./icon.js";

var selectedItem = "/home";
const navItem = [
    { route: "/home", icon: "home", title: "首页" },
    { route: "/dynamic", icon: "archive", title: "动态" },
    { route: "/search", icon: "search", title: "搜索" },
    { route: "/message", icon: "alert", title: "消息" },
    { route: "/mine", icon: "person", title: "我的" }
];

const NavView = {
    oncreate() {
        selectedItem = m.route.get() || "/home";
        m.redraw();

        setInterval(() => {
            if (selectedItem != m.route.get()){
                selectedItem = m.route.get();
                m.redraw();
            }
        }, 5000);
    },

    view(vnode) {
        return m("nav",
            navItem.map(item => {
                return m(
                    m.route.Link,
                    {
                        href: item.route,
                        title: item.name,
                        options: { replace: true },
                        onclick: () => selectedItem = item.route
                    },
                    m("div", { class: `item${(selectedItem == item.route ? " selected" : "")}` }, m(Icon, { name: item.icon }))
                )
            })
        );
    }
}

export default NavView;