import { toggleLoader } from "../components/loader.js";

const ImageViewer = {
    oninit() {
        toggleLoader(true);
    },
    oncreate() {
        
    },
    view() {
        return m(
            ".container",
            {
                style: {
                    overflow: "auto",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center"
                }
            },
            [
                m("img", {
                    src: decodeURIComponent(m.route.param("url")),
                    style: {
                        maxWidth: "100%",
                        maxHeight: "600%"
                    },
                    onload: () => setTimeout(toggleLoader(false), 1000)
                })
            ]
        )
    }
};

export default ImageViewer;