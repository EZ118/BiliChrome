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