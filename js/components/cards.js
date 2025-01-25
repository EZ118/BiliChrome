var card = {
    video: (videoList) => {
        var WebList = "";
        $.each(videoList, function (index, item) {
            var bsdata = "bvid_" + item.bvid || "aid_" + item.aid;

            WebList += `
                <s-card clickable="true" class="common_video_card" title="${item.desc || ''}" bs-data="${bsdata}">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#${bsdata}">
                            <img src='${item.pic}@412w_232h_1c.webp' style="width:100%; height:100%; object-fit:cover;" loading="lazy">
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
    user: (userList) => {
        var WebList = "";

        $.each(userList, function (index, item) {
            var bsdata = "uid_" + item.uid;

            WebList += `<a href="#${bsdata}">
                    <s-card class="common_user_card_slim" type="outlined" title="${item.sign}" bs-data="${bsdata}" title="${item.desc || ""}">
                        <img src="${item.pic}@48w_48h_1c.webp" class="avatar" loading="lazy" />
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
        var WebList = "";
        $.each(liveList, function (index, item) {
            var bsdata = "roomid_" + item.roomid;

            WebList += `
                <s-card clickable="true" class="common_video_card" title="${item.desc || ''}" bs-data="${bsdata}">
                    <div slot="image" style="overflow:hidden;">
                        <a href="#${bsdata}">
                            <img src='${item.pic}@412w_232h_1c.webp' style="width:100%; height:100%; object-fit:cover;" loading="lazy">
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