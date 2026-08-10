# tampermonkey

个人 Tampermonkey / Violentmonkey 用户脚本仓库。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 或兼容扩展
2. 打开对应 `.user.js`，按扩展提示安装
3. 改 metadata（`@version` / `@match` / `@grant`）后需重新安装或点更新

## 脚本索引

| 脚本        | 路径                                                     | 说明                                                                    |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| X: 阅读增强 | [`X/XReadingEnhance.user.js`](X/XReadingEnhance.user.js) | 隐藏右栏与右下浮钮、主栏/内层同宽加宽、加压间距/行高/媒体高度（仅 CSS） |
| 2Libra: V2EX 风格双栏 | [`2libra/TwoColumnPolish.user.js`](2libra/TwoColumnPolish.user.js) | 隐藏左栏，将列表、帖子正文和回复调整为 V2EX Polish 风格的紧凑双栏 |

### X: 阅读增强

- 匹配：`https://x.com/*`、`https://twitter.com/*`
- 权限：`GM_addStyle`

验证建议：登录后在 1280 / 1440 / 1920 查看首页、个人主页、帖子详情；主栏应明显宽于默认且右白减少，右下 Grok/消息浮钮消失，左导航仍在；站内跳转后样式应仍在。

### 2Libra: V2EX 风格双栏

- 匹配：`https://2libra.com/*`
- 权限：`GM_addStyle`
- 参考：V2EX Polish 2.0.6 的布局和排版常量，不移植其功能逻辑

验证建议：登录后在 1440 / 1920 查看首页和帖子详情，页面应为约 805px 主栏加 270px 右栏，左导航隐藏；帖子列表、正文与回复采用 15px 内容和 12px 元信息，回复显示为连续分隔列表。375 / 768 宽度下应恢复单栏且无横向滚动。
