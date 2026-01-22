import { App } from "./app.js";

// 渲染
const mountNode = document.querySelector("#app");
m.mount(mountNode, App);

// 合适时机隐藏遮罩
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        document.querySelector("#SplashScreen").style.opacity = "0";
        setTimeout(() => {
            document.querySelector("#SplashScreen").style.display = "none";
        }, 300);
    }, 500);
})