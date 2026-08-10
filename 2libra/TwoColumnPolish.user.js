// ==UserScript==
// @name         2Libra: V2EX 风格双栏
// @namespace    https://github.com/kakarrot-dev/tampermonkey
// @version      0.2.5
// @description  将 2Libra 调整为 V2EX Polish 风格的紧凑双栏、发帖、正文与回复布局
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
    postList: 'kk-2libra-post-list',
    routeNav: 'kk-2libra-route-nav',
    profile: 'kk-2libra-profile',
    profileContainer: 'kk-2libra-profile-container',
    ad: 'kk-2libra-ad',
    recent: 'kk-2libra-recent',
    post: 'kk-2libra-post',
    reply: 'kk-2libra-reply',
    replyFirst: 'kk-2libra-reply-first',
    replyLast: 'kk-2libra-reply-last',
    editor: 'kk-2libra-editor',
    create: 'kk-2libra-create',
    createPage: 'kk-2libra-create-page',
    createForm: 'kk-2libra-create-form',
    createTitle: 'kk-2libra-create-title',
    createEditor: 'kk-2libra-create-editor',
    createNode: 'kk-2libra-create-node',
    createActions: 'kk-2libra-create-actions',
    createExtensions: 'kk-2libra-create-extensions',
  };

  const POST_ROUTES = [
    { href: '/post/hot/today', label: '今日热议' },
    { href: '/post/hot/recent', label: '近期热议' },
    { href: '/post/latest', label: '新发表' },
  ];

  function currentPath() {
    return location.pathname.replace(/\/+$/, '') || '/';
  }

  function findSidebarColumn(seed) {
    let node = seed;
    while (node?.parentElement) {
      const candidate = node.parentElement;
      const shell = candidate.parentElement;
      if (
        shell?.children.length >= 2 &&
        candidate === shell.lastElementChild &&
        candidate.previousElementSibling?.matches('.flex-1.min-w-0')
      ) {
        return candidate;
      }
      node = candidate;
    }
    return null;
  }

  function findDirectChild(container, descendant) {
    let node = descendant;
    while (node && node.parentElement !== container) {
      node = node.parentElement;
    }
    return node?.parentElement === container ? node : null;
  }

  function markSidebarCards(right) {
    const profile = right
      .querySelector('a[href="/user/setting/profile"]')
      ?.closest('.card');
    const profileContainer = findDirectChild(right, profile);
    const recentHeading = Array.from(right.querySelectorAll('h4')).find((heading) =>
      heading.textContent?.includes('最近访问')
    );
    const recent = findDirectChild(right, recentHeading?.closest('.card'));

    profile?.classList.add(CLASS.profile);
    profileContainer?.classList.add(CLASS.profileContainer);
    recent?.classList.add(CLASS.recent);

    return { profileContainer, recent };
  }

  function syncPostRouteNav(right, profileContainer, recent) {
    const existing = right.querySelector(`.${CLASS.routeNav}`);

    if (currentPath() === '/post/create') {
      existing?.remove();
      return;
    }

    const nav = existing || document.createElement('nav');
    nav.className = `card ${CLASS.routeNav}`;
    nav.setAttribute('aria-label', '帖子浏览');

    if (!existing) {
      const heading = document.createElement('h2');
      heading.textContent = '帖子浏览';
      nav.append(heading);

      const list = document.createElement('div');
      POST_ROUTES.forEach(({ href, label }) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        list.append(link);
      });
      nav.append(list);
    }

    POST_ROUTES.forEach(({ href }) => {
      const link = nav.querySelector(`a[href="${href}"]`);
      const isCurrent = href === currentPath();
      link?.classList.toggle('is-current', isCurrent);
      if (isCurrent) {
        link?.setAttribute('aria-current', 'page');
      } else {
        link?.removeAttribute('aria-current');
      }
    });

    if (profileContainer) {
      if (profileContainer.nextElementSibling !== nav) {
        profileContainer.after(nav);
      }
    } else if (right.firstElementChild !== nav) {
      right.prepend(nav);
    }
    if (recent && right.lastElementChild !== recent) {
      right.append(recent);
    }

    Array.from(right.children).forEach((child) => {
      const keep =
        child === profileContainer || child === nav || child === recent;
      child.classList.toggle(CLASS.ad, !keep);
    });
  }

  function findFieldset(main, label) {
    return Array.from(main.querySelectorAll('fieldset')).find((fieldset) =>
      Array.from(fieldset.children).some(
        (child) => child.matches('legend') && child.textContent?.trim().startsWith(label)
      )
    );
  }

  function markCreateLayout() {
    if (currentPath() !== '/post/create') {
      return false;
    }

    const titleInput = document.querySelector('input.input.w-full[type="text"]');
    const main = titleInput?.closest('.flex-1.min-w-0');
    const shell = main?.parentElement;
    const page = titleInput?.closest('.w-full.mt-2');
    const form = titleInput?.closest('.flex.gap-4')?.firstElementChild;
    const extensionsHeading = Array.from(document.querySelectorAll('p')).find(
      (paragraph) => paragraph.textContent?.trim() === '扩展功能'
    );
    const extensions = extensionsHeading?.parentElement;

    if (!main || !shell || !page || !form || !extensions) {
      return false;
    }

    const mainIndex = Array.from(shell.children).indexOf(main);
    const left = mainIndex > 0 ? shell.children[mainIndex - 1] : null;
    const right = main.nextElementSibling;

    document.body.classList.add(CLASS.create);
    shell.classList.add(CLASS.shell);
    main.classList.add(CLASS.main);
    left?.classList.add(CLASS.left);
    right?.classList.add(CLASS.right);
    page.classList.add(CLASS.createPage);
    form.classList.add(CLASS.createForm);
    findFieldset(main, '标题')?.classList.add(CLASS.createTitle);
    findFieldset(main, '正文')?.classList.add(CLASS.createEditor);
    findFieldset(main, '节点')?.classList.add(CLASS.createNode);
    form.querySelector('fieldset.mt-8')?.classList.add(CLASS.createActions);
    extensions.classList.add(CLASS.createExtensions);
    return true;
  }

  function markLayout() {
    if (currentPath() === '/post/create') {
      markCreateLayout();
      return;
    }

    if (markCreateLayout()) {
      return;
    }

    const postList =
      document.querySelector('#post-list-ul') ||
      document.querySelector('a.title-link[href^="/post/"]')?.closest('ul.card');
    const anchor = postList || document.querySelector('.post-body, article.c-item');
    const sidebarSeed =
      document.querySelector('a[href="/user/setting/profile"]')?.closest('.card') ||
      Array.from(document.querySelectorAll('h4')).find((heading) =>
        heading.textContent?.includes('最近访问')
      );
    const fallbackRight = findSidebarColumn(sidebarSeed);
    const main = anchor?.closest('.flex-1.min-w-0') || fallbackRight?.previousElementSibling;
    const shell = main?.parentElement;

    if (!main || !shell || shell.children.length < 2) {
      return;
    }

    const mainIndex = Array.from(shell.children).indexOf(main);
    const left = mainIndex > 0 ? shell.children[mainIndex - 1] : null;
    const right = main.nextElementSibling || fallbackRight;

    shell.classList.add(CLASS.shell);
    main.classList.add(CLASS.main);
    postList?.classList.add(CLASS.postList);
    left?.classList.add(CLASS.left);
    right?.classList.add(CLASS.right);
    if (right) {
      const { profileContainer, recent } = markSidebarCards(right);
      syncPostRouteNav(right, profileContainer, recent);
    }

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

    const editorHeading = Array.from(main.querySelectorAll('h3')).find((heading) =>
      heading.textContent?.includes('发表一个评论')
    );
    editorHeading?.parentElement?.parentElement?.classList.add(CLASS.editor);
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
  --kk-2libra-sidebar-gap: 16px;
  --kk-2libra-sidebar-padding: 10px;
  --kk-2libra-sidebar-header-height: 40px;
  --kk-2libra-sidebar-row-height: 42px;
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

.kk-2libra-main .kk-2libra-post-list {
  overflow: hidden;
}

.kk-2libra-main .kk-2libra-post-list > div:first-child {
  min-height: 42px;
  padding: 8px 10px !important;
  font-size: 14px;
  line-height: 26px;
  border-color: var(--kk-2libra-border) !important;
}

.kk-2libra-main .kk-2libra-post-list > li {
  min-height: 89px;
  gap: 10px !important;
  padding: 20px 10px !important;
  font-size: 14px;
  line-height: 1.45;
  border-color: var(--kk-2libra-border) !important;
}

.kk-2libra-main .kk-2libra-post-list > li:hover {
  background: #f8fafc;
}

.kk-2libra-main .kk-2libra-post-list > li a[href^="/post/"] {
  color: var(--kk-2libra-text);
  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;
  text-decoration: none;
}

.kk-2libra-main .kk-2libra-post-list > li :is(time, a[href^="/user/"], a[href^="/node/"]) {
  color: var(--kk-2libra-muted);
  font-size: 12px;
  line-height: 1.5;
}

.kk-2libra-main .kk-2libra-post-list > li a[href^="/node/"] {
  padding: 2px 5px;
  color: var(--kk-2libra-secondary);
  background: var(--kk-2libra-subtle);
  border-radius: 4px;
}

.kk-2libra-main .kk-2libra-post-list > li div.flex.items-center.gap-2:has(> a[href*="?commentId="]) {
  display: none !important;
}

.kk-2libra-main .kk-2libra-post-list > li span[class~="w-[0.0625rem]"] {
  display: none !important;
}

.kk-2libra-main .kk-2libra-post-list > li button > img {
  width: 48px !important;
  height: 48px !important;
  border-radius: 5px !important;
}

.kk-2libra-main .kk-2libra-post-list > li button:has(> img),
.kk-2libra-reply article.c-item button:has(> img) {
  padding: 0 !important;
  line-height: 0;
  background: transparent;
}

.kk-2libra-main .kk-2libra-post-list > li button:has(> img) {
  min-width: 48px;
  min-height: 48px;
}

.kk-2libra-reply article.c-item button:has(> img) {
  min-width: 40px;
  min-height: 40px;
}

.kk-2libra-right {
  font-size: 13px;
  line-height: 1.5;
}

.kk-2libra-right > div,
.kk-2libra-right .card {
  margin-top: var(--kk-2libra-sidebar-gap) !important;
}

.kk-2libra-right .card :is(.card-body, [class*="card-body"]) {
  gap: 0;
}

.kk-2libra-right .card {
  overflow: hidden;
}

.kk-2libra-right > .kk-2libra-ad {
  display: none !important;
}

.kk-2libra-route-nav > h2 {
  min-height: var(--kk-2libra-sidebar-header-height);
  margin: 0;
  padding: 10px var(--kk-2libra-sidebar-padding) 9px;
  border-bottom: 1px solid var(--kk-2libra-border);
}

.kk-2libra-route-nav > div {
  display: grid;
  padding: 5px;
}

.kk-2libra-route-nav a {
  display: flex;
  align-items: center;
  min-height: 36px;
  padding: 7px 10px;
  color: var(--kk-2libra-secondary);
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  text-decoration: none;
  border-radius: 6px;
}

.kk-2libra-route-nav a.is-current {
  color: var(--kk-2libra-text);
  background: var(--kk-2libra-subtle);
}

@media (hover: hover) {
  .kk-2libra-route-nav a:hover {
    color: var(--kk-2libra-text);
    background: #f8fafc;
  }
}

.kk-2libra-right :is(h2, h3, h4) {
  color: var(--kk-2libra-secondary);
  font-size: 14px;
  line-height: 20px;
}

.kk-2libra-right :is(time, small, .text-base-content\/60, .text-base-content\/50) {
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-profile > .card-body {
  display: block;
}

.kk-2libra-profile > .card-body > :first-child {
  min-height: 58px;
  padding: 8px var(--kk-2libra-sidebar-padding) !important;
}

.kk-2libra-profile > .card-body > :first-child > div {
  min-width: 0;
}

.kk-2libra-profile > .card-body > :first-child > div > div:first-child {
  flex: 0 0 40px;
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
}

.kk-2libra-profile > .card-body > :first-child > div > div:first-child > div {
  width: 40px !important;
  height: 40px !important;
}

.kk-2libra-profile > .card-body > :first-child > div > div:last-child {
  min-width: 0;
}

.kk-2libra-profile > .card-body > :first-child .text-gray-400 {
  display: block;
  max-width: 158px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kk-2libra-profile > .card-body > :first-child > a {
  flex: 0 0 30px;
  width: 30px;
  min-height: 30px;
  padding: 0 !important;
}

.kk-2libra-profile > .card-body > :nth-child(2) {
  min-height: 38px;
  padding: 6px var(--kk-2libra-sidebar-padding) 8px !important;
}

.kk-2libra-profile > .card-body > :nth-child(2) > div:first-child {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.kk-2libra-profile > .card-body > :nth-child(2) > div:first-child > div {
  min-width: 0;
  white-space: nowrap;
}

.kk-2libra-profile > .card-body > :nth-child(2) :is(span, number-flow-react) {
  font-size: 11px;
}

.kk-2libra-profile > .card-body > :nth-child(3) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px;
  min-height: 36px;
  padding: 3px var(--kk-2libra-sidebar-padding) !important;
}

.kk-2libra-profile > .card-body > :nth-child(3) > div {
  gap: 5px !important;
  min-width: 0;
  white-space: nowrap;
}

.kk-2libra-profile > .card-body > :last-child {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px !important;
  margin-bottom: 0 !important;
  padding: 6px var(--kk-2libra-sidebar-padding) 8px !important;
}

.kk-2libra-profile > .card-body > :last-child > div:last-child,
.kk-2libra-profile > .card-body > :last-child > div:last-child > div {
  display: contents;
}

.kk-2libra-profile .btn {
  min-height: 30px;
  height: 30px;
  padding-inline: 7px !important;
  font-size: 12px;
  white-space: nowrap;
}

.kk-2libra-right .card-body:has(> h4) > h4 {
  box-sizing: border-box;
  min-height: var(--kk-2libra-sidebar-header-height);
  margin: 0;
  padding: 10px var(--kk-2libra-sidebar-padding) 9px !important;
  font-weight: 600;
  border-bottom: 1px solid var(--kk-2libra-border);
}

.kk-2libra-right .card-body:has(> h4) > h4 a {
  color: var(--kk-2libra-secondary);
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
}

.kk-2libra-right .card-body:has(> h4) > h4 + div > div {
  box-sizing: border-box;
  min-height: var(--kk-2libra-sidebar-row-height);
  padding: 6px var(--kk-2libra-sidebar-padding) !important;
  border-color: var(--kk-2libra-border) !important;
}

.kk-2libra-right .card-body:has(> h4) > h4 + div > div:last-child {
  border-bottom: 0 !important;
}

.kk-2libra-right .card-body:has(> h4) > h4 + div > div > .flex.items-center.justify-between {
  min-height: 29px;
}

.kk-2libra-right .card-body:has(> h4) > h4 + div button:has(img) {
  flex: 0 0 28px;
  min-width: 28px;
  min-height: 28px;
  padding: 0 !important;
  line-height: 0;
  background: transparent;
}

.kk-2libra-right .card-body:has(> h4) > h4 + div button:has(img) :is(img, svg, canvas) {
  width: 28px !important;
  height: 28px !important;
  border-radius: 5px !important;
}

.kk-2libra-right .card-body:has(> h4) > h4 + div a[href^="/post/"] {
  color: var(--kk-2libra-text);
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  text-decoration: none;
}

.kk-2libra-right .card-body:has(> h4) > h4 + div .rounded-full {
  min-width: 26px;
  height: 22px;
  padding-inline: 7px !important;
  color: var(--kk-2libra-secondary);
  font-size: 11px;
  line-height: 22px;
  background: var(--kk-2libra-subtle);
  border-radius: 11px;
}

@media (hover: hover) {
  .kk-2libra-right .card-body:has(> h4) > h4 + div > div:hover {
    background: #f8fafc;
  }

  .kk-2libra-right .card-body:has(> h4) > h4 a:hover,
  .kk-2libra-right .card-body:has(> h4) > h4 + div a[href^="/post/"]:hover {
    color: var(--kk-2libra-text);
    text-decoration: underline;
  }
}

.kk-2libra-profile > .card-body > :last-child .btn {
  width: 100%;
}

.kk-2libra-post {
  border: 1px solid var(--kk-2libra-border) !important;
  border-radius: var(--kk-2libra-radius) !important;
  box-shadow: var(--kk-2libra-shadow);
}

.kk-2libra-post > div {
  padding: 20px 22px !important;
}

.kk-2libra-post > div > :first-child {
  min-height: 21px;
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 21px;
}

.kk-2libra-post h1 {
  margin-bottom: 10px !important;
  color: var(--kk-2libra-text);
  font-size: 22px !important;
  font-weight: 600;
  line-height: 33px !important;
}

.kk-2libra-post h1 + div {
  margin-bottom: 12px !important;
  font-size: 12px;
  line-height: 21px;
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

.kk-2libra-main .card.kk-2libra-reply {
  margin-block: 0 !important;
  border-width: 0 1px 1px !important;
  border-style: solid !important;
  border-color: var(--kk-2libra-border) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.kk-2libra-main .card.kk-2libra-reply-first {
  border-top-width: 1px !important;
  border-radius: var(--kk-2libra-radius) var(--kk-2libra-radius) 0 0 !important;
}

.kk-2libra-main .card.kk-2libra-reply-last {
  border-radius: 0 0 var(--kk-2libra-radius) var(--kk-2libra-radius) !important;
}

.kk-2libra-main .kk-2libra-reply > .rounded-xl,
.kk-2libra-main .kk-2libra-reply > .rounded-xl > .rounded-xl {
  border-radius: 0 !important;
}

.kk-2libra-main .kk-2libra-reply-first > .rounded-xl,
.kk-2libra-main .kk-2libra-reply-first > .rounded-xl > .rounded-xl {
  border-radius: var(--kk-2libra-radius) var(--kk-2libra-radius) 0 0 !important;
}

.kk-2libra-main .kk-2libra-reply-last > .rounded-xl,
.kk-2libra-main .kk-2libra-reply-last > .rounded-xl > .rounded-xl {
  border-radius: 0 0 var(--kk-2libra-radius) var(--kk-2libra-radius) !important;
}

.kk-2libra-reply > div > div {
  padding: 20px 10px !important;
  border-radius: inherit !important;
}

.kk-2libra-reply article.c-item {
  min-height: 50px;
  color: var(--kk-2libra-text);
  font-size: 14px;
  line-height: 21px;
}

.kk-2libra-reply article.c-item > div {
  position: relative;
  min-height: 50px;
}

.kk-2libra-reply article.c-item header {
  min-height: 21px;
  margin-bottom: 4px !important;
  padding-left: 55px;
  line-height: 21px;
}

.kk-2libra-reply article.c-item header address {
  gap: 8px;
  min-width: 0;
}

.kk-2libra-reply article.c-item header address > div:first-child > div:first-child {
  position: absolute !important;
  top: 0;
  left: -55px;
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
}

.kk-2libra-reply article.c-item header address > div:first-child > div:first-child > button,
.kk-2libra-reply article.c-item header address > div:first-child > div:first-child > button > div,
.kk-2libra-reply article.c-item header address > div:first-child > div:first-child > button > div > div {
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
}

.kk-2libra-reply article.c-item header address > div:first-child > div:first-child :is(img, svg, canvas) {
  width: 40px !important;
  height: 40px !important;
  border-radius: 5px !important;
}

.kk-2libra-reply article.c-item header address a[href^="/user/"] {
  color: var(--kk-2libra-secondary) !important;
  font-size: 13px !important;
  font-weight: 600;
}

.kk-2libra-reply article.c-item > div > section {
  margin: 0 0 0 55px !important;
  min-height: 24px;
}

.kk-2libra-reply article.c-item .prose {
  color: var(--kk-2libra-text);
  font-size: 15px !important;
  line-height: 1.6 !important;
}

.kk-2libra-reply article.c-item .prose p {
  margin-block: 0 !important;
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

.kk-2libra-reply article.c-item > div > footer {
  position: absolute;
  right: 0;
  bottom: 0;
  margin-left: 55px;
  line-height: 24px;
  transition: opacity 120ms ease;
}

@media (hover: hover) {
  .kk-2libra-reply article.c-item > div > footer {
    pointer-events: none;
    opacity: 0;
  }

  .kk-2libra-reply article.c-item:hover > div > footer,
  .kk-2libra-reply article.c-item:focus-within > div > footer {
    pointer-events: auto;
    opacity: 1;
  }
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

.kk-2libra-editor {
  box-sizing: border-box;
  width: 100%;
  padding: 18px !important;
  background: var(--kk-2libra-surface) !important;
  border-radius: var(--kk-2libra-radius);
  box-shadow: var(--kk-2libra-shadow);
}

body.kk-2libra-create {
  background: var(--kk-2libra-bg) !important;
}

.kk-2libra-create .kk-2libra-shell {
  align-items: flex-start;
  padding-top: 20px;
}

.kk-2libra-create .kk-2libra-right > div {
  margin-top: 0 !important;
}

.kk-2libra-create-page {
  box-sizing: border-box;
  margin-top: 0 !important;
  padding: 0 20px 20px;
  background: var(--kk-2libra-surface);
  border: 1px solid var(--kk-2libra-border);
  border-radius: var(--kk-2libra-radius);
  box-shadow: var(--kk-2libra-shadow);
}

.kk-2libra-create-page > .breadcrumbs {
  min-height: 58px;
  padding: 18px 0 14px;
  color: var(--kk-2libra-secondary);
  font-size: 14px;
  border-bottom: 1px solid var(--kk-2libra-border);
}

.kk-2libra-create-page > .flex {
  display: block;
}

.kk-2libra-create-form {
  padding-top: 16px;
}

.kk-2libra-create-form > fieldset {
  padding: 0;
}

.kk-2libra-create-form .fieldset-legend {
  min-height: 32px;
  padding: 0;
  color: var(--kk-2libra-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 32px;
}

.kk-2libra-create-title .input {
  box-sizing: border-box;
  height: 60px;
  padding: 0 16px;
  color: var(--kk-2libra-text);
  font-size: 16px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  box-shadow: none;
}

.kk-2libra-create-title .input:focus {
  background: var(--kk-2libra-surface);
  border-color: #94a3b8;
  outline: 2px solid rgb(148 163 184 / 22%);
  outline-offset: 1px;
}

.kk-2libra-create-form .label {
  padding: 7px 1px 0;
  color: var(--kk-2libra-muted);
  font-size: 12px;
  line-height: 18px;
}

.kk-2libra-create-editor {
  margin-top: 10px;
}

.kk-2libra-create-editor .fieldset-legend {
  display: flex;
  align-items: center;
}

.kk-2libra-create-editor .fieldset-legend .btn {
  min-height: 28px;
  height: 28px;
  padding-inline: 9px;
  color: var(--kk-2libra-secondary);
  font-size: 12px;
  background: var(--kk-2libra-subtle);
  border-color: var(--kk-2libra-border);
  border-radius: 5px;
  box-shadow: none;
}

.kk-2libra-create-editor .skeleton {
  min-height: 360px !important;
  background: #f8fafc !important;
  border: 1px solid #cbd5e1;
  border-radius: 7px !important;
}

.kk-2libra-create-editor .w-md-editor {
  min-height: 358px;
  color: var(--kk-2libra-text);
  background: transparent;
  border-radius: 6px;
  box-shadow: none;
}

.kk-2libra-create-editor .w-md-editor-toolbar {
  min-height: 40px;
  padding: 5px 8px;
  background: var(--kk-2libra-subtle);
  border-bottom: 1px solid var(--kk-2libra-border);
}

.kk-2libra-create-editor .w-md-editor-toolbar button {
  min-width: 28px;
  min-height: 28px;
  border-radius: 4px;
}

@media (hover: hover) {
  .kk-2libra-create-editor .w-md-editor-toolbar button:hover {
    background: #e2e8f0;
  }
}

.kk-2libra-create-editor .w-md-editor-text {
  padding: 0 !important;
}

.kk-2libra-create-editor .w-md-editor-text-input,
.kk-2libra-create-editor .w-md-editor-text-pre {
  padding: 14px 16px !important;
  color: var(--kk-2libra-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace !important;
  font-size: 14px !important;
  font-variant-ligatures: none;
  letter-spacing: normal !important;
  line-height: 1.65 !important;
  tab-size: 2;
}

.kk-2libra-create-editor .w-md-editor-text-pre > code {
  font: inherit !important;
  letter-spacing: inherit !important;
}

.kk-2libra-create-node {
  margin-top: 12px;
  padding: 12px 0 14px !important;
  border-top: 1px solid var(--kk-2libra-border);
  border-bottom: 1px solid var(--kk-2libra-border);
}

.kk-2libra-create-node .fieldset-legend {
  min-height: 25px;
  line-height: 25px;
}

.kk-2libra-create-node > div {
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-create-actions {
  margin-top: 0 !important;
  padding-top: 14px !important;
}

.kk-2libra-create-actions .mb-4:empty {
  display: none;
}

.kk-2libra-create-actions .btn-primary {
  min-height: 38px;
  height: 38px;
  padding-inline: 18px !important;
  color: var(--kk-2libra-secondary);
  font-size: 14px;
  font-weight: 600;
  background: var(--kk-2libra-subtle);
  border: 1px solid var(--kk-2libra-border);
  border-radius: 6px;
  box-shadow: none;
}

@media (hover: hover) {
  .kk-2libra-create-actions .btn-primary:hover {
    color: var(--kk-2libra-text);
    background: #e2e8f0;
  }
}

.kk-2libra-create-extensions {
  overflow: hidden;
  margin-top: 0 !important;
  background: var(--kk-2libra-surface);
  border: 1px solid var(--kk-2libra-border);
  border-radius: var(--kk-2libra-radius);
  box-shadow: var(--kk-2libra-shadow);
}

.kk-2libra-create-extensions > p:first-child {
  min-height: 48px;
  margin: 0 !important;
  padding: 13px 14px;
  color: var(--kk-2libra-text);
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  border-bottom: 1px solid var(--kk-2libra-border);
}

.kk-2libra-create-extensions > div {
  margin: 0 !important;
}

.kk-2libra-create-extensions .card {
  border: 0 !important;
  border-bottom: 1px solid var(--kk-2libra-border) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.kk-2libra-create-extensions > div:last-child .card {
  border-bottom: 0 !important;
}

.kk-2libra-create-extensions .card-body {
  gap: 5px;
  padding: 11px 13px !important;
}

.kk-2libra-create-extensions h2 {
  min-height: 28px;
  color: var(--kk-2libra-text);
  font-size: 13px;
  line-height: 28px;
}

.kk-2libra-create-extensions h2 .btn {
  min-height: 28px;
  height: 28px;
  padding-inline: 9px;
  color: var(--kk-2libra-secondary);
  font-size: 12px;
  background: var(--kk-2libra-subtle);
  border-color: var(--kk-2libra-border);
  border-radius: 5px;
  box-shadow: none;
}

.kk-2libra-create-extensions .card-body > p {
  color: var(--kk-2libra-muted);
  font-size: 12px;
  line-height: 18px;
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

  .kk-2libra-main .kk-2libra-post-list > li {
    padding-inline: 8px !important;
  }

  .kk-2libra-post h1 {
    font-size: 20px !important;
    line-height: 1.45 !important;
  }

  .kk-2libra-post > div {
    padding: 16px !important;
  }

  .kk-2libra-editor {
    padding: 14px !important;
  }

  .kk-2libra-create .kk-2libra-shell {
    padding-top: 8px;
  }

  .kk-2libra-create-page {
    padding: 0 14px 16px;
  }

  .kk-2libra-create-page > .breadcrumbs {
    min-height: 48px;
    padding-block: 13px 11px;
  }

  .kk-2libra-create-title .input {
    height: 52px;
  }

  .kk-2libra-create-editor .skeleton,
  .kk-2libra-create-editor .w-md-editor {
    min-height: 300px !important;
  }
}
`);

  markLayout();
  new MutationObserver(scheduleMarkLayout).observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
