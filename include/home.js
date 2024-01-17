var currentTab = "home";

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

function getSearchResult(wd){
	/* 获取搜索结果 */
	if(!wd){return;}
	document.getElementById("item_container").innerHTML = "";
	document.getElementById("dynamic_loader").style.display = "block";
	ajaxGet("https://api.bilibili.com/x/web-interface/search/all/v2?keyword=" + encodeURI(wd), function(result){
		var tjlist = JSON.parse(result);
		var WebList = "<p style='margin:0px 10px 0px 10px;font-size:16px;'><b>" + wd + "</b>的搜索结果：</p><br>";
		for(var i = 0; i < tjlist.data.result[11].data.length; i++){
			let card = tjlist.data.result[11].data[i];
			WebList += `<div class='wide_singlebox'>
						 <a href="#bvid_` + card.bvid + `">
							 <img src='https:` + card.pic + `@412w_232h_1c.webp'><br>
						 </a>
						 <div height="100%">
						 	<a href="#aid_` + card.aid + `">
						 		<div class="wide_singlebox_vt">` + card.title + `</div>
						 	</a>
							<a href="#uid_` + card.mid + `">
							 	<div class="wide_singlebox_un">🔘&nbsp;` + card.author + `</div>
							</a>
						 </div>
					 </div>
				 `;
		}
		document.getElementById("item_container").innerHTML += WebList;
		document.getElementById("dynamic_loader").style.display = "none";
	});
}

function getRecommendedVideos(){
	/* 获取推荐视频列表 */
	document.getElementById("item_container").innerHTML = "";
	document.getElementById("dynamic_loader").style.display = "block";
	for(let i = 1; i <= 2; i ++) {
		//GetAjax("https://api.bilibili.com/x/web-interface/index/top/feed/rcmd?y_num=4&fresh_type=3&feed_version=V11&fresh_idx_1h=1&fetch_row=1&fresh_idx=1&brush=0&homepage_ver=1&ps=11&outside_trigger=", Add2Page);
		ajaxGet("https://api.bilibili.com/x/web-interface/index/top/rcmd?fresh_type=3&version=1&ps=14", function(result){
			var tjlist = JSON.parse(result);
			var WebList = "";
			for(var i = 0; i < tjlist.data.item.length; i++){
				WebList += `<div class='dynamic_singlebox'>
							 <a href="#bvid_` + tjlist.data.item[i].bvid + `">
								 <img src='` + tjlist.data.item[i].pic + `@412w_232h_1c.webp'><br>
								 <div class="dynamic_singlebox_vt">` + tjlist.data.item[i].title + `</div>
							 </a>
							 <a href="#uid_` + tjlist.data.item[i].owner.mid + `">
							 	<div class="dynamic_singlebox_un">🔘&nbsp;` + tjlist.data.item[i].owner.name + `</div>
							 </a>
						 </div>
					 `;
			}
			document.getElementById("item_container").innerHTML += WebList;
			document.getElementById("dynamic_loader").style.display = "none";
		});
	}
}

function getHotVideos(){
	/* 获取最热视频 */
	document.getElementById("item_container").innerHTML = "";
	document.getElementById("dynamic_loader").style.display = "block";
	ajaxGet("https://api.bilibili.com/x/web-interface/popular?ps=40&pn=1", function(result){
		var tjlist = JSON.parse(result);
		var WebList = "";
		for(var i = 0; i < tjlist.data.list.length; i++){
			WebList += `<div class='wide_singlebox'>
						 <a href="#bvid_` + tjlist.data.list[i].bvid + `">
							 <img src='` + tjlist.data.list[i].pic + `@412w_232h_1c.webp'><br>
						 </a>
						 <div height="100%">
						 	<a href="#bvid_` + tjlist.data.list[i].bvid + `">
						 		<div class="wide_singlebox_vt">` + tjlist.data.list[i].title + `</div>
						 	</a>
							<a href="#uid_` + tjlist.data.list[i].owner.mid + `">
							 	<div class="wide_singlebox_un">🔘&nbsp;` + tjlist.data.list[i].owner.name + `</div>
							</a>
						 </div>
					 </div>
				 `;
		}
		document.getElementById("item_container").innerHTML += WebList;
		document.getElementById("dynamic_loader").style.display = "none";
	});
}
function getSubscribedVideos(){
	/* 获取关注up主的视频更新 */
	document.getElementById("item_container").innerHTML = "";
	document.getElementById("dynamic_loader").style.display = "block";
	ajaxGet("https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new?type_list=8,512,4097,4098,4099,4100,4101", function(result){
		var tjlist = JSON.parse(result);
		var WebList = "";
		for(var i = 0; i < tjlist.data.cards.length; i++){
			let card = JSON.parse(tjlist.data.cards[i].card);
			WebList += `<div class='wide_singlebox'>
						 <a href="#aid_` + card.aid + `">
							 <img src='` + card.pic + `@412w_232h_1c.webp'><br>
						 </a>
						 <div height="100%">
						 	<a href="#aid_` + card.aid + `">
						 		<div class="wide_singlebox_vt">` + card.title + `</div>
						 	</a>
							<a href="#uid_` + card.owner.mid + `">
							 	<div class="wide_singlebox_un">🔘&nbsp;` + card.owner.name + `</div>
							</a>
						 </div>
					 </div>
				 `;
		}
		document.getElementById("item_container").innerHTML = WebList;
		document.getElementById("dynamic_loader").style.display = "none";
	});
}

