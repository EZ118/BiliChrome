/* 自定义对话框 */
var dlgOpenNewNow = "";

function openDlg(title, html, url, isTop) {
	if (!url) { url = ""; }
	if(isTop) { $('#dlg_container').css("z-index", "104"); }

	$('#dlg_container').fadeIn(200);
	$('#dlg_content').html(html);
	$('#dlg_title').html(title);
	dlgOpenNewNow = url;
}
function closeDlg() {
	if($('#dlg_container').css("z-index") === "104") { $('#dlg_container').css("z-index", "") }

	$('#dlg_container').fadeOut(200);
	$('#dlg_content').html("");
	$('#dlg_title').html("[默认标题]");
	dlgOpenNewNow = "";

	window.location.hash = "#default";
}



/* 全局事件 */
$(document).ready(function () {
	$('#dlg_openNewBtn').click(function () {
		/* 对话框右上角“在新标签页中打开” */
		if (dlgOpenNewNow[0] == "#") {
			location.href = "dlgOpenNewNow";
		} else {
			chrome.tabs.create({ url: dlgOpenNewNow });
		}
	});

	$('#dlg_closeBtn').click(function () {
		closeDlg();
	});

	$('#dlg_container').click(function (event) {
		/* 点击对话框之外，自动关闭对话框 */
		var target = $(event.target);
		if (!target.is('.dlg_container_real') && !target.is('.dlg_container_real *')) {
			closeDlg();
		}
	});

	$(document).keydown(function (event) {
		/* Ctrl + Q 快捷键关闭对话框事件处理 */
		if (event.ctrlKey && event.key === 'q') {
			event.preventDefault();

			var dlgHidden = $("#dlg_container").is(":hidden");
			var playerHidden = $("#player_container").is(":hidden");

			if (!playerHidden) {
				closePlayer();
			} else if (!dlgHidden) {
				closeDlg();
			} else {
				closePlayer();
			}

			return false;
		}
	});
});



/* 自定义Toast */
function showToast(message, duration) {
	sober.Snackbar.show(message);
}


function showNotification(title, message, image, button, onclick) {
    chrome.notifications.create({
        'type': 'basic',
        'iconUrl': image,
        'title': title,
        'message': message,
        'requireInteraction': true, // 使用 requireInteraction 代替 isClickable
        'buttons': [{
            'title': button || '查看'
        }]
    });

    chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
        if (buttonIndex === 0) {
            onclick();
        }
    });
}
