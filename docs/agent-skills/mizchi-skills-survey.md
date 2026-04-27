# mizchi/skills 調査メモ（Kansu / Cursor 向け）

[mizchi/skills](https://github.com/mizchi/skills) は、[agentskills.io](https://agentskills.io) 系の Skill をディレクトリ単位で公開しているリポジトリである。配布は APM（`apm install`）でもよいが、本リポジトリでは **Cursor の `.cursor/skills/`** に必要なものだけを配置する方針とした。

## 言語ポリシー（mizchi Skill を取り込むとき）

- **エージェント向けの正本**: mizchi 側で **英語の `SKILL.md` が原文**の Skill は、その英語に沿って `.cursor/skills/<name>/SKILL.md` および補助ファイル（例: `reference.md`）を書く。
- **ユーザー向けの説明**: 読みやすさのため **各 `.cursor/skills/<name>/OVERVIEW-ja.md` に日本語**で概要・運用・リポジトリ固有の注意を書く（Skill にコロケーション）。例: [empirical-prompt-tuning OVERVIEW-ja.md](../../.cursor/skills/empirical-prompt-tuning/OVERVIEW-ja.md)、[playwright-test OVERVIEW-ja.md](../../.cursor/skills/playwright-test/OVERVIEW-ja.md)。
- mizchi README にあるとおり、一部 Skill には `SKILL-ja.md` が別途ある場合がある。その場合は **英語 `SKILL.md` をエージェント正**としつつ、人間向けに `SKILL-ja.md` の内容を `OVERVIEW-ja.md` へ要約・統合してよい。

## 本リポジトリへの適合度が高い候補（優先順）

以下は README のカテゴリ分けと各 `SKILL.md` の要点に基づく。このリポジトリの技術スタック（WXT / TypeScript / React / Playwright / GitHub Actions / pnpm）に照らした判断である。

| 順位 | Skill | 概要 | 導入コスト | Kansu での想定シーン |
| --- | --- | --- | --- | --- |
| 1 | [playwright-test](https://github.com/mizchi/skills/tree/main/playwright-test) | E2E の待機・network トリガ・CI shard/retry 等 | 低 | `e2e/` の安定化・フレーキー低減 |
| 2 | [gh-fix-ci](https://github.com/mizchi/skills/tree/main/gh-fix-ci) | `gh` で Actions 失敗を切り分け修正 | 中（認証・運用） | PR の `ci` / `e2e` ジョブ復旧の初動定型化 |
| 3 | [empirical-prompt-tuning](https://github.com/mizchi/skills/tree/main/empirical-prompt-tuning) | 指示文の実証的改善ループ | 中〜高 | `.cursor/rules` や Skill の品質検証 |
| 4 | [playwright-cli](https://github.com/mizchi/skills/tree/main/playwright-cli) | codegen / debug / ui / shard 等 CLI 実務 | 低 | 新規 E2E のたたき台・ローカル再現 |
| 5 | [ast-grep-practice](https://github.com/mizchi/skills/tree/main/ast-grep-practice) | ast-grep ルールと CI への載せ方 | 中 | Biome だけでは書きにくい構造禁止を機械化 |

## 今回のスコープ

- **導入済み（プロジェクト Skill）**:
  - `empirical-prompt-tuning` → [`.cursor/skills/empirical-prompt-tuning/`](../../.cursor/skills/empirical-prompt-tuning/)（英語本文・[OVERVIEW-ja.md](../../.cursor/skills/empirical-prompt-tuning/OVERVIEW-ja.md)・差分は `upstream-divergences.md`）。
  - `playwright-test` → [`.cursor/skills/playwright-test/`](../../.cursor/skills/playwright-test/)（英語本文・[OVERVIEW-ja.md](../../.cursor/skills/playwright-test/OVERVIEW-ja.md)・差分は `upstream-divergences.md`）。
- **未導入（候補のまま）**: 上表の `gh-fix-ci` / `playwright-cli` / `ast-grep-practice` および MoonBit / Gleam / Nix 系など。必要になったタイミングで `.cursor/skills/` へ取り込み、本ドキュメントを更新する。

## 参考まで（README にあるが優先度を下げた例）

- **Tooling / Infra**: `cloudflare-deploy` / `nix-setup` / `devbox` 等は、デプロイ先や開発コンテナ方針がこのリポジトリの主戦場とずれる場合が多い。
- **APM 前提**: [apm-usage](https://github.com/mizchi/skills/tree/main/apm-usage) は Skill 集合の管理に有用だが、リポジトリに `apm.yml` を導入する意思が無いなら必須ではない。

## upstream 外のスキル

README の「Upstream skills (not in this repo)」に列挙されているもの（例: `ast-grep/agent-skill`）は、別途取得して評価する。
