class VideoPlayer {
	constructor() {
		// 播放器初始化，应该在页面加载时执行
		this.ele_container = $("#player_container");
		this.ele_title = $("#player_title");
		this.ele_descArea = $("#player_descArea");
		this.ele_videoList = $("#player_videoList");
		this.ele_videoContainer = $("#player_videoContainer");
		this.ele_danmu = $("#player_simpleDanmu");

		// 播放器正在播放的视频ID
		this.bvid = "";
		this.aid = "";
		this.cid = "";

		// 弹幕初始化
		this.danmuList = [];
		this.danmuCnt = 0;


		// 加载预设
		this.config = {
			"HD_Quality_As_Default": false,
			"Advanced_DanMu_As_Default": false,
			"DanMu_Color": "#FFFFFF"
		}
		getConfig("player.HD_Quality_As_Default", (val) => {
			this.config.HD_Quality_As_Default = val ? true : false;
		});
		getConfig("player.Advanced_DanMu_As_Default", (val) => {
			this.config.Advanced_DanMu_As_Default = val ? true : false;
		});
		getConfig("player.DanMu_Color", (val) => {
			this.config.DanMu_Color = val ? true : false;
		});

		// 按钮事件监听
		$("#player_openNewBtn").click(() => chrome.tabs.create({ url: "https://www.bilibili.com/video/" + this.bvid })); // 在新标签页打开
		$("#player_closeBtn").click(() => this.close()); // 关闭播放器

		$("#player_likeBtn").click(() => this.doLikeVid(this.bvid)); // 点赞
		$("#player_coinBtn").click(() => this.doGiveCoin(this.bvid)); // 投币
		$("#player_watchlaterBtn").click(() => this.doWatchLater(this.bvid)) // 稍后再看

		$("#player_scrSwitchBtn").click(() => {
			this.config.Advanced_DanMu_As_Default = !this.config.Advanced_DanMu_As_Default; // 切换弹幕模式
			modal.toast("弹幕模式已切换，当前模式：" + (this.config.Advanced_DanMu_As_Default ? "滚动弹幕模式" : "简单弹幕模式"));
			$("#player_simpleDanmu").text("");
		});
		$("#player_pipBtn").click(() => {
			var pip = $("#player_videoContainer")[0].requestPictureInPicture(); // 切换画中画
			modal.toast("画中画", 1000);
		});
		$("#player_highQnBtn").click(() => {
			/* 切换高画质 */
			this.config.HD_Quality_As_Default = !this.config.HD_Quality_As_Default;
			modal.toast("已切换至" + (this.config.HD_Quality_As_Default ? "高画质" : "低画质"), 5000);
			this.loadVideoSource(this.bvid, this.cid);
		});

		// 侧边栏标签切换
		$("#player_sidebarTab").click(() => {
			const { selectedIndex } = document.querySelector('#player_sidebarTab');
			if (selectedIndex == 0) {
				this.ele_descArea.show();
				this.ele_videoList.hide();
			} else {
				this.ele_descArea.hide();
				this.ele_videoList.show();
			}
		});

		// 弹幕输出
		setInterval(() => {
			if (!this.danmuList || this.danmuList.length == 0 || this.danmuList.length <= this.danmuCnt) { return; }
			try {
				if (this.danmuList[this.danmuCnt]["time"] <= $("#player_videoContainer")[0].currentTime) {
					if (this.config.Advanced_DanMu_As_Default) {
						const containerWidth = this.ele_container.innerWidth() - 380;
						const containerHeight = this.ele_container.innerHeight() - 20;
						const pageH = parseInt(Math.random() * containerHeight);
						const newSpan = $("<div class='player_danmuText'></span>");
						newSpan.appendTo("#player_simpleDanmu")
							.css("left", (containerWidth - newSpan.innerWidth() + 20))
							.css("top", pageH)
							.css("color", this.config.DanMu_Color)
							.text(this.danmuList[this.danmuCnt]["text"])
							.animate({ "left": -500 }, 10000, "linear", () => $(this).remove());
					} else {
						this.ele_danmu.html("<b>「弹幕」</b>" + this.danmuList[this.danmuCnt]["text"]);
					}
					this.danmuCnt += 1;
				}
			} catch (e) { console.log("弹幕装填出错（显示时）" + e) }
		}, 100);

		// 视频播放器事件绑定
		this.ele_videoContainer.bind('loadedmetadata', () => {
			// 视频帧加载完毕后自动播放
			this.ele_videoContainer[0].play();
			
			$("#dynamic_loader").hide();
		});
		this.ele_videoContainer.bind('error', () => {
			// 视频加载失败，关闭加载球
			$("#dynamic_loader").hide();
		});
		this.ele_videoContainer.bind('ended', () => {
			// 视频播放完毕，重置时间和弹幕计数器
			$("#player_videoContainer")[0].currentTime = 0;
			this.danmuCnt = 0;
			modal.toast("视频播放完毕", 1000);
		});

		console.log("[VideoPlayer] 已初始化");
	}

