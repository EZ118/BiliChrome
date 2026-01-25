import { App } from "./app.js";
import { initPlugin } from "./plugin.js";

// 渲染
const mountNode = document.querySelector("#app");
m.mount(mountNode, App);

document.addEventListener("DOMContentLoaded", () => {
    // 合适时机隐藏遮罩
    setTimeout(() => {
        document.querySelector("#SplashScreen").style.opacity = "0";
        setTimeout(() => {
            document.querySelector("#SplashScreen").style.display = "none";
        }, 300);
    }, 500);

    // 初始化插件系统
    initPlugin();
})