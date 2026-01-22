// 动态调整颜色主题

const themeList = {
    "default": {
        "light": {
            "primary": "rgb(255, 48, 112)",
            "secondary": "rgb(255, 217, 222)",
            "background": "rgb(255, 251, 255)",
            "foreground": "rgb(32, 26, 27)",
            "wallpaper": "../img/wallpaper_light.webp"
        },
        "dark": {
            "primary": "rgb(255, 123, 166)",
            "secondary": "rgb(92, 63, 67)",
            "background": "rgb(32, 26, 27)",
            "foreground": "rgb(236, 224, 224)",
            "wallpaper": "../img/wallpaper_dark.webp"
        }
    },
    "fluent": {
        "light": {
            "primary": "#0f6cbd",
            "secondary": "#b4d6fa",
            "background": "#fafafa",
            "foreground": "#242424",
            "wallpaper": "../img/wallpaper_light.webp"
        },
        "dark": {
            "primary": "#479ef5",
            "secondary": "#0f548c",
            "background": "#1f1f1f",
            "foreground": "#ffffff",
            "wallpaper": "../img/wallpaper_dark.webp"
        }
    }
}

export const ThemeStyleSheet = {
    view() {
        const theme = "default";
        return m("style", [
            `:root {
                --primary-color: ${themeList[theme].light.primary};
                --secondary-color: ${themeList[theme].light.secondary};
                --background-color: ${themeList[theme].light.background};
                --text-color: ${themeList[theme].light.foreground};
                --wallpaper: url(${themeList[theme].light.wallpaper});
            }

            @media (prefers-color-scheme: dark) {
                :root {
                    --primary-color: ${themeList[theme].dark.primary};
                    --secondary-color: ${themeList[theme].dark.secondary};
                    --background-color: ${themeList[theme].dark.background};
                    --text-color: ${themeList[theme].dark.foreground};
                    --wallpaper: url(${themeList[theme].dark.wallpaper});
                }
            }`
        ])
    }
}