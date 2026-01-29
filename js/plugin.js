// 注意，4.0版本的插件 不能使用jquery 
// 插件可以使用BiliScape提供的 事件监听器、mithril-js渲染 简化一些操作
// 插件当然也可以写原生js（地狱级，因为v4.0是使用响应式框架且是模块化的，难以监听事件、获取数据）

// 注：该项目仍将使用 evel5-js 来执行插件，尽管已经有 sval-js 项目（支持es6+），出于项目轻量体验的考量。

import { showDialog } from './components/dialog.js';
import native from './native.js';
import { parsePluginMetadata, pickFile, toast } from './util.js';
import { toggleLoader } from './components/loader.js';
import Sval from './vendor/sval.min.js';

// 存储所有插件
var pluginList

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
    console.log("[plugin.emit]", event, data);
    // 由 BiliScape 各组件触发监听的事件
    eventList[event].forEach(item => {
        item(data);
    })
}

export function on(event, callback) {
    console.log("[plugin.on]", event, callback);
    // 监听事件
    eventList[event].push(callback);
}

export function registerMenuCommand(name, callback) {
    console.log("[plugin.regMenuCmd]", name, callback);
    // 注册当前视图下的菜单按钮
    menuCommands.push({ name, callback });
}

export function initPlugin() {
    // 初始化（index.js内触发）
    on("routeChange", () => {
        menuCommands = [];
    });

    native.storageGet("plugin", (res) => {
        if (!res) res = [];

        pluginList = res;

        res.forEach(item => {
            // Create a interpreter
            const interpreter = new Sval({
                ecmaVer: 'latest',
                sourceType: 'script',
                sandBox: false
            });

            interpreter.import({
                on,
                emit,
                registerMenuCommand,
                toast,
                native,
                showDialog,
                toggleLoader,
                m,
                currentScriptInfo: item
            });

            // Parse and run the code
            interpreter.run(item.rawScript)
        });
    });
}

export function importPlugin() {
    // 插件安装导入

    pickFile(".js,.ts", (file) => {
        const reader = new FileReader();
        reader.readAsText(file, "text");
        reader.onload = (e) => {
            const res = e.target.result;
            if (!res) { toast("插件不存在！"); return; }

            let metadata = parsePluginMetadata(res);
            if (!metadata.name) { toast("插件元数据错误"); return; }

            const userComfirm = confirm(`是否添加该脚本？ \n\n- 名称: ${metadata.name} \n- 作者: ${metadata.author}\n- 简介: ${metadata.description}`);
            if (!userComfirm) { return; }

            metadata["rawScript"] = res;
            pluginList.push(metadata);
            native.storageSet("plugin", pluginList);
            m.redraw();

            toast("已添加，即将刷新页面");
            setTimeout(() => location.reload(), 600);
        }
    });
}

export function managePlugin() {
    // 打开插件管理对话框
    showDialog({
        title: "插件管理",
        content: m("plugin-manager",
            m("b", "已安装的插件："),
            m("ol",
                pluginList.map((item, index) => {
                    return m(
                        "li",
                        [
                            item.name,
                            " ",
                            m("button.del-btn", {
                                onclick: () => {
                                    const res = confirm("确认移除该插件吗？");
                                    if (res) {
                                        pluginList.splice(index, 1);
                                        native.storageSet("plugin", pluginList);

                                        toast("已删除，即将刷新页面");
                                        setTimeout(() => location.reload(), 600);
                                    }
                                }
                            }, "删除")
                        ]
                    );
                })
            ),
            m("button.del-btn", {
                onclick: () => importPlugin()
            }, "从本地导入插件")
        )
    })
}