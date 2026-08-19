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
| Session cache-hit rate | Not shown. Transcript already has `input` / `cache_creation` / `cache_read` token totals. | New `display.showCacheHitRate` (default `true` with no config). Renders `Cache hit 80.0%` from `cache_read / (input + cache_creation + cache_read)`, inlined on the Context line. `/claude-hud:configure` Minimal/Essential turn it off. The number is a lifetime average over the whole transcript, including subagent usage. |
| Docs | Official README only | README banner + this file. Install commands point at this fork (`anyuan95/claude-hud`). |

The formula matches the usual session-level token coverage used by other Claude Code statuslines. It is a lifetime average for the current transcript, not a last-request rate and not a cost discount.

## Install this fork

If the official plugin is already installed, remove it first (both marketplaces use the name `claude-hud`):

```bash
claude plugin uninstall claude-hud@claude-hud -s user -y
claude plugin marketplace remove claude-hud
```

Then:

```bash
claude plugin marketplace add anyuan95/claude-hud
claude plugin install claude-hud@claude-hud -s user -y
```

In Claude Code, run `/reload-plugins`, then `/claude-hud:setup` if the statusline is not already configured.

Existing `~/.claude/plugins/claude-hud/config.json` is kept. `display.showCacheHitRate` defaults to `true`.

To develop against a local checkout instead of GitHub:

```bash
npm install
npm run build
claude plugin marketplace add /absolute/path/to/this/repo
claude plugin install claude-hud@claude-hud -s user -y
```
