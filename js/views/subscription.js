function SubscriptionsView(vue) {
    const sv = PetiteVue.reactive({
        vue,

        cardList: [], // 视频列表
        upList: [], // UP主列表
        currentTab: "", // 当前选中的UP主
        currentTabTitle: "全部动态", // 当前选中的UP主标题

        togglePanel() {
            document.querySelector('.dynamic_view').toggle();
        },

        showFollowList() {
            // UP主列表
            this.vue.isLoading = true;
            api.getDynamicUpList()
                .then((data) => {
                    this.upList = data;
                    this.vue.isLoading = false;
                })
                .catch((error) => {
                    console.error("Error fetching UP list:", error);
                    this.vue.isLoading = false;
                });
        },

        showAllDynamics() {
            this.vue.isLoading = true;
            this.currentTab = "all";

            api.getAllDynamics()
                .then((data) => {
                    this.cardList = data;
                    this.currentTabTitle = "全部动态";
                    this.vue.isLoading = false;
                })
                .catch((error) => {
                    console.error("Error fetching recommended videos:", error);
                    this.vue.isLoading = false;
                });
        },

        showSingleDynamics(uid) {
            this.vue.isLoading = true;
            this.currentTab = uid;

            api.getSingleDynamics(uid)
                .then((data) => {
                    this.cardList = data;
                    this.currentTabTitle = data[0].author.name || "该账号无视频动态";

                    this.vue.isLoading = false;
                })
                .catch((error) => {
                    console.error("Error fetching recommended videos:", error);
                    this.vue.isLoading = false;
                });
        },

        init() {
            this.showFollowList();
            this.showAllDynamics();
        }
    });

    sv.init();

    return sv;
}

export default 1