var biliJctData = ""; /* 登录凭据 */
var bvidPlayingNow = ""; /* 正在播放的bvid */
var cidPlayingNow = "";
var player_danmuList = []; /* 弹幕列表 */
var player_danmuCnt = 0; /* 弹幕数量 */
var player_advancedDanmu = false; /* 高级弹幕显示模式 */
var player_highQuality = 0; /* 视频高画质Flag,1为开启,0为关闭 */

function xml2json(xml) {
	/* xml转json */
	var obj = {};
	if (xml.nodeType == 1) {
		if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
			for (var j = 0; j < xml.attributes.length; j++) {
				var attribute = xml.attributes.item(j);
				obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
			}
		}
	} else if (xml.nodeType == 3) {
		obj = xml.nodeValue;
	}
	// do children
	if (xml.hasChildNodes()) {
		for (var i = 0; i < xml.childNodes.length; i++) {
			var item = xml.childNodes.item(i);
			var nodeName = item.nodeName;
			if (typeof (obj[nodeName]) == "undefined") {
				obj[nodeName] = xml2json(item);
			} else {
				if (typeof (obj[nodeName].length) == "undefined") {
					var old = obj[nodeName];
					obj[nodeName] = [];
					obj[nodeName].push(old);
				}
				obj[nodeName].push(xml2json(item));
			}
		}
	}
	return obj;
}

function parseComments(comments) {
	/* 解析评论 */
	let result = '';

	comments.forEach(comment => {
		const { member, content, replies, ctime } = comment;
		const timeString = new Date(ctime * 1000).toLocaleString();

		result += `<div class="reply"><b>🔘&nbsp;${member.uname}</b><br>`;
		result += `<div class="content">${content.message}</div>`;
		result += `<i>时间：${timeString}</i></div><hr>`;

		if (replies && replies.length > 0) {
			result += `<div class="moreReply">回复：<br>`;
			result += parseComments(replies);
			result += `</div>`;
		}
	});

	return result;
}

function getDanmu(cid) {
	/* 获取弹幕 */
	$.get("https://comment.bilibili.com/" + cid + ".xml", function (s) {
		cInfo = xml2json(s).i.d;
		newInfo = [];
		
		$.each(cInfo,function(index,item){
			try {
				newInfo.push({ "text": item["#text"], "time": parseFloat(item["@attributes"]["p"].split(",")[0]) });
			} catch (e) {
				console.log("弹幕装填出错（解析时）");
			}
		});
		player_danmuList = newInfo.sort(function (x, y) {
			/* 弹幕排序方式 */
			return x["time"] - y["time"];
		});
	});
}

function showDanmu(content) {
	/* 装填高级弹幕 */
	var containerWidth = $("#player_container").innerWidth() - 380;
	var containerHeight = $("#player_container").innerHeight() - 20;
	var pageH = parseInt(Math.random() * containerHeight);
	var newSpan = $("<div class='player_danmuText'></span>");
	newSpan.text(content);

	newSpan.appendTo("#player_scrComment");

	newSpan.css("left", (containerWidth - newSpan.innerWidth() + 20));
	newSpan.css("top", pageH);
	//弹幕动画
	newSpan.animate({ "left": -500 }, 10000, "linear", function () {
		$(this).remove();
	});
}

function loadVideoSource(bvid, cid) {
	/* 加载视频源 */
	$.get("https://api.bilibili.com/x/player/playurl?type=mp4&platform=html5&bvid=" + bvid + "&cid=" + cid + "&qn=64&high_quality=" + player_highQuality, function (result) {
		/* 获取视频播放源 */
		vidUrl = result.data.durl[0].url;
		$("#player_videoContainer").attr("src", vidUrl);
		bvidPlayingNow = bvid;
		cidPlayingNow = cid;
	});
}

