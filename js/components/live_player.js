class LivePlayer {
	constructor() {
		// 播放器初始化
		this.ele_container = $("#live_container");
		this.ele_title = $("#live_title");
		this.ele_descArea = $("#live_descArea");
		this.ele_commentArea = $("#live_commentArea");
		this.ele_videoContainer = $("#live_videoContainer");

		// 播放器状态
		this.roomid = ""; // 正在播放的 roomid
		this.danmuList = []; // 实时评论列表
		this.danmuShowDelay = null; // 实时评论输出延迟
		this.hls = null; // hls 对象

		// 播放器配置
		this.config = {
			danmuReqFrequency: 6000, // 实时评论获取频率（请求1次/6000毫秒）
			danmuMaxSum: 60, // 最大显示弹幕数量
			showDanmu: true, // 是否显示实时评论
			quality: 3, // 视频画质, 2：流畅 3：高清 4：原画
		};

		// 初始化事件监听
		this.initEventListeners();

		/* 弹幕输出 */
		setInterval(() => {
			if (!this.danmuShowDelay || !this.config.showDanmu) { return; }
			else {
				this.getDanmu(this.roomid);
			}
		}, this.config.danmuReqFrequency);
	}

	initEventListeners() {
		// 按钮事件监听
		$("#live_openNewBtn").click(() => {
			chrome.tabs.create({ url: "https://live.bilibili.com/" + this.roomid }); // 在新标签页打开
		});
		$("#live_closeBtn").click(() => this.close()); // 关闭播放器
		$("#live_scrSwitchBtn").click(() => this.toggleDanmu()); // 切换弹幕模式
		$("#live_pipBtn").click(() => this.togglePictureInPicture()); // 切换画中画
		$("#live_qnSwitchBtn").click(() => this.toggleQuality()); // 切换画质
		$("#live_videoContainer").on("canplay", () => $("#dynamic_loader").hide()); // 视频加载完毕后隐藏加载球
	}

	showDanmu(danmuList) {
		// 装填弹幕
		var danmuCnt = 0;
		const maxDanmuCount = danmuList.length; // 设定的最大弹幕数量

		const intervalId = setInterval(function () {
			if (danmuCnt >= maxDanmuCount || danmuCnt >= danmuList.length) {
				clearInterval(intervalId); // 清除定时器
				return;
			}

			const danmu = danmuList[danmuCnt];
			// 显示弹幕的逻辑
			const newSpan = $("<div class='messageBubble'></div>");
			newSpan.text(danmu.text);
			newSpan.css("opacity", 0.5);

			newSpan.appendTo("#live_commentArea");
			$("#live_commentArea").scrollTop($("#live_commentArea").prop("scrollHeight"));

			// 弹幕动画
			newSpan.animate({ bottom: "+=50", opacity: 1 }, 600, "linear");

			danmuCnt += 1;
		}, this.danmuShowDelay);
	}

	getDanmu(room_id) {
		// 获取弹幕列表，并解析内容，将所有条目按照时间顺序排序
		const visibleDanmus = $("#live_commentArea .messageBubble");
		if (visibleDanmus.length > this.danmuMaxSum) {
			visibleDanmus.slice(0, visibleDanmus.length - this.danmuMaxSum).remove();
		}
	
		// 获取新弹幕
		$.get("https://api.live.bilibili.com/xlive/web-room/v1/dM/gethistory?roomid=" + room_id + "&room_type=0", (ReplyInfo) => {
			let newDanmuList = [];
			$.each(ReplyInfo.data.room, (index, item) => {
				const { nickname, text, timeline, id_str } = item;
				newDanmuList.push({ text, name: nickname, time: timeline, id: id_str });
			});
	
			const existingIds = new Set(this.danmuList.map(danmu => danmu.id));
	
			newDanmuList = newDanmuList.filter(danmu => !existingIds.has(danmu.id)); // 过滤掉已有的弹幕
	
			this.danmuList = newDanmuList;
	
			this.danmuShowDelay = this.config.danmuReqFrequency / this.danmuList.length;
	
			this.showDanmu(this.danmuList);
		});
	}

	loadStreamSource(cid) {
		// 加载视频源
		const platform = "h5"; // web 或 h5
		$.get(`https://api.live.bilibili.com/room/v1/Room/playUrl?cid=${cid}&platform=${platform}&quality=${this.config.quality}`, (result) => {
			const videoUrl = result.data.durl[0].url;

			if (Hls.isSupported()) {
				const videoEle = this.ele_videoContainer[0];
				this.hls = new Hls();
				this.hls.loadSource(videoUrl);
				this.hls.attachMedia(videoEle);

				this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
					videoEle.play();
					videoEle.muted = false;
					videoEle.controls = false;
				});
			} else {
				showToast("浏览器不支持 HLS 播放，请更新浏览器");
				$("#dynamic_loader").hide();
			}
		});
	}

	open(option) {
		// 显示播放器并展示指定视频
		if (!option.roomid) {
			console.log("[ERROR] 直播播放器参数错误：缺少一个可用的 roomid");
			showToast("直播播放器参数错误");
			return;
		}

		this.option = option;

		$("#dynamic_loader").show();
		this.ele_commentArea.empty();
		this.ele_container.fadeIn(200);

		// 获取视频信息
		$.get(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${option.roomid}`, (VideoInfo) => {
			const { room_id, title, live_time, area_name } = VideoInfo.data;
			this.roomid = room_id;

			const desc = `开播时间：${live_time} <br>直播分区：${area_name}`;
			this.ele_title.text(title);
			this.ele_descArea.html(`<b class='player_blockTitle'>详情</b><br>${desc}`);

			this.getDanmu(room_id); // 获取弹幕
			this.loadStreamSource(room_id); // 获取视频源
		});

		return option;
	}

	close() {
		// 关闭播放器
		if (this.hls) {
			this.hls.destroy();
		}
		this.ele_container.fadeOut(150);
		this.danmuList = [];
		this.danmuShowDelay = null;
		$("#dynamic_loader").hide();

		
		this.option = {};
		window.location.hash = "#default";
	}

	toggleDanmu() {
		// 切换弹幕模式
		this.config.showDanmu = !this.config.showDanmu;
		showToast(this.config.showDanmu ? "已启用实时弹幕" : "已关闭实时弹幕");

		if (this.config.showDanmu) {
			this.ele_commentArea.append("<p class='messageBubble_sys'>实时弹幕已启用</p>");
		} else {
			setTimeout(() => this.ele_commentArea.append("<p class='messageBubble_sys'>实时弹幕已暂停</p>"), this.config.danmuReqFrequency);
		}
	}

	togglePictureInPicture() {
		// 切换画中画
		const pip = this.ele_videoContainer[0].requestPictureInPicture();
		showToast("画中画", 1000);
	}

	toggleQuality() {
		// 切换画质
		this.config.quality = this.config.quality === 3 ? 2 : 3;
		showToast(`已切换为${this.config.quality === 3 ? "较高" : "普通"}画质（重新打开直播生效）`, 3000);
		this.loadStreamSource(this.roomid);
	}
}