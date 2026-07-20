# 项目 AI Coding Agent 规范

本文件适用于当前项目。
Codex 默认读取本文件。
Claude Code 通过项目根目录 `CLAUDE.md` 导入本文件。

------

## 1. 项目基本信息

项目名称：

```text
tampermonkey（个人油猴脚本仓库）
```

项目定位：

```text
我个人的 Tampermonkey / Violentmonkey（油猴）脚本仓库。
每个脚本服务一个站点或一个明确场景，源码即安装产物。
```

主要用户：

```text
仅本人。脚本为自己装、自己用、自己维护；不为第三方发布平台优化。
```

核心目标：

```text
用 git 管理个人油猴脚本：可安装、可回滚、改动可验证、脚本之间互不干扰。
```

非目标：

```text
- 不做浏览器扩展打包与商店上架
- 不做脚本市场 / 多用户分发 / 商业化
- 不做后端服务、账号体系、数据库
- 不做与油猴无关的 Web 应用或通用前端工程
- 不为“万一别人用”过度设计；够自己稳定用即可
```

------

## 2. 技术栈

运行环境：

```text
浏览器页面 + Tampermonkey / Violentmonkey
优先兼容 Tampermonkey；Violentmonkey 作次要兼容目标
```

语言：

```text
默认原生 JavaScript（ES2018+），单文件 .user.js
除非明确需要，不引入 TypeScript / 打包器 / 框架
```

API：

```text
优先页面原生 DOM / Fetch / localStorage
需要特权能力时再用 GM_*（并在 @grant 中显式声明）
跨域请求用 GM_xmlhttpRequest，并配合 @connect
```

包管理器 / 构建：

```text
全仓默认无。真源码即产物。
若某脚本必须打包，在该脚本目录单独说明，构建产物仍落到 scripts/ 下的 .user.js
```

部署 / 安装：

```text
GitHub 托管：https://github.com/kakarrot-dev/tampermonkey
安装方式：Tampermonkey 打开本地 .user.js，或安装仓库 raw URL
```

------

## 3. 常用命令

本仓无脚本工程，不靠 npm 命令驱动。开始任务前先看本节。

安装依赖：

```bash
暂无
```

本地开发：

```text
1. 编辑 scripts/.../*.user.js
2. 在 Tampermonkey 中安装/更新该脚本（本地文件或 raw URL）
3. 打开 @match 对应页面，硬刷新验证
4. 改 metadata（尤其 @version / @match / @grant）后必须重新安装或点更新
```

类型检查 / 测试 / Lint / 构建 / 格式化 / 数据库迁移：

```bash
暂无
验证默认 = 目标站点手动验证
```

------

## 4. 目录约定

```text
scripts/                         全部可安装油猴脚本
  <site-or-feature>/             按站点或场景分目录
    <name>.user.js               唯一交付物（含完整 UserScript 头）
    README.md                    可选：该脚本用途、快捷键、已知坑
docs/
  superpowers/
    specs/                       需求规格
    plans/                       开发计划
README.md                        仓库说明 + 脚本索引
lessons.md                       可复用踩坑经验
AGENTS.md                        本规范
CLAUDE.md                        Claude Code 入口
DESIGN.md                        可选：注入 UI 视觉约定
```

规则：

- 一个脚本一个职责；不同站点不要塞进同一文件
- 文件名：`PascalCase.user.js` 或 `kebab-case.user.js`，必须以 `.user.js` 结尾
- 修改前先理解目录职责；不创建重复目录；不顺手重构目录
- 不要把构建缓存、扩展导出包、截图垃圾提交进仓库

------

## 5. 油猴脚本规范（核心）

本节优先于一般前端习惯。写脚本时按这里做。

### 5.1 Metadata 头（必须）

每个 `.user.js` 顶部必须有完整且可被管理器识别的头：

