// ==UserScript==
// @name         X: 阅读增强
// @namespace    https://github.com/kakarrot-dev/tampermonkey
// @version      0.1.0
// @description  隐藏右侧推荐栏、加宽信息流、优化帖子间距与媒体圆角（仅 CSS）
// @author       kakarrot
// @match        https://x.com/*
// @match        https://twitter.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // 选择器依据：docs/selectors.md（2026-07-20 实测）
  // 新版以 main/aside 语义标签为主；旧版 data-testid 作兼容。
  // 当前无需 !important；若日后被 Tailwind 压住再补并更新 docs/selectors.md。

  GM_addStyle(`
/* ========== 新版布局（2026） ========== */

/* 放宽整体最大宽度，吃掉右栏空间 */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"] {
  max-width: min(1400px, 100%);
}

/* 隐藏右侧推荐栏；保留左侧导航列 */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"] > aside {
  display: none;
}

/* 中央信息流加宽 */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"] > main {
  width: min(920px, 100%);
  max-width: min(920px, 100%);
  flex: 1 1 auto;
}

/* ========== 旧版兼容 ========== */

[data-testid="sidebarColumn"] {
  display: none;
}

[data-testid="primaryColumn"] {
  max-width: min(920px, 100%);
  width: 100%;
}

/* ========== 阅读密度 ========== */

article {
  margin-block: 0.4rem;
}

article div[lang],
article [dir="auto"],
[data-testid="tweetText"] {
  line-height: 1.55;
}

article img,
[data-testid="tweetPhoto"],
[data-testid="tweetPhoto"] img {
  border-radius: 12px;
}
`);
})();
