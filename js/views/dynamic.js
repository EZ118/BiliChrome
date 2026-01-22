import { toggleLoader } from "../components/loader.js";
import { getDynamicUpList, getAllDynamics, getUpDynamics } from "../api/index.js";
import { VideoCard } from "../components/card.js";

var hasInited = false;
var upList = [];
var dynamicList = [];
var currentUp = {
    uid: 0,
    name: "加载中...",
    face: "",
    has_update: false
};


function loadUpList() {
    toggleLoader(true);
    getDynamicUpList()
        .then((data_uplist) => {
            upList = [{
                uid: "all",
                name: "全部动态",
                face: "https://static.hdslb.com/images/member/noface.gif",
                has_update: false
            }, ...data_uplist];
            toggleLoader(false);
        })
        .catch((error) => {
            toggleLoader(false);
        })
}

function switchTo(obj) {
    currentUp = obj;
    toggleLoader(true);

    if (obj.uid === "all") {
        getAllDynamics()
            .then((data) => {
                dynamicList = data;
                toggleLoader(false);
            })
            .catch((error) => {
                toggleLoader(false);
            })
    } else {
        getUpDynamics(obj.uid)
            .then((data) => {
                dynamicList = data;
                toggleLoader(false);
            })
            .catch((error) => {
                toggleLoader(false);
            })
    }
}

const DynamicView = {
    oninit() {
        if (!hasInited) {
            hasInited = true;
            loadUpList();
        }
    },
    view() {
        return m(".container.dynamic-view", [
            m(".left", [
                upList.map((item) => {
                    return m(
                        ".up-card",
                        {
                            class: (currentUp.uid == item.uid) ? "selected" : "",
                            onclick: () => switchTo(item)
                        },
                        [
                            m("img.face", { src: `${item.face}${!isNaN(item.uid) ? "@40w_40h_1c.webp" : ""}`, loading: "eager" }),
                            m("p.name", item.name + (item.has_update ? " ° " : ""))
                        ]
                    );
                })
            ]),

            m(".right", (currentUp.uid) ? [
                m(".titlebar", " ✦ " + currentUp.name),
                m(".dynamicList", [
                    dynamicList.map((item) => {
                        return m(VideoCard, { data: item })
                    })
                ])
            ] : [])
        ]);
    }
};

export default DynamicView;