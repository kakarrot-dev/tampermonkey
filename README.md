<div align="center">
  <img src="assets/repository-logo.png" alt="Tampermonkey Scripts logo" width="112">
  <h1>Tampermonkey Scripts</h1>
  <p>Small, site-specific userscripts for a quieter and more useful web.</p>
  <p><a href="README.zh-CN.md">简体中文</a> · English</p>

  <p>
    <a href="https://www.tampermonkey.net/"><img src="https://img.shields.io/badge/Tampermonkey-compatible-b7791f?style=flat-square" alt="Tampermonkey compatible"></a>
    <a href="https://violentmonkey.github.io/"><img src="https://img.shields.io/badge/Violentmonkey-compatible-2c6f75?style=flat-square" alt="Violentmonkey compatible"></a>
    <img src="https://img.shields.io/badge/JavaScript-ES2018%2B-29271d?style=flat-square" alt="JavaScript ES2018+">
    <img src="https://img.shields.io/badge/userscripts-3-f5f3e9?style=flat-square&amp;labelColor=403d36" alt="3 userscripts">
    <img src="https://img.shields.io/badge/build-none-f5f3e9?style=flat-square&amp;labelColor=403d36" alt="No build step">
  </p>
</div>

![Browser pages refined by userscripts](assets/repository-banner.png)

This repository keeps personal Tampermonkey and Violentmonkey scripts in plain JavaScript. Each script has one site or one clear job. The `.user.js` source is also the installable artifact, so there is no build step or package manager.

## Tags

`tampermonkey` `violentmonkey` `userscript` `javascript` `browser-customization` `ui-polish` `2libra` `v2ex` `x-twitter`

## Scripts

| Script | Type | Matches | Version | Install |
| --- | --- | --- | --- | --- |
| X Reading Enhance | Original | `x.com`, `twitter.com` | `0.2.2` | [Install raw script](https://raw.githubusercontent.com/kakarrot-dev/tampermonkey/main/X/XReadingEnhance.user.js) |
| 2Libra V2EX-style Two-column Layout | Original | `2libra.com` | `0.3.9` | [Install raw script](https://raw.githubusercontent.com/kakarrot-dev/tampermonkey/main/2libra/TwoColumnPolish.user.js) |
| V2EX Polish | Third-party snapshot | `v2ex.com` | `2.0.6` | [Open source file](<V2EX/▲V2EX Polish - 体验更现代化的 V2EX 🟢-2.0.6.user.js>) · [Upstream](https://v2p.leoku.dev/) |

### X Reading Enhance

Hides the right column and floating controls, widens the reading column, and tightens spacing, line height, and media height with CSS only.

- Grants: `GM_addStyle`
- Source: [`X/XReadingEnhance.user.js`](X/XReadingEnhance.user.js)
- Check after install: home, profile, and post detail pages at 1280, 1440, and 1920 pixels

### 2Libra V2EX-style Two-column Layout

Reworks 2Libra into an approximately 805 px main column plus a 270 px sidebar. It applies V2EX Polish-inspired spacing and typography to the topic composer, topic lists, topic details, nested replies, user profiles, settings, history, the sidebar profile panel, and the reply editor. Except on the topic composer, the desktop sidebar consistently keeps the profile panel first, Today/Recent/Latest navigation second, and recent visits last while hiding promotional cards. Plain clicks on topic links stay in the current tab, while modifier-key clicks keep the browser's native behavior. At narrow widths it returns to one column.

- Grants: `GM_addStyle`
- Source: [`2libra/TwoColumnPolish.user.js`](2libra/TwoColumnPolish.user.js)
- Check after install: home, topic composer, and topic detail pages at 1440 and 1920 pixels, plus 375 and 768 pixel responsive widths

### V2EX Polish snapshot

The file under `V2EX/` is an upstream script kept as a reference snapshot. It is not maintained as an original script in this repository. Its metadata identifies LeoKu as the author and MIT as the license. Prefer the [upstream project](https://v2p.leoku.dev/) for installation and updates.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Open an original script's raw install link from the table above.
3. Review the match patterns and granted permissions, then confirm installation.
4. Hard-refresh a matching page.

When metadata such as `@version`, `@match`, or `@grant` changes, update or reinstall the script in the userscript manager.

## Development

There are no dependencies, build tasks, or generated bundles.

```text
edit <site>/<name>.user.js
install or update it in the userscript manager
open a matching URL
hard-refresh and verify the visible behavior
```

Keep permissions narrow, guard DOM queries, and account for SPA navigation when a site changes routes without a full reload. See [`AGENTS.md`](AGENTS.md) for repository conventions and [`CLAUDE.md`](CLAUDE.md) for the Claude Code entry point.

## Contributing

This is a maintainer-first personal repository, but focused fixes are welcome. Keep each script scoped to one site or task. Explain the affected URL, visible behavior, and manual verification in the pull request. Do not add dependencies or broaden `@match`, `@grant`, or `@connect` without a concrete need.

## Security and privacy

The original scripts in this repository do not contain API keys, cookies, or account credentials. Review every userscript before installing it. A userscript runs inside matching pages and can interact with their DOM.

Report a security issue privately to the repository owner instead of opening a public issue with credentials or personal data.

## License

No repository-wide license has been declared for the original scripts yet. The bundled V2EX Polish snapshot retains its upstream MIT license and authorship metadata. Do not assume that the third-party license applies to the rest of this repository.

## Visual identity

The repository logo and banner use the [Claude Cream](https://github.com/kakarrot-dev/claude-cream) palette: warm cream surfaces, ink text, amber accents, and restrained teal. Both assets are stored in [`assets/`](assets/).