	open(option) {
		// 显示播放器并展示指定视频
		// option 示例：{ bvid: "BV1Zy4y1C7ZV", aid: "123456", videoList: "watch_later", refreshOnly: false }

		// 显示加载球
        $("#dynamic_loader").show();

		/* 视频ID */
		var urlStr = "";
		if (option.bvid) {
			urlStr = "bvid=" + option.bvid;
		} else if (option.aid) {
			urlStr = "aid=" + option.aid;
		} else {
			console.log("[ERROR] 播放器参数错误：缺少一个可用的bvid或aid");
			modal.toast("播放器参数错误");
			return;
		}

		this.ele_container.fadeIn(200);
		this.option = option;

		/* 视频详情 */
		$.get(`https://api.bilibili.com/x/web-interface/view?${urlStr}`, (VideoInfo) => {
			/* 获取视频信息 */
			var cid = VideoInfo["data"]["cid"];
			var cidPages = VideoInfo["data"]["pages"];
			var bvid = VideoInfo["data"]["bvid"];
			var aid = VideoInfo["data"]["aid"];
			var desc = VideoInfo["data"]["desc"] || "-";
		
			desc = desc.replace(/\n/g, "<br>");
			desc = limitConsecutiveChars(desc);
		
			this.ele_title.html(VideoInfo["data"]["title"]);
			this.ele_descArea.html("<b class='player_blockTitle'>详情</b><br>" + desc);
		
			this.aid = aid;
			this.bvid = bvid;
		
			if (cidPages.length > 1) { this.loadCidList(cidPages); } /* 显示分P视频列表 */
			this.getDanmu(cid); /* 获取弹幕 */
			this.loadVideoSource(bvid, cid); /* 获取视频源 */
		
			getUserCard(VideoInfo["data"]["owner"]["mid"], (card) => {
				/* 获取UP主卡片 */
				$("#player_descArea").prepend(`<a href="#uid_${card.data.uid}_top">` + limitConsecutiveChars(card.html).replace(/\ \ /g, "").replace(/\n/g, "").replace('type="outlined"', 'type="outlined" style="border:none;"') + `</a>`);
			});
		
			$.get(`https://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&ps=20&type=1&sort=2&oid=${aid}`, (ReplyInfo) => {
				/* 获取评论 */
				this.ele_descArea.append(`<br><b class='player_blockTitle'>评论</b><br><div class='reply_container'>${this.parseComments(ReplyInfo.data.replies)}<hr style='border-bottom:2px dashed #91919160;'></div>`);
		
				$(document).on('click', '.reply_container .more_reply', (evt) => {
					// 当用户点击了评论回复，则显示更多评论
					const clickedEle = $(evt.target);
					let rpid = clickedEle.parent().parent().attr("rpid") || clickedEle.parent().attr("rpid") || clickedEle.attr("rpid");
					this.showMoreReplies(rpid);
				});
			});
		});

		if (option.refreshOnly) { return; }

		/* 侧边栏列表 */
		if (option.videoList == "watch_later") {
			// 如果是从稍后再看列表进入的话，侧边栏显示稍后再看列表
			$("#player_sidebarTab_2").text("稍后再看");

			$.get(`https://api.bilibili.com/x/v2/history/toview`, (tjlist) => {
				var WebList = tjlist.data.list.map(item => ({
					bvid: item.bvid,
					aid: item.aid,
					pic: item.pic,
					title: item.title,
					desc: '- 点赞数量: ' + item.stat.like + '\n- 视频简介: ' + (item.desc ? item.desc : "无简介"),
					author: { uid: item.owner.mid, name: item.owner.name }
				}));
				this.ele_videoList.html(card.video_slim(WebList, true));
			});
		} else {
			// 如果是从普通视频页面进入的话，侧边栏显示推荐视频
			$("#player_sidebarTab_2").text("相关推荐");

			$.get(`https://api.bilibili.com/x/web-interface/archive/related?${urlStr}`, (tjlist) => {
				var WebList = tjlist.data.map(item => ({
					bvid: item.bvid,
					aid: item.aid,
					pic: item.pic,
					title: item.title,
					desc: '- 点赞数量: ' + item.stat.like + '\n- 视频简介: ' + (item.desc ? item.desc : "无简介"),
					author: { uid: item.owner.mid, name: item.owner.name }
				}));
				this.ele_videoList.html(card.video_slim(WebList));
			});
		}

		return option;
	}