```js
// ==UserScript==
// @name         站点名: 短标题
// @namespace    https://github.com/kakarrot-dev/tampermonkey
// @version      0.1.0
// @description  一句话说明做什么
// @author       kakarrot
// @match        https://example.com/*
// @grant        none
// ==/UserScript==
```

字段约定：

| 字段 | 规则 |
|------|------|
| `@name` | `站点名: 功能`；可读、可区分 |
| `@namespace` | 固定指向本仓库，避免与他人脚本冲突 |
| `@version` | semver；行为变更必须 bump（见 5.7） |
| `@description` | 一行说清用途 |
| `@match` | **默认只用 `@match`**，范围尽量窄；需要排除再用 `@exclude` |
| `@include` | 仅当 `@match` 表达不了再考虑；不要用过于宽泛的正则 |
| `@grant` | 不用 GM API 时写 `@grant none`；用了就**逐条列出**实际 API |
| `@connect` | 使用 `GM_xmlhttpRequest` / 相关跨域能力时，显式列出主机，禁止无必要的 `*` |
| `@run-at` | 默认可省略（按管理器默认，通常接近 `document-idle`）；只有时机影响行为时再写 `document-start` / `document-end` / `document-idle` |
| `@require` | 尽量不用；确需外部库须说明来源、体积、失败时降级 |
| `@updateURL` / `@downloadURL` | 需要自动更新时再加，指向本仓库对应文件的 raw URL |

禁止：

- 缺 `==UserScript==` / `==/UserScript==`
- `@match *://*/*` 或无必要的超大匹配范围
- 声明了用不到的 `@grant`
- `@grant none` 与其它 `@grant` 混用（`none` 会抢优先，导致 API 不可用）

### 5.2 脚本骨架

```js
// ==UserScript==
// ...metadata...
// ==/UserScript==

(function () {
  'use strict';

  // 实现
})();
```

要求：

- 默认 IIFE + `'use strict'`，不污染页面全局
- 需要给页面调试挂全局时，用唯一前缀（如 `window.__kk_<scriptId>`），并写注释说明
- `const` / `let`，早期 return，小函数；避免深层嵌套
- 注释写「站点坑、选择器假设、时序原因」，不写废话

### 5.3 权限与 GM API

优先级：

1. 页面能力够用 → `@grant none`
2. 需要跨脚本存储 / 跨域 / 剪贴板 / 样式注入等 → 最小 `@grant`
3. 需要读页面闭包变量 → 谨慎使用 `unsafeWindow`，并说明理由

常用对照：

| 需求 | 做法 |
|------|------|
| 单站点配置 | 可优先 `localStorage`（`@grant none`） |
| 跨域同源策略挡住房 | `GM_xmlhttpRequest` + `@connect` |
| 跨站点共享配置 | `GM_getValue` / `GM_setValue` |
| 注入 CSS | `GM_addStyle` 或自建 `<style>`（限定选择器前缀） |
| 异步后开标签 | `GM_openInTab`（需 `@grant`）；勿在异步回调里裸 `window.open` 指望不被拦 |

### 5.4 DOM / SPA / 时机

- 查询 DOM 必须空值防护；元素不在就安静退出或等待，不要抛一堆错
- SPA（React/Vue 等）不要只在首次 `load` 跑逻辑：用 `MutationObserver`、轮询关键节点，或监听 URL 变化（可 debounce）
- `document-start` 脚本要处理 `document.body` 尚未存在的情况
- 快捷键：在 `input` / `textarea` / `[contenteditable]` 中默认不抢键；接管时 `preventDefault`
- 选择器当成易碎约定：站点改版时**先修选择器与等待逻辑**，不顺手重写整脚本

### 5.5 注入 UI

- 克制：不挡站点主流程，可关可藏
- 样式加脚本专属前缀（如 `.kk-xxx`），避免污染宿主
- 不要为“好看”引入大型 UI 库
- 若有 `DESIGN.md` 则遵守

### 5.6 网络与隐私

