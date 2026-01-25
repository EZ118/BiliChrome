import { timestampToDate } from "../util.js";

const baseUrl = 'https://api.bilibili.com/';
const baseLiveUrl = 'https://api.live.bilibili.com/';
const baseChatUrl = 'https://api.vc.bilibili.com/';
const baseMsgUrl = 'https://message.bilibili.com/'
const defaultFace = 'https://static.hdslb.com/images/member/noface.gif?';

/* 主页推荐部分 */
export function getHomeRecommend() {
    return native.requestGet(`${baseUrl}x/web-interface/index/top/rcmd?fresh_type=3&version=1&ps=14`)
        .then((data) => {
            return data.data.item.map((item) => ({
                bvid: item.bvid,
                aid: item.id,
                pic: item.pic,
                title: item.title,
                desc: item.title,
                author: { uid: item.owner.mid, name: item.owner.name },
            }));
        })
        .catch(error => console.error('Error fetching recommended videos:', error));
}

export function getHomePopular(page) {
    return native.requestGet(`${baseUrl}x/web-interface/popular?ps=40&pn=${page}`)
        .then((data) => {
            return data.data.list.map((item) => ({
                bvid: item.bvid,
                aid: item.aid,
                pic: item.pic,
                title: item.title,
                desc:
                    `- 点赞数量: ${item.stat.like}\n- 视频简介: ${item.desc ? item.desc : "无简介"
                    }` +
                    (item.rcmd_reason.content
                        ? `\n- 推荐原因: ${item.rcmd_reason.content}`
                        : ""),
                author: { uid: item.owner.mid, name: item.owner.name },
            }));
        })
        .catch(error => console.error('Error fetching popular videos:', error));
}

export function getHomeLiveRooms(page) {
    return native.requestGet(`${baseLiveUrl}room/v1/Index/getShowList?page=${page}&page_size=20&platform=web`)
        .then((data) => {
            return data.data.map((item) => ({
                roomid: item.roomid,
                pic: item.user_cover,
                title: item.title,
                desc: `- 分区: ${item.area_name}/${item.area_v2_name}`,
                author: { uid: item.uid, name: item.uname },
            }));
        })
        .catch(error => console.error('Error fetching recommended live rooms:', error));
}

/* 动态部分 */
export function getDynamicUpList() {
    return native.requestGet(`${baseUrl}x/polymer/web-dynamic/v1/portal?up_list_more=0`)
        .then((data) => {
            return data.data.up_list.map((item) => ({
                uid: item.mid,
                name: item.uname,
                face: item.face,
                has_update: item.has_update
            }));
        })
        .catch(error => console.error('Error fetching up list in dynamic section:', error));
}

export function getAllDynamics() {
    let jsonList = [];
    let promises = [];
    let offset = null;

    for (let page = 1; page <= 1; page++) {
        promises.push(
            native.requestGet(`${baseUrl}x/polymer/web-dynamic/v1/feed/all?timezone_offset=-480&offset=${offset || ""}&type=video&platform=web&page=${page}`)
                .then((data) => {
                    jsonList = jsonList.concat(data.data.items.map(item => ({
                        bvid: item.modules.module_dynamic.major.archive.bvid,
                        aid: item.modules.module_dynamic.major.archive.aid,
                        pic: item.modules.module_dynamic.major.archive.cover,
                        title: item.modules.module_dynamic.major.archive.title,
                        desc: (item.modules.module_dynamic.desc ? ("动态内容: " + item.modules.module_dynamic.desc.text + "\n") : "") +
                            '点赞数量: ' + item.modules.module_stat.like.count + '\n视频简介: ' +
                            item.modules.module_dynamic.major.archive.desc,
                        author: { uid: item.modules.module_author.mid, name: item.modules.module_author.name }
                    })));

                    offset = data.data.offset;
                })
                .catch(error => { throw error; })
        );
    }

    return Promise.all(promises)
        .then(() => {
            return jsonList;
        })
        .catch((error) => console.error("Error fetching all dynamics:", error))
}

