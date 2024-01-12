var bvidPlayingNow = "";

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
		VideoInfo = JSON.parse(VideoInfo);
		cid = VideoInfo["data"]["pages"][0]["cid"];
		bvid = VideoInfo["data"]["bvid"];
		aid = VideoInfo["data"]["aid"];
		videoTitle.innerHTML = VideoInfo["data"]["title"];
		videoDesc.innerHTML = VideoInfo["data"]["desc"];
		ajaxGet("https://api.bilibili.com/x/player/playurl?type=mp4&platform=html5&bvid=" + bvid + "&cid=" + cid + "&qn=64",function(result){
			vidUrl = JSON.parse(result).data.durl[0].url;
			videoContainer.src = vidUrl;
			bvidPlayingNow = bvid;
		});
		ajaxGet("https://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&type=1&sort=2&oid=" + aid, function(result){
			//console.log(result);
			ReplyInfo = JSON.parse(result);
			textAll = parseComments(ReplyInfo.data.replies);
			videoDesc.innerHTML += "<hr><b style='font-size:18px;'>[评论]</b><br>" + textAll;
		});
	});
}

window.addEventListener("load", function(){
	playerContainer = document.getElementById("player_container");
	videoContainer = document.getElementById("player_videoContainer");
	openBtn = document.getElementById("player_openNewBtn");
	closeBtn = document.getElementById("player_closeBtn");

	openBtn.addEventListener("click", function(){
		chrome.tabs.create({ url: "https://www.bilibili.com/video/" + bvidPlayingNow });
	});
	closeBtn.addEventListener("click", function(){
		playerContainer.style.display = "none";
		videoContainer.src = "";
	});
});
