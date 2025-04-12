var card = {
    video: (videoList, watchlater = false) => {
        // 显示完整视频卡片（场景：各种视频列表）
        var WebList = "";
        $.each(videoList, function (index, item) {
            var bsdata = (item.bvid ? "bvid_" + item.bvid : "aid_" + item.aid) + (watchlater ? "_watchlater" : "");

            WebList += `
                <s-card clickable="true" class="common_video_card" title="${item.desc || ''}" bs-data="${bsdata}">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#${bsdata}">
                            <img src='${item.pic}@412w_232h_1c.webp' style="width:100%; height:100%; object-fit:cover;" loading="eager">
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#${bsdata}">
                            ${item.title}
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#uid_${item.author.uid}">
                            ${item.author.name}
                        </a>
                    </div>
                </s-card>`;
        });

        return WebList;
    },
    video_slim: (videoList, watchlater = false) => {
        // 显示窄视频卡片（场景：播放器相关推荐列表）
        var WebList = "";
        $.each(videoList, function (index, item) {
            var bsdata = (item.bvid ? "bvid_" + item.bvid : "aid_" + item.aid) + (watchlater ? "_watchlater" : "");

            WebList += `
                <s-card clickable="true" class="slim_video_card" title="${item.desc || ''}" bs-data="${bsdata}">
                    <div class="card-image">
                        <a href="#${bsdata}">
                            <img src='${item.pic}@412w_232h_1c.webp' style='width:100%; height:100%; object-fit:cover;' loading="eager">
                        </a>
                    </div>
                    <div class="card-content">
                        <div class="card-subhead">
                            <a href="#${bsdata}">
                                ${item.title}
                            </a>
                        </div>
                        <div class="card-text">
                            <a href="#${bsdata}">
                                ${item.author.name}
                            </a>
                        </div>
                    </div>
                </s-card>
                `;
        });

        return WebList;
    },
    bangumi: (bangumiList) => {
        // 显示番剧卡片（场景：番剧列表）
        var WebList = "";
        $.each(bangumiList, function (index, item) {
            var bsdata = "bangumi_" + item.media_id;

            WebList += `
                <s-card clickable="true" class="common_video_card" title="${item.desc || ''}" bs-data="${bsdata}">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#${bsdata}">
                            <img src='${item.pic}@412w_232h_1c.webp' style="width:100%; height:100%; object-fit:cover;" loading="eager">
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#${bsdata}">
                            ${item.title}
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#default">
                            ${item.desc || ""}
                        </a>
                    </div>
                </s-card>`;
        });

        return WebList;
    },
    user: (userList) => {
        // 显示用户卡片（场景：订阅列表、搜索用户）
        var WebList = "";
        $.each(userList, function (index, item) {
            var bsdata = "uid_" + item.uid;

            WebList += `<a href="#${bsdata}">
                    <s-card class="common_user_card_slim" type="outlined" title="${item.sign}" bs-data="${bsdata}" title="${item.desc || ""}">
                        <img src="${item.pic}@48w_48h_1c.webp" class="avatar" loading="eager" />
                        <div class="right">
                            <span class="name">
                                ${item.name}
                            </span>
                            <span class="sign">${item.sign}</span>
                        </div>
                    </s-card>
                </a>`;
        });

        return WebList;
    },
    live: (liveList) => {
        // 显示直播卡片（场景：首页直播推荐、搜索直播）
        var WebList = "";
        $.each(liveList, function (index, item) {
            var bsdata = "roomid_" + item.roomid;

            WebList += `
                <s-card clickable="true" class="common_video_card" title="${item.desc || ''}" bs-data="${bsdata}">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#${bsdata}">
                            <img src='${item.pic}@412w_232h_1c.webp' style="width:100%; height:100%; object-fit:cover;" loading="eager">
                        </a>
                    </div>
                    <div slot="subhead">
                        <a href="#${bsdata}">
                            ${item.title}
                        </a>
                    </div>
                    <div slot="text">
                        <a href="#uid_${item.author.uid}">
                            ${item.author.name}
                        </a>
                    </div>
                </s-card>`;
        });

        return WebList;
    }
};