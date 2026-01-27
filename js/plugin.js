// 注意，4.0版本的插件 不能使用jquery 
// 插件可以使用BiliScape提供的 事件监听器、mithril-js渲染 简化一些操作
// 插件当然也可以写原生js（地狱级，因为v4.0是使用响应式框架且是模块化的，难以监听事件、获取数据）

// 注：该项目仍将使用 evel5-js 来执行插件，尽管已经有 sval-js 项目（支持es6+），出于项目轻量体验的考量。

import { showDialog } from './components/dialog.js';
import native from './native.js';
import eval5 from './vendor/eval5.min.js';
const { Interpreter } = eval5;

// 存储事件监听
const eventList = {
    "routeChange": [],
    "navigateBack": [],
    //"nativeEvent": [],
    "loading": [],
    "videoLoaded": [],
    "liveLoaded": [],
    "dialogShow": []
};

// 存储当前视图的菜单
export var menuCommands = [];

export function emit(event, data) {
    // 由 BiliScape 各组件触发监听的事件
    eventList[event].forEach(item => {
        item(data);
    })
}

export function on(event, callback) {
    // 监听事件
    eventList[event].push(callback);
}

export function registerMenuCommand(name, callback) {
    // 注册当前视图下的菜单按钮
    menuCommands.push({ name, callback });
}

export function initPlugin() {
    // 初始化
    const ctx = {
        on,
        emit,
        registerMenuCommand,
        m,
        ...window
    };
    const interpreter = new Interpreter(ctx, {
        rootContext: window,
        timeout: 500,
    });

    interpreter.evaluate(`
        console.log("Plugin inited");
    `);

    on("routeChange", () => {
        menuCommands = [];
    })
}

export function importPlugin() {
    // 插件安装导入
}

export function managePlugin() {
    // 打开插件管理对话框
    native.storageGet("plugin", (res) => {
        if (!res) res = [];
        showDialog({
            title: "插件管理",
            content: res.map(item => {
                return item.name + " ";
            })
        })
    });
}