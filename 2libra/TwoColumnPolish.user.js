// ==UserScript==
// @name         2Libra: V2EX 风格双栏
// @namespace    https://github.com/kakarrot-dev/tampermonkey
// @version      0.3.9
// @description  将 2Libra 调整为 V2EX Polish 风格的紧凑双栏、发帖、正文与回复布局
// @author       kakarrot
// @match        https://2libra.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  document.documentElement.classList.add('kk-2libra-booting');

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
    postInner: 'kk-2libra-post-inner',
    postHeader: 'kk-2libra-post-header',
    postMeta: 'kk-2libra-post-meta',
    postContent: 'kk-2libra-post-content',
    postPool: 'kk-2libra-post-pool',
    postActions: 'kk-2libra-post-actions',
    replyToolbar: 'kk-2libra-reply-toolbar',
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
    settingsPage: 'kk-2libra-settings-page',
    userPage: 'kk-2libra-user-page',
  };

  const POST_ROUTES = [
    { href: '/post/hot/today', label: '今日热议' },
    { href: '/post/hot/recent', label: '近期热议' },
    { href: '/post/latest', label: '新发表' },
  ];

  function currentPath() {
    return location.pathname.replace(/\/+$/, '') || '/';
  }

  function isPostDetailPath(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    return (
      segments.length === 3 &&
      (segments[0] === 'post' || segments[0] === 'post-flat') &&
      segments[1] !== 'hot'
    );
  }

  function enableSameTabPostNavigation() {
    document.addEventListener(
      'click',
      (event) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          !(event.target instanceof Element)
        ) {
          return;
        }

        const link = event.target.closest('a[href]');
        if (!link || link.hasAttribute('download')) {
          return;
        }

        const url = new URL(link.href, location.href);
        if (url.origin !== location.origin || !isPostDetailPath(url.pathname)) {
          return;
        }

        const target = link.getAttribute('target');
        link.removeAttribute('target');
        queueMicrotask(() => {
          if (target === null) {
            link.removeAttribute('target');
          } else {
            link.setAttribute('target', target);
          }
        });
      },
      true
    );
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

    if (recentHeading?.firstChild?.nodeType === Node.TEXT_NODE) {
      recentHeading.firstChild.nodeValue = '最近访问';
    }

    profile?.classList.add(CLASS.profile);
    profileContainer?.classList.add(CLASS.profileContainer);
    recent?.classList.add(CLASS.recent);

    return { profileContainer, recent };
  }

  function isAuthEntry(child) {
    if (
      child.querySelector(
        'a[href*="/login"], a[href*="/register"], a[href*="/sign-in"], a[href*="/sign-up"]'
      )
    ) {
      return true;
    }

    return Array.from(child.querySelectorAll('a, button')).some((control) =>
      /^(登录|注册|登入|log in|sign in|register|sign up)$/i.test(
        control.textContent?.trim() || ''
      )
    );
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
        child === profileContainer ||
        child === nav ||
        child === recent ||
        isAuthEntry(child);
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
    document.documentElement.classList.remove('kk-2libra-booting');
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
    main.classList.toggle(CLASS.settingsPage, currentPath().startsWith('/user/setting/'));
    main.classList.toggle(
      CLASS.userPage,
      /^\/user\/[^/]+\/(?:about|post|comment|favorites|history)$/.test(currentPath())
    );
    postList?.classList.add(CLASS.postList);
    left?.classList.add(CLASS.left);
    right?.classList.add(CLASS.right);
    if (right) {
      const { profileContainer, recent } = markSidebarCards(right);
      syncPostRouteNav(right, profileContainer, recent);
    }

    const post = document.querySelector('.post-body');
    post?.classList.add(CLASS.post);
    if (post?.firstElementChild) {
      const inner = post.firstElementChild;
      const title = inner.querySelector(':scope > h1');
      const meta = title?.nextElementSibling;
      const prose = inner.querySelector('.prose');
      const content = findDirectChild(inner, prose);
      const poolLabel = Array.from(inner.querySelectorAll('span')).find(
        (span) => span.textContent?.trim() === '金币池'
      );
      const pool = findDirectChild(inner, poolLabel);
      const tagLink = inner.querySelector('a[href^="/tag/"]');
      const actions = findDirectChild(inner, tagLink);
      const header = title?.previousElementSibling;

      inner.classList.add(CLASS.postInner);
      header?.classList.add(CLASS.postHeader);
      meta?.classList.add(CLASS.postMeta);
      content?.classList.add(CLASS.postContent);
      pool?.classList.add(CLASS.postPool);
      actions?.classList.add(CLASS.postActions);

      const homeCrumb = header?.querySelector('.breadcrumbs a[href="/"]');
      if (homeCrumb) {
        homeCrumb.textContent = '2Libra';
      }

      const replyCount = Array.from(meta?.children || []).find((child) =>
        /^\d+\s*条回复$/.test(child.textContent?.trim() || '')
      )?.textContent?.trim();
      const toolbar = post.parentElement?.querySelector(':scope > .flex.justify-end.items-center');
      if (toolbar) {
        toolbar.classList.add(CLASS.replyToolbar);
        toolbar.dataset.replyCount = replyCount || '帖子回复';
      }
    }
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
    document.documentElement.classList.remove('kk-2libra-booting');
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
:root.kk-2libra-booting {
  background: #f2f3f5;
}

:root.kk-2libra-booting body {
  visibility: hidden !important;
}

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
  --kk-2libra-reply-indent: 55px;
  --kk-2libra-nested-reply-indent: 36px;
  --kk-2libra-reply-row-padding: 12px;
  --kk-2libra-nested-reply-row-padding: 8px;
  --kk-2libra-reply-stack-gap: 6px;
  --kk-2libra-reply-group-bg: #f6f8fb;
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
  min-width: 0;
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

.kk-2libra-right .kk-2libra-profile {
  position: relative;
  z-index: 2;
  overflow: visible !important;
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

.kk-2libra-right .kk-2libra-recent .card-body > h4 {
  min-height: 48px !important;
  padding: 13px 14px 12px !important;
  color: var(--kk-2libra-secondary);
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}

.kk-2libra-right .kk-2libra-recent .card-body > h4 > a {
  padding: 3px 0;
  color: var(--kk-2libra-muted);
  font-size: 11px;
}

.kk-2libra-right .kk-2libra-recent .card-body > h4 + div > div {
  min-height: 0 !important;
  padding: 0 !important;
}

.kk-2libra-right .kk-2libra-recent .card-body > h4 + div > div > a[href^="/post/"] {
  display: flex;
  align-items: center;
  min-height: 50px;
  padding: 8px 12px;
  color: var(--kk-2libra-text);
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  text-decoration: none;
}

.kk-2libra-right .kk-2libra-recent .card-body > h4 + div > div > a[href^="/post/"] + div {
  display: none !important;
}

@media (hover: hover) {
  .kk-2libra-right .kk-2libra-recent .card-body > h4 + div > div:hover {
    background: #f8fafc;
  }

  .kk-2libra-right .kk-2libra-recent .card-body > h4 + div > div > a[href^="/post/"]:hover {
    text-decoration: none;
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

.kk-2libra-profile > .card-body > h2:first-child {
  min-height: 58px;
  padding: 8px var(--kk-2libra-sidebar-padding) !important;
}

.kk-2libra-profile > .card-body > h2:first-child > div {
  min-width: 0;
}

.kk-2libra-profile > .card-body > h2:first-child > div > div:first-child {
  flex: 0 0 40px;
  width: 40px !important;
  min-width: 40px !important;
  height: 40px !important;
}

.kk-2libra-profile > .card-body > h2:first-child > div > div:first-child > div {
  width: 40px !important;
  height: 40px !important;
}

.kk-2libra-profile > .card-body > h2:first-child > div > div:last-child {
  min-width: 0;
}

.kk-2libra-profile > .card-body > :first-child .text-gray-400 {
  display: block;
  max-width: 158px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kk-2libra-profile > .card-body > h2:first-child > a {
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

.kk-2libra-profile > .card-body > :nth-child(3) > div:last-child {
  justify-content: flex-end;
}

.kk-2libra-profile > .card-body > :nth-child(3) .dropdown-content {
  font-size: 12px;
}

.kk-2libra-profile > .card-body > :nth-child(3) > div {
  gap: 5px !important;
  min-width: 0;
  white-space: nowrap;
}

.kk-2libra-profile > .card-body > :last-child {
  display: flex;
  gap: 4px !important;
  align-items: center;
  margin-bottom: 0 !important;
  padding: 6px var(--kk-2libra-sidebar-padding) 8px !important;
}

.kk-2libra-profile > .card-body > :last-child > div:first-child {
  flex: 0 0 auto;
}

.kk-2libra-profile > .card-body > :last-child > div:last-child {
  display: flex;
  flex: 1 1 auto;
  gap: 4px !important;
  justify-content: flex-end;
  min-width: 0;
}

.kk-2libra-profile > .card-body > :last-child > div:last-child > div:first-child > div {
  gap: 4px !important;
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

.kk-2libra-profile > .card-body > :last-child > div:first-child > .btn,
.kk-2libra-profile > .card-body > :last-child > div:last-child > button,
.kk-2libra-profile > .card-body > :last-child > div:last-child > div:first-child > div > .btn {
  width: auto;
  min-width: 28px;
  min-height: 28px;
  height: 28px;
  padding-inline: 6px !important;
  font-size: 11px;
}

.kk-2libra-profile > .card-body > :last-child > div:last-child > button {
  flex: 0 0 28px;
  width: 28px;
  padding: 0 !important;
}

.kk-2libra-profile > .card-body > :last-child > div:last-child > button > span {
  display: none !important;
}

.kk-2libra-profile > .card-body > :nth-child(3) > div:last-child > .relative {
  z-index: 20;
}

.kk-2libra-settings-page > .card,
.kk-2libra-user-page > .card {
  overflow: hidden;
}

.kk-2libra-settings-page .breadcrumbs,
.kk-2libra-user-page .breadcrumbs {
  min-height: 42px;
  padding: 10px 2px;
  color: var(--kk-2libra-secondary);
  font-size: 13px;
  line-height: 22px;
}

.kk-2libra-settings-page [role="tablist"],
.kk-2libra-user-page [role="tablist"] {
  box-sizing: border-box;
  min-height: 42px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-inline: 8px;
  border-color: var(--kk-2libra-border) !important;
  scrollbar-width: thin;
}

.kk-2libra-settings-page [role="tab"],
.kk-2libra-user-page [role="tablist"] .tab {
  min-width: max-content;
  height: 42px;
  padding-inline: 12px;
  color: var(--kk-2libra-muted);
  font-size: 13px;
  line-height: 42px;
  border-color: transparent;
}

.kk-2libra-settings-page [role="tab"].tab-active,
.kk-2libra-user-page [role="tablist"] .tab-active {
  color: var(--kk-2libra-text);
  font-weight: 600;
  border-color: var(--kk-2libra-secondary) !important;
}

.kk-2libra-settings-page > .card > div:last-child > div:last-child {
  padding: 16px 18px 20px !important;
}

.kk-2libra-settings-page fieldset.fieldset {
  gap: 4px;
  padding: 0 0 16px;
}

.kk-2libra-settings-page fieldset.fieldset + fieldset.fieldset {
  padding-top: 14px;
  border-top: 1px solid var(--kk-2libra-border);
}

.kk-2libra-settings-page .fieldset-legend {
  padding: 0;
  color: var(--kk-2libra-text);
  font-size: 13px;
  font-weight: 600;
  line-height: 24px;
}

.kk-2libra-settings-page fieldset.fieldset > .flex,
.kk-2libra-settings-page fieldset.fieldset > div {
  min-height: 28px;
}

.kk-2libra-settings-page fieldset.fieldset .font-bold {
  color: var(--kk-2libra-text);
  font-size: 14px;
}

.kk-2libra-settings-page fieldset.fieldset .label {
  padding: 0;
  color: var(--kk-2libra-muted);
  font-size: 12px;
  line-height: 19px;
}

.kk-2libra-user-page > .card > div:nth-child(2) {
  min-height: 138px;
  padding: 14px 16px !important;
  border-color: var(--kk-2libra-border) !important;
}

.kk-2libra-user-page > .card > div:nth-child(2) > div:first-child {
  min-width: 0;
}

.kk-2libra-user-page > .card > div:nth-child(2) img[alt] {
  max-width: 100%;
  height: auto;
}

.kk-2libra-user-page > .card > div:nth-child(2) .text-xl,
.kk-2libra-user-page > .card > div:nth-child(2) [class~="sm:text-2xl"] {
  color: var(--kk-2libra-text);
  font-size: 22px !important;
  line-height: 30px;
}

.kk-2libra-user-page > .card > div:nth-child(2) [class*="text-base-content/60"] {
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-user-page [role="tablist"] + div > ul > li {
  min-height: 62px;
  padding: 9px 10px !important;
  border-color: var(--kk-2libra-border) !important;
}

.kk-2libra-user-page [role="tablist"] + div > ul > li:last-child {
  border-bottom: 0 !important;
}

.kk-2libra-user-page [role="tablist"] + div > ul > li a.title-link {
  color: var(--kk-2libra-text);
  font-size: 14px !important;
  font-weight: 500;
  line-height: 20px !important;
}

.kk-2libra-user-page [role="tablist"] + div > ul > li :is(time, [class*="text-base-content/60"]) {
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-user-page [role="tablist"] + div > ul > li .badge {
  border: 0;
  box-shadow: none;
}

@media (hover: hover) {
  .kk-2libra-user-page [role="tablist"] + div > ul > li:hover {
    background: #f8fafc;
  }
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

.kk-2libra-post .prose :is(img, video) {
  max-width: 100% !important;
  height: auto !important;
}

.kk-2libra-post :is(time, a[href^="/user/"], [class*="text-base-content/60"]) {
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-post > .kk-2libra-post-inner {
  position: relative;
  padding: 14px 18px 12px !important;
}

.kk-2libra-post-header {
  min-height: 24px !important;
  margin-bottom: 4px !important;
  padding-right: 78px;
}

.kk-2libra-post-header .breadcrumbs {
  padding: 0;
  color: var(--kk-2libra-secondary);
  font-size: 12px;
  line-height: 20px;
}

.kk-2libra-post h1 {
  max-width: calc(100% - 78px);
  margin: 0 0 7px !important;
  font-size: 22px !important;
  line-height: 1.4 !important;
}

.kk-2libra-post-meta {
  position: static;
  gap: 6px !important;
  min-height: 22px;
  margin: 0 78px 12px 0 !important;
  color: var(--kk-2libra-muted);
  font-size: 12px;
}

.kk-2libra-post-meta > div:first-child > div:first-child {
  position: absolute !important;
  top: 14px;
  right: 18px;
  width: 64px !important;
  min-width: 64px !important;
  height: 64px !important;
}

.kk-2libra-post-meta > div:first-child > div:first-child > button,
.kk-2libra-post-meta > div:first-child > div:first-child > button > div,
.kk-2libra-post-meta > div:first-child > div:first-child > button > div > div,
.kk-2libra-post-meta > div:first-child > div:first-child :is(img, svg, canvas) {
  width: 64px !important;
  min-width: 64px !important;
  height: 64px !important;
  border-radius: 6px !important;
}

.kk-2libra-post-meta > div:first-child > .tooltip.emoji:has(> img),
.kk-2libra-post-meta > span[class*="w-"] {
  display: none !important;
}

.kk-2libra-post-meta a[href^="/user/"] {
  color: var(--kk-2libra-secondary) !important;
  font-size: 12px;
  font-weight: 600;
}

.kk-2libra-post-meta > div:last-child {
  gap: 4px !important;
}

.kk-2libra-post-meta > div:last-child > div:last-child {
  color: var(--kk-2libra-secondary);
  text-decoration: none !important;
}

.kk-2libra-post-content {
  margin-inline: 0;
  padding: 14px 0 8px;
  border-top: 1px solid var(--kk-2libra-border);
}

.kk-2libra-post-content .prose {
  font-size: 15px !important;
  line-height: 1.65 !important;
}

.kk-2libra-post-content .prose a {
  color: var(--kk-2libra-text);
  text-decoration: underline 1px;
  text-underline-offset: 0.28em;
  background: var(--kk-2libra-subtle);
}

.kk-2libra-post-pool {
  margin: 8px 0 10px !important;
  padding: 10px 12px;
  background: #fffbeb;
  border-left: 3px solid #f4d58d;
  border-radius: 4px;
}

.kk-2libra-post-pool > .divider {
  min-height: 20px;
  margin: 0 0 4px;
  color: var(--kk-2libra-secondary);
  font-weight: 600;
}

.kk-2libra-post-pool > .divider::before,
.kk-2libra-post-pool > .divider::after {
  display: none;
}

.kk-2libra-post-pool > div:last-child > div {
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
}

.kk-2libra-post-pool .text-warning {
  color: #9a6700;
  font-size: 13px;
}

.kk-2libra-post-pool .label {
  padding: 2px 0 0;
  color: var(--kk-2libra-muted);
  font-size: 12px;
  line-height: 18px;
}

.kk-2libra-post-actions {
  min-height: 32px;
  padding-top: 8px;
  border-top: 1px solid var(--kk-2libra-border);
}

.kk-2libra-post-actions .badge {
  height: 22px;
  padding-inline: 7px;
  color: var(--kk-2libra-secondary);
  font-size: 11px;
  background: var(--kk-2libra-subtle);
  border: 0;
  border-radius: 5px;
}

.kk-2libra-post-actions a[href^="/tag/"] {
  color: inherit;
  text-decoration: none;
}

.kk-2libra-reply-toolbar {
  box-sizing: border-box;
  justify-content: flex-end !important;
  min-height: 48px;
  margin: 16px 0 0 !important;
  padding: 8px 10px;
  background: var(--kk-2libra-surface);
  border: 1px solid var(--kk-2libra-border);
  border-bottom: 0;
  border-radius: var(--kk-2libra-radius) var(--kk-2libra-radius) 0 0;
}

.kk-2libra-reply-toolbar::before {
  content: attr(data-reply-count);
  margin-right: auto;
  color: var(--kk-2libra-secondary);
  font-size: 13px;
  font-weight: 600;
}

.kk-2libra-reply-toolbar > .flex.items-center.gap-2 > .btn,
.kk-2libra-reply-toolbar > .flex.items-center.gap-2 > .relative [role="button"].btn {
  min-height: 28px;
  height: 28px;
  padding-inline: 8px;
  color: var(--kk-2libra-secondary);
  font-size: 12px;
  background: var(--kk-2libra-subtle);
  border: 0;
  border-radius: 5px;
  box-shadow: none;
}

.kk-2libra-reply-toolbar + .kk-2libra-reply-first {
  border-radius: 0 !important;
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
  padding: 0 !important;
  border-radius: inherit !important;
}

.kk-2libra-reply .level-1 > .box {
  overflow: hidden;
  margin: 0 10px 12px var(--kk-2libra-reply-indent);
  padding: 4px 8px 4px 10px;
  background: var(--kk-2libra-reply-group-bg) !important;
  border-left: 2px solid #d7e0ea;
  border-radius: 0 !important;
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) {
  padding: 0 !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
}

.kk-2libra-reply .l-3-comment {
  padding-left: 10px !important;
  border-left: 1px solid #d7e0ea !important;
}

.kk-2libra-reply :is(.level-2, .level-3) > [class*="pl-"] {
  padding-left: 10px !important;
}

.kk-2libra-reply :is(.level-2, .level-3),
.kk-2libra-reply :is(.level-2, .level-3) > [class*="pl-"] > .box {
  background: transparent !important;
  border-radius: 0 !important;
}

.kk-2libra-reply article.c-item {
  min-height: 48px;
  padding: var(--kk-2libra-reply-row-padding) 10px !important;
  color: var(--kk-2libra-text);
  font-size: 14px;
  line-height: 21px;
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item {
  min-height: 48px;
  padding: var(--kk-2libra-nested-reply-row-padding) 0 !important;
}

.kk-2libra-reply article.c-item > div {
  position: relative;
  min-height: 40px;
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item > div {
  min-height: 32px;
}

.kk-2libra-reply article.c-item header {
  min-height: 21px;
  margin-bottom: var(--kk-2libra-reply-stack-gap) !important;
  padding-left: var(--kk-2libra-reply-indent);
  line-height: 21px;
}

.kk-2libra-reply article.c-item header address {
  gap: 8px;
  min-width: 0;
}

.kk-2libra-reply article.c-item header address > .tooltip.emoji:has(> img) {
  display: none !important;
}

.kk-2libra-reply article.c-item header address > div:first-child > div:first-child {
  position: absolute !important;
  top: 0;
  left: calc(-1 * var(--kk-2libra-reply-indent));
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
  margin: 0 0 0 var(--kk-2libra-reply-indent) !important;
  min-height: 24px;
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item header {
  padding-left: var(--kk-2libra-nested-reply-indent);
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item > div > section {
  margin-left: var(--kk-2libra-nested-reply-indent) !important;
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item header address > div:first-child > div:first-child {
  left: calc(-1 * var(--kk-2libra-nested-reply-indent));
  width: 26px !important;
  min-width: 26px !important;
  height: 26px !important;
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item header address > div:first-child > div:first-child > button,
.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item header address > div:first-child > div:first-child > button > div,
.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item header address > div:first-child > div:first-child > button > div > div {
  width: 26px !important;
  min-width: 26px !important;
  height: 26px !important;
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item header address > div:first-child > div:first-child :is(img, svg, canvas),
.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item button > img {
  width: 26px !important;
  height: 26px !important;
  border-radius: 4px !important;
}

.kk-2libra-reply article.c-item > div > div[id^="reply-comment-"] {
  min-width: 0;
  margin-bottom: var(--kk-2libra-reply-stack-gap) !important;
  margin-left: calc(var(--kk-2libra-reply-indent) - 22px);
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

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item .prose {
  font-size: 14px !important;
  line-height: 1.55 !important;
}

.kk-2libra-reply article.c-item .prose a {
  color: var(--kk-2libra-text);
  text-decoration: underline 1px;
  text-underline-offset: 0.28em;
  background: var(--kk-2libra-subtle);
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item header address > span:has(+ time),
.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item header address > time {
  display: none !important;
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
  margin-left: var(--kk-2libra-reply-indent);
  line-height: 24px;
  transition: opacity 120ms ease;
}

.kk-2libra-reply :is(.l-2-comment, .l-3-comment) article.c-item > div > footer {
  margin-left: var(--kk-2libra-nested-reply-indent);
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
  max-width: 100%;
  overflow: hidden;
  padding: 18px !important;
  background: var(--kk-2libra-surface) !important;
  border-radius: var(--kk-2libra-radius);
  box-shadow: var(--kk-2libra-shadow);
}

.kk-2libra-editor .w-md-editor-toolbar {
  overflow-x: auto;
  overflow-y: hidden;
}

.kk-2libra-editor {
  margin-top: 16px !important;
  margin-bottom: 16px !important;
  padding: 14px 18px 18px !important;
  border: 1px solid var(--kk-2libra-border);
}

.kk-2libra-editor > div:first-child {
  min-height: 34px;
  margin-bottom: 8px !important;
  border-bottom: 1px solid var(--kk-2libra-border);
}

.kk-2libra-editor > div:first-child > h3 {
  color: var(--kk-2libra-text);
  font-size: 15px;
  font-weight: 600;
}

.kk-2libra-editor > div:first-child > div:last-child {
  display: none !important;
}

.kk-2libra-editor .skeleton,
.kk-2libra-editor .w-md-editor {
  min-height: 220px !important;
  background: #f8fafc !important;
  border-radius: 7px !important;
}

.kk-2libra-editor .w-md-editor {
  border: 1px solid #cbd5e1;
  box-shadow: none;
}

.kk-2libra-editor .w-md-editor-toolbar {
  min-height: 38px;
  padding: 5px 8px;
  background: var(--kk-2libra-subtle);
  border-bottom: 1px dashed #cbd5e1;
}

.kk-2libra-editor .w-md-editor-toolbar button {
  min-width: 26px;
  min-height: 26px;
  border-radius: 4px;
}

.kk-2libra-editor .w-md-editor-text-input,
.kk-2libra-editor .w-md-editor-text-pre {
  padding: 14px 16px !important;
  color: var(--kk-2libra-text) !important;
  font-size: 14px !important;
  line-height: 1.65 !important;
}

.kk-2libra-editor .my-2 {
  margin: 10px 0 0 !important;
}

.kk-2libra-editor .my-2 .btn-primary {
  min-width: 88px;
  min-height: 34px;
  height: 34px;
  color: var(--kk-2libra-secondary);
  font-size: 13px;
  font-weight: 600;
  background: var(--kk-2libra-subtle);
  border: 1px solid var(--kk-2libra-border);
  border-radius: 6px;
  box-shadow: none;
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

  .kk-2libra-post > .kk-2libra-post-inner {
    padding: 12px 14px !important;
  }

  .kk-2libra-post-header,
  .kk-2libra-post h1 {
    max-width: calc(100% - 58px);
    padding-right: 0;
  }

  .kk-2libra-post-meta {
    margin-right: 58px !important;
  }

  .kk-2libra-post-meta > div:first-child > div:first-child {
    top: 12px;
    right: 14px;
  }

  .kk-2libra-post-meta > div:first-child > div:first-child,
  .kk-2libra-post-meta > div:first-child > div:first-child > button,
  .kk-2libra-post-meta > div:first-child > div:first-child > button > div,
  .kk-2libra-post-meta > div:first-child > div:first-child > button > div > div,
  .kk-2libra-post-meta > div:first-child > div:first-child :is(img, svg, canvas) {
    width: 48px !important;
    min-width: 48px !important;
    height: 48px !important;
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

  .kk-2libra-user-page > .card > div:nth-child(2) {
    align-items: flex-start;
    gap: 12px !important;
    padding: 12px !important;
  }

  .kk-2libra-user-page > .card > div:nth-child(2) > div:last-child {
    display: none;
  }
}
`);

  function initialize() {
    enableSameTabPostNavigation();
    markLayout();
    new MutationObserver(scheduleMarkLayout).observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.setTimeout(() => {
      document.documentElement.classList.remove('kk-2libra-booting');
    }, 1500);
  }

  if (document.body) {
    initialize();
  } else {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  }
})();
