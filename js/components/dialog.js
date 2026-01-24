let isVisible = false;
let currentOptions = {};
let dialogElement = null; // <dialog> 元素的DOM

export const Dialog = {
    view() {
        if (!isVisible) return null;

        const { title, content, onConfirm, onCancel } = currentOptions;

        return m(
            "dialog",
            {
                oncreate: (vnode) => {
                    // 保存 dialog 元素
                    dialogElement = vnode.dom;
                    dialogElement.showModal();
                },
                onremove: () => {
                    // 组件被移除时清理引用
                    dialogElement = null;
                },
                onupdate: (vnode) => {
                    // 确保 DOM 状态与 JS 状态同步
                    if (isVisible && !vnode.dom.open) {
                        vnode.dom.showModal();
                    } else if (!isVisible && vnode.dom.open) {
                        vnode.dom.close();
                    }
                }
            },
            [
                m(".dialog-content", [
                    m("h2.dialog-title", title),
                    m(".dialog-body", content),
                    m(".dialog-footer", [
                        m("button.text-btn.confirm", {
                            onclick: () => {
                                currentOptions.onConfirm?.();
                                isVisible = false;
                            }
                        }, "确定"),
                        m("button.text-btn.cancel", {
                            onclick: () => {
                                currentOptions.onCancel?.();
                                isVisible = false;
                            }
                        }, "取消")
                    ])
                ])
            ]
        );
    }
};

export function showDialog(options) {
    currentOptions = options;
    isVisible = true;
    m.redraw();
}