export function getUpDynamics(uid) {
    return native.requestGet(`${baseUrl}x/polymer/web-dynamic/v1/feed/space?offset=&host_mid=${uid}&timezone_offset=-480&platform=web&type=video`)
        .then((data) => {
            return data.data.items.map(item => ({
                bvid: item.modules.module_dynamic.major.archive.bvid,
                aid: item.modules.module_dynamic.major.archive.aid,
                pic: item.modules.module_dynamic.major.archive.cover,
                title: item.modules.module_dynamic.major.archive.title,
                desc: (item.modules.module_dynamic.desc ? ("动态内容: " + item.modules.module_dynamic.desc.text + "\n") : "") +
                    '点赞数量: ' + item.modules.module_stat.like.count + '\n视频简介: ' +
                    item.modules.module_dynamic.major.archive.desc,
                author: { uid: item.modules.module_author.mid, name: item.modules.module_author.name }
            }));
        })
        .catch(error => console.error('Error fetching dynamics of the target up:', error));
}

/* 搜索部分 */
export function getSearchSuggestions(keyword) {
    return native.requestGet(`${baseUrl}main/suggest?term=${encodeURIComponent(keyword)}`)
        .then((data) => {
            return data.result.tag.map(item => item.value);
        })
        .catch(error => console.error('Error fetching search suggestions:', error));
}

export function getSearchResults(keyword, search_type, page = 1) {
    // search_type: video/bili_user/live_room
    return native.requestGet(`${baseUrl}x/web-interface/wbi/search/type?search_type=${search_type}&keyword=${encodeURIComponent(keyword)}&page=${page}`)
        .then((data) => {
            if (!data.data.result || data.data.result.length == 0) { return []; }

            switch (search_type) {
                case "video":
                    return data.data.result.map(item => ({
                        bvid: item.bvid,
                        aid: item.aid,
                        pic: item.pic.includes("://") ? item.pic : "https:" + item.pic,
                        title: item.title,
                        desc: item.description,
                        author: { uid: item.mid, name: item.author }
                    }));

                case "bili_user":
                    return data.data.result.map(item => ({
                        uid: item.mid,
                        name: item.uname,
                        face: item.upic.includes("://") ? item.upic : "https:" + item.upic,
                        desc: item.usign,
                        sign: item.usign
                    }));

                case "live":
                    return data.data.result.live_room.map(item => ({
                        roomid: item.roomid,
                        pic: item.cover.includes("://") ? item.cover : "https:" + item.cover,
                        title: item.title,
                        desc: '- 开始时间: ' + item.live_time,
                        author: { uid: item.uid, name: item.uname }
                    }));

                default:
                    console.error('Unsupported search type:', search_type);
                    break;
            }
        })
        .catch(error => console.error('Error fetching search results:', error));
}

/* 消息部分 */
export function getReplyMe() {
    return native.requestGet(`${baseUrl}x/msgfeed/reply?platform=web&build=0&mobi_app=web&ps=40`)
        .then((data) => {
            return data.data.items.map(item => ({
                content: item.item.source_content,
                desc: timestampToDate(item.reply_time * 1000),
                quote: {
                    video: {
                        bvid: null,
                        aid: item.item.subject_id,
                        title: item.item.title,
                        pic: item.item.image,
                        desc: item.item.desc,
                        author: null
                    }
                },
                sender: { uid: item.user.mid, name: item.user.nickname, face: item.user.avatar }
            }));
        }).catch(error => console.error('Error fetching reply me:', error));
}

export function getAtMe() {
    return native.requestGet(`${baseUrl}x/msgfeed/at?build=0&mobi_app=web`)
        .then((data) => {
            return data.data.items.map(item => ({
                content: item.item.source_content,
                desc: "在" + item.item.business + "中@了你",
                quote: {
                    video: {
                        bvid: null,
                        aid: item.item.subject_id,
                        title: item.item.title,
                        pic: item.item.image,
                        desc: null,
                        author: null
                    }
                },
                sender: { uid: item.user.mid, name: item.user.nickname, face: item.user.avatar }
            }));
        }).catch(error => console.error('Error fetching @me:', error));
}

