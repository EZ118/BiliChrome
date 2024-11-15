var biliJctData = ""; /* 登录凭据 */
var bvidPlayingNow = ""; /* 正在播放的bvid */
var cidPlayingNow = ""; /* 正在播放的cid */
var player_danmuList = []; /* 弹幕列表 */
var player_danmuCnt = 0; /* 弹幕数量 */
var player_advancedDanmu = false; /* 高级弹幕显示模式 */
var player_highQuality = 0; /* 视频高画质Flag,1为开启,0为关闭 */

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

function showMoreReplies(oid){
	/* 在对话框中展示单条评论下的所有回复，oid即评论ID */
	$.get("https://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&ps=20&type=1&sort=2&oid=" + oid, function (ReplyInfo) {
		/* 获取评论 */
		textAll = parseComments(ReplyInfo.data.replies);
		openDlg("更多评论 [" + oid + "]", "<div class='reply_container'>" + textAll + "</div>", "https://www.bilibili.com/video/" + bvidPlayingNow, isTop = true);
	});
}

function getDanmu(cid) {
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


function showDanmu(content) {
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

function loadVideoSource(bvid, cid) {
	/* 加载视频源，需要bvid和cid */
	$.get("https://api.bilibili.com/x/player/playurl?type=mp4&platform=html5&bvid=" + bvid + "&cid=" + cid + "&qn=64&high_quality=" + player_highQuality, function (result) {
		/* 获取视频播放源 */
		vidUrl = result.data.durl[0].url;
		$("#player_videoContainer").attr("src", vidUrl);
		bvidPlayingNow = bvid;
		cidPlayingNow = cid;
	});
}

function loadCidList(pages) {
	/* 如果视频包含多个分P视频，则加载分P列表 */
	var cidList = "";
	$.each(pages, function (index, item) {
		cidList += `<s-chip type='${(index == 0) ? "filled-tonal" : "outlined"}' class='player_cidListItem' cid-data='${item.cid}' page-num='${item.page}' title='${item.part}'>${item.part}</s-chip>`;
	});
	$("#player_descArea").append("<br><hr><b class='player_blockTitle'>选集</b><div class='flex_container'>" + cidList + "</div>");
	$(".player_cidListItem").click(function () {
		var cid = $(this).attr("cid-data");
		var page = $(this).attr("page-num");

		$(".player_cidListItem").attr("type", "outlined");
		$(this).attr("type", "filled-tonal");

		showToast("正在加载分P视频 [P" + page + "]");
		loadVideoSource(bvidPlayingNow, cid);
		getDanmu(cid);
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
		var cid = VideoInfo["data"]["cid"];
		var cidPages = VideoInfo["data"]["pages"];
		var bvid = VideoInfo["data"]["bvid"];
		var aid = VideoInfo["data"]["aid"];
		var desc = VideoInfo["data"]["desc"] || "-";

		
		desc = desc.replace(/\n/g, "<br>");
		desc = limitConsecutiveChars(desc);

		$("#player_title").html(VideoInfo["data"]["title"]);
		$("#player_descArea").html("<b class='player_blockTitle'>详情</b><br>" + desc);

		if (cidPages.length > 1) { loadCidList(cidPages); } /* 显示分P视频列表 */
		getDanmu(cid); /* 获取弹幕 */
		loadVideoSource(bvid, cid); /* 获取视频源 */

		$.get("https://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&ps=20&type=1&sort=2&oid=" + aid, function (ReplyInfo) {
			/* 获取评论 */
			textAll = parseComments(ReplyInfo.data.replies);
			$("#player_descArea").append("<br><b class='player_blockTitle'>评论</b><br><div class='reply_container'>" + textAll + "<hr style='border-bottom:2px dashed #91919160;'></div>");

			$(document).on('click', '.reply_container .moreReply', function (evt) {
				/* 当用户点击了评论回复，则显示更多评论 */
				const clickedEle = $(evt.target);
				let oid = clickedEle.parent().parent().attr("oid") || clickedEle.parent().attr("oid") || clickedEle.attr("oid");
				showMoreReplies(oid);
			});
		});
	});

	if (option.refreshOnly) { return; }

	/* 侧边栏列表 */
	if (option.videoList == "watch_later") {
		/* 如果是从稍后再看列表进入的话，侧边栏显示稍后再看列表 */
		$("#player_sidebarTab_2").text("稍后再看");

		$.get("https://api.bilibili.com/x/v2/history/toview", function (tjlist) {
			var WebList = "";
			$.each(tjlist.data.list, function (index, item) {
				WebList += `
					<s-card clickable="true" class="slim_video_card">
						<div class="card-image">
							<a href="#bvid_${item.bvid}_watchlater">
								<img src='${item.pic}@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
							</a>
						</div>
						<div class="card-content">
							<div class="card-subhead">
								<a href="#bvid_${item.bvid}_watchlater">
									${item.title}
								</a>
							</div>
							<div class="card-text">
								<a href="#bvid_${item.bvid}_watchlater">
									${item.owner.name}
								</a>
							</div>
						</div>
					</s-card>
					`;
			});
			$("#player_videoList").html(WebList)
		});
	} else {
		/* 如果是从普通视频页面进入的话，侧边栏显示推荐视频 */
		$("#player_sidebarTab_2").text("相关推荐");

		$.get("https://api.bilibili.com/x/web-interface/archive/related?" + urlStr, function (res) {
			var WebList = "";
			$.each(res.data, function (index, item) {
				WebList += `
                    <s-card clickable="true" class="slim_video_card">
						<div class="card-image">
							<a href="#bvid_${item.bvid}">
								<img src='${item.pic}@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;'>
							</a>
						</div>
						<div class="card-content">
							<div class="card-subhead">
								<a href="#bvid_${item.bvid}">
									${item.title}
								</a>
							</div>
							<div class="card-text">
								<a href="#bvid_${item.bvid}">
									${item.owner.name}
								</a>
							</div>
						</div>
					</s-card>
					`;
			});
			$("#player_videoList").html(WebList);
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
			showToast("点赞失败，请求被拦截");
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
			showToast("投币失败，请求被拦截");
		})
}

function doWatchLater(bvid) {
	/* 投币视频 */
	$.post("https://api.bilibili.com/x/v2/history/toview/add", "bvid=" + bvid + "&csrf=" + biliJctData)
		.done(function (res) {
			if (res.code == 0) { showToast("已添加到稍后再看"); }
			else { showToast("添加失败 [" + res.code + "] \n(" + res.message + ")"); }
		})
		.fail(function (res) {
			showToast("添加失败，请求被拦截");
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
	$("#player_watchlaterBtn").click(function () {
		doWatchLater(bvidPlayingNow); /* 投币 */
	});
	$("#player_scrSwitchBtn").click(function () {
		player_advancedDanmu = !player_advancedDanmu; /* 切换弹幕模式 */
		showToast("弹幕模式已切换，当前模式：" + (player_advancedDanmu ? "滚动弹幕模式" : "简单弹幕模式"));
		$("#player_simpleDanmu").text("");
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
	$("#player_sidebarTab").click(() => {
		const { selectedIndex } = document.querySelector('#player_sidebarTab');
		if(selectedIndex == 0) {
			$("#player_descArea").show();
			$("#player_videoList").hide();
		} else {
			$("#player_descArea").hide();
			$("#player_videoList").show();
		}
	});

	/* 弹幕输出 */
	setInterval(function () {
		if (!player_danmuList || player_danmuList.length == 0 || player_danmuList.length <= player_danmuCnt) { return; }
		try {
			if (player_danmuList[player_danmuCnt]["time"] <= $("#player_videoContainer")[0].currentTime) {
				if (player_advancedDanmu) {
					showDanmu(player_danmuList[player_danmuCnt]["text"]);
				} else {
					$("#player_simpleDanmu").html("<b>「弹幕」</b>" + player_danmuList[player_danmuCnt]["text"]);
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
