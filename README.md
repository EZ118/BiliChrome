<br />
<div align="center">
    <img src="https://ez118.github.io/biliweb/icon.svg" width="100" height="100" />
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
QQ群：1023133212   
   
</div>

## 安装   
**Edge浏览器：** [在 Microsoft Addons 查看](https://microsoftedge.microsoft.com/addons/detail/biliscape/baglkdkhhmbfimiacicchpflifnpibkp?hl=zh-CN)   
**Firefox浏览器：** [在 Add-ons for Firefox 查看](https://addons.mozilla.org/zh-CN/firefox/addon/biliscape/)   
**Chrome浏览器：** 主菜单 > 扩展程序 > 管理扩展程序 > 启用 开发者模式 > 加载已解压的扩展程序 并选择文件夹 **或** 将打包为zip的扩展拖拽到“扩展程序”页面内。   

## 功能   
- [x] 推荐视频列表
- [x] 最热视频列表
- [x] 直播板块
  - [x] 热门直播
  - [x] 观看直播
- [x] 动态板块
  - [x] 基本动态信息查看
  - [x] 显示用户卡片
- [x] 搜索板块
  - [x] 搜索视频
  - [x] 搜索历史
  - [x] 分类搜索（视频/直播/用户）
- [x] 视频播放板块
  - [x] 播放视频（360P / 1080P）
  - [x] 视频详情
  - [x] 视频推荐列表
  - [x] 查看评论/回复
  - [ ] 点赞、投币操作
  - [x] 小窗播放
  - [x] 弹幕（精简/滚动模式）
  - [x] 添加稍后再看
  - [x] 用户卡片
- [x] 用户板块
  - [x] 关注用户
  - [x] 最近动态
  - [x] 稍后再看
  - [x] 观看记录
  - [x] 我的收藏
  - [x] 查看评论回复列表
  - [x] 私聊历史查询
- [x] 设置板块
  - [x] 暗黑模式
  - [x] JS插件管理器
  - [x] 账户基本信息
  - [x] 将关注列表导出至PipePipe
  - [x] 播放设置

## JS插件功能
自`v3.3.0`版本起，可通过“我的”->“插件管理”安装在线插件或加载本地插件。   

在 [BiliChromePlugin](https://github.com/EZ118/BiliChromePlugin) 仓库中可查看EZ118（项目作者）制作的JS插件源代码。   

插件基于`eval5.js`实现，仅支持`ES5`标准，若报错请留意语法。   
插件脚本在页面加载完成后执行，可访问 **所有数据/函数/变量/DOM** 。   
导入插件前 **请务必确认插件是否安全** 。   

## 视频演示
2024年11月：[前往观看 >>](https://www.bilibili.com/video/BV1SZDAYtE73/)   
2025年02月：[前往观看 >>](https://www.bilibili.com/video/BV14eKKeiEVa/)   

## 参考与使用   
- [jQuery](https://jquery.com/)
- [Material Icon](https://fonts.google.com/icons)
- [SocialSisterYi/bilibili-API-collect](https://github.com/SocialSisterYi/bilibili-API-collect)
- [apprat/sober](https://soberjs.com/)
- [video-dev/hls.js](https://github.com/video-dev/hls.js/)
- [bplok20010/eval5](https://github.com/bplok20010/eval5/)

## 开发计划
- “消息”页 私聊区 支持显示更多富文本内容/卡片。
- 修复BUG