export function getLikeMe() {
    return native.requestGet(`${baseUrl}x/msgfeed/like?platform=web&build=0&mobi_app=web`)
        .then((data) => {
            return data.data.total.items.map(item => {
                let userlist = "";
                item.users.forEach((user, index) => {
                    userlist += user.nickname;
                    if (index != item.users.length - 1) {
                        userlist += "、"
                    }
                });

                const videoAid = item.item.native_uri.split("/")[3].split("?")[0];

                return {
                    content: userlist + " 点赞了你的" + item.item.business,
                    desc: item.item.detail_name,
                    quote: {
                        video: {
                            bvid: null,
                            aid: videoAid,
                            title: item.item.title,
                            pic: item.item.image,
                            desc: item.item.desc,
                            author: null
                        }
                    },
                    sender: { uid: item.users[0].mid, name: item.users[0].nickname, face: item.users[0].avatar }
                }
            });
        }).catch(error => console.error('Error fetching like me:', error));
}

export function getSysMsg() {
    return native.requestGet(`${baseMsgUrl}x/sys-msg/query_user_notify?page_size=20&build=0&mobi_app=web`)
        .then((data) => {
            return data.data.system_notify_list.map(item => ({
                content: `【${item.title}】  ${item.content.replace(/#\{[^}]+\}\{"([^"]+)"\}/g, '『$1』')}`,
                desc: item.time_at,
                quote: {
                    video: {
                        bvid: null,
                        aid: null,
                        title: null,
                        pic: null,
                        desc: null,
                        author: null
                    }
                },
                sender: { uid: 0, name: item.source.name, face: item.source.logo }
            }));
        }).catch(error => console.error('Error fetching @me:', error));
}

export function getMsgSessions() {
    /* 获取聊天列表 */
    return native.requestGet(`${baseChatUrl}session_svr/v1/session_svr/get_sessions?session_type=1&group_fold=1&unfollow_fold=0&sort_rule=2&mobi_app=web`)
        .then((sessionInfo) => {
            const uidList = sessionInfo.data.session_list.map((item) => item.talker_id);
            return getUsersInfo(uidList)
                .then((userInfo) => {
                    return sessionInfo.data.session_list.map(item => ({
                        uid: item.talker_id,
                        name: userInfo[item.talker_id].name,
                        face: userInfo[item.talker_id].face
                    }));
                });
        }).catch(error => console.error('Error fetching message sessions:', error));
}

export function getMsgSessionDetail(uid) {
    return native.requestGet(`${baseChatUrl}svr_sync/v1/svr_sync/fetch_session_msgs?talker_id=${uid}&session_type=1&size=60`)
        .then((msgInfo) => {
            return msgInfo.data.messages.map(item => {
                const msgCard = JSON.parse(item.content);
                return {
                    content: msgCard.content,
                    desc: timestampToDate(item.timestamp * 1000),
                    quote: {
                        video: {
                            bvid: null,
                            aid: msgCard.id,
                            pic: msgCard.thumb,
                            title: msgCard.title,
                            desc: msgCard.title,
                            author: { uid: msgCard.sender_uid, name: msgCard.author }
                        }
                    },
                    sender: { uid: item.sender_uid },
                    receiver: { uid: item.receiver_id }
                };
            }).reverse();
        }).catch(error => console.error('Error fetching message session detail:', error));
}

export function getUsersInfo(uids) {
    let uidstr = "";
    uids.map(item => uidstr += item + ",");

    return native.requestGet(`https://api.bilibili.com/x/polymer/pc-electron/v1/user/cards?uids=${uidstr.slice(0, -1)}&mobi_app=web`)
        .then((data) => {
            return data.data;
        }).catch(error => console.error('Error fetching data:', error));
}

