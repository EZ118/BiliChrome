class Modal {
	constructor() {
		// 初始化
		this.url = "";

		$('#dlg_openNewBtn').click(() => {
			// 对话框右上角“在新标签页中打开”
			if (this.url[0] == "#") {
				// location.href = this.url;
			} else {
				chrome.tabs.create({ url: this.url });
			}
		});

		$('#dlg_closeBtn').click(() => {
			this.close();
		});

		$('#dlg_container').click((event) => {
			/* 点击对话框之外，自动关闭对话框 */
			var target = $(event.target);
			if (!target.is('.dlg_container_real') && !target.is('.dlg_container_real *')) {
				this.close();
			}
		});

		console.log("[Modal] 已初始化");
	}

	open(title, html, url, isTop, isFullscreen) {
		// 显示对话框

		if (!url) { url = ""; }
		if (isTop) {
			// 如果设置了置顶
			$('#dlg_container').css("z-index", "104");
		}
		if (isFullscreen) {
			// 如果设置了全屏
			$('.dlg_container_real').css({ "width": "100vw", "height": "100vw", "top": 0, "left": 0, "transform": "initial" });
			$('#dlg_content').css({ "max-height": "calc(100vh - 47px)" });
		}

		$('#dlg_content').html(html);
		$('#dlg_title').html(title);
		$('#dlg_container').show();
		this.url = url;
	}

	close() {
		// 关闭对话框
		$('#dlg_container, .dlg_container_real, #dlg_content').removeAttr("style");

		$('#dlg_content, #dlg_title').empty();
		$('#dlg_container').hide();

		this.url = "";
		window.location.hash = "#default";
	}

	toast(message, duration) {
		// 显示消息提示框
		sober.Snackbar.builder(message);
	}

	notification(title, message, image, button, onclick) {
		// 显示系统消息通知
		chrome.notifications.create({
			'type': 'basic',
			'iconUrl': image,
			'title': title,
			'message': message,
			'requireInteraction': true,
			'buttons': [{
				'title': button || '查看'
			}]
		});

		chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
			if (buttonIndex === 0) {
				onclick();
			}
		});
	}
}


/* 全局事件 */
$(document).ready(function () {
	$(document).keydown(function (event) {
		/* Ctrl + Q 快捷键关闭对话框事件处理 */
		if (event.ctrlKey && event.key === 'q') {
			event.preventDefault();

			var dlgHidden = $("#dlg_container").is(":hidden");
			var playerHidden = $("#player_container").is(":hidden");
			var liveHidden = $("#live_container").is(":hidden");

			if (!playerHidden) {
				player.close();
			} else if (!liveHidden) {
				live_player.close();
			} else if (!dlgHidden) {
				modal.close();
			} else {
				player.close();
			}

			return false;
		}
	});
});

