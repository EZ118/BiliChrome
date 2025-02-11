
var interpreter = null;
const pluginStorageKey = "single_plugin";

function checkPluginSafety(codeString) {
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

function importPlugin() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js';
    input.style.display = 'none';
    input.addEventListener('change', function (event) {
        var file = event.target.files[0];

        if (file) {
            //var fileName = file.name;
            var reader = new FileReader();

            // 定义文件读取完成后的回调
            reader.onload = function (e) {
                var content = e.target.result;

                if (checkPluginSafety(content)) {
                    localStorage.setItem(pluginStorageKey, content);
                    showToast("插件已导入，刷新后生效");
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

function removePlugin() {
    localStorage.removeItem(pluginStorageKey);
    showToast("插件已被移除，刷新后生效");
}

function runPlugin() {
    let script = localStorage.getItem(pluginStorageKey);

    if (!script) { return; }
    if (!checkPluginSafety(script)) { showToast("插件未执行"); return; }
    else { showToast("插件开始执行"); }

    try {

        interpreter.evaluate(script);
    } catch (e) {
        showToast("插件执行出错");
        console.error(e);
    }
}

function pluginInit() {
    interpreter = new eval5.Interpreter(window);
    runPlugin();
}