function openPlayer(option) {
	/* 显示播放器并展示指定视频 */

	/* 视频ID */
	if (option.bvid) {
		urlStr = "bvid=" + option.bvid;
	} else if (option.aid) {
		urlStr = "aid=" + option.aid;
	} else {
		console.log("[ERROR] 播放器参数错误：缺少一个可用的bvid或aid");
		showToast("播放器参数错误");
		return;
	}

	$("#player_container").fadeIn(200);

	/* 视频详情 */
	$.get("https://api.bilibili.com/x/web-interface/view?" + urlStr, function (VideoInfo) {
		/* 获取视频信息 */
		var cid = VideoInfo["data"]["pages"][0]["cid"];
		var bvid = VideoInfo["data"]["bvid"];
		var aid = VideoInfo["data"]["aid"];
		var desc = VideoInfo["data"]["desc"] || "-";

		$("#player_title").html(VideoInfo["data"]["title"]);
		$("#player_descArea").html("<b style='font-size:18px;'>[详情]</b><br>" + desc);

		getDanmu(cid); /* 获取弹幕 */

		loadVideoSource(bvid, cid); /* 获取视频源 */

		$.get("https://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&type=1&sort=2&oid=" + aid, function (ReplyInfo) {
			/* 获取评论 */
			textAll = parseComments(ReplyInfo.data.replies);
			$("#player_descArea").append("<hr><b style='font-size:18px;'>[评论]</b><br>" + textAll);
		});
	});

	if (option.refreshOnly) { return; }

	/* 侧边栏列表 */
	if (option.videoList == "watch_later") {
		/* 如果是从稍后再看列表进入的话，侧边栏显示稍后再看列表 */
		$("#player_sidebarTab_2").text("稍后再看");

		$.get("https://api.bilibili.com/x/v2/history/toview", function (tjlist) {
			var WebList = "";
			$.each(tjlist.data.list,function(index,item){
				WebList += `<div class='dynamic_singlebox'>
							<a href="#bvid_` + item.bvid + `_refreshonly">
								<img src='` + item.pic + `@412w_232h_1c.webp'><br>
								<div class="dynamic_singlebox_vt">` + item.title + `</div>
							</a>
							<a href="#uid_` + item.owner.mid + `">
								<div class="dynamic_singlebox_un">🔘&nbsp;` + item.owner.name + `</div>
							</a>
						</div>
					`;
			});
			$("#player_videoList").html(WebList)
		});
	} else {
		/* 如果是从普通视频页面进入的话，侧边栏显示推荐视频 */
		$("#player_sidebarTab_2").text("相关推荐");

		$.get("https://api.bilibili.com/x/web-interface/archive/related?" + urlStr, function (res) {
			var VidList = "";
			$.each(res.data,function(index,item){
				VidList += `<div class='dynamic_singlebox'>
						<a href="#bvid_` + item.bvid + `">
							<img src='` + item.pic + `@412w_232h_1c.webp'><br>
							<div class="dynamic_singlebox_vt">` + item.title + `</div>
						</a>
						<a href="#uid_` + item.owner.mid + `">
							<div class="dynamic_singlebox_un">🔘&nbsp;` + item.owner.name + `</div>
						</a>
					</div>`
			});
			$("#player_videoList").html(VidList);
		});
	}
}

function closePlayer() {
	/* 关闭播放器 */
	$("#player_container").fadeOut(150);
	$("#player_videoContainer").attr("src", "");
	player_danmuList = [];
	player_danmuCnt = 0;
}



function doLikeVid(bvid) {
	/* 点赞视频 */
	$.post("https://api.bilibili.com/x/web-interface/archive/like", "bvid=" + bvid + "&like=1&csrf=" + biliJctData)
		.done(function (res) {
			if (res.code == 0) { showToast("点赞成功"); }
			else if (res.code == 65006) { showToast("已赞过"); }
			else { showToast("点赞失败 [" + res.code + "] \n(" + res.message + ")"); }
		})
		.fail(function (res) {
			showToast("【失败】\nB站官方点赞API限制了请求标头Origin，而Chrome扩展无权修改Origin。\n（player.js:216）");
		})
}

