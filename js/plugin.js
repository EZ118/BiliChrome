// 加载插件

// 注意，4.0版本的插件 不能使用jquery 
// 插件可以使用BiliScape提供的 事件监听器、mithril-js渲染 简化一些操作
// 插件当然也可以写原生js（地狱级，因为v4.0是使用响应式框架且是模块化的，难以监听事件、获取数据）

// 上述为开发计划，插件系统尚未完成

// 注：该项目仍将使用 evel5-js 来执行插件，尽管已经有 sval-js 项目（支持es6+），出于项目轻量体验的考量。

import eval5 from './vendor/eval5.min.js';
const { Interpreter, evaluate } = eval5;

const eventList = {
    "routeChange": null,
    "navigateBack": null,
    "nativeEvent": null,
    "loading": null,
    "videoLoaded": null,
    "prefChange": null
};

const menuCommands = [
    {
        name: "测试按钮",
        callback: () => {}
    }
]

export function emit(event, data) {

}

export function on(event, callback) {
    
}

export function registerMenuCommand(name, callback) {

}

export function setTheme(option) {

}

export function initPlugin() {
    const ctx = {
        on,
        emit,
        registerMenuCommand
    };
    const interpreter = new Interpreter(ctx, {
        rootContext: window,
        timeout: 500,
    });

    interpreter.evaluate(`
        console.log("Plugin inited")
    `);
}