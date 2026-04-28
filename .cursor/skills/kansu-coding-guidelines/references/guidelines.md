# Kansu Coding Guidelines Reference

## UI プリミティブ（`src/components/ui`）のフォーカス・アクティブ

インタラクティブなコントロールは次を揃える。

- キーボードフォーカス:
  - `outline-none`
  - `focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50`
  - destructive 系は既存どおり `ring-destructive` 派生
  - `focus:` 単体の ring は原則使わない
- ポインタ押下（`active`）:
  - フィールド型（Input / Textarea / SelectTrigger など）は `active:border-ring/60` と必要に応じて `active:bg-accent/…`
  - ボタン型・タブ・バッジ（リンク時）は `active:scale-[0.98]` と variant ごとの `active:bg…` / `active:opacity…`
  - トグル・スイッチは軽い `active:scale` + `active:opacity` またはトラック色を一段暗め
- 一貫性:
  - 新規 UI プリミティブも上記をデフォルトにする
  - 例外は理由が明確な場合のみ
