// ==UserScript==
// @name         2Libra: V2EX 风格双栏
// @namespace    https://github.com/kakarrot-dev/tampermonkey
// @version      0.1.0
// @description  将 2Libra 调整为 V2EX Polish 风格的紧凑双栏、帖子正文与回复布局
// @author       kakarrot
// @match        https://2libra.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const CLASS = {
    shell: 'kk-2libra-shell',
    left: 'kk-2libra-left',
    main: 'kk-2libra-main',
    right: 'kk-2libra-right',
    post: 'kk-2libra-post',
    reply: 'kk-2libra-reply',
    replyFirst: 'kk-2libra-reply-first',
    replyLast: 'kk-2libra-reply-last',
  };

  function markLayout() {
    const anchor = document.querySelector('#post-list-ul, .post-body, article.c-item');
    const main = anchor?.closest('.flex-1.min-w-0');
    const shell = main?.parentElement;

    if (!main || !shell || shell.children.length < 2) {
      return;
    }

    const mainIndex = Array.from(shell.children).indexOf(main);
    const left = mainIndex > 0 ? shell.children[mainIndex - 1] : null;
    const right = main.nextElementSibling;

    shell.classList.add(CLASS.shell);
    main.classList.add(CLASS.main);
    left?.classList.add(CLASS.left);
    right?.classList.add(CLASS.right);

    document.querySelector('.post-body')?.classList.add(CLASS.post);
    const replyCards = Array.from(document.querySelectorAll('article.c-item'))
      .map((article) => article.closest('.card'))
      .filter((card, index, cards) => card && cards.indexOf(card) === index);

    replyCards.forEach((card) => {
      card.classList.remove(CLASS.replyFirst, CLASS.replyLast);
      card.classList.add(CLASS.reply);
    });
    replyCards[0]?.classList.add(CLASS.replyFirst);
    replyCards.at(-1)?.classList.add(CLASS.replyLast);
  }

  let scheduled = false;
  function scheduleMarkLayout() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      markLayout();
    });
  }

  GM_addStyle(`
:root {
  --kk-2libra-bg: #f2f3f5;
  --kk-2libra-surface: #ffffff;
  --kk-2libra-text: #1e293b;
  --kk-2libra-secondary: #475569;
  --kk-2libra-muted: #94a3b8;
  --kk-2libra-subtle: #f1f5f9;
  --kk-2libra-border: #e2e8f0;
  --kk-2libra-main-width: 805px;
  --kk-2libra-right-width: 270px;
  --kk-2libra-column-gap: 25px;
  --kk-2libra-radius: 10px;
  --kk-2libra-shadow: 0 3px 5px rgb(0 0 0 / 4%);
}

html:has(.kk-2libra-shell),
body:has(.kk-2libra-shell) {
  background: var(--kk-2libra-bg);
}

body:has(.kk-2libra-shell) {
  color: var(--kk-2libra-text);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

body:has(.kk-2libra-shell) > div > div.bg-base-100 {
  background: transparent;
}

.kk-2libra-shell {
  box-sizing: border-box;
  width: min(100%, calc(var(--kk-2libra-main-width) + var(--kk-2libra-right-width) + var(--kk-2libra-column-gap))) !important;
  max-width: calc(var(--kk-2libra-main-width) + var(--kk-2libra-right-width) + var(--kk-2libra-column-gap)) !important;
  gap: var(--kk-2libra-column-gap) !important;
  padding-inline: 0 !important;
}

.kk-2libra-main {
  flex: 1 1 var(--kk-2libra-main-width) !important;
  width: auto !important;
  max-width: var(--kk-2libra-main-width) !important;
}

.kk-2libra-right {
  flex: 0 0 var(--kk-2libra-right-width) !important;
  width: var(--kk-2libra-right-width) !important;
}

.kk-2libra-main .card,
.kk-2libra-right .card {
  border-color: var(--kk-2libra-border) !important;
  border-radius: var(--kk-2libra-radius) !important;
  background: var(--kk-2libra-surface);
  box-shadow: var(--kk-2libra-shadow);
}

.kk-2libra-main #post-list-ul {
  overflow: hidden;
}

.kk-2libra-main #post-list-ul > div:first-child {
  min-height: 42px;
  padding: 8px 10px !important;
  font-size: 14px;
  line-height: 26px;
  border-color: var(--kk-2libra-border) !important;
}

.kk-2libra-main #post-list-ul > li {
  min-height: 58px;
  gap: 10px !important;
  padding: 9px 10px !important;
  font-size: 14px;
  line-height: 1.45;
  border-color: var(--kk-2libra-border) !important;
}

.kk-2libra-main #post-list-ul > li:hover {
  background: #f8fafc;
}

.kk-2libra-main #post-list-ul > li a[href^="/post/"] {
  color: var(--kk-2libra-text);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;
  text-decoration: none;
}

.kk-2libra-main #post-list-ul > li :is(time, a[href^="/user/"], a[href^="/node/"]) {
  color: var(--kk-2libra-muted);
  font-size: 12px;
  line-height: 1.5;
}

.kk-2libra-main #post-list-ul > li a[href^="/node/"] {
  padding: 2px 5px;
  color: var(--kk-2libra-secondary);
  background: var(--kk-2libra-subtle);
  border-radius: 4px;
}

.kk-2libra-main #post-list-ul > li button > img {
  width: 40px !important;
  height: 40px !important;
  border-radius: 5px !important;
}

.kk-2libra-main #post-list-ul > li button:has(> img),
.kk-2libra-reply article.c-item button:has(> img) {
  min-width: 40px;
  min-height: 40px;
  padding: 0 !important;
  line-height: 0;
  background: transparent;
}

.kk-2libra-right {
  font-size: 13px;
  line-height: 1.5;
}

.kk-2libra-right > div,
.kk-2libra-right .card {
  margin-top: 20px !important;
}

.kk-2libra-right .card :is(.card-body, [class*="card-body"]) {
  gap: 0;
}

.kk-2libra-right :is(h2, h3, h4) {
  color: var(--kk-2libra-text);
  font-size: 14px;
  line-height: 1.5;
}

.kk-2libra-right :is(time, small, .text-base-content\/60, .text-base-content\/50) {
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-post {
  border: 1px solid var(--kk-2libra-border) !important;
  border-radius: var(--kk-2libra-radius) !important;
  box-shadow: var(--kk-2libra-shadow);
}

.kk-2libra-post > div {
  padding: 12px 14px 14px !important;
}

.kk-2libra-post h1 {
  margin-bottom: 8px !important;
  color: var(--kk-2libra-text);
  font-size: 20px !important;
  font-weight: 600;
  line-height: 1.4 !important;
}

.kk-2libra-post .prose {
  color: var(--kk-2libra-text);
  font-size: 15px !important;
  line-height: 1.6 !important;
}

.kk-2libra-post .prose p {
  margin-block: 8px !important;
  line-height: 1.6 !important;
}

.kk-2libra-post :is(time, a[href^="/user/"], [class*="text-base-content/60"]) {
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-reply {
  margin-block: 0 !important;
  border-width: 0 1px 1px !important;
  border-color: var(--kk-2libra-border) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.kk-2libra-reply-first {
  border-top-width: 1px !important;
  border-radius: var(--kk-2libra-radius) var(--kk-2libra-radius) 0 0 !important;
}

.kk-2libra-reply-last {
  border-radius: 0 0 var(--kk-2libra-radius) var(--kk-2libra-radius) !important;
}

.kk-2libra-reply > div > div {
  padding: 10px !important;
  border-radius: inherit !important;
}

.kk-2libra-reply article.c-item {
  min-height: 40px;
  color: var(--kk-2libra-text);
  font-size: 13px;
  line-height: 1.5;
}

.kk-2libra-reply article.c-item .prose {
  color: var(--kk-2libra-text);
  font-size: 15px !important;
  line-height: 1.6 !important;
}

.kk-2libra-reply article.c-item .prose p {
  margin-block: 4px !important;
  line-height: 1.6 !important;
}

.kk-2libra-reply article.c-item :is(time, aside, [class*="text-base-content/60"]) {
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-reply article.c-item button > img {
  width: 40px !important;
  height: 40px !important;
  border-radius: 5px !important;
}

.kk-2libra-reply article.c-item article.c-item {
  margin-top: 10px;
  padding: 10px 0 0 15px;
  background: var(--kk-2libra-subtle);
  border-left: 2px solid #cbd5e1;
}

.kk-2libra-main textarea,
.kk-2libra-main [contenteditable="true"] {
  color: var(--kk-2libra-text);
  font: 14px/1.6 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  border-color: #cbd5e1;
  border-radius: 6px;
}

.kk-2libra-main textarea:focus,
.kk-2libra-main [contenteditable="true"]:focus {
  border-color: var(--kk-2libra-secondary);
  outline: 2px solid rgb(148 163 184 / 25%);
  outline-offset: 1px;
}

@media (min-width: 960px) {
  .kk-2libra-left {
    display: none !important;
  }
}

@media (max-width: 959px) {
  .kk-2libra-shell {
    width: 100% !important;
    max-width: 100% !important;
    gap: 0 !important;
    padding-inline: 8px !important;
  }

  .kk-2libra-left,
  .kk-2libra-right {
    display: none !important;
  }

  .kk-2libra-main {
    flex-basis: 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  .kk-2libra-main #post-list-ul > li {
    padding-inline: 8px !important;
  }

  .kk-2libra-post h1 {
    font-size: 18px !important;
  }
}
`);

  markLayout();
  new MutationObserver(scheduleMarkLayout).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
