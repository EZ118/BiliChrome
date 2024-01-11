var dlgOpenNewNow = "";

function openDlg(title,html,url){
	if(!url){ url = ""; }

	dlgContainer = document.getElementById("dlg_container");
	dlgContent = document.getElementById("dlg_content");
	dlgTitle = document.getElementById("dlg_title");

	dlgContainer.style.display = "block";
	dlgContent.innerHTML = html;
	dlgTitle.innerHTML = title;
	dlgOpenNewNow = url;
}

window.addEventListener("load", function(){
	dlgContainer = document.getElementById("dlg_container");
	closeBtn = document.getElementById("dlg_closeBtn");
	openBtn = document.getElementById("dlg_openNewBtn");

	openBtn.addEventListener("click", function(){
		chrome.tabs.create({ url: dlgOpenNewNow });
	});
	closeBtn.addEventListener("click", function(){
		dlgContainer.style.display = "none";
	});
});