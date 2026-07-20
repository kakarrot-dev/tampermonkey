# X（x.com）选择器实录

实测时间：2026-07-20  
实测工具：Playwright + 本机 Google Chrome（Cursor Browser MCP 本会话不可用）  
视口：1280 / 1440 / 1920 × 900  
页面：公开个人主页 `https://x.com/X`、帖子详情 `/status/...`；搜索/通知/首页在未登录时跳转登录墙，未拿到完整三栏 DOM。

## 1. 总布局（新版 UI，2026）

页面主体不再使用旧的 `data-testid="primaryColumn"` / `sidebarColumn`（公开页实测均为 **false**）。

布局根（`body` 直接子级之一）：

```text
div.one-col:max-w-[688px].two-col:max-w-[978px].nav-xl:max-w-[1038px].nav-xxl:max-w-[1225px].mx-auto.flex.w-full.items-stretch
```

子列（1440px 实测）：

| 索引 | 标签 | 宽度 | 职责 | 稳定钩子 |
|------|------|------|------|----------|
| 0 | `div` | 88～275 | 左侧导航 | 布局根直接子级；含 `aria-label="X"` 的品牌链 |
| 1 | `main` | 默认 600 | 中央信息流 | **语义标签 `main`**；class 含 `one-col:w-[600px]` / `one-col:max-w-[600px]` |
| 2 | `aside` | 290～350 | 右侧推荐/页脚 | **语义标签 `aside`**；class 含 `two-col:block`、`nav-xl:w-[350px]`；内含 `aria-label="Footer"` |
| 3 | `div` | 视口宽 | 底部登录条（未登录） | `fixed inset-x-0 bottom-0`；第一阶段不处理 |

宽度随断点变化（未注入样式时）：

| 视口 | 根宽 | 导航 | 主栏 | 右栏 |
|------|------|------|------|------|
| 1280 | 1038 | 88 | 600 | 350 |
| 1440 | 1225 | 275 | 600 | 350 |
| 1920 | 1225 | 275 | 600 | 350 |

## 2. 脚本采用的选择器

优先语义标签 + 短 attribute 子串（避免随机 hash class、完整 XPath、含 `]` 的 attribute 值截断问题）。

### 2.1 新版（当前主路径）

```css
/* 布局根：用断点 token 子串，勿写完整 [1225px]（] 会截断属性选择器） */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"]

/* 右栏 */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"] > aside

/* 主栏 */
body > div[class*="nav-xxl:max-w-"][class*="mx-auto"][class*="flex"] > main
```

### 2.2 旧版兼容（登录态旧壳若仍存在）

```css
[data-testid="sidebarColumn"]
[data-testid="primaryColumn"]
article[data-testid="tweet"]
[data-testid="tweetText"]
[data-testid="tweetPhoto"]
```

公开页实测上述 testid **均不存在**；保留是为登录后旧壳降级。

### 2.3 帖子 / 媒体（新版）

| 目标 | 选择器 | 说明 |
|------|--------|------|
| 帖子块 | `article` | 主栏内帖子容器；无 `data-testid="tweet"` |
| 帖子 id | `[data-tweet-id]` | 存在于帖子树内 |
| 正文 | `article div[lang]`、`article [dir="auto"]` | 无独立 tweetText testid |
| 媒体 | `article img` | 无 tweetPhoto testid；圆角作用于此 |
| 互动 | `aria-label`：`Reply` / `Repost` / `Like` / `Bookmark` / `Share` | 仅识别用，脚本不操作 |

## 3. 排除项（禁止依赖）

- 随机 / hash class（如历史 `css-1dbjc4n`）
- 完整 XPath、过深 `div > div > div...`
- attribute 选择器中带未转义 `]` 的完整 Tailwind 任意值（如 `one-col:w-[600px]` 整段）
- 依赖未登录底部蓝条、登录墙 DOM

## 4. CSS 注入验收（2026-07-20）

注入后公开主页 / 详情（无需 `!important`）：

| 视口 | 导航宽 | 主栏宽 | aside |
|------|--------|--------|-------|
| 1280 | 88 | 920 | `display: none` |
| 1440 | 275 | 920 | `display: none` |
| 1920 | 275 | 920 | `display: none` |

站内从个人主页进入 `/status/...` 后，重新注入同样规则仍生效（油猴 `GM_addStyle` 挂在 document，SPA 软导航可持续）。

未登录访问 `/search`、`/notifications`、`/home` 会跳到 onboarding 登录页，无三栏布局可测；选择器与登录后同壳页面共用（`main`/`aside`）。

截图产物（本地，不入库）：`X/_inspect-out/verify-profile-{1280,1440,1920}.png`、`verify-status-1440.png`。

## 5. `!important`

当前实测：`aside { display: none }` 与 `main` 的 `width`/`max-width` **无需** `!important` 即可覆盖 Tailwind 工具类。若日后站点特异性升高再补，并在此记录原因。
