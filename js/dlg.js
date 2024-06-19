/* 自定义对话框 */
var dlgOpenNewNow = "";

function openDlg(title, html, url) {
	if (!url) { url = ""; }

	$('#dlg_container').fadeIn(200);
	$('#dlg_content').html(html);
	$('#dlg_title').html(title);
	dlgOpenNewNow = url;
}
function closeDlg() {
	$('#dlg_container').fadeOut(200);
	$('#dlg_content').html("");
	$('#dlg_title').html("[默认标题]");
	dlgOpenNewNow = "";
}

/* 自定义Toast */
function showToast(message, duration) {
	duration = duration ? duration : "3000";
	var toast = $('#toast_container');
	toast.text(message);
	toast.fadeIn(200);
	setTimeout(function () {
		toast.fadeOut(200);
	}, duration);
}

/* 全局事件 */
$(document).ready(function () {
	$('#dlg_openNewBtn').click(function () {
		chrome.tabs.create({ url: dlgOpenNewNow });
	});

	$('#dlg_closeBtn').click(function () {
		closeDlg();
	});


	$(document).keydown(function (event) {
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