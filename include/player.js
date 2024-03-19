var biliJctData = "";
var bvidPlayingNow = "";
var player_scrCommerts = [];
var player_scrCommertCnt = 0;
var player_fancyScreenComment = false;

function ajaxGet(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) { callback(xhr.responseText); }
			else { callback("Error: " + xhr.status); }
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
}
function ajaxPost(url, data, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				callback(xhr.responseText);
			} else {
				callback("Error: " + xhr.status);
			}
		}
	};

	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	// xhr.setRequestHeader("Origin", "https://www.bilibili.com");
	// xhr.setRequestHeader("Referer", "https://www.bilibili.com/blackboard/html5mobileplayer.html");
	xhr.send(data);
}



function str2xml(xmlString) {
	/* xml字符串转xml对象 */
	var xmlDoc = null;
	if (window.DOMParser) {
		var parser = new DOMParser();
		xmlDoc = parser.parseFromString(xmlString, "text/xml");
	} else {
		//IE
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = "false";
		xmlDoc.loadXML(xmlString);
	}
	return xmlDoc;
}

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
};

function parseComments(comments) {
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

function commentSortMethod(x, y) {
	/* 弹幕排序方式 */
	return x["time"] - y["time"];
}

function getScreenComment(cid) {
	/* 获取弹幕 */
	ajaxGet("https://comment.bilibili.com/" + cid + ".xml", function (s) {
		cInfo = xml2json(str2xml(s)).i.d;
		newInfo = [];
		for (let i = 0; i < cInfo.length; i++) {
			try {
				newInfo.push({ "text": cInfo[i]["#text"], "time": parseFloat(cInfo[i]["@attributes"]["p"].split(",")[0]) });
			} catch (e) {
				console.log("弹幕装填出错（解析时）")
			}
		}
		player_scrCommerts = newInfo.sort(commentSortMethod);
	});
}

function showScreenComment(content) {

	var containerWidth = $("#player_container").innerWidth() - 380;
	var containerHeight = $("#player_container").innerHeight() - 20;
	var pageH = parseInt(Math.random() * containerHeight);
	var newSpan = $("<div class='player_danmuText'></span>");
	newSpan.text(content);

	newSpan.appendTo("#player_scrComment");

	newSpan.css("left", (containerWidth - newSpan.innerWidth() + 20) );
	newSpan.css("top", pageH);
	//弹幕动画
	newSpan.animate({ "left": -500 }, 10000, "linear", function () {
		$(this).remove();
	});
}

function openPlayer(bvid) {
	playerContainer = document.getElementById("player_container");
	videoContainer = document.getElementById("player_videoContainer");
	videoTitle = document.getElementById("player_title");
	videoDesc = document.getElementById("player_descArea");
	openBtn = document.getElementById("player_openNewBtn");
	closeBtn = document.getElementById("player_closeBtn");

	playerContainer.style.display = "block";

	if (bvid[0] == "B") {
		urlStr = "bvid=" + bvid;
	} else {
		urlStr = "aid=" + bvid;
	}
	ajaxGet("https://api.bilibili.com/x/web-interface/view?" + urlStr, function (VideoInfo) {
		/* 获取视频信息 */
		VideoInfo = JSON.parse(VideoInfo);
		cid = VideoInfo["data"]["pages"][0]["cid"];
		bvid = VideoInfo["data"]["bvid"];
		aid = VideoInfo["data"]["aid"];
		videoTitle.innerHTML = VideoInfo["data"]["title"];
		videoDesc.innerHTML = VideoInfo["data"]["desc"];

		getScreenComment(cid); /* 获取弹幕 */

		ajaxGet("https://api.bilibili.com/x/player/playurl?type=mp4&platform=html5&bvid=" + bvid + "&cid=" + cid + "&qn=64", function (result) {
			/* 获取视频播放源 */
			vidUrl = JSON.parse(result).data.durl[0].url;
			videoContainer.src = vidUrl;
			bvidPlayingNow = bvid;
		});
		ajaxGet("https://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&type=1&sort=2&oid=" + aid, function (result) {
			/* 获取评论 */
			ReplyInfo = JSON.parse(result);
			textAll = parseComments(ReplyInfo.data.replies);
			videoDesc.innerHTML += "<hr><b style='font-size:18px;'>[评论]</b><br>" + textAll;
		});
	});
}


function doLikeVid(bvid) {
	alert("该功能未成功实现\n问题出在：哔哩哔哩官方的点赞API对于请求标头Origin有限制，而Chrome扩展没有权限修改Origin，导致请求出问题\n（player.js:173）");
	/* 点赞视频 */
	ajaxPost("https://api.bilibili.com/x/web-interface/archive/like", "bvid=" + bvid + "&like=1&csrf=" + biliJctData, function (result) {
		var res = JSON.parse(result);
		if (res.code == 0) { alert("点赞成功"); }
		else if (res.code == 65006) { alert("已赞过"); }
		else { alert("点赞失败 [" + res.code + "] \n(" + res.message + ")"); }
	});
}

function doGiveCoin(bvid) {
	alert("该功能未成功实现\n问题出在：哔哩哔哩官方的点赞API对于请求标头Origin有限制，而Chrome扩展没有权限修改Origin，导致请求出问题。\n（player.js:184）");
	/* 投币视频 */
	ajaxPost("https://api.bilibili.com/x/web-interface/coin/add", "bvid=" + bvid + "&upid=114514&multiply=1&avtype=1", function (result) {
		var res = JSON.parse(result);
		if (res.code == 0) { alert("投币成功"); }
		else if (res.code == 65006) { alert("已投过"); }
		else { alert("投币失败 [" + res.code + "] \n(" + res.message + ")"); }
	});
}

function getJctStr() {
	/* 获取B站用户数据（仅用于请求相关API） */
	chrome.cookies.getAll({ url: "https://www.bilibili.com/" }, function (cookies) {
		var finalVal = "";
		for (let i = 0; i < cookies.length; i++) {
			if (cookies[i]["name"] == "bili_jct") {
				finalVal = cookies[i]["value"];
				break;
			}
		}

		biliJctData = finalVal;
		return finalVal;
	});
}


window.addEventListener("load", function () {
	playerContainer = document.getElementById("player_container");
	videoContainer = document.getElementById("player_videoContainer");;
	commentContainer = document.getElementById("player_scrComment");
	openBtn = document.getElementById("player_openNewBtn");
	closeBtn = document.getElementById("player_closeBtn");
	likeBtn = document.getElementById("player_likeBtn");
	coinBtn = document.getElementById("player_coinBtn");
	scrSwitchBtn = document.getElementById("player_scrSwitchBtn");

	/* 登录数据获取 */
	getJctStr();

	/* 按钮事件监听 */
	openBtn.addEventListener("click", function () {
		chrome.tabs.create({ url: "https://www.bilibili.com/video/" + bvidPlayingNow });
	});
	closeBtn.addEventListener("click", function () {
		playerContainer.style.display = "none";
		videoContainer.src = "";
		player_scrCommerts = [];
		player_scrCommertCnt = 0;
	});
	likeBtn.addEventListener("click", function () {
		doLikeVid(bvidPlayingNow);
	});
	coinBtn.addEventListener("click", function () {
		doGiveCoin(bvidPlayingNow);
	});
	scrSwitchBtn.addEventListener("click", function() {
		player_fancyScreenComment = player_fancyScreenComment?false:true;
		alert("弹幕模式已切换，当前模式：" + (player_fancyScreenComment?"全屏滑动弹幕模式":"简单弹幕模式") );
	})


	setInterval(function () {
		if (!player_scrCommerts || player_scrCommerts.length == 0) { return; }
		try {
			if (player_scrCommerts[player_scrCommertCnt]["time"] <= videoContainer.currentTime) {
				if(player_fancyScreenComment){
					showScreenComment(player_scrCommerts[player_scrCommertCnt]["text"]);
				} else {
					commentContainer.innerHTML = "<b>「弹幕」</b>" + player_scrCommerts[player_scrCommertCnt]["text"];
				}
				player_scrCommertCnt += 1;
			}
		} catch (e) { console.log("弹幕装填出错（显示时）" + e) }
	}, 100);
});
