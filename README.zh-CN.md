<div align="center">
  <img src="assets/repository-logo.png" alt="Tampermonkey Scripts 标志" width="112">
  <h1>Tampermonkey Scripts</h1>
  <p>按站点维护的小型用户脚本，让网页更安静、更顺手。</p>
  <p>简体中文 · <a href="README.md">English</a></p>

  <p>
    <a href="https://www.tampermonkey.net/"><img src="https://img.shields.io/badge/Tampermonkey-compatible-b7791f?style=flat-square" alt="兼容 Tampermonkey"></a>
    <a href="https://violentmonkey.github.io/"><img src="https://img.shields.io/badge/Violentmonkey-compatible-2c6f75?style=flat-square" alt="兼容 Violentmonkey"></a>
    <img src="https://img.shields.io/badge/JavaScript-ES2018%2B-29271d?style=flat-square" alt="JavaScript ES2018+">
    <img src="https://img.shields.io/badge/userscripts-3-f5f3e9?style=flat-square&amp;labelColor=403d36" alt="3 个用户脚本">
    <img src="https://img.shields.io/badge/build-none-f5f3e9?style=flat-square&amp;labelColor=403d36" alt="无需构建">
  </p>
</div>

![通过用户脚本调整浏览器页面](assets/repository-banner.png)

这个仓库用原生 JavaScript 管理个人 Tampermonkey 和 Violentmonkey 脚本。每个脚本只对应一个站点或一个明确用途，`.user.js` 源文件就是安装产物，不需要构建工具或包管理器。

## 标签

`tampermonkey` `violentmonkey` `userscript` `javascript` `browser-customization` `ui-polish` `2libra` `v2ex` `x-twitter`

## 脚本索引

| 脚本 | 类型 | 匹配站点 | 版本 | 安装 |
| --- | --- | --- | --- | --- |
| X 阅读增强 | 自有脚本 | `x.com`、`twitter.com` | `0.2.2` | [安装原始脚本](https://raw.githubusercontent.com/kakarrot-dev/tampermonkey/main/X/XReadingEnhance.user.js) |
| 2Libra V2EX 风格双栏 | 自有脚本 | `2libra.com` | `0.2.5` | [安装原始脚本](https://raw.githubusercontent.com/kakarrot-dev/tampermonkey/main/2libra/TwoColumnPolish.user.js) |
| V2EX Polish | 第三方快照 | `v2ex.com` | `2.0.6` | [查看源码](<V2EX/▲V2EX Polish - 体验更现代化的 V2EX 🟢-2.0.6.user.js>) · [上游项目](https://v2p.leoku.dev/) |

### X 阅读增强

隐藏右栏和浮动控件，加宽阅读区域，并通过 CSS 收紧间距、行高和媒体高度。

- 权限：`GM_addStyle`
- 源码：[`X/XReadingEnhance.user.js`](X/XReadingEnhance.user.js)
- 安装后检查：在 1280、1440 和 1920 像素宽度下查看首页、个人主页和帖子详情

### 2Libra V2EX 风格双栏

把 2Libra 调整为约 805 px 主栏加 270 px 右栏，并将 V2EX Polish 的间距和排版方式应用到发帖页、帖子列表、帖子详情、回复、个人信息和回复编辑器。除发帖页外，桌面端右栏固定为“个人信息、帖子浏览、最近访问”的顺序，并隐藏推广卡片；窄屏下恢复单栏。

- 权限：`GM_addStyle`
- 源码：[`2libra/TwoColumnPolish.user.js`](2libra/TwoColumnPolish.user.js)
- 安装后检查：在 1440 和 1920 像素宽度下查看首页、发帖页和帖子详情，并检查 375 和 768 像素响应式布局

### V2EX Polish 快照

`V2EX/` 下的文件是上游脚本快照，只用于参考，不作为本仓库的自有脚本维护。其元数据将 LeoKu 标记为作者，许可证为 MIT。安装和更新请优先使用[上游项目](https://v2p.leoku.dev/)。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)。
2. 打开上表中自有脚本的原始安装链接。
3. 检查匹配范围和权限，然后确认安装。
4. 打开匹配页面并硬刷新。

当 `@version`、`@match` 或 `@grant` 等元数据发生变化时，需要在用户脚本管理器中更新或重新安装脚本。

## 开发

仓库没有依赖、构建任务或生成产物。

```text
编辑 <site>/<name>.user.js
在用户脚本管理器中安装或更新
打开匹配 URL
硬刷新并检查页面行为
```

权限应保持最小范围，DOM 查询需要空值防护，单页应用还要处理无整页刷新的路由切换。仓库规范见 [`AGENTS.md`](AGENTS.md)，Claude Code 入口见 [`CLAUDE.md`](CLAUDE.md)。

## 贡献

这是一个以维护者个人使用为主的仓库，也接受范围明确的修复。每个脚本应只处理一个站点或任务。提交拉取请求时，请说明受影响的 URL、可见行为和手动验证结果。没有明确需求时，不要新增依赖或扩大 `@match`、`@grant`、`@connect`。

## 安全与隐私

仓库中的自有脚本不包含 API Key、Cookie 或账号凭证。安装任何用户脚本前都应先检查源码，因为用户脚本可以在匹配页面中访问和修改 DOM。

发现安全问题时，请私下联系仓库所有者，不要在公开 Issue 中提交凭证或个人数据。

## 许可证

自有脚本目前没有声明仓库级许可证。仓库内的 V2EX Polish 快照保留上游 MIT 许可证和作者元数据，不能把该第三方许可证视为整个仓库的许可证。

## 视觉设计

仓库 Logo 和横幅使用 [Claude Cream](https://github.com/kakarrot-dev/claude-cream) 配色，包括暖米色表面、墨色文字、琥珀强调色和克制的青绿色。两项资源保存在 [`assets/`](assets/)。
