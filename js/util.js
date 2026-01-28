export function toast(content, delay) {
    delay = delay || 4000;
    let div = document.createElement('div');
    div.className = 'toast';
    div.innerText = content;
    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, delay);
}

export function timestampToDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() 返回 0-11
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function openInNewTab(url) {
    chrome.tabs.create({ url: url });
}

export function parsePluginMetadata(str) {
    // 找到第一个 /* 开头的注释内容
    const commentRegex = /\/\*[^]*?\*\//;
    const match = str.match(commentRegex);

    if (!match || !match[0]) {
        return {}; // 没有找到注释
    }

    const commentContent = match[0];

    // 提取注释内部的内容（去掉 /* 和 */）
    const content = commentContent.substring(2, commentContent.length - 2);

    const lines = content.split('\n');
    const metadata = {};

    // 匹配 @key value 格式
    const keyRegex = /^@(\w+)\s+(.+)$/;

    lines.forEach(line => {
        // 去掉行首的 * 和空格
        const cleanedLine = line.trim().replace(/^\*\s*/, '');
        const lineMatch = cleanedLine.match(keyRegex);
        if (lineMatch) {
            const key = lineMatch[1];
            const value = lineMatch[2].trim();
            metadata[key] = value;
        }
    });
    return metadata;
}

export function pickFile(accept, callback) {
    // 创建 input 元素
    var input = document.createElement('input');

    // 设置属性
    input.type = 'file';
    input.accept = accept || '*/*';
    input.multiple = false;

    // 隐藏元素
    input.style.display = 'none';

    // 添加事件监听器
    input.addEventListener('change', function () {
        var files = this.files;
        if (files.length > 0) {
            callback(files[0]);
        } else {
            callback(null);
        }
        // 移除元素
        if (input.parentNode) {
            input.parentNode.removeChild(input);
        }
    });

    // 添加到页面
    document.body.appendChild(input);

    // 触发点击
    input.click();
}