function doGiveCoin(bvid) {
	/* 投币视频 */
	$.post("https://api.bilibili.com/x/web-interface/coin/add", "bvid=" + bvid + "&upid=114514&multiply=1&avtype=1&csrf=" + biliJctData)
		.done(function (res) {
			if (res.code == 0) { showToast("投币成功"); }
			else if (res.code == 65006) { showToast("已投过"); }
			else { showToast("投币失败 [" + res.code + "] \n(" + res.message + ")"); }
		})
		.fail(function (res) {
			showToast("【失败】\nB站官方投币API限制了请求标头Origin，而Chrome扩展无权修改Origin。\n（player.js:229）");
		})
}

$(document).ready(function () {
	/* 登录数据获取 */
	getJctToken(function (token) {
		biliJctData = token;
	});

	/* 按钮事件监听 */
	$("#player_openNewBtn").click(function () {
		chrome.tabs.create({ url: "https://www.bilibili.com/video/" + bvidPlayingNow }); /* 在新标签页打开 */
	});
	$("#player_closeBtn").click(function () {
		closePlayer(); /* 关闭播放器 */
	});
	$("#player_likeBtn").click(function () {
		doLikeVid(bvidPlayingNow); /* 点赞 */
	});
	$("#player_coinBtn").click(function () {
		doGiveCoin(bvidPlayingNow); /* 投币 */
	});
	$("#player_scrSwitchBtn").click(function () {
		player_advancedDanmu = !player_advancedDanmu; /* 切换弹幕模式 */
		showToast("弹幕模式已切换，当前模式：" + (player_advancedDanmu ? "全屏滑动弹幕模式" : "简单弹幕模式"));
	});
	$("#player_pipBtn").click(function () {
		var pip = $("#player_videoContainer")[0].requestPictureInPicture(); /* 切换画中画 */
		showToast("画中画", 1000);
	});
	$("#player_highQnBtn").click(function () {
		/* 切换高画质 */
		if (player_highQuality == 1) {
			player_highQuality = 0;
			showToast("已切换为普通画质", 5000);
		} else {
			player_highQuality = 1;
			showToast("已切换为高画质", 5000);
		}
		loadVideoSource(bvidPlayingNow, cidPlayingNow);
	});


	/* 侧边栏标签切换 */
	$("#player_sidebarTab_1").click(function () {
		$("#player_descArea").show();
		$("#player_videoList").hide();
		$("#player_sidebarTab_1").attr("class", 'player_sidebarTab_sel');
		$("#player_sidebarTab_2").attr("class", 'player_sidebarTab');
	});
	$("#player_sidebarTab_2").click(function () {
		$("#player_descArea").hide();
		$("#player_videoList").show();

		$("#player_sidebarTab_1").attr("class", 'player_sidebarTab');
		$("#player_sidebarTab_2").attr("class", 'player_sidebarTab_sel');
	});


	/* 弹幕输出 */
	setInterval(function () {
		if (!player_danmuList || player_danmuList.length == 0 || player_danmuList.length <= player_danmuCnt) { return; }
		try {
			if (player_danmuList[player_danmuCnt]["time"] <= $("#player_videoContainer")[0].currentTime) {
				if (player_advancedDanmu) {
					showDanmu(player_danmuList[player_danmuCnt]["text"]);
				} else {
					$("#player_scrComment").html("<b>「弹幕」</b>" + player_danmuList[player_danmuCnt]["text"]);
				}
				player_danmuCnt += 1;
			}
		} catch (e) { console.log("弹幕装填出错（显示时）" + e) }
	}, 100);

	(function () {
		/* 视频播放完毕事件 */
		$("#player_videoContainer").bind('ended', function () {
			$("#player_videoContainer")[0].currentTime = 0;
			player_danmuCnt = 0;
			showToast("视频播放完毕", 1000);
		});
	})();

});