	close() {
		// 关闭播放器
		this.ele_container.fadeOut(150);
		this.ele_videoContainer.attr("src", "");
		this.danmuList = [];
		this.danmuCnt = 0;

		this.option = {};

		window.location.hash = "#default";

		
        $("#dynamic_loader").hide();
	}

	parseComments(comments) {
		// 解析评论；将评论列表中的每一项递归解析，并返回解析后的字符串（html），由主函数统一调用
		let result = '';

		$.each(comments, (index, comment) => {
			const { rpid, member, content, replies, ctime, like, reply_control } = comment;
			const timeString = new Date(ctime * 1000).toLocaleDateString();

			/* 显示评论图片 */
			let pictureList = "";
			if (content.pictures && content.pictures.length > 0) {
				$.each(content.pictures, (index, pic) => pictureList += `<a href="#img-${pic.img_src}-top"><img src='${pic.img_src}@176w_176h_1c_1s.avif' class='image' loading='eager' /></a>`);
			}

			/* 显示评论回复 */
			let replyList = "";
			if (replies && replies.length > 0) {
				replyList += `<div class="more_reply" rpid="${rpid}">`;
				$.each(replies, (idx, cmt) => {
					replyList += `<s-ripple class="more_reply_item">
							<span class="username">${cmt.member.uname}: </span>
							<span>${cmt.content.message}</span>
						</s-ripple>`;
				})
				replyList += `</div>`;
			}

			result += `<div class="reply_item">
					<a class="username" href="#uid_${member.mid}_top">${member.uname}</a><br>
					<div class="content">
						${content.message}<br/>
						${pictureList}
					</div>
					<i class="other_detail">
						${like}赞 &nbsp; ${timeString} &nbsp; 
						${reply_control.location ? reply_control.location.split("：")[1] : ""}
					</i>
					${replyList}
				</div>`;
		});
		return result;
	}

	showMoreReplies(rpid) {
		// 在对话框中展示单条评论下的所有回复，rpid即评论ID
		$.get(`https://api.bilibili.com/x/v2/reply/reply?jsonp=jsonp&pn=1&ps=20&type=1&sort=2&oid=${this.aid}&root=${rpid}`, (ReplyInfo) => {
			modal.open(
				"更多评论",
				`<div class='reply_container'>${this.parseComments(ReplyInfo.data.replies)}</div>`,
				`https://www.bilibili.com/video/${this.bvid}`,
				true
			);
		});
	}

