## 2026-07-20

### X 新版布局不再依赖 data-testid 三栏

- 现象：公开页抓不到 `primaryColumn` / `sidebarColumn` / `tweet`。
- 根因：2026 新 UI 用 `main` + `aside` + Tailwind 断点 class（如 `nav-xxl:max-w-`、`one-col:w-`）。
- 解决：优先 `main`/`aside` 语义标签；旧 testid 仅作兼容。
- 以后注意：CSS attribute 选择器不要写含 `]` 的完整任意值（如 `w-[600px]`），会被截断。
