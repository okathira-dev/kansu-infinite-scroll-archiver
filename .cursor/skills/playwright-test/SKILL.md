---
name: playwright-test
description: >-
  Best practices and reference for Playwright Test (E2E). Covers how to write tests, avoiding fixed waits,
  network triggers, DnD, shard/retry setup on GitHub Actions, and more. Use when writing, reviewing, or
  configuring CI for Playwright tests.
---

# Playwright Test

## When to use

- Writing or reviewing E2E tests under Playwright Test
- Debugging flakiness, timeouts, or locator strategy
- Configuring or changing CI (shard, retry, reporters, fonts on Linux)

## Kansu repository context

Use these project facts before copy-pasting generic Playwright templates (upstream examples often use `npm` / `testDir: './tests'`):

| Topic | This repo |
| --- | --- |
| Test directory | `./e2e` (`playwright.config.ts` → `testDir`) |
| Run commands | `pnpm e2e` (build + test), `pnpm e2e:only` (tests only), `pnpm e2e:watch` (UI mode) |
| Step / expect timeouts | Shared constants in `e2e/constants.ts` (e.g. `E2E_STEP_TIMEOUT_MS`); align new waits with them |
| Package manager | **pnpm** — use `pnpm exec playwright …` in snippets you author for this repo |
| CI | `.github/workflows/` — toolchain via `.github/actions/setup-node-pnpm` (do not hard-code `node-version` in new YAML) |

Do not replace this repo’s `playwright.config.ts` wholesale with upstream templates unless the task explicitly asks for it—merge patterns (retries, reporters, trace) conservatively.

## Non-negotiables (summary)

- **No fixed sleeps**: do not use `page.waitForTimeout()`. Rely on auto-waiting, `expect(locator)` web-first assertions, or targeted `waitForResponse` / `waitForURL` when the UI truly depends on network or navigation.
- **Prefer web-first `expect`**: avoid one-shot reads (`isVisible()`, raw `innerText()` for assertions) when an auto-retrying matcher exists.
- **Set up network listeners before the action** that triggers the request (`waitForResponse`, `waitForRequest`).