/* 用户信息部分 */
export function getUserCard(uid) {
    return native.requestGet(`${baseUrl}x/web-interface/card?mid=${uid}`)
        .then((data) => {
            return {
                "name": data.data.card.name,
                "uid": data.data.card.mid,
                "face": data.data.card.face,
                "sex": data.data.card.sex,
                "sign": data.data.card.sign,
                "level": data.data.card.level_info.current_level,
                "vip": (data.data.card.vip.status != 0) ? data.data.card.vip.label.text : null,
                "liveroom": null,
                "birthday": null,
                "attestation": data.data.card.official_verify.desc,
                "is_followed": data.data.following,
                "follower": data.data.follower,
                "following": data.data.card.attention
            };
        })
        .catch(error => {
            console.error("Error fetching user card: ", error);
        });
}
export function getUserInfo(uid) {
    // 注意，该API易拦截，因此项目中弃用
    return native.requestGet(`${baseUrl}x/space/acc/info?mid=${uid}`)
        .then((data) => {
            return {
                "name": data.data.name,
                "uid": data.data.mid,
                "face": data.data.face,
                "sex": data.data.sex,
                "sign": data.data.sign,
                "level": data.data.level,
                "vip": (data.data.vip.status != 0) ? data.data.vip.label.text : null,
                "liveroom": (data.data.live_room && data.data.live_room?.liveStatus != 0) ? data.data.live_room.roomid : null,
                "birthday": data.data.birthday || null,
                "attestation": (data.data.attestation.type != 0) ? data.data.attestation.common_info.title : null,
                "is_followed": data.data.is_followed
            };
        })
        .catch(error => {
            console.error("Error fetching user profile: ", error);
        });
}
export function getUserRecentDynamics(uid) {
    // 获取近期动态（多形态）

    function parseCard(item) {
        switch (item.type) {
            case "DYNAMIC_TYPE_AV":
                if (!item.modules.module_dynamic.major) return;
                return {
                    type: "video",
                    id: item.id_str,
                    topic: item.modules.module_dynamic.topic?.name,
                    title: null,
                    text: item.modules.module_dynamic.desc?.text,
                    time: timestampToDate(item.modules.module_author.pub_ts * 1000),
                    quote: {
                        video: {
                            bvid: item.modules.module_dynamic.major.archive.bvid,
                            aid: item.modules.module_dynamic.major.archive.aid,
                            pic: item.modules.module_dynamic.major.archive.cover,
                            title: item.modules.module_dynamic.major.archive.title,
                            desc: item.modules.module_dynamic.major.archive.desc,
                            author: { uid: item.modules.module_author.mid, name: item.modules.module_author.name }
                        }
                    }
                };

            case "DYNAMIC_TYPE_WORD":
            case "DYNAMIC_TYPE_DRAW":
                return {
                    type: "text",
                    id: item.id_str,
                    topic: item.modules.module_dynamic.topic?.name,
                    title: item.modules.module_dynamic.major?.opus.title,
                    text: item.modules.module_dynamic.major?.opus.summary.text,
                    time: timestampToDate(item.modules.module_author.pub_ts * 1000),
                    quote: {
                        image: item.modules.module_dynamic.major?.opus.pics.map(img => img.url)
                    }
                };

            case "DYNAMIC_TYPE_ARTICLE":
                return {
                    type: "article",
                    id: item.id_str,
                    topic: item.modules.module_dynamic.topic?.name,
                    title: item.modules.module_dynamic.major?.opus.title,
                    text: item.modules.module_dynamic.major?.opus.summary.text,
                    time: timestampToDate(item.modules.module_author.pub_ts * 1000),
                    quote: {
                        article: {
                            url: item.modules.module_dynamic.major?.opus.jump_url,
                            title: item.modules.module_dynamic.major?.opus.title,
                            desc: item.modules.module_dynamic.major?.opus.summary.text,
                        },
                        image: item.modules.module_dynamic.major?.opus.pics.map(img => img.url)
                    }
                };

            case "DYNAMIC_TYPE_LIVE_RCMD":
                const live_item = JSON.parse(item.modules.module_dynamic.major.live_rcmd.content);
                return {
                    type: "live",
                    id: item.id_str,
                    topic: item.modules.module_dynamic.topic?.name,
                    title: null,
                    text: item.modules.module_dynamic.desc,
                    time: timestampToDate(item.modules.module_author.pub_ts * 1000),
                    quote: {
                        live: {
                            roomid: live_item.live_play_info.room_id,
                            pic: live_item.live_play_info.cover,
                            title: live_item.live_play_info.title,
                            desc: `- 分区: ${live_item.live_play_info.area_name}/${live_item.live_play_info.parent_area_name}`,
                            author: { uid: live_item.live_play_info.uid, name: item.modules.module_author.name }
                        }
                    }
                };

            case "DYNAMIC_TYPE_FORWARD":
                return {
                    type: "forward",
                    id: item.id_str,
                    topic: item.modules.module_dynamic.topic?.name,
                    title: item.modules.module_dynamic.major?.opus.title,
                    text: item.modules.module_dynamic.major?.opus.summary.text,
                    time: timestampToDate(item.modules.module_author.pub_ts * 1000),
                    quote: {
                        dynamic: parseCard(item.orig)
                    }
                };

            default:
                console.log("不支持的类型：", item)
                break;
        }
    }

    return native.requestGet(`${baseUrl}x/polymer/web-dynamic/v1/feed/space?host_mid=${uid}&features=itemOpusStyle,listOnlyfans,opusBigCover,onlyfansVote,decorationCard,onlyfansAssetsV2,forwardListHidden,ugcDelete`)
        .then((data) => {
            return data.data.items.map((item) => parseCard(item));
        }).catch(error => console.error('Error fetching recent dynamics:', error));
}

