/* 
番剧 模块（测试中）
若希望测试该模块，请在控制台输入以下命令：
var bangumi = new Bangumi(); // 初始化
bangumi.following(你的B站UID或MID); // 获取追番列表
bangumi.getBangumiInfo(番剧的media_id); // 获取番剧信息
bangumi.getBangumiSource(番剧的ep_id); // 获取番剧视频源

*/

class Bangumi {
    constructor() {
        console.log("[Bangumi] “番剧”处于开发阶段，仅供可行性测试，若视频源无法播放，则后续不会加入此功能。");
        console.log("[Bangumi] 已初始化");
    }

    following(mid) {
        $.get(`https://api.bilibili.com/x/space/bangumi/follow/list?vmid=${mid}&type=1&ps=30&pn=1`, (res) => {
            var followList = res.data.list.map(item => ({
                media_id: item.media_id,
                pic: item.cover,
                title: item.title,
                desc: item.subtitle,
            }));

            modal.open("我的追番", card.bangumi(followList), `https://space.bilibili.com/${mid}/bangumi`)
        })
    }

    getBangumiInfo(media_id) {
        $.get(`https://api.bilibili.com/pgc/review/user?media_id=${media_id}`, (res) => {
            var info = {
                title: res.result.media.title,
                pic: res.result.media.cover,
                desc: res.result.media.season_type + " . " + res.result.media.areas[0].name + " · " + res.result.media.new_ep.index_show + " · " + res.result.rating.score + "分",
                media_id: res.result.media.media_id,
                ep_id: res.result.media.new_ep.ep_id,
            }
            modal.toast("番剧信息获取成功，详情见控制台", 2000);
            console.log("番剧信息：", info);
        });
    }

    getBangumiSource(ep_id) {
        $.get("https://api.bilibili.com/pgc/player/web/playurl?ep_id=" + ep_id, (res) => {
            var sources = res.result.durl.map(item => ({
                url: item.url,
                md5: item.md5,
                size: item.size,
            }));
            modal.toast("番剧视频源获取成功，详情见控制台", 2000);
            console.log("番剧源：", sources);
        });
    }
}