	getDanmu(cid) {
		// 获取弹幕文件，并解析内容，将所有条目按照时间顺序排序；最终存储在全局变量 player_danmuList 中
		$.get(`https://comment.bilibili.com/${cid}.xml`, (s) => {
			var danmuList = [];

			$(s).find("d").each(function () { // 使用普通函数
				try {
					const pAttr = $(this).attr("p"); // 获取 p 属性
					if (!pAttr) {
						console.warn("弹幕缺少 p 属性", $(this));
						return; // 跳过无效的弹幕
					}
					const time = parseFloat(pAttr.split(",")[0]);
					const text = $(this).text();
					danmuList.push({ text, time });
				} catch (e) {
					console.error("弹幕装填出错（解析时）", e);
				}
			});

			this.danmuList = danmuList.sort((a, b) => a.time - b.time);
		});
	}

	loadVideoSource(bvid, cid) {
		// 加载视频源，需要bvid和cid
		this.cid = cid;

		$.get(`https://api.bilibili.com/x/player/playurl?type=mp4&platform=html5&bvid=${bvid}&cid=${cid}&qn=64&high_quality=${this.config.HD_Quality_As_Default ? 1 : 0}`, (result) => {
			this.ele_videoContainer.attr("src", result.data.durl[0].url);
		});
	}

	loadCidList(pages) {
		/* 如果视频包含多个分P视频，则加载分P列表 */
		var cidList = "";
		$.each(pages, (index, item) => {
			cidList += `<s-chip type='${(index == 0) ? "filled-tonal" : "outlined"}' class='player_cidListItem' cid-data='${item.cid}' page-num='${item.page}' title='${item.part}'>${item.part}</s-chip>`;
		});
		this.ele_descArea.append("<br><hr><b class='player_blockTitle'>选集</b><div class='flex_container'>" + cidList + "</div>");
		$(".player_cidListItem").click((evt) => {
			var cid = $(evt.currentTarget).attr("cid-data");
			var page = $(evt.currentTarget).attr("page-num");

			$(".player_cidListItem").attr("type", "outlined");
			$(evt.currentTarget).attr("type", "filled-tonal");

			modal.toast("正在加载分P视频 [P" + page + "]");
			this.loadVideoSource(this.bvid, cid);
			this.getDanmu(cid);
		});
	}

	doLikeVid(bvid) {
		// 点赞视频
		$.post(`https://api.bilibili.com/x/web-interface/archive/like`, `bvid=${bvid}&like=1&csrf=${biliJctData}`)
			.done((res) => {
				if (res.code == 0) { modal.toast("点赞成功"); }
				else if (res.code == 65006) { modal.toast("已赞过"); }
				else { modal.toast("点赞失败 [" + res.code + "] \n(" + res.message + ")"); }
			})
			.fail((res) => {
				modal.toast("点赞失败，请求被拦截");
			})
	}

	doGiveCoin(bvid) {
		// 投币视频 
		$.post(`https://api.bilibili.com/x/web-interface/coin/add`, `bvid=${bvid}&upid=114514&multiply=1&avtype=1&csrf=${biliJctData}`)
			.done((res) => {
				if (res.code == 0) { modal.toast("投币成功"); }
				else if (res.code == 65006) { modal.toast("已投过"); }
				else { modal.toast("投币失败 [" + res.code + "] \n(" + res.message + ")"); }
			})
			.fail((res) => {
				modal.toast("投币失败，请求被拦截");
			})
	}

	doWatchLater(bvid) {
		// 投币视频
		$.post(`https://api.bilibili.com/x/v2/history/toview/add`, `bvid=${bvid}&csrf=${biliJctData}`)
			.done((res) => {
				if (res.code == 0) { modal.toast("已添加到稍后再看"); }
				else { modal.toast("添加失败 [" + res.code + "] \n(" + res.message + ")"); }
			})
			.fail((res) => {
				modal.toast("添加失败，请求被拦截");
			})
	}
}