/* 个人页面 */
export function getMyInfo() {
    // 检查缓存再决定是否请求，减少无用请求
    return new Promise((resolve, reject) => {
        native.storageGet("user-info", (result) => {
            if (result) {
                resolve(result);
            } else {
                native.requestGet(` $ {baseUrl}x/space/v2/myinfo?`)
                    .then((data) => {
                        if (data.code == -101) {
                            reject("The user is not logged in.");
                        }

                        const userinfo = {
                            "name": data.data.profile.name,
                            "uid": data.data.profile.mid,
                            "face": data.data.profile.face,
                            "sex": data.data.profile.sex,
                            "sign": data.data.profile.sign,
                            "level": data.data.profile.level,
                            "vip": (data.data.profile.vip.status != 0) ? data.data.profile.vip.label.text : null,
                            "liveroom": null,
                            "birthday": timestampToDate(data.data.profile.birthday * 1000),
                            "attestation": data.data.profile.official.desc,
                            "follower": data.data.follower,
                            "following": null
                        };

                        native.storageSet("user-info", userinfo);
                        resolve(userinfo);
                    })
                    .catch(error => {
                        console.error("Error fetching user profile: ", error);
                        reject(error); 
                    });
            }
        });
    });
}

export function getUserSubscription(uid) {
    const requests = [];
    // 最多请求6页，每页50个关注
    for (let i = 1; i <= 6; i++) {
        const url = `https://api.bilibili.com/x/relation/followings?vmid=${uid}&pn=${i}&ps=50&order=desc&order_type=attention`;
        requests.push(
            native.requestGet(url)
                .then(tjlist => {
                    if (!tjlist.data?.list || tjlist.data.list.length === 0) {
                        return []; // 没有数据时返回空数组
                    }
                    return tjlist.data.list.map(item => ({
                        uid: item.mid,
                        name: item.uname,
                        face: item.face.includes('://') ? item.face : 'https:' + item.face,
                        desc: item.sign,
                        sign: item.sign
                    }));
                })
                .catch(error => {
                    console.error(`Error fetching followings page  $ {i}:`, error);
                    return []; // 出错也返回空数组，避免中断 Promise.all
                })
        );
    }
    return Promise.all(requests).then(pages => {
        const seen = new Set();
        const uniqueList = [];
        for (const page of pages) {
            for (const user of page) {
                if (!seen.has(user.uid)) {
                    seen.add(user.uid);
                    uniqueList.push(user);
                }
            }
        }
        return uniqueList;
    });
}


/* 视频播放部分 */
export function getVideoDetail(bvid, aid) {
    // 获取视频详情

    let urlStr = "";
    if (bvid) {
        urlStr = "bvid=" + bvid;
    } else if (aid) {
        urlStr = "aid=" + aid;
    } else {
        console.error("Error fetching video detail: Missing at least a bvid or an aid.");
        return;
    }

    return native.requestGet(`${baseUrl}x/web-interface/view?${urlStr}`)
        .then((data) => {
            if (data.code != 0) {
                return {
                    "title": "视频去哪了？",
                    "pic": "",
                    "desc": data.message,
                    "aid": 0,
                    "bvid": "",
                    "cid": 0,
                    "pages": [],
                    "author": {
                        "name": "未知",
                        "uid": 0,
                        "face": defaultFace
                    },
                    "stat": {
                        "like": 0,
                        "coin": 0,
                        "view": 0,
                        "fav": 0
                    }
                }
            }
            return {
                "title": data.data.title,
                "pic": data.data.pic,
                "desc": (data.data.desc || "-").replace(/\n/g, "<br>"),
                "aid": data.data.aid,
                "bvid": data.data.bvid,
                "cid": data.data.cid,
                "pages": data.data.pages,
                "author": {
                    "name": data.data.owner.name,
                    "uid": data.data.owner.mid,
                    "face": data.data.owner.face
                },
                "stat": {
                    "like": data.data.stat.like,
                    "coin": data.data.stat.coin,
                    "view": data.data.stat.view,
                    "fav": data.data.stat.favorite
                }
            };
        })
        .catch(error => {
            console.error("Error fetching video detail: ", error);
        });

}

