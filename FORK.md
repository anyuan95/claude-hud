# Fork notes

This repository is a maintained fork of [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud).

Upstream remains the source of truth for HUD behavior. Changes here are listed below so they stay visible when syncing, instead of being buried only in git history.

## Remotes

| Remote | URL | Role |
| --- | --- | --- |
| `origin` | https://github.com/anyuan95/claude-hud | This fork (default push target) |
| `upstream` | https://github.com/jarrodwatts/claude-hud | Official project |

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

Feature work stays on a branch off `main`. After syncing `main`, rebase or merge that branch, then open a PR against **this fork's** `main`.

## Changes from upstream

| Area | Upstream | This fork |
| --- | --- | --- |
| Session cache-hit rate | Not shown. Transcript already has `input` / `cache_creation` / `cache_read` token totals. | New `display.showCacheHitRate` (default `true`). Renders `Cache hit 80.0%` from `cache_read / (input + cache_creation + cache_read)`. |
| Docs | Official README only | README banner + this file |

The formula matches the usual session-level token coverage used by other Claude Code statuslines. It is a lifetime average for the current transcript, not a last-request rate and not a cost discount.

## Use this checkout as the statusline

Marketplace installs still point at the official plugin cache. To run this fork:

```bash
npm install
npm run build
```

Point `statusLine.command` in `~/.claude/settings.json` at this repo's `dist/index.js` (keep the same Node binary you already use). Then enable or leave the default:

```json
{
  "display": {
    "showCacheHitRate": true
  }
}
```

in `~/.claude/plugins/claude-hud/config.json`.
