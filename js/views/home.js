import { toggleLoader, isLoading } from "../components/loader.js";
import { getHomeRecommend, getHomePopular, getHomeLiveRooms } from '../api/index.js';
import { VideoCard, LiveCard } from "../components/card.js";

var currentTab = "recommand"; // 默认选中的标签页
var currentPage = 1; // 默认初始页码
var cardList = []; // 视频列表
var hasInited = false;

function showRecommendedVideos(scrollRefresh) {
    toggleLoader(true);

    getHomeRecommend()
        .then((data) => {
            if (scrollRefresh) {
                cardList = cardList.concat(data);
            } else {
                cardList = data;
                currentPage = 1;
            }
            toggleLoader(false);

            // 如果首次加载的列表无法达到瀑布流所需高度，则手动重复加载一次
            const cardlst = document.querySelector(".cardlist");
            const { clientHeight, scrollHeight } = cardlst;
            if (clientHeight >= scrollHeight) {
                showRecommendedVideos(true);
            }
        })
        .catch((error) => {
            console.error("Error fetching recommended videos:", error);
            toggleLoader(false);
        });
}
function showPopularVideos(scrollRefresh) {
    toggleLoader(true);

    getHomePopular(currentPage)
        .then((data) => {
            if (scrollRefresh) {
                cardList = cardList.concat(data);
            } else {
                cardList = data;
                currentPage = 1;
            }
            toggleLoader(false);

            // 如果首次加载的列表无法达到瀑布流所需高度，则手动重复加载一次
            const cardlst = document.querySelector(".cardlist");
            const { clientHeight, scrollHeight } = cardlst;
            if (clientHeight >= scrollHeight) {
                showPopularVideos(true);
            }
        })
        .catch((error) => {
            console.error("Error fetching recommended videos:", error);
            toggleLoader(false);
        });
}

function showLiveRooms() {
    toggleLoader(true);

    getHomeLiveRooms()
        .then((data) => {
            cardList = data;
            toggleLoader(false);
        })
        .catch((error) => {
            console.error("Error fetching recommended videos:", error);
            toggleLoader(false);
        });
}

function switchTab(tabData) {
    scrollTo(0, 0);
    currentPage = 1;
    currentTab = tabData;
    if (tabData === "recommand") {
        showRecommendedVideos();
    } else if (tabData === "popular") {
        showPopularVideos();
    } else if (tabData === "live") {
        showLiveRooms();
    }

    m.redraw();
}


const HomeView = {
    oninit() {
        // 首次加载时刷新
        if (!hasInited) {
            currentPage = 1;
            hasInited = true;
            switchTab("recommand");
        }
    },

    view() {
        return m(".container.home-view", [
            m(".tabbar", [
                m(".tab", { class: (currentTab == "recommand") ? "selected" : null, onclick: () => switchTab("recommand") }, "推荐"),
                m(".tab", { class: (currentTab == "popular") ? "selected" : null, onclick: () => switchTab("popular") }, "热门"),
                m(".tab", { class: (currentTab == "live") ? "selected" : null, onclick: () => switchTab("live") }, "直播")
            ]),
            m(".cardlist",
                {
                    onscroll: (e) => {
                        if (isLoading) { return; }
                        const { scrollTop, clientHeight, scrollHeight } = e.target;
                        if (scrollTop + clientHeight >= scrollHeight - 10) {
                            // 如果列表内容太多，则清空列表
                            if (currentPage >= 8) {
                                currentPage = 1;
                                if (currentTab == "recommand") {
                                    showRecommendedVideos();
                                } else if (currentTab == "popular") {
                                    showPopularVideos();
                                }
                                return;
                            }

                            // 不覆盖原先内容，并添加后一页的内容
                            currentPage++;
                            if (currentTab == "recommand") {
                                showRecommendedVideos(true);
                            } else if (currentTab == "popular") {
                                showPopularVideos(true);
                            }
                        }
                    }
                },
                (currentTab != "live") ? [
                    cardList.map((item) => {
                        return m(VideoCard, { data: item })
                    })
                ] : [
                    // 如果是直播间，则显示直播卡片
                    cardList.map((item) => {
                        return m(LiveCard, { data: item })
                    })
                ]
            )
        ])
    }
};

export default HomeView;