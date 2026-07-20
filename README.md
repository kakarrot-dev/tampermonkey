# tampermonkey

个人 Tampermonkey / Violentmonkey 用户脚本仓库。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或兼容扩展  
2. 打开对应 `.user.js`，按扩展提示安装  
3. 改 metadata（`@version` / `@match` / `@grant`）后需重新安装或点更新  

## 脚本索引

| 脚本 | 路径 | 说明 |
|------|------|------|
| X: 阅读增强 | [`X/XReadingEnhance.user.js`](X/XReadingEnhance.user.js) | 隐藏右侧推荐栏、加宽信息流、优化帖子间距/行高/媒体圆角（仅 CSS） |

### X: 阅读增强

- 匹配：`https://x.com/*`、`https://twitter.com/*`
- 权限：`GM_addStyle`
- 选择器实录：[docs/selectors.md](docs/selectors.md)
- 规格：[docs/superpowers/specs/2026-07-20-x-ux-css-spec.md](docs/superpowers/specs/2026-07-20-x-ux-css-spec.md)

验证建议：在 1280 / 1440 / 1920 宽度下查看首页、个人主页、帖子详情；站内跳转后样式应仍在。
