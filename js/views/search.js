import { toggleLoader, isLoading } from "../components/loader.js";
import { getSearchResults, getSearchSuggestions } from '../api/index.js';
import { VideoCard, LiveCard, UserCard } from "../components/card.js";

var cardList = []; // 视频列表
var kwSuggestList = []; // 搜索词推荐列表
var keyword = "";
var page = 1; // 默认初始页码
var category = "video"; // 默认搜索类型

function loadSearchResult(scrollRefresh) {
    toggleLoader(true);
    getSearchResults(keyword, category, page)
        .then((data) => {
            if (scrollRefresh) {
                cardList = cardList.concat(data);
            } else {
                cardList = data;
            }
            toggleLoader(false);
        })
        .catch((error) => {
            toggleLoader(false);
        });
}

function loadSearchSuggestion(val) {
    if (val.length % 3 == 2) {
        getSearchSuggestions(val)
            .then((data) => {
                kwSuggestList = data;
                m.redraw();
            });
    } else if (val.length == 0) {
        kwSuggestList = [];
        m.redraw();
    }
}

function switchTab(tabData) {
    scrollTo(0, 0);
    page = 1;
    category = tabData;
    loadSearchResult();
}


const SearchView = {
    oninit() {
        page = 1;
    },

    onupdate() {
        if (m.route.param("kw") && m.route.param("kw") != keyword) {
            page = 1;
            keyword = decodeURIComponent(m.route.param("kw"));
            document.querySelector("header .SearchBox").value = keyword;
            loadSearchResult();
        }
    },

    view(vnode) {
        if (cardList.length == 0) {
            return m(".container.search-view", [
                m(".logo", [
                    m("img", { src: "./img/logo.svg", height: "125px" }),
                    " | 搜索"
                ]),
                m("br"),
                m("input[type='text'].search-box",
                    {
                        placeholder: "键入关键字搜索",
                        onkeyup: (e) => {
                            if (e.key == 'Enter') {
                                page = 1;
                                keyword = e.target.value;
                                document.querySelector("header .SearchBox").value = keyword;
                                loadSearchResult();
                            } else {
                                loadSearchSuggestion(e.target.value)
                            }
                        }
                    }),

                (kwSuggestList.length) ? m(
                    ".searchSuggestion",
                    kwSuggestList.map((item) => m(".item", {
                        onclick: () => {
                            vnode.dom.querySelector(".search-box").value = item;
                            setTimeout(() => vnode.dom.querySelector(".search-box").focus(), 10)
                        },
                        ondblclick: () => {
                            page = 1;
                            keyword = item;
                            document.querySelector("header .SearchBox").value = item;
                            loadSearchResult();
                        }
                    }, item))) : ""
            ]);
        }

        if (cardList.length > 0) {
            // 如果搜索结果存在
            return m(".container.search-view", [
                m(".tabbar", [
                    m(".tab", { class: (category == "video") ? "selected" : null, onclick: () => switchTab("video") }, "视频"),
                    m(".tab", { class: (category == "live") ? "selected" : null, onclick: () => switchTab("live") }, "直播"),
                    m(".tab", { class: (category == "bili_user") ? "selected" : null, onclick: () => switchTab("bili_user") }, "用户")
                ]),
                m(".cardlist",
                    {
                        onscroll: (e) => {
                            if (isLoading) { return; }
                            const { scrollTop, clientHeight, scrollHeight } = e.target;
                            if (scrollTop + clientHeight >= scrollHeight - 10) {
                                page++;
                                loadSearchResult(true);
                            }
                        }
                    },
                    cardList.map((item) => {
                        // 如果正在加载不同类别的卡片，则暂时不渲染（否则会导致渲染数据错误）
                        if (page == 1 && isLoading) return;

                        if (category == "video") {
                            return m(VideoCard, { data: item })
                        } else if (category == "live") {
                            return m(LiveCard, { data: item })
                        } else if (category == "bili_user") {
                            return m(UserCard, { data: item })
                        }
                    })
                )
            ])
        }
    }
};

export default SearchView;