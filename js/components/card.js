export const VideoCard = {
    view(vnode) {
        return m(
            ".video-card",
            {
                onclick: () => {
                    if (vnode.attrs.data?.bvid) {
                        m.route.set("/video/" + vnode.attrs.data.bvid);
                    } else {
                        m.route.set("/video/av" + vnode.attrs.data.aid);
                    }
                },
                title: vnode.attrs.data?.desc
            },
            [
                vnode.attrs.data.pic ? m("img.pic", { src: vnode.attrs.data.pic + "@288w_162h_1c.webp", loading: "eager" }) : "",
                m("p.title", vnode.attrs.data.title.replace(/<[^>]*>/g, '')),
                m("p.subtitle", vnode.attrs.data?.author?.name)
            ]
        )
    }
}

export const VideoCardSlim = {
    view(vnode) {
        return m(
            ".video-card-slim",
            {
                onclick: () => {
                    if (vnode.attrs.data?.bvid) {
                        m.route.set("/video/" + vnode.attrs.data.bvid);
                    } else {
                        m.route.set("/video/av" + vnode.attrs.data.aid);
                    }

                    vnode.attrs?.onclick();
                },
                title: vnode.attrs.data?.desc
            },
            [
                m("img.pic", { src: vnode.attrs.data.pic + "@288w_162h_1c.webp", loading: "eager" }),
                m(".info", [
                    m("p.title", vnode.attrs.data.title),
                    m("p.subtitle", vnode.attrs.data.author?.name)
                ])
            ]
        )
    }
}

export const LiveCard = {
    view(vnode) {
        return m(
            ".live-card",
            {
                onclick: () => {
                    m.route.set("/live/" + vnode.attrs.data.roomid);
                },
                title: vnode.attrs.data?.desc
            },
            [
                m("img.pic", { src: vnode.attrs.data.pic + "@288w_162h_1c.webp", loading: "eager" }),
                m("p.title", vnode.attrs.data.title.replace(/<[^>]*>/g, '')),
                m("p.subtitle", vnode.attrs.data.author.name)
            ]
        )
    }
}

export const ReplyCard = {
    view(vnode) {
        return m(
            ".reply-card",
            [
                m(
                    ".user",
                    [
                        m("img.face", { src: vnode.attrs.data.author.face + "@40w_40h_1c.webp", loading: "eager", onclick: () => m.route.set("/space/" + vnode.attrs.data.author.uid) }),
                        m("p.name", vnode.attrs.data.author.name)
                    ]
                ),
                m("p.content", vnode.attrs.data.content),
                m("p.detail", ` 👍 ${vnode.attrs.data.detail.like} ⏰ ${vnode.attrs.data.detail.time_desc.replace("发布", "")} 📍 ${vnode.attrs.data.detail.location.replace("IP属地：", "")}`),

                vnode.attrs.data.replies ? m(".more-replies",
                    {
                        onclick: () => { }
                    },
                    vnode.attrs.data.replies.map((item) => {
                        return m(
                            ".more-reply-item",
                            [
                                m("span.name", item.author.name),
                                ": ",
                                item.content
                            ]
                        )
                    })
                ) : ""
            ]
        )
    }
}

export const UserCard = {
    view(vnode) {
        return m(
            ".user-card",
            {
                onclick: () => {
                    m.route.set("/space/" + vnode.attrs.data?.uid);
                    vnode.attrs.onclick?.();
                },
                title: "点击查看该用户的空间"
            },
            [
                m("img.face", { src: vnode.attrs.data?.face + "@40w_40h_1c.webp", loading: "eager" }),
                m("p.name", vnode.attrs.data?.name),
                m("p.desc", vnode.attrs.data?.desc)
            ]
        )
    }
}


export const ChatBubble = {
    view(vnode) {
        return [
            m(
                ".chat-bubble",
                {
                    class: (vnode.attrs?.align == "left") ? "left" : "right"
                },
                
                (vnode.attrs.data.sender?.face) ? m("img.avatar", {
                    src: vnode.attrs.data.sender.face,
                    loading: "eager",
                    onclick: () => m.route.set("/space/" + vnode.attrs.data.sender?.uid),
                    title: vnode.attrs.data.sender.name,
                    onerror: (e) => {
                        e.target.src = "https://static.hdslb.com/images/member/noface.gif";
                    }
                }) : "",
                
                m(".bubble",
                    {
                        class: (vnode.attrs?.align == "left") ? "left" : "right"
                    },
                    [
                        vnode.attrs.data.content,
                        vnode.attrs.data.quote.video.aid ? m(VideoCard, { data: vnode.attrs.data.quote.video }) : "",
                        m("span.desc", vnode.attrs.data?.desc)
                    ]
                )
            )
        ]
    }
}