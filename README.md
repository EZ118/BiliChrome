# ⭕️ 项目停止更新
由于“bilibili-API-collect”项目收到B站官方律师函，而 BiliScape 作为基于该项目的个人开发的第三方客户端，为防止后续风险，本人决定**停止对 BiliScape 的维护**，同时浏览器扩展商店版也停止更新。   
该项目原名BiliChrome，因其名称未过审而更名为 BiliScape ，目的是让老旧上网本也能流畅观看B站视频。BiliScape自首个发行版发布至今一年零一月。   

----
<br />
<div align="center">
    <img src="./img/icon.svg" width="100" height="100" />
    <h1>BiliScape</h1>
</div>

<div align="center">

![License](https://img.shields.io/badge/license-GPLv3-yellow)
![GitHub repo size](https://img.shields.io/github/repo-size/EZ118/BiliChrome)
![GitHub Repo stars](https://img.shields.io/github/stars/EZ118/BiliChrome)
![GitHub all releases](https://img.shields.io/github/downloads/EZ118/BiliChrome/total)

<p>第三方哔哩哔哩客户端浏览器插件</p>

<img src="https://ez118.github.io/biliweb/shot1.png" width="32%" alt="首页" />
<img src="https://ez118.github.io/biliweb/shot2.png" width="32%" alt="消息" />
<img src="https://ez118.github.io/biliweb/shot3.png" width="32%" alt="搜索" /><br/>
<img src="https://ez118.github.io/biliweb/shot4.png" width="32%" alt="空间" />
<img src="https://ez118.github.io/biliweb/shot5.png" width="32%" alt="动态" />
<img src="https://ez118.github.io/biliweb/shot6.png" width="32%" alt="播放" /><br/><br/>
<br/>
</div>

## 安装   
**Edge浏览器：** [在 Microsoft Addons 查看](https://microsoftedge.microsoft.com/addons/detail/biliscape/baglkdkhhmbfimiacicchpflifnpibkp?hl=zh-CN)   
**Firefox浏览器：** [在 Add-ons for Firefox 查看](https://addons.mozilla.org/zh-CN/firefox/addon/biliscape/)   
**Chrome浏览器：** 主菜单 > 扩展程序 > 管理扩展程序 > 启用 开发者模式 > 加载已解压的扩展程序 并选择文件夹 **或** 将打包为zip的扩展拖拽到“扩展程序”页面内。   

## 功能   
- [x] 首页
  - [x] 推荐
  - [x] 热门
  - [x] 直播
- [x] 直播
  - [x] 推荐
  - [x] 观看
  - [x] 搜索
- [x] 动态板块
  - [x] 动态与视频动态
  - [x] 用户卡片
- [x] 搜索板块
  - [x] 关键词推荐
  - [ ] 搜索历史
  - [x] 分类搜索（视频/直播/用户）
- [x] 视频播放板块
  - [x] 播放视频（360P / 1080P）
  - [x] 视频详情
  - [x] 视频推荐列表
  - [x] 查看评论/回复
  - [ ] 点赞、投币操作
  - [ ] 小窗播放
  - [ ] 弹幕（精简/滚动模式）
  - [ ] 添加稍后再看
  - [ ] 字幕
  - [x] 用户卡片
  - [ ] 收藏
- [x] 用户板块
  - [x] 我的关注
  - [x] 最近动态
  - [x] 稍后再看
  - [x] 观看记录
  - [x] 我的收藏
  - [x] 查看评论回复列表
  - [x] 私聊历史查询
- [x] 设置板块
  - [x] 黑暗模式（始终跟随系统）
  - [x] JS插件管理器
  - [x] 账户基本信息
  - [ ] 将关注列表导出至PipePipe
  - [ ] 播放设置

## JS插件功能
在 [BiliChromePlugin](https://github.com/EZ118/BiliChromePlugin) 仓库中可查看EZ118（项目作者）制作的JS插件源代码。   

插件基于`sval.js`实现，已支持`ES6+`标准。   
插件脚本在页面加载完成后执行，可访问 **所有数据/函数/变量/DOM/内置事件监听** 。   
导入插件前 **请确认插件是否安全** 。   

## 视频演示
2024年11月：[前往观看 >>](https://www.bilibili.com/video/BV1SZDAYtE73/)   
2025年02月：[前往观看 >>](https://www.bilibili.com/video/BV14eKKeiEVa/)   
*目前没有v4.x版本的演示视频*

## 参考与使用   
- [Fluent Icon](https://fluenticon.com/)
- [SocialSisterYi/bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect)
- [video-dev/hls.js](https://github.com/video-dev/hls.js/)
- [Siubaak/sval](https://github.com/Siubaak/sval)
- [MithrilJS/mithril.js](https://github.com/MithrilJS/mithril.js)

## 开发计划
- 编写函数文档
- 完善功能板块
