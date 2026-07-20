## 2026-07-20

### X 新版布局不再依赖 data-testid 三栏

- 现象：公开页抓不到 `primaryColumn` / `sidebarColumn` / `tweet`。
- 根因：2026 新 UI 用 `main` + `aside` + Tailwind 断点 class（如 `nav-xxl:max-w-`、`one-col:w-`）。
- 解决：优先 `main`/`aside` 语义标签；旧 testid 仅作兼容。
- 以后注意：CSS attribute 选择器不要写含 `]` 的完整任意值（如 `w-[600px]`），会被截断。

### 加宽 main 后内层仍卡 600px

- 现象：顶栏全宽，帖子/输入框两侧留白、宽度不一致。
- 根因：内层 `div.mx-auto.w-full.max-w-[600px]` 未随 `main` 放宽。
- 解决：对 `main div[class*="mx-auto"][class*="w-full"][class*="max-w-"]` 设 `max-width/width: 100%`。
- 以后注意：只加宽 `main` 不够，必须同步拆内层硬宽。

### 右下 Grok/消息浮钮仅登录态出现

- 现象：未登录公开页测不到右下浮钮 DOM。
- 根因：`GrokDrawer` / `DMDrawer` 挂在登录壳；与左栏导航 `a[aria-label=…]` 不是同一节点。
- 解决：藏 `[data-testid="GrokDrawer"]`、`[data-testid="DMDrawer"]`；勿藏左栏入口。
- 以后注意：浮钮改版时优先重测这两个 testid，不要用导航链选择器「顺手」扩大隐藏范围。
