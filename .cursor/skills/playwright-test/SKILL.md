---
name: playwright-test
description: >-
  Best practices and reference for Playwright Test (E2E). Covers how to write tests, avoiding fixed waits,
  network triggers, DnD, shard/retry setup on GitHub Actions, and more. Use when writing, reviewing, or
  configuring CI for Playwright tests.
---

# Playwright Test

> **Human readers (日本語):** see [OVERVIEW-ja.md](OVERVIEW-ja.md) (colocated). Full English reference (mizchi-aligned body) is in [reference.md](reference.md).

## When to use

- Writing or reviewing E2E tests under Playwright Test
- Debugging flakiness, timeouts, or locator strategy
- Configuring or changing CI (shard, retry, reporters, fonts on Linux)

## Kansu repository context

Use these project facts before suggesting copy-paste from generic templates:

| Topic | This repo |
| --- | --- |
| Test directory | `./e2e` (`playwright.config.ts` → `testDir`) |
| Run commands | `pnpm e2e` (build + test), `pnpm e2e:only` (tests only), `pnpm e2e:watch` (UI mode) |
| Step / expect timeouts | Shared constants in `e2e/constants.ts` (e.g. `E2E_STEP_TIMEOUT_MS`); align new waits with them |
| Package manager | **pnpm** — prefer `pnpm exec playwright …` over `npx` in docs you author for this repo |
| CI | See `.github/workflows/` for actual jobs (may differ from upstream `npm` examples) |

Do not replace this repo’s `playwright.config.ts` wholesale with the template in `reference.md` unless the task explicitly asks for it—merge patterns (retries, reporters, trace) conservatively.

## Non-negotiables (summary)

- **No fixed sleeps**: do not use `page.waitForTimeout()`. Rely on auto-waiting, `expect(locator)` web-first assertions, or targeted `waitForResponse` / `waitForURL` when the UI truly depends on network or navigation.
- **Prefer web-first `expect`**: avoid one-shot reads (`isVisible()`, raw `innerText()` for assertions) when an auto-retrying matcher exists.
- **Set up network listeners before the action** that triggers the request (`waitForResponse`, `waitForRequest`).

## Full reference

Templates (config, GitHub Actions, sharding), network/HAR, DnD, locators, modals, auth setup, POM, debugging CLI — see **[reference.md](reference.md)** (progressive load; same substance as [mizchi/skills `playwright-test/SKILL.md`](https://github.com/mizchi/skills/blob/main/playwright-test/SKILL.md)).

## Divergences from upstream

Structural and repo-specific changes are listed in [upstream-divergences.md](upstream-divergences.md).
