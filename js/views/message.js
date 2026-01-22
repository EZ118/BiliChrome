import { toggleLoader, isLoading } from "../components/loader.js";
import { getMsgSessions, getMsgSessionDetail, getReplyMe, getAtMe, getLikeMe, getSysMsg } from "../api/index.js";
import { ChatBubble } from "../components/card.js";

var hasInited = false;
var sessionList = [];
var chatHistory = [];
var currentSession = {
    uid: 0,
    name: "加载中...",
    face: "",
    has_update: false
};


function loadSessionList() {
    toggleLoader(true);
    getMsgSessions()
        .then((data) => {
            const defaultFace = 'data:image/svg+xml;charset=utf-8;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2IDYuNUg1LjI1YTEuNzUgMS43NSAwIDAgMC0xLjc0NCAxLjYwNmwtLjAwNC4xTDExIDEyLjE1M2w2LjAzLTMuMTc0YTMuNDg5IDMuNDg5IDAgMCAwIDIuOTcuOTg1djYuNzg2YTMuMjUgMy4yNSAwIDAgMS0zLjA2NiAzLjI0NUwxNi43NSAyMEg1LjI1YTMuMjUgMy4yNSAwIDAgMS0zLjI0NS0zLjA2NkwyIDE2Ljc1di04LjVhMy4yNSAzLjI1IDAgMCAxIDMuMDY2LTMuMjQ1TDUuMjUgNWgxMS4wODdBMy40ODcgMy40ODcgMCAwIDAgMTYgNi41Wm0yLjUgMy4zOTktNy4xNSAzLjc2NWEuNzUuNzUgMCAwIDEtLjYwMy4wNDJsLS4wOTYtLjA0MkwzLjUgOS45djYuODVhMS43NSAxLjc1IDAgMCAwIDEuNjA2IDEuNzQ0bC4xNDQuMDA2aDExLjVhMS43NSAxLjc1IDAgMCAwIDEuNzQ0LTEuNjA3bC4wMDYtLjE0M1Y5Ljg5OVpNMTkuNSA0YTIuNSAyLjUgMCAxIDEgMCA1IDIuNSAyLjUgMCAwIDEgMC01WiIgZmlsbD0iIzg4OCIvPjwvc3ZnPg==';
            sessionList = [
                {
                    uid: "replies",
                    name: "回复我的 📌 ",
                    face: defaultFace
                },
                {
                    uid: "atme",
                    name: "@我的 📌 ",
                    face: defaultFace
                },
                {
                    uid: "likes",
                    name: "收到的赞 📌 ",
                    face: defaultFace
                },
                {
                    uid: "system",
                    name: "系统通知 📌 ",
                    face: defaultFace
                },
                ...data
            ];
            toggleLoader(false);
        })
        .catch((error) => {
            toggleLoader(false);
        })
}

function switchTo(obj) {
    currentSession = obj;
    toggleLoader(true);

    if (obj.uid === "replies") {
        getReplyMe()
            .then((data) => {
                chatHistory = data.reverse();
                toggleLoader(false);
            })
            .catch((error) => {
                toggleLoader(false);
            })
    } else if (obj.uid === "atme") {
        getAtMe()
            .then((data) => {
                chatHistory = data.reverse();
                console.log(chatHistory)
                toggleLoader(false);
            })
            .catch((error) => {
                toggleLoader(false);
            })
    } else if (obj.uid === "likes") {
        getLikeMe()
            .then((data) => {
                chatHistory = data.reverse();
                toggleLoader(false);
            })
            .catch((error) => {
                toggleLoader(false);
            })
    } else if (obj.uid === "system") {
        getSysMsg()
            .then((data) => {
                chatHistory = data.reverse();
                toggleLoader(false);
            })
            .catch((error) => {
                toggleLoader(false);
            })
    } else {
        getMsgSessionDetail(obj.uid)
            .then((data) => {
                console.log(data)
                chatHistory = data;
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
            loadSessionList();
        }
    },
    onupdate() {
        const dialogContent = document.querySelector('.message-view .chatHistory');
        if (dialogContent) {
            dialogContent.scrollTop = dialogContent.scrollHeight;
        }
    },
    view() {
        return m(".container.message-view", [
            m(".left", [
                sessionList.map((item) => {
                    return m(
                        ".up-card",
                        {
                            class: (currentSession.uid == item.uid) ? "selected" : "",
                            onclick: () => switchTo(item)
                        },
                        [
                            m("img.face", { src: `${item.face}${!isNaN(item.uid) ? "@40w_40h_1c.webp" : ""}`, loading: "eager" }),
                            m("p.name", item.name)
                        ]
                    );
                })
            ]),

            m(".right", (currentSession.uid) ? [
                m(".titlebar", " 💬 " + currentSession.name),
                m(".chatHistory", [
                    chatHistory.map((item) => {
                        return m(ChatBubble, { data: item, align: (currentSession.uid == item.sender.uid || isNaN(item.uid)) ? "left" : "right" })
                    })
                ])
            ] : [])
        ]);
    }
};

export default DynamicView;