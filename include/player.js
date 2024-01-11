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
			ReplyInfo = JSON.parse(result);
			let textAll = "";
			for (let i = 0; i < ReplyInfo.data.replies.length; i ++){
				singleReply = ReplyInfo.data.replies[i];
				textAll += "【" + singleReply.member.uname + "】 " + singleReply.content.message + "<br>";
			}
			videoDesc.innerHTML += "<hr><b>评论：</b><br>" + textAll;
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