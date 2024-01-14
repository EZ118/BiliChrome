var bvidPlayingNow = "";
var scrCommentNow = [];
var player_scrCommertCnt = 0;

function ajaxGet(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) { callback(xhr.responseText); }
			else { callback("Error: " + xhr.status); }
		}
	};
	xhr.open("GET", url, true);
	xhr.send();
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
        for(var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof(obj[nodeName]) == "undefined") {
                obj[nodeName] = xml2json(item);
            } else {
                if (typeof(obj[nodeName].length) == "undefined") {
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

function getScreenComment(cid){
	ajaxGet("https://comment.bilibili.com/" + cid + ".xml",function(s){
		cInfo = xml2json(str2xml(s)).i.d;
		newInfo = [];
		for(let i = 0; i < cInfo.length; i ++){
			try{
				newInfo.push({ "text": cInfo[i]["#text"], "time": parseFloat(cInfo[i]["@attributes"]["p"].split(",")[0]) });
			}catch(e){
				console.log("弹幕装填出错（解析时）")
			}
		}
		scrCommentNow = newInfo.sort(commentSortMethod);
	});
}

function openPlayer(bvid){
	playerContainer = document.getElementById("player_container");
	videoContainer = document.getElementById("player_videoContainer");
	videoTitle = document.getElementById("player_title");
	videoDesc = document.getElementById("player_descArea");
	openBtn = document.getElementById("player_openNewBtn");
	closeBtn = document.getElementById("player_closeBtn");

	playerContainer.style.display = "block";
	
	if(bvid[0] == "B"){
		urlStr = "bvid=" + bvid;
	} else {
		urlStr = "aid=" + bvid;
	}
	ajaxGet("https://api.bilibili.com/x/web-interface/view?" + urlStr, function(VideoInfo){
		/* 获取视频信息 */
		VideoInfo = JSON.parse(VideoInfo);
		cid = VideoInfo["data"]["pages"][0]["cid"];
		bvid = VideoInfo["data"]["bvid"];
		aid = VideoInfo["data"]["aid"];
		videoTitle.innerHTML = VideoInfo["data"]["title"];
		videoDesc.innerHTML = VideoInfo["data"]["desc"];

		getScreenComment(cid); /* 获取弹幕 */

		ajaxGet("https://api.bilibili.com/x/player/playurl?type=mp4&platform=html5&bvid=" + bvid + "&cid=" + cid + "&qn=64",function(result){
			/* 获取视频播放源 */
			vidUrl = JSON.parse(result).data.durl[0].url;
			videoContainer.src = vidUrl;
			bvidPlayingNow = bvid;
		});
		ajaxGet("https://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&type=1&sort=2&oid=" + aid, function(result){
			/* 获取评论 */
			ReplyInfo = JSON.parse(result);
			textAll = parseComments(ReplyInfo.data.replies);
			videoDesc.innerHTML += "<hr><b style='font-size:18px;'>[评论]</b><br>" + textAll;
		});
	});
}

window.addEventListener("load", function(){
	playerContainer = document.getElementById("player_container");
	videoContainer = document.getElementById("player_videoContainer");;
	commentContainer = document.getElementById("player_scrComment");
	openBtn = document.getElementById("player_openNewBtn");
	closeBtn = document.getElementById("player_closeBtn");

	openBtn.addEventListener("click", function(){
		chrome.tabs.create({ url: "https://www.bilibili.com/video/" + bvidPlayingNow });
	});
	closeBtn.addEventListener("click", function(){
		playerContainer.style.display = "none";
		videoContainer.src = "";
		player_scrComment = [];
		player_scrCommertCnt = 0;
	});

	setInterval(function(){
		if(!player_scrComment || player_scrComment == [] ){ return; }
		try{
			if ( scrCommentNow[player_scrCommertCnt]["time"] <= videoContainer.currentTime){
				commentContainer.innerHTML = "<b>「弹幕」</b>" + scrCommentNow[player_scrCommertCnt]["text"];
				player_scrCommertCnt += 1;
			}
		} catch(e){ console.log("弹幕装填出错（显示时）") }
	}, 500);
});
