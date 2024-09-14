$(document).ready(function () {
    /* 侧边主菜单 */
    $("s-navigation-item").click((evt) => {
        const link = $(evt.target).attr("href");
        //routeCtrl(hash = link)
        window.location.hash = link;
    });

    /* 侧栏彩蛋 */
    var eggBtnCnt = 0;
    $("#eggBtn").click(() => {
        eggBtnCnt ++;
        if (eggBtnCnt == 16) {
            showToast("这不是彩蛋...");
        } else if (eggBtnCnt == 32) {
            showToast("真不是彩蛋...");
        } else if (eggBtnCnt >= 64) {
            eggBtnCnt = 0;
            showToast("你疯了吧！");
        }
    });
});