- 不硬编码 API Key / Cookie / Token；需要时用脚本配置项或 GM 存储，README 说明怎么填
- 不外传页面登录态、表单内容、隐私数据
- 调用站点内部 API 时，复用当前页面登录态即可，并处理空数据 / 结构变更
- 第三方请求必须在 metadata 里通过 `@connect`（及必要 `@grant`）说清楚

### 5.7 版本与变更

以下情况必须提高 `@version`：

- 功能增减
- `@match` / `@grant` / `@connect` / `@run-at` 变更
- 修复用户可感知的 bug

建议：

- patch：修 bug / 选择器
- minor：新能力
- major：不兼容的行为或存储结构变化

### 5.8 新脚本检查清单

- [ ] 头信息完整，`@match` 尽量窄
- [ ] `@grant` 最小且与代码一致
- [ ] IIFE + 严格模式
- [ ] DOM / SPA 时序有防护
- [ ] 无密钥进仓库
- [ ] README 脚本索引已更新（若对外可见用途有变）
- [ ] 目标站点手动验证通过

------

## 6. 工作流规则

### 6.1 小任务

可以直接做：

- typo、文案
- 选择器微调、明显单点 bug
- `@version` bump、小配置
- 我已给出明确修改点

执行前说明：

```text
目标：
改动位置：
验证方式：（哪个 URL、期望看到什么）
```

### 6.2 中大型任务

必须先写 spec：

- 新脚本或大块新功能
- 改核心注入/拦截逻辑
- 扩大 `@match` 或新增敏感权限
- 多脚本联动
- 存储结构变更
- 需求有歧义

流程：

```text
讨论需求边界
→ 编写 spec
→ 等我确认
→ 编写 plan
→ 等我确认
→ 开发
→ 验证
→ 文档同步
→ commit
→ push
```

------

## 7. Spec 规则

spec 放到：

```text
docs/superpowers/specs/
```

命名格式：

```text
YYYY-MM-DD-功能名-spec.md
```

spec 模板：

```md
# 功能规格：功能名

## 背景

为什么要做。

## 目标

要实现什么。

## 非目标

明确不做什么。

## 用户场景

我在什么站点、什么操作路径下用。

## 需求边界

包含什么，不包含什么。

## 匹配范围

@match / @exclude；是否影响其它页面。

## 交互流程

我怎么触发，页面应出现什么变化。

## 数据与状态

localStorage / GM 存储的 key、结构、是否迁移。

## 权限与安全

需要哪些 @grant / @connect；是否碰登录态或隐私数据。

## 异常情况

只列真实可能发生的异常。

## 验收标准

在哪些 URL 上、怎样算完成。
```

spec 不写实现细节，除非实现约束会影响需求边界。

------

## 8. Plan 规则

plan 放到：

```text
docs/superpowers/plans/
```

命名格式：

```text
YYYY-MM-DD-功能名-plan.md
```

plan 模板：

```md
# 开发计划：功能名

## 对应 spec

路径：docs/superpowers/specs/xxx.md

## 已确认需求

列出已确认的需求点。

## 当前代码理解

说明现有脚本与关键文件。

## 实现步骤

按最小可提交单元拆分。

## 涉及文件

列出预计修改文件。

## 验证方式

目标 URL、安装/更新步骤、预期行为。

## 回滚方式

如何回滚本次改动。

## 文档同步

是否更新 README.md、lessons.md。
```

plan 要能执行，不要写泛泛而谈的计划。

------

## 9. 编码规则

默认最小改动。

禁止：

- 做需求外功能
- 提前抽象成“通用油猴框架”
- 无关重构 / 顺手格式化无关文件
- 无必要引入依赖或打包链路
- 大范围重写
- 不理解代码就删除

新增依赖（含 `@require` CDN）前必须说明：

- 现有能力为什么不够
- 解决什么问题
- 是否有更轻量方案
- 对体积、离线、稳定性的影响

------

## 10. API 与“后端”规则

无自有后端。

若调用站点或第三方接口：

