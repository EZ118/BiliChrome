var biliJctData = ""; /* 登录凭据 */
var roomidPlayingNow = ""; /* 正在播放的roomid */
var live_danmuList = []; /* 实时评论列表 */
var live_danmuShowDelay = null; /* 实时评论输出延迟 */
const live_danmuReqRrequency = 6000; /* 实时评论获取频率（请求1次/6000毫秒） */
const live_danmuMaxSum = 60; // 最大显示弹幕数量
var live_showDanmu = false; /* 是否显示实时评论 */
var live_quality = 3; /* 视频画质,2：流畅 3：高清 4：原画 */
var live_hls = null; /* hls对象 */

function limitConsecutiveChars(str) {
	/* 只允许字符串中连续出现n个相同字符 */
	const maxConsecutive = 10;
	return str.replace(new RegExp(`(.)\\1{${maxConsecutive - 1},}`, 'g'), (match, p1) => p1.repeat(maxConsecutive));
}



function showLiveDanmu(danmuList) {
	/* 装填弹幕 */
	let danmuCnt = 0;
	const maxDanmuCount = danmuList.length; // 设定的最大弹幕数量

	const intervalId = setInterval(function () {
		if (danmuCnt >= maxDanmuCount || danmuCnt >= danmuList.length) {
			clearInterval(intervalId); // 清除定时器
			return;
		}

		const danmu = danmuList[danmuCnt];
		// 显示弹幕的逻辑
		var newSpan = $("<div class='messageBubble'></div>");
		newSpan.text(danmu.text);
		newSpan.css("opacity", 0.5);

		newSpan.appendTo("#live_commentArea");

		$('#live_commentArea').scrollTop($('#live_commentArea').prop("scrollHeight"));

		// 弹幕动画
		newSpan.animate({ "bottom": "+=50", "opacity": 1 }, 600, "linear");

		danmuCnt += 1;
	}, live_danmuShowDelay);
}

function getLiveDanmu(room_id) {
	/* 获取列表，并解析内容，将所有条目按照时间顺序排序；最终存储在全局变量live_danmuList中 */

	// 检查并清除旧弹幕
	
	const visibleDanmus = $("#live_commentArea .messageBubble");
	if (visibleDanmus.length > live_danmuMaxSum) {
		visibleDanmus.slice(0, visibleDanmus.length - live_danmuMaxSum).remove();
	}

	//获取新弹幕
	$.get("https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid=" + room_id + "&room_type=0", function (ReplyInfo) {
		let newDanmuList = [];
		$.each(ReplyInfo.data.room, function (index, item) {
			const { nickname, text, timeline, id_str } = item;
			newDanmuList.push({ text, name: nickname, time: timeline, id: id_str });
		});

		const existingIds = new Set(live_danmuList.map(danmu => danmu.id));

		newDanmuList = newDanmuList.filter(danmu => !existingIds.has(danmu.id)); // 过滤掉已有的弹幕

		live_danmuList = newDanmuList;


		live_danmuShowDelay = live_danmuReqRrequency / live_danmuList.length;

		showLiveDanmu(live_danmuList);
	});
}

function loadLiveStreamSource(cid) {
	/* 加载视频源，需要bvid和cid */
	const platform = "h5"; // web或h5
	$.get("https://api.live.bilibili.com/room/v1/Room/playUrl?cid=" + cid + "&platform=" + platform + "&quality=" + live_quality, function (result) {
		/* 获取视频播放源 */
		let videoUrl = result.data.durl[0].url;

		if (Hls.isSupported()) {
			const videoEle = $("#live_videoContainer")[0];
			live_hls = new Hls();
			live_hls.loadSource(videoUrl);
			live_hls.attachMedia(videoEle);

			live_hls.on(Hls.Events.MEDIA_ATTACHED, function () {
				videoEle.play();
				videoEle.muted = false;
				videoEle.controls = false;

				//$("#dynamic_loader").hide();
			});
		} else {
			showToast("浏览器不支持HLS播放，请更新浏览器");
			$("#dynamic_loader").hide();
		}
	});
}

function openLivePlayer(option) {
	/* 显示播放器并展示指定视频 */
	$("#dynamic_loader").show();
	$('#live_commentArea').empty();

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

		roomidPlayingNow = room_id;

		let desc = `开播时间：${live_time} <br>直播分区：${area_name}`


		$("#live_title").text(title);
		$("#live_descArea").html("<b class='player_blockTitle'>详情</b><br>" + desc);

		getLiveDanmu(room_id); /* 获取弹幕 */
		loadLiveStreamSource(room_id); /* 获取视频源 */
	});
}

function closeLivePlayer() {
	/* 关闭播放器 */
	live_hls.destroy();
	$("#live_container").fadeOut(150);
	live_danmuList = [];
	live_danmuShowDelay = null;

	$("#dynamic_loader").hide();
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
		const pip = $("#live_videoContainer")[0].requestPictureInPicture(); /* 切换画中画 */
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
	$("#live_videoContainer").on('canplay', function (e) {
		/* 视频加载完毕后隐藏加载球 */
		$("#dynamic_loader").hide();
	});

	/* 弹幕输出 */
	setInterval(function () {
		if (!live_danmuList || live_danmuList.length == 0) { return; }
		else {
			getLiveDanmu(roomidPlayingNow);
		}
	}, live_danmuReqRrequency);
});