function getUserSpace(uid){
	/* 获取指定用户动态 */
	var WebList = "";
	ajaxGet("https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=" + uid, function(result2){
		FeedJson = JSON.parse(result2);

		for(var i = 0; i < FeedJson.data.cards.length; i++){
			itm = FeedJson.data.cards[i];
			
			var ImgUrl = "";
			var VidDesc = "";
			var LinkUrl = "default";
			var card_json = JSON.parse(itm.card);
			try{ VidDesc = card_json.item.content; } catch(e){}
			try{//视频卡片
				VidDesc = card_json.title;
				if (card_json.pic){
					ImgUrl = '<img class="videopic" src="' + card_json.pic + '@240w_135h_1c.jpg" onerror="this.remove()">';
				}
				if(card_json.aid){LinkUrl = "aid_" + card_json.aid;}
				
			}catch(e){}
			
			try{
				if (card_json.item.pictures_count != null){
					//带图片的卡片
					VidDesc = card_json.item.description;
					for (var j = 0; j < card_json.item.pictures.length; j++){
						d = card_json.item.pictures[j];
						ImgUrl += `
							<a href="#img-` + encodeURI(d.img_src) + `">
								<img class="dailypic" src="` + d.img_src + `@256w_256h_1e_1c_!web-dynamic.jpg">
							</a>`;
						if(j % 3 == 2) {ImgUrl += "<br/>";}
					}
				} 
			}catch(e){}
			
			if (VidDesc == null) {VidDesc = "";}
			if (LinkUrl == null) {LinkUrl = "default";}
			
			if (VidDesc == "" && LinkUrl == "default" && (ImgUrl == null || ImgUrl == "")){}
			else{
				VidDesc = VidDesc.split("\n").join("<br>")
				WebList += `
					<div class='space_singlebox' align='left'>
						<a>
							<div class="space_singlebox_un">
								<img class="userpic" src='` + itm.desc.user_profile.info.face + `'>
								<label>&nbsp;` + itm.desc.user_profile.info.uname + `</label>
							</div>
						</a>
			      		<a href='#` + LinkUrl + `'>
							<div class='space_singlebox_vt'>` + VidDesc + `</div>
							` + ImgUrl + `
						</a>
				</div>`;
			}
		}
		openDlg("用户空间 (" + uid + ")", WebList, "https://space.bilibili.com/" + uid);
	});
}

function getUserHistory(){
	/* [用户个人] 获取个人视频播放历史 */
	ajaxGet("https://api.bilibili.com/x/web-interface/history/cursor?ps=30&type=archive", function(result){
		var tjlist = JSON.parse(result);
		var WebList = "";
		for(var i = 0; i < tjlist.data.list.length; i++){
			let item = tjlist.data.list[i];
			WebList += `<div class='dynamic_singlebox'>
						<a href="#bvid_` + item.history.bvid + `">
							<img src='` + item.cover + `@412w_232h_1c.webp'><br>
							<div class="dynamic_singlebox_vt">` + item.title + `</div>
						</a>
						<a href="#uid_` + item.author_mid + `">
						 	<div class="dynamic_singlebox_un">🔘&nbsp;` + item.author_name + `</div>
						</a>
					</div>
				`;
		}
		openDlg("观看历史（近30条）", WebList, "https://www.bilibili.com/account/history");
	});
}

