var biliJctData = ""; /* 登录凭据 */
var roomidPlayingNow = ""; /* 正在播放的roomid */
var live_danmuList = []; /* 实时评论列表 */
var live_danmuCnt = 0; /* 实时评论数量 */
var live_showDanmu = false; /* 是否显示实时评论 */
var live_quality = 3; /* 视频画质,2：流畅 3：高清 4：原画 */

function limitConsecutiveChars(str) {
    /* 只允许字符串中连续出现n个相同字符 */
	const maxConsecutive = 10;
    return str.replace(new RegExp(`(.)\\1{${maxConsecutive - 1},}`, 'g'), (match, p1) => p1.repeat(maxConsecutive));
}

function parseComments(comments) {
	/* 解析评论；将评论列表中的每一项递归解析，并返回解析后的字符串（html），由主函数统一调用 */
	let result = '';

	$.each(comments, function (index, comment) {
		const { oid, member, content, replies, ctime, like, reply_control } = comment;
		const timeString = new Date(ctime * 1000).toLocaleDateString();

		if(index > 0) { result += "<hr>"; }
		result += `<div class="reply"><b>🔘&nbsp;${member.uname}</b><br>`;
		result += `<div class="content">${content.message}</div>`;
		result += `<i>${like}赞 &nbsp; ${timeString} &nbsp; ${reply_control.location ? reply_control.location.split("：")[1] : ""}</i></div>`;

		if (replies && replies.length > 0) {
			result += `<div class="moreReply" oid="${oid}">回复：<br>`;
			result += parseComments(replies);
			result += `</div>`;
		}
	});

	return result;
}

function getLiveDanmu(cid) {
    /* 获取弹幕文件，并解析内容，将所有条目按照时间顺序排序；最终存储在全局变量player_danmuList中 */
    $.get(`https://comment.bilibili.com/${cid}.xml`, function (s) {
        const danmuList = [];

        $(s).find("d").each(function () {
            try {
                const time = parseFloat($(this).attr("p").split(",")[0]);
                const text = $(this).text();
                danmuList.push({ text, time });
            } catch (e) {
                console.error("弹幕装填出错（解析时）", e);
            }
        });

        player_danmuList = danmuList.sort((a, b) => a.time - b.time);
    });
}


function showLiveDanmu(content) {
	/* 装填高级弹幕；只负责将弹幕文本显示在屏幕中 */
	var containerWidth = $("#player_container").innerWidth() - 380;
	var containerHeight = $("#player_container").innerHeight() - 20;
	var pageH = parseInt(Math.random() * containerHeight);
	var newSpan = $("<div class='player_danmuText'></span>");
	newSpan.text(content);

	newSpan.appendTo("#player_simpleDanmu");

	newSpan.css("left", (containerWidth - newSpan.innerWidth() + 20));
	newSpan.css("top", pageH);
	//弹幕动画
	newSpan.animate({ "left": -500 }, 10000, "linear", function () {
		$(this).remove();
	});
}

function loadLiveStreamSource(cid) {
	/* 加载视频源，需要bvid和cid */
    const platform = "web"; // web或h5
	$.get("https://api.live.bilibili.com/room/v1/Room/playUrl?cid=" + cid + "&platform=" + platform + "&quality=" + live_quality, function (result) {
		/* 获取视频播放源 */
		let vidUrl = result.data.durl[0].url;
		$("#live_videoContainer").attr("src", vidUrl);
	});
}

function openLivePlayer(option) {
	/* 显示播放器并展示指定视频 */

	/* 视频ID */
	if (!option.roomid) {
		console.log("[ERROR] 直播播放器参数错误：缺少一个可用的roomid");
		showToast("直播播放器参数错误");
		return;
	}

	$("#live_container").fadeIn(200);

	/* 视频详情 */
	$.get("https://api.live.bilibili.com/room/v1/Room/get_info?room_id=" + option.roomid, function (VideoInfo) {
		/* 获取视频信息 */
		var { room_id, title, uid, live_time, area_name } = VideoInfo["data"];

        let desc = `开播时间：${live_time} <br>直播分区：${area_name}`
        

		$("#live_title").text(title);
		$("#live_descArea").html("<b class='player_blockTitle'>详情</b><br>" + desc);
		$("#live_commentArea").html("<b class='player_blockTitle'>实时评论</b><br><i>(尚不支持)</i>");

		//getLiveDanmu(cid); /* 获取弹幕 */
		loadLiveStreamSource(room_id); /* 获取视频源 */

		// $.get("https://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&ps=20&type=1&sort=2&oid=" + aid, function (ReplyInfo) {
		// 	/* 获取评论 */
		// 	textAll = parseComments(ReplyInfo.data.replies);
		// 	$("#live_descArea").append("<br><b class='player_blockTitle'>评论</b><br><div class='reply_container'>" + textAll + "<hr style='border-bottom:2px dashed #91919160;'></div>");
		// });
	});
}

function closeLivePlayer() {
	/* 关闭播放器 */
	$("#live_container").fadeOut(150);
	$("#live_videoContainer").attr("src", "");
	live_danmuList = [];
	live_danmuCnt = 0;
}



$(document).ready(function () {
	/* 登录数据获取 */
	getJctToken(function (token) {
		biliJctData = token;
	});

	/* 按钮事件监听 */
	$("#live_openNewBtn").click(function () {
		chrome.tabs.create({ url: "https://live.bilibili.com/" + roomidPlayingNow }); /* 在新标签页打开 */
	});
	$("#live_closeBtn").click(function () {
		closeLivePlayer(); /* 关闭播放器 */
	});
	$("#live_scrSwitchBtn").click(function () {
		live_showDanmu = !live_showDanmu; /* 切换弹幕模式 */
		showToast((live_showDanmu ? "已启用实时评论" : "已关闭实时评论"));
	});
	$("#live_pipBtn").click(function () {
		var pip = $("#live_videoContainer")[0].requestPictureInPicture(); /* 切换画中画 */
		showToast("画中画", 1000);
	});
	$("#live_qnSwitchBtn").click(function () {
		/* 切换高画质 */
		if (live_quality == 3) {
			live_quality = 2;
			showToast("已切换为普通画质", 3000);
		} else {
			live_quality = 3;
			showToast("已切换为较高画质", 3000);
		}
		loadLiveStreamSource(roomidPlayingNow);
	});

	/* 弹幕输出 */
	// setInterval(function () {
	// 	if (!player_danmuList || player_danmuList.length == 0 || player_danmuList.length <= player_danmuCnt) { return; }
	// 	try {
	// 		if (player_danmuList[player_danmuCnt]["time"] <= $("#player_videoContainer")[0].currentTime) {
	// 			if (player_advancedDanmu) {
	// 				showDanmu(player_danmuList[player_danmuCnt]["text"]);
	// 			} else {
	// 				$("#player_simpleDanmu").html("<b>「弹幕」</b>" + player_danmuList[player_danmuCnt]["text"]);
	// 			}
	// 			player_danmuCnt += 1;
	// 		}
	// 	} catch (e) { console.log("弹幕装填出错（显示时）" + e) }
	// }, 100);

	(function () {
		/* 视频播放完毕事件 */
		$("#live_videoContainer").bind('ended', function () {
			$("#live_videoContainer")[0].currentTime = 0;
			live_danmuCnt = 0;
			showToast("直播结束", 1000);
		});
	})();

});
