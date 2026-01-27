import { emit } from "../plugin.js";

export var isLoading = false;

export function toggleLoader(isVisible) {
    if (isVisible) {
        isLoading = isVisible;
        m.redraw();

        emit("loading", null);
    } else {
        setTimeout(() => {
            isLoading = isVisible;
            m.redraw();
        }, 150);
    }
}

export const Loader = {
    view(vnode) {
        return m(
            "svg#loader",
            {
                style: { display: isLoading ? "block" : "none" },
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 16 16",
                width: 48,
                height: 48
            },
            [
                m("style", `
                    @keyframes loader-spin {
                        0% { stroke-dasharray: 0.01, 43.97; transform: rotate(0deg); }
                        50% { stroke-dasharray: 21.99, 21.99; transform: rotate(450deg); }
                        100% { stroke-dasharray: 0.01, 43.97; transform: rotate(1080deg); }
                    }
                    .c {
                        fill: none;
                        stroke: var(--primary-color);
                        stroke-width: 1.6;
                        stroke-linecap: round;
                        transform-origin: 8px 8px;
                        transform: rotate(-90deg);
                        animation: loader-spin 2s linear infinite;
                    }
                `),
                m("circle.c", { cx: 8, cy: 8, r: 7 })
            ]
        )
    }
}