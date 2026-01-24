// 主页面
import HomeView from "./views/home.js";
import DynamicView from "./views/dynamic.js";
import SearchView from "./views/search.js";
import MessageView from "./views/message.js";
import MineView from "./views/mine.js";

// 次页面
import SpaceView from "./views/space.js";
import VideoPlayerView from "./views/video_player.js";
import ImageViewerView from "./views/image_viewer.js";

// 部件
import { Loader } from "./components/loader.js";
import Toolbar from "./components/toolbar.js";
import Navbar from "./components/navbar.js";
import { ThemeStyleSheet } from "./components/theme.js";
import { Dialog } from "./components/dialog.js";


export const App = () => {
    // 渲染
    return {
        oncreate: () => {
            // 创建路由
            m.route(document.querySelector("main"), "/home", {
                "/home": HomeView,
                "/dynamic": DynamicView,
                "/search": SearchView,
                "/message": MessageView,
                "/mine": MineView,

                "/video/:id": VideoPlayerView,
                "/image/:url": ImageViewerView,
                "/space/:uid": SpaceView
            });
        },
        view: () => {
            return [
                m(Loader),
                m(Toolbar),
                m(Navbar),
                m("main"),
                m(Dialog),
                m(ThemeStyleSheet)
            ];
        },
    };
};