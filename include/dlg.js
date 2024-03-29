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

function showToast(message, duration) {
	duration = duration ? duration : "3000";
	var toast = $('#toast_container');
	toast.text(message);
	toast.fadeIn(200);
	setTimeout(function () {
		toast.fadeOut(200);
	}, duration);
}

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

			var aHidden = $("#dlg_container").is(":hidden");
			var bHidden = $("#player_container").is(":hidden");

			if (!bHidden) {
				closePlayer();
			} else if (!aHidden) {
				closeDlg();
			} else {
				closePlayer();
			}

			return false;
		}
	});
});

window.onbeforeunload = function (e) {
	e = e || window.event;
	if (e) {
		e.returnValue = "nothing";
	}
	return "nothing";
}