function getMySpace(){
	/* [用户个人] 获取当前用户空间 */
	document.getElementById("item_container").innerHTML = "";
	document.getElementById("dynamic_loader").style.display = "block";
	ajaxGet("https://api.bilibili.com/x/space/v2/myinfo?", function(result){
		var usrInfo = JSON.parse(result);
		var uid = usrInfo.data.profile.mid;
		var WebList = `
			<br>
			<table class="myspace_topInfoBox" cellpadding="0" cellspacing="0">
				<tr>
					<td><img src="` + usrInfo.data.profile.face +`@256w_256h_1c.webp"></td>
					<td width="10px"></td>
					<td>
						<b class="usrName">` + usrInfo.data.profile.name + `</b>&nbsp;&nbsp;<i>` + usrInfo.data.profile.sex + `</i><br>
						LEVEL:&nbsp;<i>` + usrInfo.data.profile.level + `</i><br>
						<i>` + usrInfo.data.profile.sign + `</i>
					</td>
					<td width="200px"></td>
					<td align="center">
						<b class="usrNums">` + usrInfo.data.coins + `</b><br>
						<i>硬币</i>
					</td>
					<td width="30px"></td>
					<td align="center">
						<b class="usrNums">` + usrInfo.data.follower + `</b><br>
						<i>粉丝</i>
					</td>
				</tr>
			</table>
			<br>
			<div style="width:100%;display:flex;">
				<div class="myspace_dynamicSection">
					<p align="left">最近动态</p>
					<p align="right"><a href="#uid_` + uid + `">[查看]</a></p>
				</div>
				<div class="myspace_historySection">
					<p align="left">历史记录</p>
					<p align="right"><a href="#history_default">[查看]</a></p>
				</div>
			</div>
		`;
		document.getElementById("item_container").innerHTML = WebList;
		document.getElementById("dynamic_loader").style.display = "none";
	});
}

function getVidPlayingNow(){
	/* 当前其他设备正在播放提示框 */
	ajaxGet("https://api.bilibili.com/x/web-interface/history/continuation?his_exp=1200", function(result){
		vidInfo = JSON.parse(result);
		if(vidInfo.data != null){
			container = document.createElement("a");
			container.href = "#bvid_" + vidInfo.data.history.bvid;
			container.innerHTML = `<div class="continuation_alertBox">
					<img src="` + vidInfo.data.cover + `@240w_135h_1c.jpg">
					<b>` + vidInfo.data.title + `</b><br>
					<p>🔘&nbsp;` + vidInfo.data.author_name + `</p>
					<i>（4秒后自动关闭）</i>
				</div>`;
			document.body.appendChild(container);
			setTimeout(function(){
				container.remove();
			}, 4000);
		}
	});
}


window.onload = function(){
	document.referrer="https://www.bilibili.com/";
	getRecommendedVideos();
	getVidPlayingNow();

	window.addEventListener('popstate', function(event) {
		/* 通过URL变化，替代点击事件 */
		var data = window.location.href.split("#")[1];
		if(data[0] == "b" || data[0] == "a"){
			openPlayer(data.split("_")[1]);
		} else if(data[0] == "u"){
			getUserSpace(data.split("_")[1]);
		} else if(data[0] == "i"){
			openDlg("浏览图片", `<img src="` + data.split("-")[1] + `" width="100%">`, data.split("-")[1])
		} else if(data[0] == "n"){
			let tab = data.split("_")[1];
			/*if(tab == currentTab){return;}
			else*/ if(tab == "home"){getRecommendedVideos();}
			else if(tab == "hot"){getHotVideos();}
			else if(tab == "subscriptions"){getSubscribedVideos();}
			else if(tab == "space"){getMySpace();}
			else if(tab == "search"){getSearchResult( prompt("[搜索] 输入关键字搜索") );}
			currentTab = tab;
		} else if(data[0] == "h"){
			getUserHistory();
		}
	});
}
document.getElementById("RefreshBtn").onclick = function(){
	if(currentTab == "home"){getRecommendedVideos();}
	else if(currentTab == "hot"){getHotVideos();}
	else if(currentTab == "subscriptions"){getSubscribedVideos();}
	else if(currentTab == "space"){getMySpace();}
}


