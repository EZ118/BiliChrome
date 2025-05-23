// Plugin可能会与浏览器内建函数冲突，因此命名为JsPlugin

class JsPlugin {
    constructor() {
        // 初始化脚本eval5解释器
        this.interpreter = new eval5.Interpreter(window);

        // 远程插件源地址，通过在F12控制台中执行 plugin.remoteSourceURL="https://xxxx" 临时使用其他源（只能用gitee.com的文件）
        // 配置自己的插件源可以参考：https://gitee.com/EZ118/BiliChromePlugin/
        this.remoteSourceURL = "https://gitee.com/EZ118/BiliChromePlugin/raw/main/plugins.json";

        // 本地存储键名（_script用于存储脚本代码；_hash用于存储脚本哈希值，主要用于分辨是否安装的是同一款脚本）
        this.storeKey_script = "single_plugin";
        this.storeKey_hash = "single_plugin_hash";
    }

    

    checkPluginSafety(codeString) {
        let checks = [];
        const maxLineLength = 200;

        // 检查是否被压缩（判断每行字符数是否超过 maxLineLength）
        const lines = codeString.split('\n');
        const isCompressed = lines.every(line => line.length <= maxLineLength);
        if (!isCompressed) {
            checks.push("- 包含被压缩的代码");
        }

        // 检查是否调用了 $.get, $.post, $.ajax, fetch
        const ajaxCalls = /(\$\.get|\$\.post|\$\.ajax|fetch|XMLHttpRequest)/.test(codeString);
        if (ajaxCalls) {
            checks.push("- 请求外部API");
        }

        // 检查是否使用了 window.localStorage
        const usesLocalStorage = /window\.localStorage/.test(codeString);
        if (usesLocalStorage) {
            checks.push("- 本地存储");
        }

        // 检查是否包含外部 HTTP/HTTPS 链接
        const externalLinks1 = /https?:\/\/[^\s]+/.test(codeString);
        const externalLinks2 = /http?:\/\/[^\s]+/.test(codeString);
        if (externalLinks1 || externalLinks2) {
            checks.push("- 包含外部 HTTP/HTTPS 链接");
        }

        // 如果有满足的项，使用 confirm 显示并询问用户
        if (checks.length > 0) {
            const message = "【安全提示】插件代码包含以下风险:\n" + checks.join("\n") + "\n\n访问的敏感权限可能造成扩展不可用甚至盗用账户，请务必仔细检查代码。\n是否继续？";
            return confirm(message);
        }

        return true; // 如果没有满足的项，默认返回 true
    }

    import(callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js';
        input.style.display = 'none';
        input.addEventListener('change', (event) => {
            var file = event.target.files[0];

            if (file) {
                //var fileName = file.name;
                var reader = new FileReader();

                // 定义文件读取完成后的回调
                reader.onload = (e) => {
                    var content = e.target.result;

                    if (this.checkPluginSafety(content)) {
                        localStorage.setItem(this.storeKey_script, content);
                        localStorage.setItem(this.storeKey_hash, hash(content));
                        modal.toast("插件已导入，刷新后生效");

                        if (callback) { callback(); }
                    }
                };

                // 读取文件内容
                reader.readAsText(file);
            } else {
                console.log("用户没有选择文件");
            }
        });
        input.click();
    }

    delete() {
        localStorage.removeItem(this.storeKey_script);
        localStorage.removeItem(this.storeKey_hash);
        modal.toast("插件已被移除，刷新后生效");
    }

    run() {
        let script = localStorage.getItem(this.storeKey_script);

        if (!script) { return; }
        // if (!checkPluginSafety(script)) { modal.toast("插件未执行"); return; }
        // else { modal.toast("插件开始执行"); }
        // 目前先把执行前安全检查注释掉，便于调试。后续版本再恢复。
        modal.toast("插件开始执行");

        try {
            this.interpreter.evaluate(script);
        } catch (e) {
            modal.toast("插件执行出错");
            console.error(e);
        }
    }

    manager() {
        let script = localStorage.getItem(this.storeKey_script);
        let scriptHash = localStorage.getItem(this.storeKey_hash);

        const pluginManager = `
            <div type="outlined" style="width:calc(100% - 30px);border:1px solid var(--s-color-surface-variant);border-radius:12px;padding:10px;margin:5px;">
                <font size=5>加载本地插件</font><br/>
                <font size=2 color=gray>从本地选择自定义JS文件并将其安装为插件</font><br/>
                <div align="right">
                    <s-button id="plugin_importBtn" disabled="${script ? true : false}"><s-icon name="add" slot="start"></s-icon>导入</s-button>
                    &nbsp;
                    <s-button id="plugin_removeBtn" disabled="${script ? false : true}"><s-icon name="close" slot="start"></s-icon>移除</s-button>
                </div>
            </div>
            <div type="outlined" style="width:calc(100% - 30px);border:1px solid var(--s-color-surface-variant);border-radius:12px;padding:10px;margin:5px;">
                
                <s-tooltip>
                    <font size=5 slot="trigger">在线插件</font>
                    <span id="plugin_tooltip">源简介</span>
                </s-tooltip><br/>
                <font size=2 color=gray>您可以在线获取 BiliScape 项目作者提供的受信任插件</font><br/>
                <font size=2 color=gray>插件源: ${this.remoteSourceURL}</font><br/><br/>
                <s-table style="overflow:auto;width:calc(100% - 4px);" slot="text">
                    <s-thead>
                        <s-tr>
                            <s-th>名称</s-th> <s-th>作者</s-th> <s-th>简介</s-th> <s-th>版本</s-th> <s-th>操作</s-th>
                        </s-tr>
                    </s-thead>
                    <s-tbody id="plugin_list"></s-tbody>
                </s-table>
            </div>
        `;

        modal.open("插件管理", pluginManager, "https://github.com/EZ118/BiliChromePlugin");

        $("#plugin_importBtn").click(() => {
            this.import(this.manager);
        });
        $("#plugin_removeBtn").click(() => {
            this.delete();
            setTimeout(() => this.manager(), 200);
        });

        $.get(this.remoteSourceURL, (resdata) => {
            let pluginList = resdata.plugins;

            $("#plugin_tooltip").text("[" + resdata.name + "] " + resdata.description);

            $("#plugin_list").empty();
            $.each(pluginList, (index, plugin) => {
                let pluginItem = `
                    <s-tr>
                        <s-td>${plugin.name}</s-td>
                        <s-td>${plugin.author}</s-td>
                        <s-td>${plugin.description}</s-td>
                        <s-td>${plugin.version}</s-td>
                        <s-td>
                            <s-button class="plugin_installRemoteJsBtn" p-val="${plugin.url}" disabled="${scriptHash == hash(this.remoteSourceURL + plugin.url)}">安装</s-button>
                        </s-td>
                    </s-tr>
                `;

                $("#plugin_list").append(pluginItem);
            });


            $(".plugin_installRemoteJsBtn").click((evt) => {
                let purl = $(evt.target).attr("p-val");
                let absoluteUrl = "";

                if (!purl.includes("://")) {
                    // 自动转为绝对路径
                    const baseURL = new URL(this.remoteSourceURL);
                    absoluteUrl = new URL(purl, baseURL).href;
                } else {
                    absoluteUrl = purl;
                }

                $.get(absoluteUrl, (script) => {
                    if (this.checkPluginSafety(script)) {
                        localStorage.setItem(this.storeKey_script, script);
                        localStorage.setItem(this.storeKey_hash, hash(this.remoteSourceURL + purl));
                        modal.toast("插件已安装，刷新后生效");
                        this.manager();
                    }
                });
            });
        });
    }
}