- 写清用途、参数、失败时的降级
- 不把内部错误细节刷屏到页面
- 不随意改变脚本已有行为语义；破坏性变更先说明

------

## 11. 存储规则

无数据库。持久化二选一，并在脚本内写清 key：

| 方案 | 适用 |
|------|------|
| `localStorage` | 单站点、`@grant none` |
| `GM_getValue` / `GM_setValue` | 需要脚本隔离存储或跨域共享配置 |

规则：

- 变更结构要有兼容或迁移说明
- 禁止未确认就清空我的已有脚本数据

------

## 12. 验证规则

默认验证方式：Tampermonkey 启用脚本后，在真实目标站手动验证。

至少说明：

- 匹配的 URL
- 如何安装/更新（是否因 metadata 变更需要重装）
- 预期可见行为
- 控制台是否有脚本引起的报错
- SPA 是否在路由切换后仍有效（若适用）

如果验证失败，必须说明失败步骤、原因、是否本次改动导致、下一步建议。不要隐藏失败。

------

## 13. README 与 lessons.md 同步规则

改完后检查：

- README.md
- lessons.md
- docs/

### 13.1 README.md

适合写入：脚本列表、用途、匹配站点、安装方式、必要配置、已知限制。

不写：临时过程、修 bug 流水账。

### 13.2 lessons.md

记录可复用经验：站点 DOM 坑、CSP/沙箱差异、选择器失效根因、不可行方案。

写入前去重；已有类似条目则更新原文。

推荐格式：

```md
## YYYY-MM-DD

### 主题

- 现象：
- 根因：
- 解决：
- 以后注意：
```

------

## 14. Git 规则

每完成一个已确认的 plan，默认执行：

```text
git status
→ 只添加本次相关文件
→ 验证
→ git commit
→ git push
```

提交前检查：

- 当前分支不是 main/master/production/release（除非我明确要求直接推 main）
- 无密钥、token、`.env`、缓存、大文件
- `@version` 已按规则处理
- README / lessons 已检查

commit message：

```text
类型: 简短说明
```

常用类型：`feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `style` / `perf`

示例：

```text
feat: 新增某站点目录辅助脚本
fix: 修复某站列表选择器失效
docs: 更新脚本安装与索引说明
```

禁止无确认执行：

```bash
git push --force
git push --force-with-lease
git reset --hard
git clean -fd
git rebase
```

------

## 15. 安全规则

禁止读取、输出、提交：

- API Key、Token、密码、Cookie、私钥、证书
- `.env` / `.env.local`
- 用户隐私数据、生产凭证

油猴额外禁止：

- 窃取或外传登录态 / 表单隐私
- 无必要扩大 `@match` / `@grant` / `@connect`
- 注入与功能无关的远程可控代码
- 在个人脚本里夹带挖矿、劫持链接、静默刷量等行为

发现敏感信息进入 git：立即停止，不要 push。

------

## 16. 完成定义

满足以下才算完成：

- 需求已实现
- 已在目标站手动验证，或说明无法验证的原因
- 无无关改动、无敏感信息
- README / lessons 已检查
- 如有 plan，状态已更新
- 已按规则 commit；允许则 push
- 用简短中文汇报

完成后回复格式：

```text
已完成。

改动：
- 文件：改动说明

验证：
- URL：xxx
- 结果：通过 / 失败 / 未运行

文档：
- README.md：已检查 / 已更新 / 无需更新
- lessons.md：已检查 / 已更新 / 无需更新

Git：
- commit：xxx
- push：已完成 / 未执行，原因：xxx

风险：
- 无 / xxx
```

不要贴完整代码。
不要贴完整 diff。
不要写长篇过程。

------

## 17. Claude Code 兼容层

项目根目录 `CLAUDE.md` 保持极简，仅导入本文件并补充：

- 默认简体中文沟通
- 非用户要求不贴大段代码或完整 diff
- 中大型任务先 plan mode，确认后再实现
