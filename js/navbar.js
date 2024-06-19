const navbar_items = [
    {
        "title": "功能",
        "href": "#"
    },
    {
        "title": "搜索视频",
        "href": "#nav_search",
        "icon": "<i class='icons10-search'></i>"
    },
    {
        "title": "推荐列表",
        "href": "#nav_home",
        "icon": "<i class='icons10-home'></i>"
    },
    {
        "title": "热门视频",
        "href": "#nav_hot",
        "icon": "<i class='icons10-numbered-list'></i>"
    },
    {
        "title": "关注动态",
        "href": "#nav_subscriptions",
        "icon": "<i class='icons10-heart'></i>"
    },
    {
        "title": "我的",
        "href": "#"
    },
    {
        "title": "空间主页",
        "href": "#nav_space",
        "icon": "<i class='icons10-user'></i>"
    },
    {
        "title": "收藏夹",
        "href": "#myfav",
        "icon": "<i class='icons10-bookmark'></i>"
    },
    {
        "title": "稍后再看",
        "href": "#watchlater",
        "icon": "<i class='icons10-box'></i>"
    },
    {
        "title": "历史记录",
        "href": "#history",
        "icon": "<i class='icons10-history'></i>"
    }
];

async function init_navbar_ul(active_item = "推荐列表") {
    for (const navbar_item of navbar_items) {
        const is_active = navbar_item.title === active_item ? 'active' : init_navbar_top_ul(active_item);

        let item;
        if (navbar_item.href == "#") {
            item = document.createElement('div');
            item.innerHTML = `<h1>${navbar_item.title}</h1><div class="app-hr"></div>`;
        } else {
            item = document.createElement('li');
            item.className = "app-navbar-list-item";
            item.innerHTML = `<a href="${navbar_item.href}" class="${is_active}">
                    ${navbar_item.icon}
                    <span>${navbar_item.title}</span>
                </a>`;
        }
        document.getElementById("app-navbar-list").appendChild(item);
    };
}

var lastNavbarTab = "推荐列表";

function init_navbar_top_ul(active_itm) {
    let navbar_items = document.getElementsByClassName("app-navbar-list-item");
    Array.from(navbar_items).forEach((el) => {
        if (el.innerText == active_itm) {
            el.querySelector("a").classList.add("active");
        } else if (el.innerText == lastNavbarTab) {
            el.querySelector("a").classList.remove("active");
        }
    });
    lastNavbarTab = active_itm;
}


function navbarCtrl() {
    var data = window.location.hash.substring(1);
    var tab = data.split("_")[1];
    if (tab == "home") {
        init_navbar_top_ul("推荐列表");
    } else if (tab == "hot") {
        init_navbar_top_ul("热门视频");
    } else if (tab == "subscriptions") {
        init_navbar_top_ul("关注动态");
    } else if (tab == "space") {
        init_navbar_top_ul("空间主页");
    } else if (tab == "search") {
        init_navbar_top_ul("搜索视频");
    }
}

$(document).ready(function () {
    init_navbar_ul("推荐列表");
    navbarCtrl();
});
window.addEventListener('popstate', function (event) {
    navbarCtrl();
});