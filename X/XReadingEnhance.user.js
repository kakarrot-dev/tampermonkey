// ==UserScript==
// @name         X: 阅读增强
// @namespace    https://github.com/kakarrot-dev/tampermonkey
// @version      0.2.2
// @description  隐藏右栏与右下浮钮、主栏居中留白且与内层同宽、加压间距/行高/媒体高度（仅 CSS）
// @author       kakarrot
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // 选择器依据：docs/selectors.md（2026-07-20 实测；浮钮为登录态社区稳定 testid）
  // 新版以 main/aside 语义标签为主；旧版 data-testid 作兼容。
  // 当前无需 !important；若日后被 Tailwind 压住再补并更新 docs/selectors.md。

  GM_addStyle(`
/* ========== 新版布局（2026） ========== */

/* 放宽整体最大宽度；主栏在导航右侧剩余空间内居中 */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"] {
  max-width: min(1600px, 100%);
  justify-content: center;
}

/* 隐藏右侧推荐栏；保留左侧导航列 */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"] > aside {
  display: none;
}

/* 中央信息流：不拉满，居中并左右留白；顶栏/输入/帖子同宽 */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"] > main {
  flex: 0 1 auto;
  width: min(1000px, 100%);
  max-width: min(1000px, 100%);
  margin-inline: auto;
}

/* 内层仍写死 max-w-[600px]，导致顶栏全宽、帖子/输入框窄且两侧留白；拉满与 main 对齐 */
/* 勿写完整 max-w-[600px] 进属性选择器（] 会截断） */
main div[class*="mx-auto"][class*="w-full"][class*="max-w-"] {
  max-width: 100%;
  width: 100%;
}

/* ========== 旧版兼容 ========== */

[data-testid="sidebarColumn"] {
  display: none;
}

[data-testid="primaryColumn"] {
  flex: 0 1 auto;
  width: min(1000px, 100%);
  max-width: min(1000px, 100%);
  margin-inline: auto;
}

/* ========== 阅读密度 ========== */

article {
  margin-block: 0.15rem;
}

article div[lang],
article [dir="auto"],
[data-testid="tweetText"] {
  line-height: 1.4;
}

/* 信息流大图限高，避免一图占满一屏；圆角保留 */
article img,
[data-testid="tweetPhoto"],
[data-testid="tweetPhoto"] img {
  border-radius: 12px;
  max-height: 70vh;
  object-fit: contain;
}

/* ========== 减干扰：右下 Grok / 消息浮钮 ========== */
/* 不碰左侧导航的 Grok / 聊天入口 */

[data-testid="GrokDrawer"],
[data-testid="DMDrawer"] {
  display: none;
}
`);
})();