export function getVideoSource(bvid, cid, quality) {
    // 获取视频播放链接
    if (!bvid && !cid) return;

    // 由于浏览器扩展权限限制，只能 360p或1080p
    return native.requestGet(`${baseUrl}x/player/wbi/playurl?type=mp4&platform=html5&bvid=${bvid}&cid=${cid}&qn=${quality || 64}&high_quality=${(quality == 112) ? 1 : 0}`)
        .then((data) => {
            if (data.data?.v_voucher) {
                data = {
                    code: 412,
                    data: { durl: [{ "url": "", "length": 0 }] }
                };
            }
            return {
                code: data.code,
                url: data.data?.durl[0]?.url,
                length: data.data?.durl[0]?.length,
                backup_url: `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${bvid}&cid=${cid}`,
                cid: cid,
                bvid: bvid
            };
        })
        .catch(error => {
            console.error("Error fetching video source: ", error);
        });
}

export function getVideosRelated(bvid) {
    if (!bvid) return;
    return native.requestGet(`${baseUrl}x/web-interface/archive/related?bvid=${bvid}`)
        .then((data) => {
            return data.data.map((item) => ({
                bvid: item.bvid,
                aid: item.aid,
                pic: item.pic,
                title: item.title,
                desc: `- 点赞: ${item.stat.like}\n- 简介: ${item.desc ? item.desc : "-"}`,
                author: { uid: item.owner.mid, name: item.owner.name }
            }));
        })
        .catch(error => console.error('Error fetching related videos:', error));
}

export function getVideoReplies(aid, pageNum = 1) {
    if (!aid) return;
    return native.requestGet(`${baseUrl}x/v2/reply?jsonp=jsonp&pn=${pageNum}&ps=20&type=1&sort=2&oid=${aid}`)
        .then((data) => {
            return data.data.replies.map((item) => ({
                rpid: item.rpid,
                aid: item.oid,
                content: item.content.message,
                detail: { like: item.like, location: item.reply_control?.location || "IP属地：未知", time: item.ctime, time_desc: item.reply_control.time_desc },
                author: { uid: item.member.mid, name: item.member.uname, face: item.member.avatar, level: item.member.level_info.current_level },

                replies: item.replies ? item.replies.map((item) => ({
                    rpid: item.rpid,
                    aid: item.oid,
                    root: item.root,
                    parent: item.parent,
                    content: item.content.message,
                    detail: { like: item.like, location: item.reply_control?.location || "IP属地：未知", time: item.ctime, time_desc: item.reply_control.time_desc },
                    author: { uid: item.member.mid, name: item.member.uname, face: item.member.avatar, level: item.member.level_info.current_level }
                })) : null
            }));
        })
        .catch(error => console.error('Error fetching video replies:', error));
}

export function getVideoReplyReplies(aid, rpid, pageNum = 1) {
    if (!aid && !rpid) return;
    return native.requestGet(`${baseUrl}x/v2/reply/reply?jsonp=jsonp&pn=${pageNum}&ps=20&type=1&sort=2&oid=${aid}&root=${rpid}`)
        .then((data) => {
            return data.data.replies.map((item) => ({
                rpid: item.rpid,
                aid: item.oid,
                content: item.content.message,
                detail: { like: item.like, location: item.reply_control?.location || "IP属地：未知", time: item.ctime, time_desc: item.reply_control.time_desc },
                author: { uid: item.member.mid, name: item.member.uname, face: item.member.avatar, level: item.member.level_info.current_level }
            }));
        })
        .catch(error => console.error('Error fetching video reply replies:', error));
}