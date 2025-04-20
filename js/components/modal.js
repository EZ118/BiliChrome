class Modal {
	constructor() {
		this.url = "";

		$('#dlg_openNewBtn').click(() => {
			// 对话框右上角“在新标签页中打开”
			if (this.url[0] == "#") {
				// location.href = "dlgOpenNewNow";
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

	open(title, html, url, isTop) {
		if (!url) { url = ""; }
		if (isTop) { $('#dlg_container').css("z-index", "104"); }

		$('#dlg_container').fadeIn(200);
		$('#dlg_content').html(html);
		$('#dlg_title').html(title);
		this.url = url;
	}

	close() {
		$('#dlg_container').fadeOut(200, () => {
			if ($('#dlg_container').css("z-index") == "104") { $('#dlg_container').css("z-index", "") }

			$('#dlg_content').html("");
			$('#dlg_title').html("[默认标题]");
			this.url = "";
		});

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

