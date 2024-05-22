/* 自定义对话框 */
var dlgOpenNewNow = "";

function openDlg(title, html, url, style) {
	if (!url) { url = ""; }

	$('#dlg_container').fadeIn(200);
	$('#dlg_content').html(html);
	$('#dlg_title').html(title);
	dlgOpenNewNow = url;
	
	if (style) { $('#dlg_container').attr("style", style); }  /* 附加样式 */
}
function closeDlg() {
	//$('#dlg_container').fadeOut(200);
	$('#dlg_container').attr("style", "display:none;");
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

/* 悬浮搜索框 */
function showSearchBox(){
	$(".searchbox_container").fadeIn(200)
	$("#searchbox_searchInput").val("");
}
function closeSearchBox(){
	$(".searchbox_container").fadeOut();
}
$("#searchbox_searchClose").click(function () {
	$(".searchbox_container").fadeOut(150);
})
$("#searchbox_searchInput").keydown(function (e) {
	if (e.keyCode  == 13) {
		getSearchResult($(this).val());
		closeSearchBox();
	}
});

/* 全局事件 */

$(document).ready(function () {
	$('#dlg_openNewBtn').click(function () {
		chrome.tabs.create({ url: dlgOpenNewNow });
	});

	$('#dlg_closeBtn').click(function () {
		closeDlg();
	});


	$(document).keydown(function (event) {
		/* 快捷键: ctrl+Q快速关闭窗口 */
		if (event.ctrlKey && event.key === 'q') {
			event.preventDefault();

			var dlgHidden = $("#dlg_container").is(":hidden");
			var playerHidden = $("#player_container").is(":hidden");
			var searchHidden = $(".searchbox_container").is(":hidden");

			if (!searchHidden) {
				closeSearchBox();
			} else if (!playerHidden) {
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

/* 阻止页面关闭 */
/*
window.onbeforeunload = function (e) {
	e = e || window.event;
	if (e) {
		e.returnValue = "nothing";
	}
	return "nothing";
}
*/