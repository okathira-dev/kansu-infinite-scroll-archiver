---
name: kansu-ubiquitous-language
description: Kansu のコンポーネント/モジュール構成に関する用語の使い分けを統一する。`ui` / `feature` / レイヤー名の言い回しや配置判断、命名方針の確認が必要なときに使う。
---

# Kansu Ubiquitous Language

## When to use

- コンポーネント境界や `ui` / `feature` の言い回しを揃えたいとき
- モジュール配置・命名のレビューで用語のズレを防ぎたいとき
- ドキュメントとコードの語彙を一致させたいとき

## Instructions

1. 先に `docs/ubiquitous-language.md` を読み、用語の意味と対応を確定する。
2. 用語が確定したら、レイヤー・命名・責務の詳細は `.cursor/rules/kansu-react-layers.mdc` に合わせる。
3. Storybook のストーリー規約が関係する場合は `.cursor/rules/storybook.mdc` を併読する。

## Notes

- この Skill は「用語の揃え方」を扱う。実装上の詳細規約はルール側を正本とする。
